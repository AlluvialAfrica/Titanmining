import React, { useState } from 'react';
import SignatureOrOtp from './SignatureOrOtp';
import { useLanguage } from '../contexts/LanguageContext';

export interface SignatorySlot {
  role: string;
  label: string;
  required: boolean;
}

interface MultiSignatureFooterProps {
  signatories: SignatorySlot[];
  onSignaturesChange: (signatures: Record<string, string>) => void;
}

export default function MultiSignatureFooter({ signatories, onSignaturesChange }: MultiSignatureFooterProps) {
  const { t } = useLanguage();
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);

  const handleVerified = (role: string, value: string) => {
    const updated = { ...signatures, [role]: value };
    setSignatures(updated);
    onSignaturesChange(updated);
    if (value) {
      setExpandedSlot(null);
    }
  };

  return (
    <div className="border-t border-black pt-6 space-y-4">
      <h3 className="text-xs uppercase tracking-widest font-semibold text-zinc-500 mb-4">
        {t('multiSignature.title') || 'Sign-Off Verification'}
      </h3>

      <div className="grid grid-cols-1 gap-4">
        {signatories.map((slot) => {
          const isSigned = !!signatures[slot.role];
          const isExpanded = expandedSlot === slot.role;

          return (
            <div key={slot.role} className="border border-zinc-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest">
                    {slot.label}
                  </span>
                  {slot.required && (
                    <span className="text-[10px] text-red-500 font-semibold">*</span>
                  )}
                </div>
                {isSigned ? (
                  <span className="flex items-center gap-1 text-xs text-green-700 font-semibold uppercase tracking-widest">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {t('multiSignature.signed') || 'Signed'}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setExpandedSlot(isExpanded ? null : slot.role)}
                    className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-black font-semibold border-b border-transparent hover:border-black transition-all"
                  >
                    {isExpanded ? (t('multiSignature.collapse') || 'Collapse') : (t('multiSignature.signNow') || 'Sign Now')}
                  </button>
                )}
              </div>

              {isExpanded && !isSigned && (
                <div className="mt-3">
                  <SignatureOrOtp onVerified={(value) => handleVerified(slot.role, value)} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
