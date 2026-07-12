import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { DEMO_USERS } from '../contexts/AuthContext';

export default function Login() {
  const { login, forcePasswordChange, changePassword, otpPending, verifyOtp } = useAuth();
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(mobileNumber, '', password);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await changePassword(newPassword);
    } catch (err: any) {
      setError(err.message || 'Password change failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp(otpCode);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const selectDemoUser = (user: any) => {
    setMobileNumber(user.mobileNumber);
    setPassword('TempPass123!');
  };

  if (forcePasswordChange) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="max-w-md w-full border border-black p-8">
          <div className="text-center mb-8">
            <img src="/atlas.png" alt="Atlas Logo" className="h-12 mx-auto mb-4 object-contain invert" />
            <h2 className="editorial-title text-2xl font-light">New Password Required</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">Change your temporary password</p>
          </div>

          {error && <div className="p-3 border border-black text-xs text-red-600 bg-red-50 mb-6">{error}</div>}

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label className="minimal-label">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="minimal-input"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="w-full minimal-btn">
              {loading ? 'Processing...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (otpPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="max-w-md w-full border border-black p-8">
          <div className="text-center mb-8">
            <img src="/atlas.png" alt="Atlas Logo" className="h-12 mx-auto mb-4 object-contain invert" />
            <h2 className="editorial-title text-2xl font-light">Enter Security Code</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">OTP sent to WhatsApp</p>
          </div>

          {error && <div className="p-3 border border-black text-xs text-red-600 bg-red-50 mb-6">{error}</div>}

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="minimal-label">6-Digit Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                className="minimal-input text-center text-lg tracking-widest font-mono"
                placeholder="123456"
              />
              <p className="text-[10px] text-zinc-400 mt-2 font-mono text-center">Tip: Enter "123456" or "1234" to bypass for testing</p>
            </div>

            <button type="submit" disabled={loading} className="w-full minimal-btn">
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left editorial branding block */}
      <div className="md:w-1/2 bg-zinc-50 border-r border-black p-12 flex flex-col justify-between">
        <div>
          <img src="/atlas.png" alt="Atlas Logo" className="h-12 mb-8 object-contain" />
          <h1 className="editorial-title text-4xl lg:text-5xl font-light tracking-tight mt-12 mb-6">
            Alluvial Mining <br />Site Manager
          </h1>
          <p className="font-serif italic text-zinc-600 text-lg leading-relaxed max-w-md">
            "High-fidelity digital record keeping and dual-verification flows for alluvial operations."
          </p>
        </div>
        
        <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono mt-12">
          ChatWorks WhiteLabel Outlet App
        </div>
      </div>

      {/* Right Login Form Block */}
      <div className="md:w-1/2 flex flex-col justify-center p-12">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="editorial-title text-2xl font-light">Portal Access</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">Sign in using mobile number</p>
          </div>

          {error && <div className="p-3 border border-black text-xs text-red-600 bg-red-50 mb-6">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="minimal-label">Mobile Number</label>
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
                className="minimal-input"
                placeholder="+254722828481"
              />
            </div>

            <div>
              <label className="minimal-label">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="minimal-input"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="w-full minimal-btn">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Login selector */}
          <div className="mt-12 pt-8 border-t border-zinc-100">
            <h3 className="text-xs uppercase tracking-widest text-zinc-400 mb-4 font-semibold">Test Profiles (Click to login)</h3>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map(u => (
                <button
                  key={u.id}
                  onClick={() => selectDemoUser(u)}
                  className="p-2 text-left border border-zinc-200 hover:border-black text-[11px] transition-all"
                >
                  <p className="font-semibold text-black">{u.firstName} {u.lastName}</p>
                  <p className="text-zinc-500 uppercase text-[9px] tracking-wide mt-1">{u.role.replace(/_/g, ' ')}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
