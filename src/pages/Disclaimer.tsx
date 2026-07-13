import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Disclaimer({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="max-w-3xl mx-auto p-12 bg-white text-black border border-black my-8 relative">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-xs uppercase tracking-widest text-zinc-400 hover:text-black font-semibold"
      >
        [{t('disclaimer.close')}]
      </button>

      <h1 className="editorial-title text-3xl font-light mb-8 border-b border-black pb-4">
        {t('disclaimer.title')}
      </h1>

      <div className="space-y-6 font-serif italic text-zinc-700 leading-relaxed text-sm">
        <p>
          {t('disclaimer.intro')}
        </p>

        <h3 className="font-semibold text-black uppercase tracking-wider text-xs not-italic mt-8">{t('disclaimer.warrantiesTitle')}</h3>
        <p>
          {t('disclaimer.warranties')}
        </p>

        <h3 className="font-semibold text-black uppercase tracking-wider text-xs not-italic mt-8">{t('disclaimer.complianceTitle')}</h3>
        <p>
          {t('disclaimer.compliance')}
        </p>
      </div>

      <div className="mt-12 pt-6 border-t border-zinc-200 text-center">
        <button onClick={onClose} className="minimal-btn">
          {t('disclaimer.acknowledge')}
        </button>
      </div>
    </div>
  );
}
