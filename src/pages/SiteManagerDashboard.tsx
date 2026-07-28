import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useReport } from '../hooks/useReport';
import { useLanguage } from '../contexts/LanguageContext';
import { formatDateDDMMYYYY } from '../utils/dateFormat';

const TEMPLATE_IDS = Array.from({ length: 17 }, (_, i) => `TEMPLATE_${String(i + 1).padStart(2, '0')}`);

interface ReportSummary {
  templateId: string;
  submitted: boolean;
  latestData?: Record<string, any>;
  submittedAt?: string;
}

export default function SiteManagerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { getReportHistory } = useReport();
  const [history, setHistory] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month'>('today');
  const [templateFilter, setTemplateFilter] = useState<string>('ALL');

  useEffect(() => {
    getReportHistory()
      .then(setHistory)
      .catch(() => setHistory([]));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  const getFilteredHistory = () => {
    let cutoff = today;
    if (dateFilter === 'week') cutoff = weekAgo;
    if (dateFilter === 'month') cutoff = monthAgo;

    return history.filter((h: any) => {
      const reportDate = h.submittedAt ? new Date(h.submittedAt).toISOString().split('T')[0] : '';
      const matchDate = reportDate >= cutoff;
      const matchTemplate = templateFilter === 'ALL' || h.reportType === templateFilter;
      return matchDate && matchTemplate;
    });
  };

  const filtered = getFilteredHistory();

  // Report completion status for today
  const todayReports = history.filter((h: any) => {
    const reportDate = h.submittedAt ? new Date(h.submittedAt).toISOString().split('T')[0] : '';
    return reportDate === today;
  });

  const completionStatus: ReportSummary[] = TEMPLATE_IDS.map(tid => {
    const matching = todayReports.filter((h: any) => h.reportType === tid);
    const latest = matching.length > 0 ? matching[matching.length - 1] : null;
    let parsedData: Record<string, any> = {};
    if (latest) {
      try {
        parsedData = typeof latest.data === 'string' ? JSON.parse(latest.data) : (latest.data || {});
      } catch { parsedData = {}; }
    }
    return {
      templateId: tid,
      submitted: matching.length > 0,
      latestData: parsedData,
      submittedAt: latest?.submittedAt,
    };
  });

  // Key metrics from today's data
  const getMetric = (tid: string, key: string): number => {
    const summary = completionStatus.find(s => s.templateId === tid);
    return Number(summary?.latestData?.[key] || 0);
  };

  const totalGold = getMetric('TEMPLATE_01', 'totalGoldRecoveryG');
  const fuelVariance = getMetric('TEMPLATE_01', 'fuelVarianceL');
  const staffPresent = getMetric('TEMPLATE_01', 'totalPresent');
  const staffAbsent = getMetric('TEMPLATE_01', 'totalAbsent');
  const cashUsed = getMetric('TEMPLATE_01', 'cashUsed');
  const completedCount = completionStatus.filter(s => s.submitted).length;

  // ---------------------------------------------------------------------------
  // Variance Alerts — compare current values against trailing 3-month averages
  // ---------------------------------------------------------------------------
  const varianceAlerts: { label: string; current: number; average: number; pctChange: number; severity: 'amber' | 'red' }[] = [];

  if (history.length >= 30) {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
    const historicalT01 = history.filter((h: any) => {
      if (h.reportType !== 'TEMPLATE_01') return false;
      const d = h.submittedAt ? new Date(h.submittedAt).toISOString().split('T')[0] : '';
      return d >= ninetyDaysAgo && d < today;
    });

    if (historicalT01.length > 0) {
      const avgOf = (key: string) => {
        const vals = historicalT01.map((h: any) => {
          try {
            const d = typeof h.data === 'string' ? JSON.parse(h.data) : (h.data || {});
            return Number(d[key] || 0);
          } catch { return 0; }
        });
        return vals.reduce((a: number, b: number) => a + b, 0) / vals.length;
      };

      const checks = [
        { label: 'Fuel Variance', key: 'fuelVarianceL', current: fuelVariance },
        { label: 'Cash Used', key: 'cashUsed', current: cashUsed },
        { label: 'Total Gold', key: 'totalGoldRecoveryG', current: totalGold },
      ];

      for (const chk of checks) {
        const avg = avgOf(chk.key);
        if (avg !== 0) {
          const pct = ((chk.current - avg) / Math.abs(avg)) * 100;
          if (Math.abs(pct) > 5) {
            varianceAlerts.push({
              label: chk.label,
              current: chk.current,
              average: parseFloat(avg.toFixed(2)),
              pctChange: parseFloat(pct.toFixed(1)),
              severity: Math.abs(pct) > 15 ? 'red' : 'amber',
            });
          }
        }
      }
    }
  }

  const handleExportPdf = (report: any) => {
    const win = window.open('', '_blank');
    if (!win) return;
    let parsedData: any = {};
    try {
      parsedData = typeof report.data === 'string' ? JSON.parse(report.data) : (report.data || {});
    } catch { parsedData = { raw: report.data }; }
    const dataRows = Object.entries(parsedData)
      .map(([k, v]) => `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">${k}</td><td style="padding:8px;border:1px solid #ddd;">${typeof v === 'object' ? JSON.stringify(v) : v}</td></tr>`)
      .join('');
    win.document.write(`<html><head><title>Report - ${report.reportType}</title>
      <style>body{font-family:'Georgia',serif;padding:40px;color:#111;}h1{font-weight:normal;border-bottom:2px solid #000;padding-bottom:10px;}.meta{margin-bottom:20px;font-family:sans-serif;font-size:13px;color:#444;}table{width:100%;border-collapse:collapse;margin-top:20px;}.print-btn{background:#000;color:#fff;border:none;padding:10px 20px;cursor:pointer;margin-bottom:20px;}@media print{.print-btn{display:none;}}</style></head>
      <body><button class="print-btn" onclick="window.print()">Print / Save PDF</button>
      <h1>TITAN MINING - OFFICIAL REPORT</h1>
      <div class="meta"><p><strong>Report Type:</strong> ${report.reportType}</p><p><strong>Organization:</strong> ${report.orgId}</p><p><strong>Site:</strong> ${report.siteId || 'N/A'}</p><p><strong>Submitted By:</strong> ${report.userId}</p><p><strong>Date:</strong> ${new Date(report.submittedAt).toLocaleString()}</p><p><strong>Status:</strong> ${report.status}</p></div>
      <h2>Report Data</h2><table><thead><tr style="background:#f4f4f4;"><th style="padding:8px;border:1px solid #ddd;text-align:left;">Field</th><th style="padding:8px;border:1px solid #ddd;text-align:left;">Value</th></tr></thead><tbody>${dataRows}</tbody></table></body></html>`);
    win.document.close();
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="editorial-title text-2xl font-light">
          {user?.role === 'ENTERPRISE_MANAGER' ? 'Commercial Overview' : t('siteManagerDashboard.title')}
        </h1>
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mt-1">
          {user?.role === 'ENTERPRISE_MANAGER' ? 'Commercial and operational overview of the enterprise' : t('siteManagerDashboard.subtitle')}
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-black p-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">{t('siteManagerDashboard.totalGold')}</p>
          <p className="text-2xl font-serif italic mt-1">{totalGold.toFixed(2)}g</p>
        </div>
        <div className="border border-black p-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">{t('siteManagerDashboard.fuelVariance')}</p>
          <p className={`text-2xl font-serif italic mt-1 ${fuelVariance !== 0 ? 'text-red-600' : ''}`}>{fuelVariance.toFixed(1)}L</p>
        </div>
        <div className="border border-black p-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">{t('siteManagerDashboard.staffPresent')}</p>
          <p className="text-2xl font-serif italic mt-1">{staffPresent} / {staffPresent + staffAbsent}</p>
        </div>
        <div className="border border-black p-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">{t('siteManagerDashboard.cashUsed')}</p>
          <p className="text-2xl font-serif italic mt-1">${cashUsed.toFixed(2)}</p>
        </div>
      </div>

      {/* Variance Alerts */}
      {varianceAlerts.length > 0 && (
        <div>
          <h2 className="font-serif italic text-lg mb-4 text-black border-b border-zinc-150 pb-1">
            Consumables Variance Alerts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {varianceAlerts.map((alert, idx) => (
              <div
                key={idx}
                className={`border p-4 ${alert.severity === 'red' ? 'border-red-500 bg-red-50' : 'border-amber-500 bg-amber-50'}`}
              >
                <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-600">{alert.label}</p>
                <p className={`text-xl font-serif italic mt-1 ${alert.severity === 'red' ? 'text-red-600' : 'text-amber-600'}`}>
                  {alert.pctChange > 0 ? '+' : ''}{alert.pctChange}%
                </p>
                <div className="flex justify-between mt-2 text-[10px] text-zinc-500">
                  <span>Current: {alert.current}</span>
                  <span>3-mo avg: {alert.average}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Completion Status */}
      <div>
        <h2 className="font-serif italic text-lg mb-4 text-black border-b border-zinc-150 pb-1">
          {t('siteManagerDashboard.completionStatus')} ({completedCount}/{TEMPLATE_IDS.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {completionStatus.map((s) => (
            <div
              key={s.templateId}
              className={`border p-3 text-center ${s.submitted ? 'border-green-500 bg-green-50' : 'border-zinc-200 bg-zinc-50'}`}
            >
              <p className="text-[10px] uppercase tracking-widest font-semibold">{s.templateId.replace('TEMPLATE_', 'T')}</p>
              <p className="text-xs text-zinc-600 mt-1 truncate">{t(`reports.${s.templateId}`)}</p>
              <span className={`text-lg mt-1 inline-block ${s.submitted ? 'text-green-600' : 'text-zinc-300'}`}>
                {s.submitted ? '\u2713' : '\u2717'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports Table */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="font-serif italic text-lg text-black">{t('siteManagerDashboard.recentReports')}</h2>
          <div className="flex gap-2">
            {(['today', 'week', 'month'] as const).map(period => (
              <button
                key={period}
                onClick={() => setDateFilter(period)}
                className={`text-[10px] uppercase tracking-widest font-semibold px-3 py-1 border ${dateFilter === period ? 'border-black bg-black text-white' : 'border-zinc-300 text-zinc-500 hover:border-black'}`}
              >
                {t(`siteManagerDashboard.${period}`)}
              </button>
            ))}
            <select
              value={templateFilter}
              onChange={e => setTemplateFilter(e.target.value)}
              className="text-xs border border-zinc-300 px-2 py-1"
            >
              <option value="ALL">{t('common.all')}</option>
              {TEMPLATE_IDS.map(tid => (
                <option key={tid} value={tid}>{t(`reports.${tid}`)}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="border border-black p-8 text-center text-zinc-500 font-serif italic">
            {t('siteManagerDashboard.noReports')}
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="editorial-table">
            <thead>
              <tr>
                <th>{t('history.date')}</th>
                <th>{t('history.type')}</th>
                <th>{t('history.submittedBy')}</th>
                <th>{t('history.status')}</th>
                <th>{t('siteManagerDashboard.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h: any) => (
                <tr key={h.id || h.submittedAt}>
                  <td>{formatDateDDMMYYYY(h.submittedAt)}</td>
                  <td className="font-serif italic font-semibold">{t(`reports.${h.reportType}`) || h.reportType}</td>
                  <td>{h.userId}</td>
                  <td>
                    <span className="text-[10px] font-semibold bg-zinc-150 border border-black px-2 py-0.5 uppercase tracking-wider">
                      {h.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleExportPdf(h)}
                      className="text-xs font-mono underline hover:text-blue-600"
                    >
                      {t('siteManagerDashboard.exportPdf')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
