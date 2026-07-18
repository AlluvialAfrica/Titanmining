import { useState } from 'react';
import { useAuth } from './useAuth';
import { useOfflineSync } from './useOfflineSync';
import { checkSoD } from '../utils/sodChecks';
import { getDataClient } from '../services/dataService';

function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Failed to parse localStorage key "${key}":`, err);
    return fallback;
  }
}

function safeSetJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write localStorage key "${key}":`, err);
  }
}

export function useReport() {
  const { user } = useAuth();
  const { isOnline, addToQueue } = useOfflineSync();
  const [loading, setLoading] = useState(false);

  const saveDraft = async (reportType: string, data: any) => {
    if (!user) return;
    const draftKey = `draft_${user.id}_${reportType}`;
    safeSetJSON(draftKey, { data, savedAt: new Date().toISOString() });
  };

  const loadDraft = (reportType: string) => {
    if (!user) return null;
    const draftKey = `draft_${user.id}_${reportType}`;
    const saved = safeGetJSON<{ data: any } | null>(draftKey, null);
    return saved ? saved.data : null;
  };

  const clearDraft = (reportType: string) => {
    if (!user) return;
    const draftKey = `draft_${user.id}_${reportType}`;
    localStorage.removeItem(draftKey);
  };

  const submitReport = async (reportType: string, reportData: any) => {
    if (!user) throw new Error('Not authenticated.');
    setLoading(true);

    try {
      // 1. Enforce Segregation of Duties (SoD)
      const sodViolation = checkSoD(reportType, reportData, user.role, user.id);
      if (sodViolation) {
        throw new Error(`SoD Violation: ${sodViolation.violation} (${sodViolation.ruleId})`);
      }

      const submission = {
        orgId: user.orgId,
        siteId: user.siteId,
        userId: user.id,
        role: user.role,
        reportType,
        reportDate: new Date().toISOString().slice(0, 10),
        data: JSON.stringify(reportData),
        submittedAt: new Date().toISOString(),
        status: 'SUBMITTED',
        source: 'WEB',
      };

      if (!isOnline) {
        addToQueue({ reportType, data: submission });
        clearDraft(reportType);
        setLoading(false);
        return { success: true, queued: true };
      }

      // Submit to AppSync/DynamoDB
      const client = getDataClient();
      await client.models.DailyReport.create(submission);

      // Also keep in local history for quick access
      const historyKey = `history_${user.orgId}`;
      const history = safeGetJSON<any[]>(historyKey, []);
      history.unshift({ ...submission, id: `report_${Date.now()}` });
      safeSetJSON(historyKey, history);

      clearDraft(reportType);
      setLoading(false);
      return { success: true, queued: false };
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const getReportHistory = async () => {
    if (!user) return [];
    try {
      const client = getDataClient();
      const { data } = await client.models.DailyReport.list();
      if (data && data.length > 0) return data;
    } catch (err) {
      console.error('Failed to fetch reports from AppSync, falling back to local:', err);
    }
    // Fallback to localStorage
    const historyKey = `history_${user.orgId}`;
    return safeGetJSON<any[]>(historyKey, []);
  };

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    submitReport,
    getReportHistory,
    loading,
  };
}
