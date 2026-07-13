import React, { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { useKPI } from '../../hooks/useKPI';
import { ROLE_KPI_PROFILES } from '../../types/kpiDefinitions';
import type { Role } from '../../types/roles';
import KPICard from '../../components/KPICard';
import TrendChart from '../../components/TrendChart';

type TimeRange = 'daily' | 'weekly' | 'monthly';

export default function KPIDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { getKPIHistory, getFieldsForRole } = useKPI();

  const [range, setRange] = useState<TimeRange>('daily');
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const profile = useMemo(() => {
    if (!user) return null;
    return ROLE_KPI_PROFILES[user.role as Role] ?? null;
  }, [user]);

  const fields = useMemo(() => {
    if (!user) return [];
    return getFieldsForRole(user.role);
  }, [user, getFieldsForRole]);

  const history = useMemo(() => getKPIHistory(7), [getKPIHistory]);

  // Latest entry values
  const latestValues: Record<string, number> = useMemo(() => {
    if (history.length === 0) return {};
    return history[0].values;
  }, [history]);

  // Trend data for selected field (last 7 days)
  const trendData = useMemo(() => {
    const key = selectedField ?? fields[0]?.key;
    if (!key) return [];
    return history
      .slice()
      .reverse()
      .map((entry) => ({
        label: entry.entryDate.slice(5), // MM-DD
        value: entry.values[key] ?? 0,
      }));
  }, [selectedField, fields, history]);

  const activeField = selectedField ?? fields[0]?.key ?? null;

  // ---------- Render ----------

  if (!user) return null;

  if (!profile) {
    return (
      <div className="py-4 space-y-6">
        <h1 className="editorial-title text-3xl font-light text-black">
          {t('kpi.dashboard.title')}
        </h1>
        <p className="text-sm text-zinc-500">{t('kpi.dashboard.noData')}</p>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-12">
      {/* Header */}
      <div>
        <h1 className="editorial-title text-3xl font-light mb-2 text-black">
          {t('kpi.dashboard.title')}
        </h1>
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold border-b border-black pb-4">
          {t('kpi.dashboard.subtitle')}
        </p>
      </div>

      {/* Time Range Toggle */}
      <div className="flex gap-2">
        {(['daily', 'weekly', 'monthly'] as TimeRange[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`text-[10px] uppercase tracking-widest font-semibold px-4 py-2 border transition-all ${
              range === r
                ? 'border-black bg-black text-white'
                : 'border-zinc-200 text-zinc-400 hover:border-black hover:text-black'
            }`}
          >
            {t(`kpi.dashboard.${r}`)}
          </button>
        ))}
      </div>

      {/* Overview Label */}
      <h2 className="font-serif italic text-lg text-black border-b border-zinc-200 pb-2">
        {t('kpi.dashboard.overview')}
      </h2>

      {/* KPI Cards Grid */}
      {history.length === 0 ? (
        <p className="text-sm text-zinc-500">{t('kpi.dashboard.noData')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((f) => (
            <div
              key={f.key}
              className={`cursor-pointer transition-shadow ${
                activeField === f.key ? 'ring-2 ring-black' : ''
              }`}
              onClick={() => setSelectedField(f.key)}
            >
              <KPICard
                label={t(f.labelKey)}
                value={latestValues[f.key] ?? 0}
                target={f.defaultTarget}
                unit={f.unit}
              />
            </div>
          ))}
        </div>
      )}

      {/* Trend Chart */}
      {trendData.length > 0 && activeField && (
        <div className="space-y-4">
          <h3 className="font-serif italic text-lg text-black border-b border-zinc-200 pb-2">
            {t('kpi.dashboard.trend')} &mdash;{' '}
            {t(fields.find((f) => f.key === activeField)?.labelKey ?? '')}
          </h3>
          <TrendChart
            data={trendData}
            maxValue={
              (fields.find((f) => f.key === activeField)?.defaultTarget ?? 1) * 1.5
            }
            height={180}
          />
        </div>
      )}

      {/* History Table */}
      {history.length > 0 && (
        <div>
          <h3 className="font-serif italic text-lg mb-4 text-black">
            {t('kpi.dashboard.history')}
          </h3>
          <div className="overflow-x-auto">
            <table className="editorial-table">
              <thead>
                <tr>
                  <th>{t('kpi.dashboard.date')}</th>
                  {fields.map((f) => (
                    <th key={f.key}>{t(f.labelKey)}</th>
                  ))}
                  <th>{t('kpi.dashboard.status')}</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => {
                  return (
                    <tr key={entry.id}>
                      <td className="font-mono text-xs">{entry.entryDate}</td>
                      {fields.map((f) => {
                        const val = entry.values[f.key] ?? 0;
                        const met = val >= f.defaultTarget;
                        return (
                          <td key={f.key}>
                            <span
                              className={`font-mono text-sm ${
                                met ? 'text-emerald-700' : 'text-red-600'
                              }`}
                            >
                              {val}
                            </span>
                            <span className="text-[9px] text-zinc-400 ml-1">
                              / {f.defaultTarget}
                            </span>
                          </td>
                        );
                      })}
                      <td>
                        <span className="text-[10px] font-semibold px-2 py-0.5 border uppercase tracking-wider border-black bg-zinc-50">
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
