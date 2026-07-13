import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { ROLE_KPI_PROFILES } from '../../types/kpiDefinitions';
import { useKPI } from '../../hooks/useKPI';
import type { Role } from '../../types/roles';

export default function KPIInputForm() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { submitKPIEntry, saveDraft, loadDraft, loading } = useKPI();

  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [shift, setShift] = useState<'DAY' | 'NIGHT'>('DAY');
  const [values, setValues] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const profile = useMemo(() => {
    if (!user) return null;
    return ROLE_KPI_PROFILES[user.role as Role] ?? null;
  }, [user]);

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setValues(draft.values);
      setEntryDate(draft.entryDate);
      setShift(draft.shift);
    }
  }, [loadDraft]);

  // Initialise values from profile defaults when profile changes
  useEffect(() => {
    if (!profile) return;
    setValues((prev) => {
      const next = { ...prev };
      for (const cat of profile.categories) {
        for (const field of cat.fields) {
          if (next[field.key] === undefined) {
            next[field.key] = 0;
          }
        }
      }
      return next;
    });
  }, [profile]);

  const handleChange = (key: string, raw: string) => {
    const num = raw === '' ? 0 : parseFloat(raw);
    setValues((prev) => ({ ...prev, [key]: isNaN(num) ? 0 : num }));
  };

  const handleSaveDraft = () => {
    saveDraft(values, entryDate, shift);
    setSubmitted(false);
    setError('');
    // Brief visual confirmation
    setError('');
    alert(t('kpi.input.savedDraft'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitted(false);
    try {
      await submitKPIEntry(values, entryDate, shift);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || t('kpi.input.submitFailed'));
    }
  };

  // ---------- Render ----------

  if (!user) return null;

  if (!profile) {
    return (
      <div className="py-4 space-y-6">
        <h1 className="editorial-title text-3xl font-light text-black">{t('kpi.input.title')}</h1>
        <p className="text-sm text-zinc-500">{t('kpi.input.noProfile')}</p>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-12">
      {/* Header */}
      <div>
        <h1 className="editorial-title text-3xl font-light mb-2 text-black">
          {t('kpi.input.title')}
        </h1>
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold border-b border-black pb-4">
          {t('kpi.input.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Date & Shift */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="minimal-label">{t('kpi.input.entryDate')}</label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="minimal-input"
            />
          </div>
          <div>
            <label className="minimal-label">{t('kpi.input.shift')}</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value as 'DAY' | 'NIGHT')}
              className="minimal-select"
            >
              <option value="DAY">{t('kpi.input.shiftDay')}</option>
              <option value="NIGHT">{t('kpi.input.shiftNight')}</option>
            </select>
          </div>
        </div>

        {/* KPI Categories */}
        {profile.categories.map((cat) => (
          <div key={cat.categoryKey} className="space-y-4">
            <h2 className="font-serif italic text-lg text-black border-b border-zinc-200 pb-2">
              {t(cat.categoryKey)}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.fields.map((field) => (
                <div key={field.key}>
                  <label className="minimal-label">{t(field.labelKey)}</label>
                  <input
                    type="number"
                    step="any"
                    value={values[field.key] ?? 0}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="minimal-input"
                    disabled={field.calculated}
                    required={field.required}
                  />
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-1">
                    {t('kpi.input.target')}: {field.defaultTarget}
                    {field.unit ? ` ${field.unit}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Feedback */}
        {submitted && (
          <div className="border border-black bg-zinc-50 p-4">
            <p className="text-xs uppercase tracking-widest text-emerald-700 font-semibold">
              {t('kpi.input.submitSuccess')}
            </p>
          </div>
        )}
        {error && (
          <div className="border border-red-500 bg-red-50 p-4">
            <p className="text-xs uppercase tracking-widest text-red-600 font-semibold">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-black">
          <button type="submit" className="minimal-btn" disabled={loading}>
            {loading ? t('kpi.input.submitting') : t('kpi.input.submit')}
          </button>
          <button type="button" onClick={handleSaveDraft} className="minimal-btn-secondary">
            {t('kpi.input.saveDraft')}
          </button>
        </div>
      </form>
    </div>
  );
}
