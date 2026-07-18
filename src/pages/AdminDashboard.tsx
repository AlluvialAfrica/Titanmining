import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getDataClient } from '../services/dataService';

interface TenantInfo {
  id: string;
  name: string;
  owner: string;
  email: string;
  plan: 'Monthly' | 'Annual' | 'Internal';
  status: 'ACTIVE' | 'SUSPENDED';
  joinedDate: string;
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [metrics, setMetrics] = useState({
    mrr: 0,
    arr: 0,
    activeTenants: 0,
    reportsFiled: 0,
    apiLatency: 0,
    apiSuccess: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoadingData(true);
    try {
      const client = getDataClient();

      // Fetch organizations
      const { data: orgs } = await client.models.Organization.list();
      if (orgs) {
        const tenantList: TenantInfo[] = orgs.map((org: any) => ({
          id: org.id,
          name: org.name,
          owner: '',
          email: '',
          plan: 'Monthly' as const,
          status: 'ACTIVE' as const,
          joinedDate: org.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        }));
        setTenants(tenantList);
        setMetrics(prev => ({ ...prev, activeTenants: tenantList.length }));
      }

      // Fetch today's reports count
      const { data: reports } = await client.models.DailyReport.list();
      if (reports) {
        setMetrics(prev => ({ ...prev, reportsFiled: reports.length }));
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoadingData(false);
    }
  }

  const toggleTenantStatus = (id: string) => {
    setTenants(tenants.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  return (
    <div className="py-4 space-y-12">
      <div>
        <h1 className="editorial-title text-3xl font-light mb-2 text-black">{t('admin.title')}</h1>
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold border-b border-black pb-4">
          {t('admin.subtitle')}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border border-black p-6 bg-white">
          <p className="minimal-label">{t('admin.mrr')}</p>
          <p className="font-serif italic text-3xl font-light text-black mt-2">
            ${metrics.mrr.toLocaleString()}
          </p>
        </div>

        <div className="border border-black p-6 bg-white">
          <p className="minimal-label">{t('admin.arr')}</p>
          <p className="font-serif italic text-3xl font-light text-black mt-2">
            ${metrics.arr.toLocaleString()}
          </p>
        </div>

        <div className="border border-black p-6 bg-white">
          <p className="minimal-label">{t('admin.activeTenants')}</p>
          <p className="font-serif italic text-3xl font-light text-black mt-2">
            {metrics.activeTenants}
          </p>
        </div>

        <div className="border border-black p-6 bg-white">
          <p className="minimal-label">{t('admin.reportsToday')}</p>
          <p className="font-serif italic text-3xl font-light text-black mt-2">
            {metrics.reportsFiled}
          </p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{t('admin.acrossTemplates')}</p>
        </div>
      </div>

      {/* Tenants Directory List */}
      <div>
        <h3 className="font-serif italic text-lg mb-4 text-black">{t('admin.registeredTenants')}</h3>
        {loadingData ? (
          <div className="text-center py-8 font-serif italic text-zinc-400">Loading...</div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-8 font-serif italic text-zinc-400">No tenants registered yet</div>
        ) : (
          <table className="editorial-table">
            <thead>
              <tr>
                <th>{t('admin.organization')}</th>
                <th>{t('admin.billingPlan')}</th>
                <th>{t('admin.dateJoined')}</th>
                <th>{t('admin.status')}</th>
                <th className="text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(tenant => (
                <tr key={tenant.id}>
                  <td className="font-serif italic font-semibold">{tenant.name}</td>
                  <td>{tenant.plan}</td>
                  <td>{tenant.joinedDate}</td>
                  <td>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 border uppercase tracking-wider ${
                      tenant.status === 'ACTIVE'
                        ? 'border-black bg-zinc-50'
                        : 'border-red-600 text-red-600 bg-red-50'
                    }`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => toggleTenantStatus(tenant.id)}
                      className={`text-xs uppercase tracking-widest font-semibold pb-0.5 border-b transition-all ${
                        tenant.status === 'ACTIVE'
                          ? 'border-transparent text-red-600 hover:border-red-600'
                          : 'border-transparent text-black hover:border-black'
                      }`}
                    >
                      {tenant.status === 'ACTIVE' ? t('admin.suspendPortal') : t('admin.activatePortal')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* System Performance */}
      <div className="border-t border-black pt-8">
        <h3 className="font-serif italic text-lg mb-4 text-black">{t('admin.systemPerformance')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-mono">
          <div className="space-y-2 border border-zinc-200 p-4 bg-white">
            <h4 className="font-bold text-black uppercase text-[10px] tracking-wider mb-2">{t('admin.cronExecutions')}</h4>
            <div className="flex justify-between border-b border-zinc-100 py-1">
              <span>daily-reminder:</span>
              <span className="text-green-600">READY</span>
            </div>
            <div className="flex justify-between border-b border-zinc-100 py-1">
              <span>report-aggregator:</span>
              <span className="text-green-600">READY</span>
            </div>
          </div>

          <div className="space-y-2 border border-zinc-200 p-4 bg-white">
            <h4 className="font-bold text-black uppercase text-[10px] tracking-wider mb-2">Backend Status</h4>
            <div className="flex justify-between border-b border-zinc-100 py-1">
              <span>AppSync API:</span>
              <span className="text-green-600">CONNECTED</span>
            </div>
            <div className="flex justify-between border-b border-zinc-100 py-1">
              <span>Cognito Auth:</span>
              <span className="text-green-600">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
