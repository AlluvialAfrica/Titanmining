import React from 'react';

interface KPICardProps {
  label: string;
  value: number;
  target: number;
  unit?: string;
}

export default function KPICard({ label, value, target, unit }: KPICardProps) {
  const pct = target === 0 ? (value === 0 ? 100 : 999) : Math.round((value / target) * 100);
  const met = value >= target;

  return (
    <div
      className={`border border-black p-6 bg-white ${
        met ? 'border-b-4 border-b-emerald-600' : 'border-b-4 border-b-red-500'
      }`}
    >
      <p className="minimal-label">{label}</p>

      <p className="font-serif italic text-3xl font-light text-black mt-2">
        {value.toLocaleString()}
        {unit ? (
          <span className="text-base font-sans not-italic text-zinc-400 ml-1">{unit}</span>
        ) : null}
      </p>

      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">
        Target: {target.toLocaleString()}
        {unit ? ` ${unit}` : ''}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1 bg-zinc-100 overflow-hidden">
          <div
            className={`h-full transition-all ${met ? 'bg-emerald-600' : 'bg-red-500'}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider ${
            met ? 'text-emerald-700' : 'text-red-600'
          }`}
        >
          {pct}%
        </span>
      </div>
    </div>
  );
}
