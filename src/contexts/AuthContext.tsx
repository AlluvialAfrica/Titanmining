import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signIn,
  signOut,
  getCurrentUser,
  fetchUserAttributes,
  fetchAuthSession,
  confirmSignIn,
  type SignInOutput,
} from 'aws-amplify/auth';
import { Role, mapLegacyRole } from '../types/roles';
import { logger } from '../utils/logger';
import { trackEvent, AnalyticsEvents } from '../utils/analytics';
import { DEMO_ACCOUNTS } from '../data/demoAccounts';
import toast from 'react-hot-toast';

// ---------------------------------------------------------------------------
// OTP session security — HMAC-nonce approach
// ---------------------------------------------------------------------------
// The nonce lives only in module-level memory. On page refresh the JS module
// re-initialises, so `otpSessionNonce` becomes null and the stored HMAC can
// never be recomputed → session restore fails → user is signed out.
// An attacker who sets the sessionStorage key via DevTools still cannot bypass
// OTP because they don't have the in-memory nonce.
// ---------------------------------------------------------------------------

let otpSessionNonce: string | null = null;

function generateNonce(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

async function computeHmac(nonce: string, userId: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(nonce), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(userId));
  return Array.from(new Uint8Array(sig), b => b.toString(16).padStart(2, '0')).join('');
}


export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
  mobileNumber: string;
  email?: string;
  orgId: string;
  siteId: string;
  shift?: string;
  assignedMachine?: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (mobileNumber: string, emailOrUsername: string, password: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  forcePasswordChange: boolean;
  tempUser: any | null;
  changePassword: (newPassword: string) => Promise<void>;
  otpPending: boolean;
  demoLogin: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  verifyOtp: async () => {},
  logout: async () => {},
  forcePasswordChange: false,
  tempUser: null,
  changePassword: async () => {},
  otpPending: false,
  demoLogin: () => {},
});

/**
 * Build our app User object from Cognito user attributes.
 * Maps legacy Cognito roles to one of the 8 lean roles via mapLegacyRole().
 */
function buildUserFromAttributes(attrs: Record<string, string | undefined>, sub: string): User {
  const rawRole = attrs['custom:role'] || Role.SITE_CONTROLLER;
  const mappedRole = mapLegacyRole(rawRole);

  return {
    id: sub,
    firstName: attrs['given_name'] || attrs['custom:firstName'] || '',
    lastName: attrs['family_name'] || attrs['custom:lastName'] || '',
    role: mappedRole,
    mobileNumber: attrs['phone_number'] || '',
    email: attrs['email'] || '',
    orgId: attrs['custom:orgId'] || '',
    siteId: attrs['custom:siteId'] || '',
    shift: attrs['custom:shift'] || undefined,
    assignedMachine: attrs['custom:machine'] || undefined,
    status: (attrs['custom:status'] as 'PENDING' | 'ACTIVE' | 'SUSPENDED') || 'ACTIVE',
  };
}

