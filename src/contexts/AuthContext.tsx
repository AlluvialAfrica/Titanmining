import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role } from '../types/roles';

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

// Prepopulated demo users for testing each role
const DEMO_USERS: User[] = [
  {
    id: 'user_controller',
    firstName: 'Amoroso',
    lastName: 'Gombe',
    role: Role.SITE_CONTROLLER,
    mobileNumber: '+254722828481',
    email: 'agombe@a1strategy.com',
    orgId: 'org_alluvial_africa',
    siteId: 'site_migori_01',
    status: 'ACTIVE',
  },
  {
    id: 'user_geology',
    firstName: 'Moses',
    lastName: 'Kiprono',
    role: Role.MINING_GEOLOGY_LEAD,
    mobileNumber: '+254711223344',
    orgId: 'org_alluvial_africa',
    siteId: 'site_migori_01',
    status: 'ACTIVE',
  },
  {
    id: 'user_processing',
    firstName: 'David',
    lastName: 'Ochieng',
    role: Role.PROCESSING_RECOVERY_LEAD,
    mobileNumber: '+254722334455',
    orgId: 'org_alluvial_africa',
    siteId: 'site_migori_01',
    status: 'ACTIVE',
  },
  {
    id: 'user_fuel',
    firstName: 'Sarah',
    lastName: 'Wambui',
    role: Role.FUEL_ADMIN_LOGISTICS,
    mobileNumber: '+254733445566',
    orgId: 'org_alluvial_africa',
    siteId: 'site_migori_01',
    status: 'ACTIVE',
  },
  {
    id: 'user_excavator',
    firstName: 'Peter',
    lastName: 'Kamau',
    role: Role.EXCAVATOR_OPERATOR,
    mobileNumber: '+254744556677',
    orgId: 'org_alluvial_africa',
    siteId: 'site_migori_01',
    assignedMachine: 'CAT_1',
    status: 'ACTIVE',
  },
  {
    id: 'user_cashier',
    firstName: 'Grace',
    lastName: 'Muthoni',
    role: Role.SITE_PETTY_CASH_MANAGER,
    mobileNumber: '+254755667788',
    orgId: 'org_alluvial_africa',
    siteId: 'site_migori_01',
    status: 'ACTIVE',
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [forcePasswordChange, setForcePasswordChange] = useState(false);
  const [otpPending, setOtpPending] = useState(false);

  useEffect(() => {
    // Check if user session exists in localStorage
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = async (mobileNumber: string, emailOrUsername: string, password: string) => {
    setLoading(true);
    try {
      const customUsers = JSON.parse(localStorage.getItem('registeredTenants') || '[]');
      // Find matching demo user by phone number
      const match = [...DEMO_USERS, ...customUsers].find(
        u => u.mobileNumber === mobileNumber || u.email === emailOrUsername
      );

      if (!match) {
        throw new Error('Invalid mobile number or credentials.');
      }

      // Check if user is pending first login
      if (match.status === 'PENDING') {
        setTempUser(match);
        setForcePasswordChange(true);
        setLoading(false);
        return;
      }

      // Simulate sending WhatsApp OTP
      console.log(`[WhatsApp OTP] Sending security code to ${match.mobileNumber}...`);
      setTempUser(match);
      setOtpPending(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const changePassword = async (newPassword: string) => {
    setLoading(true);
    if (tempUser) {
      const updatedUser = { ...tempUser, status: 'ACTIVE' as const };
      setTempUser(updatedUser);
      setForcePasswordChange(false);
      setOtpPending(true);
      console.log(`[WhatsApp OTP] Sending security code to ${updatedUser.mobileNumber}...`);
    }
    setLoading(false);
  };

  const verifyOtp = async (code: string) => {
    setLoading(true);
    try {
      if (code === '123456' || code === '1234') { // master bypass code
        if (tempUser) {
          setUser(tempUser);
          localStorage.setItem('currentUser', JSON.stringify(tempUser));
          setTempUser(null);
          setOtpPending(false);
        }
        setLoading(false);
      } else {
        throw new Error('Invalid verification code.');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('currentUser');
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
export { DEMO_USERS };
