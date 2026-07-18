import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import RegisterTenant from './RegisterTenant';
import TermsOfService from './TermsOfService';
import Disclaimer from './Disclaimer';
import Pricing from './Pricing';
import LanguageToggle from '../components/LanguageToggle';

export default function Login() {
  const { login, forcePasswordChange, changePassword, otpPending, verifyOtp } = useAuth();
  const { t } = useLanguage();

  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState<'login' | 'register' | 'pricing'>('login');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [activeModal, setActiveModal] = useState<'terms' | 'disclaimer' | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(mobileNumber, mobileNumber, password);
    } catch (err: any) {
      setError(err.message || t('login.loginFailed'));
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
      setError(err.message || t('login.passwordChangeFailed'));
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
      setError(err.message || t('login.otpFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (activeModal === 'terms') {
    return <TermsOfService onClose={() => setActiveModal(null)} />;
  }

  if (activeModal === 'disclaimer') {
    return <Disclaimer onClose={() => setActiveModal(null)} />;
  }

  if (view === 'pricing') {
    return (
      <Pricing
        onRegisterClick={() => setView('register')}
        onBackClick={() => setView('login')}
      />
    );
  }

  if (view === 'register') {
    return (
      <RegisterTenant
        onBackToLogin={() => setView('login')}
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
      />
    );
  }

  if (forcePasswordChange) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="max-w-md w-full border border-black p-8">
          <div className="text-center mb-8">
            <img src="/atlas.png" alt="Atlas Logo" className="h-12 mx-auto mb-4 object-contain invert" />
            <h2 className="editorial-title text-2xl font-light">{t('login.newPasswordRequired')}</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">{t('login.changeTemporary')}</p>
          </div>

          {error && <div className="p-3 border border-black text-xs text-red-600 bg-red-50 mb-6">{error}</div>}

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label className="minimal-label">{t('login.newPassword')}</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="minimal-input"
                placeholder="Min 8 chars, upper + lower + number + symbol"
              />
            </div>

            <button type="submit" disabled={loading} className="w-full minimal-btn">
              {loading ? t('login.processing') : t('login.updatePassword')}
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
            <h2 className="editorial-title text-2xl font-light">{t('login.enterSecurityCode')}</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">{t('login.otpSentWhatsApp')}</p>
          </div>

          {error && <div className="p-3 border border-black text-xs text-red-600 bg-red-50 mb-6">{error}</div>}

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="minimal-label">{t('login.verificationCode')}</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                className="minimal-input text-center text-lg tracking-widest font-mono"
                placeholder="123456"
              />
              <p className="text-[10px] text-zinc-400 mt-2 font-mono text-center">{t('login.otpTip')}</p>
            </div>

            <button type="submit" disabled={loading} className="w-full minimal-btn">
              {loading ? t('login.verifying') : t('login.verifyCode')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <div className="md:w-1/2 bg-zinc-50 border-r border-black p-12 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <img src="/atlas.png" alt="Atlas Logo" className="h-12 object-contain" />
            <LanguageToggle />
          </div>
          <h1 className="editorial-title text-4xl lg:text-5xl font-light tracking-tight mt-12 mb-6">
            {t('login.brandTitle')} <br />{t('login.brandSubtitle')}
          </h1>
          <p className="font-serif italic text-zinc-600 text-lg leading-relaxed max-w-md">
            &ldquo;{t('login.brandQuote')}&rdquo;
          </p>
        </div>

        <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono mt-12">
          {t('login.poweredBy').replace('ChatWorks.', '').replace('ChatWorks', '')}
          <a
            href="https://www.chatworks.chat"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 no-underline hover:text-black hover:underline transition-colors"
          >
            ChatWorks
          </a>.
        </div>
      </div>

      <div className="md:w-1/2 flex flex-col justify-between p-12">
        <div />

        <div className="max-w-md w-full mx-auto my-auto">
          <div className="mb-8">
            <h2 className="editorial-title text-2xl font-light">{t('login.portalAccess')}</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">{t('login.signInUsing')}</p>
          </div>

          {error && <div className="p-3 border border-black text-xs text-red-600 bg-red-50 mb-6">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="minimal-label">{t('login.mobileNumber')}</label>
              <input
                type="text"
                required
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
                className="minimal-input"
                placeholder="email@example.com or +254..."
              />
            </div>

            <div>
              <label className="minimal-label">{t('login.password')}</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="minimal-input"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <button type="submit" disabled={loading} className="minimal-btn">
                {loading ? t('login.signingIn') : t('login.signIn')}
              </button>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setView('pricing')}
                  className="uppercase tracking-widest font-semibold border-b border-transparent hover:border-black transition-all"
                >
                  {t('login.viewPlans')}
                </button>
                <button
                  type="button"
                  onClick={() => setView('register')}
                  className="uppercase tracking-widest font-semibold border-b border-transparent hover:border-black transition-all"
                >
                  {t('login.registerOrg')}
                </button>
              </div>
            </div>
          </form>
        </div>

        <footer className="border-t border-zinc-100 pt-6 text-center text-[10px] text-zinc-400 uppercase tracking-widest mt-12 bg-white flex justify-center gap-6">
          <button onClick={() => setActiveModal('terms')} className="hover:text-black transition-colors font-semibold">
            {t('footer.termsOfService')}
          </button>
          <span>&bull;</span>
          <button onClick={() => setActiveModal('disclaimer')} className="hover:text-black transition-colors font-semibold">
            {t('footer.disclaimer')}
          </button>
        </footer>
      </div>
    </div>
  );
}
