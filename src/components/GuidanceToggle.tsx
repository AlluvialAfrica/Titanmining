import React from 'react';
import { useGuidance } from '../contexts/GuidanceContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function GuidanceToggle() {
  const { guidanceEnabled, setGuidanceEnabled } = useGuidance();
  const { t } = useLanguage();

  return (
    <div className="flex gap-2 items-center text-xs uppercase tracking-widest font-medium">
      <span className="text-zinc-400">{t('guidance.label')}</span>
      <button
        onClick={() => setGuidanceEnabled(!guidanceEnabled)}
        className={`pb-1 transition-all ${
          guidanceEnabled
            ? 'border-b border-black text-black font-semibold'
            : 'text-gray-400 hover:text-black'
        }`}
      >
        {guidanceEnabled ? t('guidance.on') : t('guidance.off')}
      </button>
    </div>
  );
}
