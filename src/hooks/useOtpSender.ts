import { useState } from 'react';

const OTP_SENDER_URL = import.meta.env.VITE_OTP_SENDER_URL;

export function useOtpSender() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = async (phone: string, code: string): Promise<boolean> => {
    setSending(true);
    setError(null);

    try {
      const res = await fetch(OTP_SENDER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to send OTP');
        return false;
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Network error');
      return false;
    } finally {
      setSending(false);
    }
  };

  return { sendOtp, sending, error };
}
