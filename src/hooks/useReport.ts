import { useState } from 'react';
import { useAuth } from './useAuth';
import { useOfflineSync } from './useOfflineSync';
import { checkSoD } from '../utils/sodChecks';
import { getDataClient } from '../services/dataService';

export function useReport() {
  const { user } = useAuth();
  const { isOnline, addToQueue } = useOfflineSync();
  const [loading, setLoading] = useState(false);

  const saveDraft = async (reportType: string, data: any) => {
    if (!user) return;
    const draftKey = `draft_${user.id}_${reportType}`;
    localStorage.setItem(draftKey, JSON.stringify({
      data,
      savedAt: new Date().toISOString()
    }));
  };

  const loadDraft = (reportType: string) => {
    if (!user) return null;
    const draftKey = `draft_${user.id}_${reportType}`;
    const saved = localStorage.getItem(draftKey);
    return saved ? JSON.parse(saved).data : null;
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
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      history.unshift({ ...submission, id: `report_${Date.now()}` });
      localStorage.setItem(historyKey, JSON.stringify(history));

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
    return JSON.parse(localStorage.getItem(historyKey) || '[]');
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
