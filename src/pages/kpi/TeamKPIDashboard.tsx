import React, { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { useKPI } from '../../hooks/useKPI';
import { ROLE_KPI_PROFILES } from '../../types/kpiDefinitions';
import { ROLE_PERMISSIONS } from '../../types/roles';
import type { Role } from '../../types/roles';
import { getAllSubordinates, ROLE_HIERARCHY } from '../../types/roleHierarchy';
import { DEMO_USERS } from '../../contexts/AuthContext';
import KPICard from '../../components/KPICard';

interface SubordinateGroup {
  role: Role;
  members: typeof DEMO_USERS;
  avgValues: Record<string, number>;
}

export default function TeamKPIDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { getUserKPIHistory, getFieldsForRole } = useKPI();

  const hasAccess = useMemo(() => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role as Role]?.canViewTeamKPI === true;
  }, [user]);

  const subordinateRoles = useMemo(() => {
    if (!user) return [];
    return getAllSubordinates(user.role as Role);
  }, [user]);

  const groups: SubordinateGroup[] = useMemo(() => {
    if (!user || subordinateRoles.length === 0) return [];

    const grouped = new Map<Role, typeof DEMO_USERS>();

    for (const role of subordinateRoles) {
      const matching = DEMO_USERS.filter((u) => u.role === role);
      if (matching.length > 0) {
        grouped.set(role, matching);
      }
    }

    const result: SubordinateGroup[] = [];

    grouped.forEach((members, role) => {
      const fields = getFieldsForRole(role);
      const avgValues: Record<string, number> = {};

      if (fields.length > 0) {
        const allValues: Record<string, number[]> = {};
        for (const field of fields) {
          allValues[field.key] = [];
        }

        for (const member of members) {
          const history = getUserKPIHistory(member.id, 7);
          if (history.length > 0) {
            const latest = history[0];
            for (const field of fields) {
              if (latest.values[field.key] !== undefined) {
                allValues[field.key].push(latest.values[field.key]);
              }
            }
          }
        }

        for (const field of fields) {
          const arr = allValues[field.key];
          avgValues[field.key] = arr.length > 0
            ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
            : 0;
        }
      }

      result.push({ role, members, avgValues });
    });

    return result;
  }, [user, subordinateRoles, getUserKPIHistory, getFieldsForRole]);

  if (!user) return null;

  if (!hasAccess) {
    return (
      <div className="py-4 space-y-6">
        <h1 className="editorial-title text-3xl font-light text-black">
          {t('kpi.team.title')}
        </h1>
        <p className="text-sm text-zinc-500">{t('kpi.team.noTeamData')}</p>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-12">
      {/* Header */}
      <div>
        <h1 className="editorial-title text-3xl font-light mb-2 text-black">
          {t('kpi.team.title')}
        </h1>
        <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold border-b border-black pb-4">
          {t('kpi.team.subtitle')}
        </p>
      </div>

      {/* Subordinate Summary */}
      <div>
        <h2 className="font-serif italic text-lg mb-6 text-black border-b border-zinc-200 pb-2">
          {t('kpi.team.subordinateSummary')}
        </h2>

        {groups.length === 0 ? (
          <p className="text-sm text-zinc-500">{t('kpi.team.noTeamData')}</p>
        ) : (
          <div className="space-y-10">
            {groups.map((group) => {
              const fields = getFieldsForRole(group.role);
              const profile = ROLE_KPI_PROFILES[group.role as Role];
              const department = ROLE_HIERARCHY[group.role]?.department ?? '';

              return (
                <div key={group.role} className="space-y-4">
                  {/* Role group header */}
                  <div className="flex items-baseline gap-3">
                    <h3 className="font-serif italic text-base text-black">
                      {t('roles.' + group.role)}
                    </h3>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">
                      {department} &middot; {group.members.length}{' '}
                      {t('kpi.team.members').toLowerCase()}
                    </span>
                  </div>

                  {/* Average KPI Cards */}
                  {profile && fields.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {fields.slice(0, 4).map((f) => (
                        <KPICard
                          key={f.key}
                          label={t('kpi.team.avgPerformance') + ' - ' + t(f.labelKey)}
                          value={group.avgValues[f.key] ?? 0}
                          target={f.defaultTarget}
                          unit={f.unit}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Team Members Table */}
      <div>
        <h3 className="font-serif italic text-lg mb-4 text-black">
          {t('kpi.team.directReports')}
        </h3>
        <div className="overflow-x-auto">
          <table className="editorial-table">
            <thead>
              <tr>
                <th>{t('kpi.team.memberName')}</th>
                <th>{t('kpi.team.roleGroup')}</th>
                <th>{t('kpi.team.department')}</th>
                <th>{t('kpi.team.avgPerformance')}</th>
              </tr>
            </thead>
            <tbody>
              {groups.flatMap((group) =>
                group.members.map((member) => {
                  const fields = getFieldsForRole(group.role);
                  const memberHistory = getUserKPIHistory(member.id, 7);
                  const latestValues = memberHistory.length > 0 ? memberHistory[0].values : {};

                  let totalPct = 0;
                  let fieldCount = 0;
                  for (const f of fields) {
                    if (f.defaultTarget > 0) {
                      totalPct += ((latestValues[f.key] ?? 0) / f.defaultTarget) * 100;
                      fieldCount++;
                    }
                  }
                  const overallPct = fieldCount > 0 ? Math.round(totalPct / fieldCount) : 0;
                  const met = overallPct >= 100;

                  return (
                    <tr key={member.id}>
                      <td className="font-serif italic font-semibold">
                        {member.firstName} {member.lastName}
                      </td>
                      <td>{t('roles.' + group.role)}</td>
                      <td>{ROLE_HIERARCHY[group.role]?.department ?? '-'}</td>
                      <td>
                        {memberHistory.length > 0 ? (
                          <span
                            className={'text-[10px] font-semibold px-2 py-0.5 border uppercase tracking-wider ' +
                              (met
                                ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                                : 'border-red-500 text-red-600 bg-red-50'
                              )
                            }
                          >
                            {overallPct}%
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                            {t('kpi.dashboard.noData')}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                }),
              )}
              {groups.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-sm text-zinc-400 text-center py-8">
                    {t('kpi.team.noTeamData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
