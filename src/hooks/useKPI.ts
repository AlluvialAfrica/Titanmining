import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { ROLE_KPI_PROFILES, KPIField } from '../types/kpiDefinitions';

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

export function useKPI() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getStorageKey = useCallback(
    (suffix: string) => (user ? `kpi_${user.id}_${suffix}` : ''),
    [user],
  );

  /** Persist a draft to localStorage */
  const saveDraft = useCallback(
    (values: Record<string, number>, entryDate: string, shift: 'DAY' | 'NIGHT') => {
      if (!user) return;
      const key = getStorageKey('draft');
      localStorage.setItem(
        key,
        JSON.stringify({ values, entryDate, shift, savedAt: new Date().toISOString() }),
      );
    },
    [user, getStorageKey],
  );

  /** Load draft from localStorage */
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
    } catch {
      return null;
    }
  }, [user, getStorageKey]);

  /** Clear draft */
  const clearDraft = useCallback(() => {
    if (!user) return;
    localStorage.removeItem(getStorageKey('draft'));
  }, [user, getStorageKey]);

  /** Submit a KPI entry */
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

        // Store in history array
        const historyKey = `kpi_history_${user.id}`;
        const existing: KPIEntry[] = JSON.parse(localStorage.getItem(historyKey) || '[]');
        existing.unshift(entry);
        localStorage.setItem(historyKey, JSON.stringify(existing));

        // Also store in site-wide KPI store for team dashboard
        const siteKey = `kpi_site_${user.siteId}`;
        const siteData: KPIEntry[] = JSON.parse(localStorage.getItem(siteKey) || '[]');
        siteData.unshift(entry);
        localStorage.setItem(siteKey, JSON.stringify(siteData));

        clearDraft();
        setLoading(false);
        return entry;
      } catch (err) {
        setLoading(false);
        throw err;
      }
    },
    [user, clearDraft],
  );

  /** Get KPI history for current user */
  const getKPIHistory = useCallback(
    (days?: number): KPIEntry[] => {
      if (!user) return [];
      const historyKey = `kpi_history_${user.id}`;
      const all: KPIEntry[] = JSON.parse(localStorage.getItem(historyKey) || '[]');
      if (!days) return all;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return all.filter((e) => new Date(e.entryDate) >= cutoff);
    },
    [user],
  );

  /** Get site-wide KPI entries (for team dashboards) */
  const getSiteKPIEntries = useCallback(
    (days?: number): KPIEntry[] => {
      if (!user) return [];
      const siteKey = `kpi_site_${user.siteId}`;
      const all: KPIEntry[] = JSON.parse(localStorage.getItem(siteKey) || '[]');
      if (!days) return all;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return all.filter((e) => new Date(e.entryDate) >= cutoff);
    },
    [user],
  );

  /** Get KPI entries for a specific user (for team view) */
  const getUserKPIHistory = useCallback(
    (userId: string, days?: number): KPIEntry[] => {
      const historyKey = `kpi_history_${userId}`;
      const all: KPIEntry[] = JSON.parse(localStorage.getItem(historyKey) || '[]');
      if (!days) return all;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return all.filter((e) => new Date(e.entryDate) >= cutoff);
    },
    [],
  );

  /** Get all KPI fields for a role */
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
