import React from 'react';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { useLanguage } from '../contexts/LanguageContext';

export default function OfflineBanner() {
  const { isOnline } = useOfflineSync();
  const { t } = useLanguage();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 w-full bg-black text-white text-center py-2 text-xs uppercase tracking-widest font-medium z-50 transition-all duration-300">
      {t('offline.banner')}
    </div>
  );
}
