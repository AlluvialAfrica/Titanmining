import React, { useState, useEffect, Suspense, lazy } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Role, ROLE_PERMISSIONS } from '../types/roles';
import { useLanguage } from '../contexts/LanguageContext';
import { logger } from '../utils/logger';
import LanguageToggle from '../components/LanguageToggle';
import OfflineBanner from '../components/OfflineBanner';
import HelpButton from '../components/HelpButton';
import { useReport } from '../hooks/useReport';

// Lazy-loaded page components for code-splitting
const FuelReconciliation = lazy(() => import('./reports/FuelReconciliation'));
const SiteDailySummary = lazy(() => import('./reports/SiteDailySummary'));
const GenericReportForm = lazy(() => import('./reports/GenericReportForm'));
const UserManagement = lazy(() => import('./UserManagement'));
const InstitutionalProfile = lazy(() => import('./InstitutionalProfile'));
const KPIInputForm = lazy(() => import('./kpi/KPIInputForm'));
const KPIDashboard = lazy(() => import('./kpi/KPIDashboard'));
const TeamKPIDashboard = lazy(() => import('./kpi/TeamKPIDashboard'));
const RoleProfile = lazy(() => import('./profile/RoleProfile'));
const HelpViewer = lazy(() => import('./help/HelpViewer'));
const TermsOfService = lazy(() => import('./TermsOfService'));
const Disclaimer = lazy(() => import('./Disclaimer'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));

