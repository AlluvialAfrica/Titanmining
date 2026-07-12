import React from 'react';

interface VarianceAlertProps {
  type: 'warning' | 'error' | 'info';
  message: string;
}

export default function VarianceAlert({ type, message }: VarianceAlertProps) {
  const borderStyle = type === 'error' ? 'border-2 border-black' : 'border border-black';
  const bgStyle = type === 'error' ? 'bg-zinc-100' : 'bg-white';

  return (
    <div className={`p-4 my-4 flex gap-3 items-center ${borderStyle} ${bgStyle} transition-all`}>
      <span className="text-lg font-bold">⚠️</span>
      <div className="flex-1">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-black mb-1">
          {type} detected
        </h4>
        <p className="text-sm text-black font-serif italic">
          {message}
        </p>
      </div>
    </div>
  );
}
