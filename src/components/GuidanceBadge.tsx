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
  const hasTranslation = translatedTip !== `guidance.nav.${tipKey}`;
  const isActive = guidanceEnabled && hasTranslation;

  // Close on outside click — hook always runs regardless of isActive
  useEffect(() => {
    if (!open || !isActive) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, isActive]);

  // Reset open state when guidance is turned off
  useEffect(() => {
    if (!isActive) setOpen(false);
  }, [isActive]);

  if (!isActive) {
    return null;
  }

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
