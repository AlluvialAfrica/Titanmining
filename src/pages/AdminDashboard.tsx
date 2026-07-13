import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

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

  const [tenants, setTenants] = useState<TenantInfo[]>([
    { id: 't1', name: 'Alluvial Africa Corp', owner: 'Amoroso Gombe', email: 'agombe@a1strategy.com', plan: 'Internal', status: 'ACTIVE', joinedDate: '2026-01-10' },
    { id: 't2', name: 'Migori Gold Diggers', owner: 'John Kiprop', email: 'kiprop@migorigold.com', plan: 'Monthly', status: 'ACTIVE', joinedDate: '2026-05-14' },
    { id: 't3', name: 'Lindi Sands Outlets', owner: 'Sarah Wanjiku', email: 'sarah@lindioutlets.com', plan: 'Annual', status: 'ACTIVE', joinedDate: '2026-06-22' },
    { id: 't4', name: 'Kakamega Alluvial Miners', owner: 'Peter Njoroge', email: 'njoroge@kakamegamining.com', plan: 'Monthly', status: 'SUSPENDED', joinedDate: '2026-07-01' },
    { id: 't5', name: 'Geita Rivers Syndicate', owner: 'Emmanuel Mwangi', email: 'mwangi@geitarivers.com', plan: 'Monthly', status: 'ACTIVE', joinedDate: '2026-07-11' },
  ]);

  const [metrics, setMetrics] = useState({
    mrr: 24500,
    arr: 57600,
    activeTenants: 61,
    reportsFiled: 142,
    apiLatency: 45,
    apiSuccess: 99.92,
  });

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
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{`49 ${t('admin.monthlyTenants')}`}</p>
        </div>

        <div className="border border-black p-6 bg-white">
          <p className="minimal-label">{t('admin.arr')}</p>
          <p className="font-serif italic text-3xl font-light text-black mt-2">
            ${metrics.arr.toLocaleString()}
          </p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{`12 ${t('admin.annualTenants')}`}</p>
        </div>

        <div className="border border-black p-6 bg-white">
          <p className="minimal-label">{t('admin.activeTenants')}</p>
          <p className="font-serif italic text-3xl font-light text-black mt-2">
            {metrics.activeTenants}
          </p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{`+8 ${t('admin.newPortals')}`}</p>
        </div>

        <div className="border border-black p-6 bg-white">
          <p className="minimal-label">{t('admin.reportsToday')}</p>
          <p className="font-serif italic text-3xl font-light text-black mt-2">
            {metrics.reportsFiled}
          </p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{t('admin.acrossTemplates')}</p>
        </div>

        <div className="border border-black p-6 bg-white">
          <p className="minimal-label">{t('admin.apiLatency')}</p>
          <p className="font-serif italic text-3xl font-light text-black mt-2">
            {metrics.apiLatency}ms
          </p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{t('admin.p95Latency')}</p>
        </div>

        <div className="border border-black p-6 bg-white">
          <p className="minimal-label">{t('admin.apiSuccess')}</p>
          <p className="font-serif italic text-3xl font-light text-black mt-2">
            {metrics.apiSuccess}%
          </p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{t('admin.zeroFaults')}</p>
        </div>
      </div>

      {/* SVG Growth Chart */}
      <div className="border border-black p-8 bg-[#fafafa]">
        <h3 className="font-serif italic text-lg mb-6 text-black border-b border-zinc-200 pb-2">{t('admin.revenueGrowth')}</h3>
        <div className="w-full h-40 relative flex items-end justify-between px-6 pt-4 border-b border-black">
          {/* Simple Clean Grid lines */}
          <div className="absolute top-1/4 left-0 w-full border-t border-dashed border-zinc-200 pointer-events-none" />
          <div className="absolute top-2/4 left-0 w-full border-t border-dashed border-zinc-200 pointer-events-none" />
          <div className="absolute top-3/4 left-0 w-full border-t border-dashed border-zinc-200 pointer-events-none" />

          {/* Chart Columns */}
          <div className="flex flex-col items-center w-1/6 z-10">
            <span className="text-[10px] font-mono text-zinc-400 mb-1">$12.5K</span>
            <div className="w-8 bg-zinc-200 border border-black" style={{ height: '40px' }} />
            <span className="text-[10px] uppercase font-mono tracking-wider mt-2">Feb</span>
          </div>
          <div className="flex flex-col items-center w-1/6 z-10">
            <span className="text-[10px] font-mono text-zinc-400 mb-1">$15.0K</span>
            <div className="w-8 bg-zinc-300 border border-black" style={{ height: '55px' }} />
            <span className="text-[10px] uppercase font-mono tracking-wider mt-2">Mar</span>
          </div>
          <div className="flex flex-col items-center w-1/6 z-10">
            <span className="text-[10px] font-mono text-zinc-400 mb-1">$18.2K</span>
            <div className="w-8 bg-zinc-400 border border-black" style={{ height: '70px' }} />
            <span className="text-[10px] uppercase font-mono tracking-wider mt-2">Apr</span>
          </div>
          <div className="flex flex-col items-center w-1/6 z-10">
            <span className="text-[10px] font-mono text-zinc-400 mb-1">$20.1K</span>
            <div className="w-8 bg-zinc-600 border border-black" style={{ height: '82px' }} />
            <span className="text-[10px] uppercase font-mono tracking-wider mt-2">May</span>
          </div>
          <div className="flex flex-col items-center w-1/6 z-10">
            <span className="text-[10px] font-mono text-zinc-400 mb-1">$22.4K</span>
            <div className="w-8 bg-zinc-800 border border-black" style={{ height: '95px' }} />
            <span className="text-[10px] uppercase font-mono tracking-wider mt-2">Jun</span>
          </div>
          <div className="flex flex-col items-center w-1/6 z-10">
            <span className="text-[10px] font-mono text-zinc-400 mb-1">$24.5K</span>
            <div className="w-8 bg-black border border-black" style={{ height: '110px' }} />
            <span className="text-[10px] uppercase font-mono tracking-wider mt-2">Jul</span>
          </div>
        </div>
      </div>

      {/* Tenants Directory List */}
      <div>
        <h3 className="font-serif italic text-lg mb-4 text-black">{t('admin.registeredTenants')}</h3>
        <table className="editorial-table">
          <thead>
            <tr>
              <th>{t('admin.organization')}</th>
              <th>{t('admin.owner')}</th>
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
                <td>{tenant.owner} <br /><span className="text-xs text-zinc-400 font-mono">{tenant.email}</span></td>
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
                  {tenant.plan !== 'Internal' && (
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
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Serverless Performance Stats */}
      <div className="border-t border-black pt-8">
        <h3 className="font-serif italic text-lg mb-4 text-black">{t('admin.systemPerformance')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-mono">
          <div className="space-y-2 border border-zinc-200 p-4 bg-white">
            <h4 className="font-bold text-black uppercase text-[10px] tracking-wider mb-2">{t('admin.cronExecutions')}</h4>
            <div className="flex justify-between border-b border-zinc-100 py-1">
              <span>daily-reminder:</span>
              <span className="text-green-600">SUCCESS (17:00 EAT)</span>
            </div>
            <div className="flex justify-between border-b border-zinc-100 py-1">
              <span>report-aggregator:</span>
              <span className="text-green-600">SUCCESS (17:15 EAT)</span>
            </div>
          </div>

          <div className="space-y-2 border border-zinc-200 p-4 bg-white">
            <h4 className="font-bold text-black uppercase text-[10px] tracking-wider mb-2">{t('admin.twilioHealth')}</h4>
            <div className="flex justify-between border-b border-zinc-100 py-1">
              <span>Twilio Webhook URL:</span>
              <span>200 OK</span>
            </div>
            <div className="flex justify-between border-b border-zinc-100 py-1">
              <span>Active SMS Balance:</span>
              <span>$482.50</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
