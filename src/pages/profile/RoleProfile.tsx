import React, { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { ROLE_PERMISSIONS } from '../../types/roles';
import type { Role } from '../../types/roles';
import { ROLE_HIERARCHY, getReportingChain } from '../../types/roleHierarchy';
import { ROLE_KPI_PROFILES } from '../../types/kpiDefinitions';

export default function RoleProfile() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const role = user?.role as Role | undefined;

  const hierarchy = useMemo(() => {
    if (!role) return null;
    return ROLE_HIERARCHY[role] ?? null;
  }, [role]);

  const permissions = useMemo(() => {
    if (!role) return null;
    return ROLE_PERMISSIONS[role] ?? null;
  }, [role]);

  const reportingChain = useMemo(() => {
    if (!role) return [];
    return getReportingChain(role);
  }, [role]);

  const directReports = useMemo(() => {
    if (!hierarchy) return [];
    return hierarchy.directReports;
  }, [hierarchy]);

  const kpiProfile = useMemo(() => {
    if (!role) return null;
    return ROLE_KPI_PROFILES[role] ?? null;
  }, [role]);

  if (!user || !role) return null;

  return (
    <div className="py-4 space-y-12">
      {/* Header */}
      <div>
        <h1 className="editorial-title text-3xl font-light mb-2 text-black">
          {t('profile.roleTitle')}
        </h1>
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold border-b border-black pb-4">
          {user.firstName} {user.lastName}
        </p>
      </div>

      {/* Role Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-black p-6 bg-white">
          <p className="minimal-label">{t('roles.' + role)}</p>
          <p className="font-serif italic text-2xl font-light text-black mt-2">
            {t('roles.' + role)}
          </p>
        </div>

        <div className="border border-black p-6 bg-white">
          <p className="minimal-label">{t('profile.department')}</p>
          <p className="font-serif italic text-2xl font-light text-black mt-2">
            {hierarchy?.department ?? '-'}
          </p>
        </div>
      </div>

      {/* Reporting Line */}
      <div>
        <h2 className="font-serif italic text-lg mb-4 text-black border-b border-zinc-200 pb-2">
          {t('profile.reportsTo')}
        </h2>
        {reportingChain.length === 0 ? (
          <p className="text-sm text-zinc-500">-</p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {reportingChain.map((r, i) => (
              <React.Fragment key={r}>
                <span
                  className={'text-[10px] font-semibold px-3 py-1 border uppercase tracking-wider ' +
                    (i === 0 ? 'border-black bg-zinc-50' : 'border-zinc-200 text-zinc-500')
                  }
                >
                  {t('roles.' + r)}
                </span>
                {i < reportingChain.length - 1 && (
                  <span className="text-zinc-300 text-xs">&rarr;</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Direct Reports */}
      <div>
        <h2 className="font-serif italic text-lg mb-4 text-black border-b border-zinc-200 pb-2">
          {t('profile.directReports')}
        </h2>
        {directReports.length === 0 ? (
          <p className="text-sm text-zinc-500">-</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {directReports.map((r) => (
              <span
                key={r}
                className="text-[10px] font-semibold px-3 py-1 border border-black uppercase tracking-wider bg-white"
              >
                {t('roles.' + r)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* KPI Targets */}
      {kpiProfile && (
        <div>
          <h2 className="font-serif italic text-lg mb-4 text-black border-b border-zinc-200 pb-2">
            {t('profile.kpiTargets')}
          </h2>
          <div className="overflow-x-auto">
            <table className="editorial-table">
              <thead>
                <tr>
                  <th>{t('kpi.input.category')}</th>
                  <th>{t('kpi.dashboard.value')}</th>
                  <th>{t('kpi.dashboard.target')}</th>
                </tr>
              </thead>
              <tbody>
                {kpiProfile.categories.flatMap((cat) =>
                  cat.fields.map((field) => (
                    <tr key={field.key}>
                      <td>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                          {t(cat.categoryKey)}
                        </span>
                        <br />
                        <span className="font-serif italic">{t(field.labelKey)}</span>
                      </td>
                      <td className="font-mono text-sm">{field.type}</td>
                      <td className="font-mono text-sm">
                        {field.defaultTarget}
                        {field.unit ? ' ' + field.unit : ''}
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Permitted Reports */}
      {permissions && (
        <div>
          <h2 className="font-serif italic text-lg mb-4 text-black border-b border-zinc-200 pb-2">
            {t('profile.permittedReports')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Can Create */}
            <div className="border border-black p-6 bg-white">
              <p className="minimal-label">{t('profile.canCreate')}</p>
              <div className="mt-3 space-y-2">
                {permissions.canCreate.length === 0 ? (
                  <p className="text-sm text-zinc-400">-</p>
                ) : (
                  permissions.canCreate.map((tmpl) => (
                    <p key={tmpl} className="text-xs font-mono">
                      {t('reports.' + tmpl)}
                    </p>
                  ))
                )}
              </div>
            </div>

            {/* Can Read */}
            <div className="border border-black p-6 bg-white">
              <p className="minimal-label">{t('profile.canRead')}</p>
              <div className="mt-3 space-y-2">
                {permissions.canRead.length === 0 ? (
                  <p className="text-sm text-zinc-400">-</p>
                ) : permissions.canRead.includes('ALL') ? (
                  <p className="text-xs font-mono font-semibold">ALL TEMPLATES</p>
                ) : (
                  permissions.canRead.map((tmpl) => (
                    <p key={tmpl} className="text-xs font-mono">
                      {t('reports.' + tmpl)}
                    </p>
                  ))
                )}
              </div>
            </div>

            {/* Can Verify */}
            <div className="border border-black p-6 bg-white">
              <p className="minimal-label">{t('profile.canVerify')}</p>
              <div className="mt-3 space-y-2">
                {permissions.canVerify.length === 0 ? (
                  <p className="text-sm text-zinc-400">-</p>
                ) : (
                  permissions.canVerify.map((tmpl) => (
                    <p key={tmpl} className="text-xs font-mono">
                      {t('reports.' + tmpl)}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
