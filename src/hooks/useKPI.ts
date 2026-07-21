import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './useAuth';
import { ROLE_KPI_PROFILES, KPIField } from '../types/kpiDefinitions';
import { getDataClient } from '../services/dataService';
import { logger } from '../utils/logger';
import { trackEvent, AnalyticsEvents } from '../utils/analytics';

export interface KPIEntry {
  id: string;
  userId: string;
  role: string;
  entryDate: string;
  shift: 'DAY' | 'NIGHT';
  values: Record<string, number>;
  submittedAt: string;
  status: 'DRAFT' | 'SUBMITTED';
}

function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    logger.warn(`Failed to parse localStorage key "${key}":`, err);
    return fallback;
  }
}

function safeSetJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    logger.error(`Failed to write localStorage key "${key}":`, err);
  }
}

export function useKPI() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getStorageKey = useCallback(
    (suffix: string) => (user ? `kpi_${user.id}_${suffix}` : ''),
    [user],
  );

  const saveDraft = useCallback(
    (values: Record<string, number>, entryDate: string, shift: 'DAY' | 'NIGHT') => {
      if (!user) return;
      const key = getStorageKey('draft');
      safeSetJSON(key, { values, entryDate, shift, savedAt: new Date().toISOString() });
    },
    [user, getStorageKey],
  );

  const loadDraft = useCallback((): {
    values: Record<string, number>;
    entryDate: string;
    shift: 'DAY' | 'NIGHT';
  } | null => {
    if (!user) return null;
    const raw = localStorage.getItem(getStorageKey('draft'));
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (err) {
      logger.warn('Failed to parse KPI draft:', err);
      return null;
    }
  }, [user, getStorageKey]);

  const clearDraft = useCallback(() => {
    if (!user) return;
    localStorage.removeItem(getStorageKey('draft'));
  }, [user, getStorageKey]);

  const submitKPIEntry = useCallback(
    async (values: Record<string, number>, entryDate: string, shift: 'DAY' | 'NIGHT') => {
      if (!user) throw new Error('Not authenticated.');
      setLoading(true);
      try {
        const entry: KPIEntry = {
          id: `kpi_${Date.now()}`,
          userId: user.id,
          role: user.role,
          entryDate,
          shift,
          values,
          submittedAt: new Date().toISOString(),
          status: 'SUBMITTED',
        };

        // Persist to AppSync/DynamoDB
        try {
          const client = getDataClient();
          await client.models.KPIEntry.create({
            orgId: user.orgId,
            siteId: user.siteId,
            userId: user.id,
            role: user.role,
            entryDate,
            shift,
            kpiData: JSON.stringify(values),
            status: 'SUBMITTED',
            submittedAt: new Date().toISOString(),
            source: 'WEB',
          });
        } catch (err) {
          logger.error('Failed to persist KPI to AppSync:', err);
          toast.error('KPI saved locally but failed to sync to server.');
        }

        // Also store locally for quick access
        const historyKey = `kpi_history_${user.id}`;
        const existing: KPIEntry[] = safeGetJSON(historyKey, []);
        existing.unshift(entry);
        safeSetJSON(historyKey, existing);

        const siteKey = `kpi_site_${user.siteId}`;
        const siteData: KPIEntry[] = safeGetJSON(siteKey, []);
        siteData.unshift(entry);
        safeSetJSON(siteKey, siteData);

        clearDraft();
        trackEvent(AnalyticsEvents.KPI_SUBMITTED, { role: user.role, shift });
        setLoading(false);
        return entry;
      } catch (err) {
        setLoading(false);
        throw err;
      }
    },
    [user, clearDraft],
  );

  const getKPIHistory = useCallback(
    (days?: number): KPIEntry[] => {
      if (!user) return [];
      const historyKey = `kpi_history_${user.id}`;
      let all: KPIEntry[] = safeGetJSON(historyKey, []);

      // Async fetch from AppSync to hydrate cache
      getDataClient().models.KPIEntry.list()
        .then(({ data }) => {
          if (data && data.length > 0) {
            const fetched: KPIEntry[] = data
              .filter((k: any) => k.userId === user.id || k.userId === user.email)
              .map((k: any) => {
                let parsed: Record<string, number> = {};
                try {
                  parsed = typeof k.kpiData === 'string' ? JSON.parse(k.kpiData) : (k.kpiData || {});
                } catch {
                  parsed = {};
                }
                return {
                  id: k.id,
                  userId: k.userId,
                  role: k.role,
                  entryDate: k.entryDate,
                  shift: (k.shift as 'DAY' | 'NIGHT') || 'DAY',
                  values: parsed,
                  submittedAt: k.submittedAt || k.createdAt || new Date().toISOString(),
                  status: (k.status as 'DRAFT' | 'SUBMITTED') || 'SUBMITTED',
                };
              });

            if (fetched.length > 0) {
              const combinedMap = new Map<string, KPIEntry>();
              for (const item of [...all, ...fetched]) {
                combinedMap.set(item.id, item);
              }
              const merged = Array.from(combinedMap.values()).sort((a, b) => (b.entryDate > a.entryDate ? 1 : -1));
              safeSetJSON(historyKey, merged);
            }
          }
        })
        .catch((err) => logger.warn('AppSync KPI fetch failed:', err));

      if (!days) return all;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return all.filter((e) => new Date(e.entryDate) >= cutoff);
    },
    [user],
  );

  const getSiteKPIEntries = useCallback(
    (days?: number): KPIEntry[] => {
      if (!user) return [];
      const siteKey = `kpi_site_${user.siteId}`;
      let all: KPIEntry[] = safeGetJSON(siteKey, []);

      getDataClient().models.KPIEntry.list()
        .then(({ data }) => {
          if (data && data.length > 0) {
            const fetched: KPIEntry[] = data
              .filter((k: any) => k.orgId === user.orgId || k.siteId === user.siteId)
              .map((k: any) => {
                let parsed: Record<string, number> = {};
                try {
                  parsed = typeof k.kpiData === 'string' ? JSON.parse(k.kpiData) : (k.kpiData || {});
                } catch {
                  parsed = {};
                }
                return {
                  id: k.id,
                  userId: k.userId,
                  role: k.role,
                  entryDate: k.entryDate,
                  shift: (k.shift as 'DAY' | 'NIGHT') || 'DAY',
                  values: parsed,
                  submittedAt: k.submittedAt || k.createdAt || new Date().toISOString(),
                  status: (k.status as 'DRAFT' | 'SUBMITTED') || 'SUBMITTED',
                };
              });

            if (fetched.length > 0) {
              const combinedMap = new Map<string, KPIEntry>();
              for (const item of [...all, ...fetched]) {
                combinedMap.set(item.id, item);
              }
              const merged = Array.from(combinedMap.values()).sort((a, b) => (b.entryDate > a.entryDate ? 1 : -1));
              safeSetJSON(siteKey, merged);
            }
          }
        })
        .catch((err) => logger.warn('AppSync site KPI fetch failed:', err));

      if (!days) return all;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return all.filter((e) => new Date(e.entryDate) >= cutoff);
    },
    [user],
  );

  const getUserKPIHistory = useCallback(
    (userId: string, days?: number): KPIEntry[] => {
      const historyKey = `kpi_history_${userId}`;
      let all: KPIEntry[] = safeGetJSON(historyKey, []);
      if (!days) return all;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return all.filter((e) => new Date(e.entryDate) >= cutoff);
    },
    [],
  );

  const getFieldsForRole = useCallback((role: string): KPIField[] => {
    const profile = ROLE_KPI_PROFILES[role as keyof typeof ROLE_KPI_PROFILES];
    if (!profile) return [];
    return profile.categories.flatMap((c) => c.fields);
  }, []);

  return {
    loading,
    saveDraft,
    loadDraft,
    clearDraft,
    submitKPIEntry,
    getKPIHistory,
    getSiteKPIEntries,
    getUserKPIHistory,
    getFieldsForRole,
  };
}
