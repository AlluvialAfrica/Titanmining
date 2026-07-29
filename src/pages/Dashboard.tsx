import React, { useState, useEffect, Suspense, lazy } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Role, ROLE_PERMISSIONS, hasAdminAccess } from '../types/roles';
import { useLanguage } from '../contexts/LanguageContext';
import { logger } from '../utils/logger';
import LanguageToggle from '../components/LanguageToggle';
import OfflineBanner from '../components/OfflineBanner';
import HelpButton from '../components/HelpButton';
import ReportExportMenu from '../components/ReportExportMenu';
import { useReport } from '../hooks/useReport';
import { formatDateDDMMYYYY } from '../utils/dateFormat';

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
const SiteManagerDashboard = lazy(() => import('./SiteManagerDashboard'));
const PayrollManagement = lazy(() => import('./hr/PayrollManagement'));
const FinanceManagement = lazy(() => import('./finance/FinanceManagement'));
const LeaveApplication = lazy(() => import('./leave/LeaveApplication'));
const LeaveSettings = lazy(() => import('./hr/LeaveSettings'));

type TabType = 'form' | 'history' | 'users' | 'settings' | 'admin' | 'siteManagerDashboard' | 'kpiInput' | 'kpiDashboard' | 'teamDashboard' | 'profile' | 'help' | 'payrollManagement' | 'financeManagement' | 'leaveApplication' | 'leaveSettings';

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

  useEffect(() => {
    if (user?.role === Role.ENTERPRISE_MANAGER) {
      setActiveTab('siteManagerDashboard');
    } else if (user?.role === Role.HR_MANAGER) {
      setActiveTab('payrollManagement');
    }
    // Finance Manager defaults to 'form' (Daily Reporting) — no override needed
  }, [user]);

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

  const permissions = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS[Role.SITE_CONTROLLER];
  const isAdmin = hasAdminAccess(user.role);

  const renderForm = (templateId: string) => {
    switch (templateId) {
      case 'TEMPLATE_01':
        return <SiteDailySummary />;
      case 'TEMPLATE_04':
        return <FuelReconciliation />;
      default:
        return <GenericReportForm key={templateId} templateId={templateId} />;
    }
  };

  const creatableReports = permissions?.canCreate || [];

  /** Roles that can see all 15 templates in the dropdown. */
  const isFullAccessRole =
    user.role === Role.SITE_CONTROLLER ||
    user.role === Role.SYSTEM_ADMIN;

  // Auto-correct selectedControllerForm when it doesn't match the role's allowed templates
  useEffect(() => {
    if (!isFullAccessRole && creatableReports.length > 0 && !creatableReports.includes(selectedControllerForm)) {
      setSelectedControllerForm(creatableReports[0]);
    }
  }, [creatableReports, selectedControllerForm, isFullAccessRole]);

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

      <header className="border-b border-black py-4 md:py-6 px-4 sm:px-6 md:px-12 flex justify-between items-center bg-white sticky top-0 z-40">
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-12">
        <Suspense fallback={suspenseFallback}>
          <div className="flex flex-col md:flex-row gap-6 md:gap-12">
            <aside className="md:w-64 flex flex-col gap-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">{t('nav.workspace')}</h2>
                <HelpButton contextPage={activeTab} onOpenHelp={() => setActiveTab('help')} />
              </div>

              {navButton('siteManagerDashboard', user.role === Role.ENTERPRISE_MANAGER ? 'Commercial Overview' : t('nav.siteManagerDashboard'), isFullAccessRole || user.role === Role.ENTERPRISE_MANAGER)}
              {navButton('form', t('nav.dailyReporting'))}
              {navButton('history', `${t('nav.reportHistory')} (${history.length})`)}
              {navButton('kpiInput', t('nav.kpiInput'), permissions.canInputKPI)}
              {navButton('kpiDashboard', t('nav.kpiDashboard'), permissions.canViewKPI)}
              {navButton('teamDashboard', t('nav.teamDashboard'), permissions.canViewTeamKPI)}
              {navButton('leaveApplication', 'Leave Application', user.role === Role.HR_MANAGER)}
              {navButton('payrollManagement', 'Payroll & Leave', user.role === Role.HR_MANAGER)}
              {navButton('leaveSettings', 'Leave Settings', user.role === Role.HR_MANAGER)}
              {navButton('financeManagement', 'Treasury & Advances', user.role === Role.FINANCE_MANAGER)}
              {navButton('profile', t('nav.roleProfile'))}
              {navButton('users', t('nav.userManagement'), permissions.canManageUsers)}
              {navButton('settings', t('nav.siteSettings'), permissions.canEditProfile)}
              {navButton('admin', 'Admin Dashboard', isAdmin)}
              {navButton('help', t('nav.help'))}

              <div className="mt-auto pt-6 md:pt-12 border-t border-zinc-100">
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">{t('nav.orgContext')}</p>
                <p className="text-xs font-semibold mt-1">{user.orgId}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">{t('nav.siteId')}: {user.siteId}</p>
              </div>
            </aside>

            <section className="flex-1 border-l border-zinc-100 pl-4 sm:pl-6 md:pl-12 min-h-[60vh]">
              {activeTab === 'form' && (
                <div>
                  {isFullAccessRole ? (
                    <div className="mb-8">
                      <label className="minimal-label">{t('reports_form.selectModule')}</label>
                      <select
                        value={selectedControllerForm}
                        onChange={e => setSelectedControllerForm(e.target.value)}
                        className="minimal-select text-base md:text-lg font-serif italic max-w-full md:max-w-md"
                      >
                        {Array.from({ length: 17 }, (_, i) => {
                          const tid = `TEMPLATE_${String(i + 1).padStart(2, '0')}`;
                          return (
                            <option key={tid} value={tid}>
                              {`Template ${String(i + 1).padStart(2, '0')}: ${t(`reports.${tid}`)}`}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  ) : creatableReports.length >= 1 ? (
                    <div className="mb-8">
                      <label className="minimal-label">{t('reports_form.selectModule')}</label>
                      <select
                        value={creatableReports.includes(selectedControllerForm) ? selectedControllerForm : creatableReports[0]}
                        onChange={e => setSelectedControllerForm(e.target.value)}
                        className="minimal-select text-base md:text-lg font-serif italic max-w-full md:max-w-md"
                      >
                        {creatableReports.map((tid) => (
                          <option key={tid} value={tid}>
                            {`${tid}: ${t(`reports.${tid}`)}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="mb-8">
                      <h1 className="editorial-title text-2xl font-light">
                        {t('reports_form.noFormsActive')}
                      </h1>
                    </div>
                  )}

                  <div className="mt-8">
                    {isFullAccessRole
                      ? renderForm(selectedControllerForm)
                      : renderForm(creatableReports.includes(selectedControllerForm) ? selectedControllerForm : (creatableReports[0] || 'TEMPLATE_01'))}
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
                    <div className="overflow-x-auto">
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
                            <td>{formatDateDDMMYYYY(h.submittedAt)}</td>
                            <td className="font-serif italic font-semibold">{t(`reports.${h.reportType}`) || h.reportType}</td>
                            <td>{h.userId}</td>
                            <td>
                              <span className="text-[10px] font-semibold bg-zinc-150 border border-black px-2 py-0.5 uppercase tracking-wider">
                                {h.status}
                              </span>
                            </td>
                            <td>{h.source || 'WEB'}</td>
                            <td>
                              <ReportExportMenu report={h} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'siteManagerDashboard' && (isFullAccessRole || user.role === Role.ENTERPRISE_MANAGER) && <SiteManagerDashboard />}
              {activeTab === 'kpiInput' && permissions.canInputKPI && <KPIInputForm />}
              {activeTab === 'kpiDashboard' && permissions.canViewKPI && <KPIDashboard />}
              {activeTab === 'teamDashboard' && permissions.canViewTeamKPI && <TeamKPIDashboard />}
              {activeTab === 'profile' && <RoleProfile />}
              {activeTab === 'users' && permissions.canManageUsers && <UserManagement />}
              {activeTab === 'settings' && permissions.canEditProfile && <InstitutionalProfile />}
              {activeTab === 'leaveApplication' && <LeaveApplication />}
              {activeTab === 'payrollManagement' && user.role === Role.HR_MANAGER && <PayrollManagement />}
              {activeTab === 'leaveSettings' && user.role === Role.HR_MANAGER && <LeaveSettings />}
              {activeTab === 'financeManagement' && user.role === Role.FINANCE_MANAGER && <FinanceManagement />}
              {activeTab === 'admin' && isAdmin && <AdminDashboard />}
              {activeTab === 'help' && <HelpViewer contextFilter={activeTab} />}
            </section>
          </div>
        </Suspense>
      </main>

      <footer className="border-t border-zinc-100 py-6 text-center text-[10px] text-zinc-400 uppercase tracking-widest mt-6 md:mt-12 bg-white flex justify-center gap-6">
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