type TabType = 'form' | 'history' | 'users' | 'settings' | 'kpiInput' | 'kpiDashboard' | 'teamDashboard' | 'profile' | 'help';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { getReportHistory } = useReport();
  const [activeTab, setActiveTab] = useState<TabType>('form');
  const [selectedControllerForm, setSelectedControllerForm] = useState<string>('TEMPLATE_01');
  const [activeModal, setActiveModal] = useState<'terms' | 'disclaimer' | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    getReportHistory().then(setHistory).catch((err) => {
      logger.error('Failed to load report history:', err);
      toast.error('Failed to load report history.');
      setHistory([]);
    });
  }, []);

  const suspenseFallback = (
    <div className="flex items-center justify-center py-12">
      <span className="font-serif italic text-zinc-400">Loading...</span>
    </div>
  );

  if (activeModal === 'terms') {
    return <Suspense fallback={suspenseFallback}><TermsOfService onClose={() => setActiveModal(null)} /></Suspense>;
  }

  if (activeModal === 'disclaimer') {
    return <Suspense fallback={suspenseFallback}><Disclaimer onClose={() => setActiveModal(null)} /></Suspense>;
  }

  if (!user) return null;

  const permissions = ROLE_PERMISSIONS[user.role];

  const renderForm = (templateId: string) => {
    switch (templateId) {
      case 'TEMPLATE_01':
        return <SiteDailySummary />;
      case 'TEMPLATE_04':
        return <FuelReconciliation />;
      default:
        return <GenericReportForm templateId={templateId} />;
    }
  };

  const creatableReports = permissions.canCreate;

  const navButton = (tab: TabType, label: string, show: boolean = true) => {
    if (!show) return null;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        className={`text-left py-2 border-b text-sm transition-all ${
          activeTab === tab
            ? 'border-black text-black font-semibold pl-2'
            : 'border-transparent text-zinc-500 hover:text-black hover:pl-2'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <OfflineBanner />

      <header className="border-b border-black py-6 px-12 flex justify-between items-center bg-white sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <img src="/atlas.png" alt="Atlas Logo" className="h-8 object-contain" />
          <span className="text-xs uppercase tracking-widest font-mono text-zinc-400">{t('app.name')}</span>
        </div>

        <div className="flex items-center gap-8">
          <LanguageToggle />
          <div className="text-right">
            <p className="text-xs font-semibold">{user.firstName} {user.lastName}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{t(`roles.${user.role}`)}</p>
          </div>
          <button
            onClick={logout}
            className="text-xs uppercase tracking-widest text-zinc-500 hover:text-black font-semibold"
          >
            {t('nav.logOut')}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-12 py-12">
        <Suspense fallback={suspenseFallback}>
        {user.role === Role.SYSTEM_ADMIN ? (
          <AdminDashboard />
        ) : (
          <div className="flex flex-col md:flex-row gap-12">
            <aside className="md:w-64 flex flex-col gap-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">{t('nav.workspace')}</h2>
                <HelpButton contextPage={activeTab} onOpenHelp={() => setActiveTab('help')} />
              </div>

              {navButton('form', t('nav.dailyReporting'))}
              {navButton('history', `${t('nav.reportHistory')} (${history.length})`)}
              {navButton('kpiInput', t('nav.kpiInput'), permissions.canInputKPI)}
              {navButton('kpiDashboard', t('nav.kpiDashboard'), permissions.canViewKPI)}
              {navButton('teamDashboard', t('nav.teamDashboard'), permissions.canViewTeamKPI)}
              {navButton('profile', t('nav.roleProfile'))}
              {navButton('users', t('nav.userManagement'), permissions.canManageUsers)}
              {navButton('settings', t('nav.siteSettings'), permissions.canEditProfile)}
              {navButton('help', t('nav.help'))}

              <div className="mt-auto pt-12 border-t border-zinc-100">
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">{t('nav.orgContext')}</p>
                <p className="text-xs font-semibold mt-1">{user.orgId}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">{t('nav.siteId')}: {user.siteId}</p>
              </div>
            </aside>

            <section className="flex-1 border-l border-zinc-100 pl-12 min-h-[60vh]">
              {activeTab === 'form' && (
                <div>
                  {user.role === Role.SITE_CONTROLLER || user.role === Role.MINE_MANAGER || user.role === Role.OPERATIONS_MANAGER ? (
                    <div className="mb-8">
                      <label className="minimal-label">{t('reports_form.selectModule')}</label>
                      <select
                        value={selectedControllerForm}
                        onChange={e => setSelectedControllerForm(e.target.value)}
                        className="minimal-select text-lg font-serif italic max-w-md"
                      >
                        {Array.from({ length: 14 }, (_, i) => {
                          const tid = `TEMPLATE_${String(i + 1).padStart(2, '0')}`;
                          return (
                            <option key={tid} value={tid}>
                              {`Template ${String(i + 1).padStart(2, '0')}: ${t(`reports.${tid}`)}`}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  ) : (
                    <div className="mb-8">
                      <h1 className="editorial-title text-2xl font-light">
                        {creatableReports[0] ? t(`reports.${creatableReports[0]}`) : t('reports_form.noFormsActive')}
                      </h1>
                    </div>
                  )}

                  <div className="mt-8">
                    {user.role === Role.SITE_CONTROLLER || user.role === Role.MINE_MANAGER || user.role === Role.OPERATIONS_MANAGER
                      ? renderForm(selectedControllerForm)
                      : renderForm(creatableReports[0])}
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h1 className="editorial-title text-2xl font-light">{t('history.title')}</h1>
                    {history.length > 0 && (
                      <button
                        onClick={() => {
                          const headers = ['ID', 'Date', 'ReportType', 'SubmittedBy', 'Status', 'OrgID', 'SiteID'];
                          const rows = history.map((h: any) => [
                            h.id || '',
                            h.submittedAt ? new Date(h.submittedAt).toISOString() : '',
                            h.reportType || '',
                            h.userId || '',
                            h.status || '',
                            h.orgId || '',
                            h.siteId || ''
                          ]);
                          const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement('a');
                          link.setAttribute('href', encodedUri);
                          link.setAttribute('download', `titan_mining_reports_${user.orgId}_${Date.now()}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="minimal-btn text-xs"
                      >
                        Export CSV
                      </button>
                    )}
                  </div>

                  {history.length === 0 ? (
                    <div className="border border-black p-8 text-center text-zinc-500 font-serif italic">
                      {t('history.noReports')}
                    </div>
                  ) : (
                    <table className="editorial-table">
                      <thead>
                        <tr>
                          <th>{t('history.date')}</th>
                          <th>{t('history.type')}</th>
                          <th>{t('history.submittedBy')}</th>
                          <th>{t('history.status')}</th>
                          <th>{t('history.source')}</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((h: any) => (
                          <tr key={h.id || h.submittedAt}>
                            <td>{new Date(h.submittedAt).toLocaleDateString()}</td>
                            <td className="font-serif italic font-semibold">{t(`reports.${h.reportType}`) || h.reportType}</td>
                            <td>{h.userId}</td>
                            <td>
                              <span className="text-[10px] font-semibold bg-zinc-150 border border-black px-2 py-0.5 uppercase tracking-wider">
                                {h.status}
                              </span>
                            </td>
                            <td>{h.source || 'WEB'}</td>
                            <td>
                              <button
                                onClick={() => {
                                  const win = window.open('', '_blank');
                                  if (!win) return;
                                  let parsedData: any = {};
                                  try {
                                    parsedData = typeof h.data === 'string' ? JSON.parse(h.data) : (h.data || {});
                                  } catch {
                                    parsedData = { raw: h.data };
                                  }
                                  const dataRows = Object.entries(parsedData)
                                    .map(([k, v]) => `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">${k}</td><td style="padding:8px;border:1px solid #ddd;">${typeof v === 'object' ? JSON.stringify(v) : v}</td></tr>`)
                                    .join('');
                                  win.document.write(`
                                    <html>
                                      <head>
                                        <title>Report - ${h.reportType}</title>
                                        <style>
                                          body { font-family: 'Georgia', serif; padding: 40px; color: #111; }
                                          h1 { font-weight: normal; border-bottom: 2px solid #000; padding-bottom: 10px; }
                                          .meta { margin-bottom: 20px; font-family: sans-serif; font-size: 13px; color: #444; }
                                          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                          .print-btn { background: #000; color: #fff; border: none; padding: 10px 20px; cursor: pointer; margin-bottom: 20px; }
                                          @media print { .print-btn { display: none; } }
                                        </style>
                                      </head>
                                      <body>
                                        <button class="print-btn" onclick="window.print()">Print / Save PDF</button>
                                        <h1>TITAN MINING - OFFICIAL REPORT</h1>
                                        <div class="meta">
                                          <p><strong>Report Type:</strong> ${h.reportType}</p>
                                          <p><strong>Organization:</strong> ${h.orgId}</p>
                                          <p><strong>Site:</strong> ${h.siteId || 'N/A'}</p>
                                          <p><strong>Submitted By:</strong> ${h.userId}</p>
                                          <p><strong>Date:</strong> ${new Date(h.submittedAt).toLocaleString()}</p>
                                          <p><strong>Status:</strong> ${h.status}</p>
                                        </div>
                                        <h2>Report Data Payload</h2>
                                        <table>
                                          <thead>
                                            <tr style="background:#f4f4f4;"><th style="padding:8px;border:1px solid #ddd;text-align:left;">Metric / Field</th><th style="padding:8px;border:1px solid #ddd;text-align:left;">Value</th></tr>
                                          </thead>
                                          <tbody>${dataRows}</tbody>
                                        </table>
                                      </body>
                                    </html>
                                  `);
                                  win.document.close();
                                }}
                                className="text-xs font-mono underline hover:text-blue-600"
                              >
                                Print / PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeTab === 'kpiInput' && permissions.canInputKPI && <KPIInputForm />}
              {activeTab === 'kpiDashboard' && permissions.canViewKPI && <KPIDashboard />}
              {activeTab === 'teamDashboard' && permissions.canViewTeamKPI && <TeamKPIDashboard />}
              {activeTab === 'profile' && <RoleProfile />}
              {activeTab === 'users' && permissions.canManageUsers && <UserManagement />}
              {activeTab === 'settings' && permissions.canEditProfile && <InstitutionalProfile />}
              {activeTab === 'help' && <HelpViewer contextFilter={activeTab} />}
            </section>
          </div>
        )}
        </Suspense>
      </main>

      <footer className="border-t border-zinc-100 py-6 text-center text-[10px] text-zinc-400 uppercase tracking-widest mt-12 bg-white flex justify-center gap-6">
        <span>{t('footer.copyright')}</span>
        <span>&bull;</span>
        <button onClick={() => setActiveModal('terms')} className="hover:text-black transition-colors font-semibold">
          {t('footer.termsOfService')}
        </button>
        <span>&bull;</span>
        <button onClick={() => setActiveModal('disclaimer')} className="hover:text-black transition-colors font-semibold">
          {t('footer.disclaimer')}
        </button>
      </footer>
    </div>
  );
}
