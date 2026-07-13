import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Role, ROLE_PERMISSIONS } from '../types/roles';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import OfflineBanner from '../components/OfflineBanner';
import HelpButton from '../components/HelpButton';
import FuelReconciliation from './reports/FuelReconciliation';
import SiteDailySummary from './reports/SiteDailySummary';
import GenericReportForm from './reports/GenericReportForm';
import UserManagement from './UserManagement';
import InstitutionalProfile from './InstitutionalProfile';
import KPIInputForm from './kpi/KPIInputForm';
import KPIDashboard from './kpi/KPIDashboard';
import TeamKPIDashboard from './kpi/TeamKPIDashboard';
import RoleProfile from './profile/RoleProfile';
import HelpViewer from './help/HelpViewer';
import { useReport } from '../hooks/useReport';
import TermsOfService from './TermsOfService';
import Disclaimer from './Disclaimer';
import AdminDashboard from './AdminDashboard';

type TabType = 'form' | 'history' | 'users' | 'settings' | 'kpiInput' | 'kpiDashboard' | 'teamDashboard' | 'profile' | 'help';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { getReportHistory } = useReport();
  const [activeTab, setActiveTab] = useState<TabType>('form');
  const [selectedControllerForm, setSelectedControllerForm] = useState<string>('TEMPLATE_01');
  const [activeModal, setActiveModal] = useState<'terms' | 'disclaimer' | null>(null);

  if (activeModal === 'terms') {
    return <TermsOfService onClose={() => setActiveModal(null)} />;
  }

  if (activeModal === 'disclaimer') {
    return <Disclaimer onClose={() => setActiveModal(null)} />;
  }

  if (!user) return null;

  const permissions = ROLE_PERMISSIONS[user.role];
  const history = getReportHistory();

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
                  <h1 className="editorial-title text-2xl font-light mb-8">{t('history.title')}</h1>

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
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((h: any) => (
                          <tr key={h.id}>
                            <td>{new Date(h.submittedAt).toLocaleDateString()}</td>
                            <td className="font-serif italic font-semibold">{t(`reports.${h.reportType}`)}</td>
                            <td>{h.userId}</td>
                            <td>
                              <span className="text-[10px] font-semibold bg-zinc-150 border border-black px-2 py-0.5 uppercase tracking-wider">
                                {h.status}
                              </span>
                            </td>
                            <td>{h.source || 'WEB'}</td>
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
