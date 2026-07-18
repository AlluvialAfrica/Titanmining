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
import { Role } from '../types/roles';
import { logger } from '../utils/logger';
import { trackEvent, AnalyticsEvents } from '../utils/analytics';

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
});

/**
 * Build our app User object from Cognito user attributes.
 */
function buildUserFromAttributes(attrs: Record<string, string | undefined>, sub: string): User {
  return {
    id: sub,
    firstName: attrs['given_name'] || attrs['custom:firstName'] || '',
    lastName: attrs['family_name'] || attrs['custom:lastName'] || '',
    role: (attrs['custom:role'] as Role) || Role.SITE_CONTROLLER,
    mobileNumber: attrs['phone_number'] || '',
    email: attrs['email'] || '',
    orgId: attrs['custom:orgId'] || '',
    siteId: attrs['custom:siteId'] || '',
    shift: attrs['custom:shift'] || undefined,
    assignedMachine: attrs['custom:machine'] || undefined,
    status: (attrs['custom:status'] as 'PENDING' | 'ACTIVE' | 'SUSPENDED') || 'ACTIVE',
  };
}

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
      const currentUser = await getCurrentUser();
      const attrs = await fetchUserAttributes();
      const appUser = buildUserFromAttributes(attrs as Record<string, string>, currentUser.userId);
      setUser(appUser);
    } catch (err) {
      // No current session on mount is expected (user not logged in)
      logger.debug('No existing auth session:', err);
    } finally {
      setLoading(false);
    }
  }

  const login = async (mobileNumber: string, emailOrUsername: string, password: string) => {
    setLoading(true);
    try {
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
        const currentUser = await getCurrentUser();
        const attrs = await fetchUserAttributes();
        const appUser = buildUserFromAttributes(attrs as Record<string, string>, currentUser.userId);
        setUser(appUser);
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
      const result = await confirmSignIn({ challengeResponse: code });

      if (result.isSignedIn) {
        const currentUser = await getCurrentUser();
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
