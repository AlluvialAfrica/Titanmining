import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Role, ROLE_PERMISSIONS } from '../types/roles';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import OfflineBanner from '../components/OfflineBanner';
import FuelReconciliation from './reports/FuelReconciliation';
import SiteDailySummary from './reports/SiteDailySummary';
import UserManagement from './UserManagement';
import InstitutionalProfile from './InstitutionalProfile';
import { useReport } from '../hooks/useReport';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { getReportHistory } = useReport();
  const [activeTab, setActiveTab] = useState<'form' | 'history' | 'users' | 'settings'>('form');
  const [selectedControllerForm, setSelectedControllerForm] = useState<string>('TEMPLATE_01');

  if (!user) return null;

  const permissions = ROLE_PERMISSIONS[user.role];
  const history = getReportHistory();

  // Render the appropriate form component based on selected template ID
  const renderForm = (templateId: string) => {
    switch (templateId) {
      case 'TEMPLATE_01':
        return <SiteDailySummary />;
      case 'TEMPLATE_04':
        return <FuelReconciliation />;
      default:
        return (
          <div className="border border-black p-8 text-center text-zinc-500 font-serif italic">
            Form for {templateId} is scaffolding ready. Check back soon.
          </div>
        );
    }
  };

  // Check what report types the current user can create
  const creatableReports = permissions.canCreate;

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <OfflineBanner />
      
      {/* Editorial Navigation Header */}
      <header className="border-b border-black py-6 px-12 flex justify-between items-center bg-white sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <img src="/atlas.png" alt="Atlas Logo" className="h-8 object-contain" />
          <span className="text-xs uppercase tracking-widest font-mono text-zinc-400">Alluvial Site Manager</span>
        </div>
        
        <div className="flex items-center gap-8">
          <LanguageToggle />
          <div className="text-right">
            <p className="text-xs font-semibold">{user.firstName} {user.lastName}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{user.role.replace(/_/g, ' ')}</p>
          </div>
          <button
            onClick={logout}
            className="text-xs uppercase tracking-widest text-zinc-500 hover:text-black font-semibold"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-12 py-12 flex flex-col md:flex-row gap-12">
        {/* Left Side Navigation menu */}
        <aside className="md:w-64 flex flex-col gap-2">
          <h2 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-4">Workspace</h2>
          
          <button
            onClick={() => setActiveTab('form')}
            className={`text-left py-2 border-b text-sm transition-all ${
              activeTab === 'form'
                ? 'border-black text-black font-semibold pl-2'
                : 'border-transparent text-zinc-500 hover:text-black hover:pl-2'
            }`}
          >
            Daily Reporting Forms
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`text-left py-2 border-b text-sm transition-all ${
              activeTab === 'history'
                ? 'border-black text-black font-semibold pl-2'
                : 'border-transparent text-zinc-500 hover:text-black hover:pl-2'
            }`}
          >
            Report History ({history.length})
          </button>

          {permissions.canManageUsers && (
            <button
              onClick={() => setActiveTab('users')}
              className={`text-left py-2 border-b text-sm transition-all ${
                activeTab === 'users'
                  ? 'border-black text-black font-semibold pl-2'
                  : 'border-transparent text-zinc-500 hover:text-black hover:pl-2'
              }`}
            >
              User Management
            </button>
          )}

          {permissions.canEditProfile && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`text-left py-2 border-b text-sm transition-all ${
                activeTab === 'settings'
                  ? 'border-black text-black font-semibold pl-2'
                  : 'border-transparent text-zinc-500 hover:text-black hover:pl-2'
              }`}
            >
              Site Settings
            </button>
          )}

          {/* Org Isolation Context indicator */}
          <div className="mt-auto pt-12 border-t border-zinc-100">
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Org context</p>
            <p className="text-xs font-semibold mt-1">{user.orgId}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Site ID: {user.siteId}</p>
          </div>
        </aside>

        {/* Right Side Content Container */}
        <section className="flex-1 border-l border-zinc-100 pl-12 min-h-[60vh]">
          {activeTab === 'form' && (
            <div>
              {/* Site Controller Form selector */}
              {user.role === Role.SITE_CONTROLLER ? (
                <div className="mb-8">
                  <label className="minimal-label">Select Reporting Module to View/Verify</label>
                  <select
                    value={selectedControllerForm}
                    onChange={e => setSelectedControllerForm(e.target.value)}
                    className="minimal-select text-lg font-serif italic max-w-md"
                  >
                    <option value="TEMPLATE_01">Template 01: Site Daily Summary</option>
                    <option value="TEMPLATE_02">Template 02: Staff Attendance & Shift Roster</option>
                    <option value="TEMPLATE_03">Template 03: Excavator / Machine Daily Log</option>
                    <option value="TEMPLATE_04">Template 04: Fuel Issue & Reconciliation</option>
                    <option value="TEMPLATE_05">Template 05: Mining & Geology Daily Sheet</option>
                    <option value="TEMPLATE_06">Template 06: Drum & Sand Pump Shift Log</option>
                    <option value="TEMPLATE_07">Template 07: Centrifuge Operation & Cleanup Log</option>
                    <option value="TEMPLATE_08">Template 08: Shaking Table Operation Log</option>
                    <option value="TEMPLATE_09">Template 09: Gold Recovery & Handover Register</option>
                    <option value="TEMPLATE_10">Template 10: Maintenance, Greasing & Washing Log</option>
                    <option value="TEMPLATE_11">Template 11: Gate, Search & Items Movement Register</option>
                    <option value="TEMPLATE_12">Template 12: Stores, Purchases & Expense Sheet</option>
                    <option value="TEMPLATE_13">Template 13: Shift Handover Certificate</option>
                    <option value="TEMPLATE_14">Template 14: Petty Cash Daily Report</option>
                  </select>
                </div>
              ) : (
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-1">Active Template</p>
                  <h1 className="editorial-title text-2xl font-light">
                    {creatableReports[0] ? t(`reports.${creatableReports[0]}`) : 'No forms active'}
                  </h1>
                </div>
              )}

              {/* Render the form */}
              <div className="mt-8">
                {user.role === Role.SITE_CONTROLLER 
                  ? renderForm(selectedControllerForm)
                  : renderForm(creatableReports[0])}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h1 className="editorial-title text-2xl font-light mb-8">Report History</h1>
              
              {history.length === 0 ? (
                <div className="border border-black p-8 text-center text-zinc-500 font-serif italic">
                  No reports submitted yet in this session.
                </div>
              ) : (
                <table className="editorial-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Submitted By</th>
                      <th>Status</th>
                      <th>Source</th>
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

          {activeTab === 'users' && permissions.canManageUsers && <UserManagement />}
          
          {activeTab === 'settings' && permissions.canEditProfile && <InstitutionalProfile />}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-6 text-center text-[10px] text-zinc-400 uppercase tracking-widest mt-12 bg-white">
        © 2026 Alluvial Africa. Powered by ChatWorks.
      </footer>
    </div>
  );
}
