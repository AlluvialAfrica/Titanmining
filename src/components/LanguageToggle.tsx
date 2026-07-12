import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-4 items-center text-xs uppercase tracking-widest font-medium">
      <button
        onClick={() => setLanguage('en')}
        className={`pb-1 transition-all ${
          language === 'en'
            ? 'border-b border-black text-black font-semibold'
            : 'text-gray-400 hover:text-black'
        }`}
      >
        EN
      </button>
      <span className="text-gray-300">/</span>
      <button
        onClick={() => setLanguage('fr')}
        className={`pb-1 transition-all ${
          language === 'fr'
            ? 'border-b border-black text-black font-semibold'
            : 'text-gray-400 hover:text-black'
        }`}
      >
        FR
      </button>
    </div>
  );
}
