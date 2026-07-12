import { useState } from 'react';
import { useAuth } from './useAuth';
import { useOfflineSync } from './useOfflineSync';
import { checkSoD } from '../utils/sodChecks';

export function useReport() {
  const { user } = useAuth();
  const { isOnline, addToQueue } = useOfflineSync();
  const [loading, setLoading] = useState(false);

  const saveDraft = async (reportType: string, data: any) => {
    if (!user) return;
    
    // Save draft locally to localStorage
    const draftKey = `draft_${user.id}_${reportType}`;
    localStorage.setItem(draftKey, JSON.stringify({
      data,
      savedAt: new Date().toISOString()
    }));
    console.log(`[Auto-Save] Draft saved for ${reportType} locally.`);

    // If online, we would also update DynamoDB draft
    if (isOnline) {
      try {
        // mock API call
      } catch (err) {
        console.error('Failed to sync draft to cloud:', err);
      }
    }
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

      // 2. Submit report
      const submission = {
        id: `report_${Date.now()}`,
        reportType,
        orgId: user.orgId,
        siteId: user.siteId,
        userId: user.id,
        role: user.role,
        data: reportData,
        submittedAt: new Date().toISOString(),
        status: 'SUBMITTED',
      };

      if (!isOnline) {
        console.log('User is offline. Queueing report for later sync...');
        addToQueue({
          reportType,
          data: submission,
        });
        clearDraft(reportType);
        setLoading(false);
        return { success: true, queued: true };
      }

      // If online, simulate network submission
      console.log('Submitting report online to Amplify backend:', submission);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Save to local history
      const historyKey = `history_${user.orgId}`;
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      history.unshift(submission);
      localStorage.setItem(historyKey, JSON.stringify(history));

      clearDraft(reportType);
      setLoading(false);
      return { success: true, queued: false };
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const getReportHistory = () => {
    if (!user) return [];
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
