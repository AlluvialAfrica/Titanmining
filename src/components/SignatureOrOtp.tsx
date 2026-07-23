import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { useOtpSender } from '../hooks/useOtpSender';
import DigitalSignature from './DigitalSignature';

interface SignatureOrOtpProps {
  onVerified: (signatureValue: string) => void;
}

export default function SignatureOrOtp({ onVerified }: SignatureOrOtpProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { sendOtp, sending, error: sendError } = useOtpSender();

  const [tab, setTab] = useState<'signature' | 'otp'>('signature');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phone = user?.mobileNumber || '';

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      return;
    }
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [cooldown]);

  const handleTabChange = (newTab: 'signature' | 'otp') => {
    setTab(newTab);
    // Reset verification state and clear parent value
    setOtpSent(false);
    setGeneratedCode('');
    setEnteredCode('');
    setVerified(false);
    setVerifyError('');
    onVerified('');
  };

  const handleSendOtp = async () => {
    if (!phone) return;
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedCode(code);
    setEnteredCode('');
    setVerified(false);
    setVerifyError('');

    const ok = await sendOtp(phone, code);
    if (ok) {
      setOtpSent(true);
      setCooldown(60);
    }
  };

  const handleVerify = () => {
    if (enteredCode === generatedCode) {
      setVerified(true);
      setVerifyError('');
      const last4 = phone.slice(-4);
      onVerified(`OTP_VERIFIED:${Date.now()}:${last4}`);
    } else {
      setVerifyError(t('otp.invalidCode'));
    }
  };

  return (
    <div className="w-full">
      {/* Tab buttons */}
      <div className="flex border-b border-zinc-300 mb-4">
        <button
          type="button"
          onClick={() => handleTabChange('signature')}
          className={`px-4 py-2 text-[10px] uppercase tracking-widest font-semibold transition-all ${
            tab === 'signature'
              ? 'border-b-2 border-black text-black'
              : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          {t('otp.drawSignature')}
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('otp')}
          className={`px-4 py-2 text-[10px] uppercase tracking-widest font-semibold transition-all ${
            tab === 'otp'
              ? 'border-b-2 border-black text-black'
              : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          {t('otp.verifyViaOtp')}
        </button>
      </div>

      {/* Tab content */}
      {tab === 'signature' ? (
        <DigitalSignature onSign={onVerified} />
      ) : (
        <div className="space-y-4">
          {!phone ? (
            <p className="text-xs text-red-600 font-semibold">
              {t('otp.noPhoneNumber')}
            </p>
          ) : verified ? (
            <div className="flex items-center gap-2 py-4 px-3 bg-zinc-50 border border-zinc-200">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-semibold text-green-700 uppercase tracking-widest">
                {t('otp.verified')}
              </span>
            </div>
          ) : (
            <>
              <p className="text-xs text-zinc-500">
                {t('otp.sendingTo')} ***{phone.slice(-4)}
              </p>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sending}
                  className="minimal-btn text-xs"
                >
                  {sending ? t('otp.sending') : t('otp.sendOtp')}
                </button>
              ) : (
                <>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={enteredCode}
                        onChange={(e) => {
                          setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                          setVerifyError('');
                        }}
                        placeholder="000000"
                        className="minimal-input text-center tracking-[0.5em] font-mono text-lg"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={enteredCode.length !== 6}
                      className="minimal-btn text-xs"
                    >
                      {t('otp.verifyCode')}
                    </button>
                  </div>

                  {verifyError && (
                    <p className="text-xs text-red-600">{verifyError}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sending || cooldown > 0}
                    className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-black font-semibold border-b border-transparent hover:border-black transition-all disabled:opacity-40 disabled:hover:text-zinc-500 disabled:hover:border-transparent"
                  >
                    {cooldown > 0
                      ? t('otp.resendIn', { seconds: String(cooldown) })
                      : t('otp.resendOtp')}
                  </button>
                </>
              )}

              {sendError && (
                <p className="text-xs text-red-600">{t('otp.sendFailed')}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
