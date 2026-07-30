import React, { useState, useRef, useEffect } from 'react';
import { useGuidance } from '../contexts/GuidanceContext';
import { useLanguage } from '../contexts/LanguageContext';

interface GuidanceBadgeProps {
  tipKey: string;
}

export default function GuidanceBadge({ tipKey }: GuidanceBadgeProps) {
  const { guidanceEnabled } = useGuidance();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  const translatedTip = t(`guidance.nav.${tipKey}`);

  if (!guidanceEnabled || translatedTip === `guidance.nav.${tipKey}`) {
    return null;
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

  return (
    <span className="relative inline-block ml-1" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="w-3.5 h-3.5 rounded-full bg-zinc-200 hover:bg-zinc-300 text-[8px] font-bold text-zinc-500 inline-flex items-center justify-center transition-colors"
        aria-label="Info"
      >
        ?
      </button>
      {open && (
        <span className="absolute left-full top-0 ml-2 z-50 w-52 bg-white border border-black p-2 shadow-sm block">
          <span className="text-[11px] text-zinc-700 leading-relaxed block">{translatedTip}</span>
        </span>
      )}
    </span>
  );
}
