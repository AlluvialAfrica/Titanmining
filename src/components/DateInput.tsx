import React, { useState, useEffect, useRef } from 'react';
import { formatDateDDMMYYYY, parseDDMMYYYYToISO, isValidDDMMYYYY } from '../utils/dateFormat';

interface DateInputProps {
  /** ISO YYYY-MM-DD value for storage */
  value?: string;
  /** Called with ISO YYYY-MM-DD when the user enters a valid date */
  onChange: (isoDate: string) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Date input with DD/MM/YYYY mask and auto-slash insertion.
 * Falls back to native date picker via a secondary hidden input.
 * Stores and emits ISO YYYY-MM-DD values.
 */
export default function DateInput({
  value,
  onChange,
  className = 'minimal-input',
  required,
  disabled,
  placeholder = 'DD/MM/YYYY',
}: DateInputProps) {
  const [display, setDisplay] = useState(() => (value ? formatDateDDMMYYYY(value) : ''));
  const nativeRef = useRef<HTMLInputElement>(null);

  // Sync external value changes
  useEffect(() => {
    const formatted = value ? formatDateDDMMYYYY(value) : '';
    if (formatted !== display) setDisplay(formatted);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9\/]/g, '');

    // Auto-insert slashes after DD and MM
    // Only auto-insert if the user is adding characters (not deleting)
    const prevLen = display.length;
    if (raw.length > prevLen) {
      if (raw.length === 2 && !raw.includes('/')) {
        raw += '/';
      } else if (raw.length === 5 && raw.charAt(2) === '/' && raw.indexOf('/', 3) === -1) {
        raw += '/';
      }
    }

    // Cap at DD/MM/YYYY length
    if (raw.length > 10) raw = raw.slice(0, 10);

    setDisplay(raw);

    // Emit ISO value when a complete valid date is entered
    if (raw.length === 10 && isValidDDMMYYYY(raw)) {
      onChange(parseDDMMYYYYToISO(raw));
    }
  };

  const handleBlur = () => {
    if (display && display.length === 10 && isValidDDMMYYYY(display)) {
      onChange(parseDDMMYYYYToISO(display));
    }
  };

  // Native date picker handler (calendar icon click)
  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value; // YYYY-MM-DD from native input
    if (isoVal) {
      setDisplay(formatDateDDMMYYYY(isoVal));
      onChange(isoVal);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        required={required}
        disabled={disabled}
        maxLength={10}
      />
      {/* Hidden native date input for calendar fallback */}
      <input
        ref={nativeRef}
        type="date"
        value={value || ''}
        onChange={handleNativeChange}
        className="absolute right-0 top-0 w-8 h-full opacity-0 cursor-pointer"
        tabIndex={-1}
        disabled={disabled}
      />
    </div>
  );
}
