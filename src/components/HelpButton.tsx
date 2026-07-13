import React from 'react';

interface HelpButtonProps {
  contextPage: string;
  onOpenHelp: () => void;
}

export default function HelpButton({ contextPage, onOpenHelp }: HelpButtonProps) {
  return (
    <button
      onClick={onOpenHelp}
      title={`Help for ${contextPage}`}
      className="inline-flex items-center justify-center w-6 h-6 border border-black text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-black hover:bg-zinc-100 transition-all"
      aria-label="Open help"
    >
      ?
    </button>
  );
}