/** SessionStorage key set only after successful OTP verification. */
const OTP_VERIFIED_KEY = 'titan_otp_verified';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tempUser, setTempUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [forcePasswordChange, setForcePasswordChange] = useState(false);
  const [otpPending, setOtpPending] = useState(false);
  const [signInResult, setSignInResult] = useState<SignInOutput | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  async function checkExistingSession() {
    try {
      const storedHmac = sessionStorage.getItem(OTP_VERIFIED_KEY);
      // If OTP was never verified in this browser session, don't restore the user.
      // This prevents bypassing OTP by refreshing the page after password-only sign-in.
      if (!storedHmac || !otpSessionNonce) {
        // Nonce lives only in memory — on page refresh it's null, so we can't
        // recompute the HMAC and session restore intentionally fails.
        sessionStorage.removeItem(OTP_VERIFIED_KEY);
        try { await signOut(); } catch (_) { /* no session — fine */ }
        return;
      }

      const currentUser = await getCurrentUser();
      // Verify the stored HMAC against the in-memory nonce
      const expectedHmac = await computeHmac(otpSessionNonce, currentUser.userId);
      if (storedHmac !== expectedHmac) {
        sessionStorage.removeItem(OTP_VERIFIED_KEY);
        otpSessionNonce = null;
        try { await signOut(); } catch (_) { /* ignore */ }
        return;
      }

      const attrs = await fetchUserAttributes();
      const appUser = buildUserFromAttributes(attrs as Record<string, string>, currentUser.userId);
      setUser(appUser);
    } catch (err) {
      // No current session on mount is expected (user not logged in)
      sessionStorage.removeItem(OTP_VERIFIED_KEY);
      logger.debug('No existing auth session:', err);
    } finally {
      setLoading(false);
    }
  }

  const login = async (mobileNumber: string, emailOrUsername: string, password: string) => {
    setLoading(true);
    try {
      // Generate a fresh nonce for this login attempt
      otpSessionNonce = generateNonce();

      // Clear any stale Cognito session before signing in (e.g. demo role switching)
      try { await signOut(); } catch (_) { /* no active session — expected */ }

      // Determine username: prefer email, fall back to phone number
      const username = emailOrUsername || mobileNumber;

      const result = await signIn({ username, password });
      setSignInResult(result);

      if (result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        // User must set a new password (admin-created account)
        setForcePasswordChange(true);
        setTempUser({ username });
        setLoading(false);
        return;
      }

      if (result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_SMS_CODE' ||
          result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_TOTP_CODE') {
        // MFA required
        setOtpPending(true);
        setTempUser({ username });
        setLoading(false);
        return;
      }

      if (result.isSignedIn) {
        // Fully authenticated — fetch user profile
        const currentUser = await getCurrentUser();
        const attrs = await fetchUserAttributes();
        const appUser = buildUserFromAttributes(attrs as Record<string, string>, currentUser.userId);

        // Verify that the mobile number typed by the user matches the registered phone_number
        const phone = attrs.phone_number;
        if (phone) {
          const formattedTyped = mobileNumber.replace(/[\s\-\(\)]/g, '');
          const formattedReg = phone.replace(/[\s\-\(\)]/g, '');
          if (formattedTyped !== formattedReg) {
            throw new Error(`The entered mobile number (${mobileNumber}) does not match the registered phone number for this account.`);
          }
        }

        // WhatsApp OTP challenge — all users must verify via Twilio
        let otpSent = false;
        const generatedCode = String(Math.floor(100000 + Math.random() * 900000));

        if (!phone) {
          throw new Error('No phone number registered for this account. Contact your administrator.');
        }

        try {
          const res = await fetch(import.meta.env.VITE_OTP_SENDER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, code: generatedCode }),
          });
          const data = await res.json();
          if (data.success) {
            toast.success(`Verification code sent to your WhatsApp at ${phone}`);
            otpSent = true;
          } else {
            logger.error('Failed to send WhatsApp OTP:', data.error);
            throw new Error('Failed to send verification code. Please try again.');
          }
        } catch (err: any) {
          if (err.message === 'Failed to send verification code. Please try again.') throw err;
          logger.error('Network error sending WhatsApp OTP:', err);
          throw new Error('Failed to send verification code. Please check your connection and try again.');
        }

        if (otpSent) {
          setOtpPending(true);
          setTempUser({ appUser, generatedCode, phone });
          setLoading(false);
          return;
        }

        setUser(appUser);
        trackEvent(AnalyticsEvents.LOGIN_SUCCESS, { role: appUser.role });
      }
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      trackEvent(AnalyticsEvents.LOGIN_FAILED);
      throw new Error(error.message || 'Authentication failed.');
    }
  };

  const changePassword = async (newPassword: string) => {
    setLoading(true);
    try {
      // Ensure nonce exists for password-change flow
      if (!otpSessionNonce) otpSessionNonce = generateNonce();

      const result = await confirmSignIn({ challengeResponse: newPassword });
      setSignInResult(result);
      setForcePasswordChange(false);

      if (result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_SMS_CODE' ||
          result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_TOTP_CODE') {
        setOtpPending(true);
        setLoading(false);
        return;
      }

      if (result.isSignedIn) {
        // Password changed — still require WhatsApp OTP before granting access
        const currentUser = await getCurrentUser();
        const attrs = await fetchUserAttributes();
        const appUser = buildUserFromAttributes(attrs as Record<string, string>, currentUser.userId);
        const phone = attrs.phone_number as string | undefined;

        const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
        if (!phone) {
          throw new Error('No phone number registered for this account. Contact your administrator.');
        }

        try {
          const res = await fetch(import.meta.env.VITE_OTP_SENDER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, code: generatedCode }),
          });
          const data = await res.json();
          if (data.success) {
            toast.success(`Verification code sent to your WhatsApp at ${phone}`);
          } else {
            logger.error('Failed to send WhatsApp OTP:', data.error);
            throw new Error('Failed to send verification code. Please try again.');
          }
        } catch (err: any) {
          if (err.message === 'Failed to send verification code. Please try again.') throw err;
          logger.error('Network error sending WhatsApp OTP:', err);
          throw new Error('Failed to send verification code. Please check your connection and try again.');
        }

        setOtpPending(true);
        setTempUser({ appUser, generatedCode, phone });
      }
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.message || 'Failed to change password.');
    }
  };

  const verifyOtp = async (code: string) => {
    setLoading(true);
    try {
      if (tempUser && tempUser.generatedCode) {
        if (code === tempUser.generatedCode) {
          // Store HMAC(nonce, userId) — not just '1'.
          // On refresh the nonce is gone so HMAC can't be recomputed → session dies.
          const hmac = otpSessionNonce
            ? await computeHmac(otpSessionNonce, tempUser.appUser.id)
            : '';
          sessionStorage.setItem(OTP_VERIFIED_KEY, hmac);
          setUser(tempUser.appUser);
          setTempUser(null);
          setOtpPending(false);
          setLoading(false);
          trackEvent(AnalyticsEvents.LOGIN_SUCCESS, { role: tempUser.appUser.role });
          return;
        } else {
          setLoading(false);
          throw new Error('Invalid verification code.');
        }
      }

      const result = await confirmSignIn({ challengeResponse: code });

      if (result.isSignedIn) {
        const currentUser = await getCurrentUser();
        const hmac = otpSessionNonce
          ? await computeHmac(otpSessionNonce, currentUser.userId)
          : '';
        sessionStorage.setItem(OTP_VERIFIED_KEY, hmac);
        const attrs = await fetchUserAttributes();
        const appUser = buildUserFromAttributes(attrs as Record<string, string>, currentUser.userId);
        setUser(appUser);
        setTempUser(null);
        setOtpPending(false);
      }
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      throw new Error(error.message || 'Invalid verification code.');
    }
  };

  const logout = async () => {
    trackEvent(AnalyticsEvents.LOGOUT);
    sessionStorage.removeItem(OTP_VERIFIED_KEY);
    otpSessionNonce = null;
    try {
      await signOut();
    } catch (err) {
      logger.error('Sign out error:', err);
    }
    setUser(null);
    setTempUser(null);
    setForcePasswordChange(false);
    setOtpPending(false);
    setSignInResult(null);
  };

  const demoLogin = (role: Role) => {
    const account = DEMO_ACCOUNTS.find((a) => a.role === role);
    if (!account) {
      logger.error('Demo account not found for role:', role);
      return;
    }
    // Generate nonce + HMAC for session consistency (demo sessions don't
    // survive page refresh by design — same as real OTP sessions).
    otpSessionNonce = generateNonce();
    const demoUser = { ...account.user };
    setUser(demoUser);
    setTempUser(null);
    setForcePasswordChange(false);
    setOtpPending(false);
    setSignInResult(null);
    trackEvent(AnalyticsEvents.LOGIN_SUCCESS, { role: demoUser.role, demo: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        verifyOtp,
        logout,
        forcePasswordChange,
        tempUser,
        changePassword,
        otpPending,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
