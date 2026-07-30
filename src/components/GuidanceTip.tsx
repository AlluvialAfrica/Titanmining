import React, { useState, useRef, useEffect } from 'react';
import { useGuidance } from '../contexts/GuidanceContext';
import { useLanguage } from '../contexts/LanguageContext';

interface GuidanceTipProps {
  tipKey: string;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom';
}

export default function GuidanceTip({ tipKey, children, position = 'top' }: GuidanceTipProps) {
  const { guidanceEnabled } = useGuidance();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const translatedTip = t(`guidance.${tipKey}`);

  // If guidance is off or the key has no translation, render children only
  if (!guidanceEnabled || translatedTip === `guidance.${tipKey}`) {
    return <>{children}</>;
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const positionClasses = {
    top: 'bottom-full left-0 mb-2',
    right: 'left-full top-0 ml-2',
    bottom: 'top-full left-0 mt-2',
  };

  return (
    <div className="relative" ref={ref}>
      {children}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-200 hover:bg-zinc-300 text-[9px] font-bold text-zinc-600 flex items-center justify-center z-10 transition-colors"
        aria-label="Help"
      >
        i
      </button>
      {open && (
        <div
          className={`absolute ${positionClasses[position]} z-50 w-64 bg-white border border-black p-3 shadow-sm`}
        >
          <p className="text-xs text-zinc-700 leading-relaxed mb-2">{translatedTip}</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500 hover:text-black"
          >
            {t('guidance.dismiss')}
          </button>
        </div>
      )}
    </div>
  );
}
