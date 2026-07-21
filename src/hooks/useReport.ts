import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './useAuth';
import { useOfflineSync } from './useOfflineSync';
import { checkSoD } from '../utils/sodChecks';
import { getDataClient } from '../services/dataService';
import { logger } from '../utils/logger';
import { trackEvent, AnalyticsEvents } from '../utils/analytics';

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
        trackEvent(AnalyticsEvents.REPORT_QUEUED_OFFLINE, { reportType });
        setLoading(false);
        return { success: true, queued: true };
      }

      // Submit to AppSync/DynamoDB
      const client = getDataClient();
      await client.models.DailyReport.create(submission);

      // Extract KPI metrics from report data to update KPI Dashboard dynamically
      const todayStr = new Date().toISOString().slice(0, 10);
      const kpiMetrics: Record<string, number> = {};

      if (reportData.totalGoldRecoveryG) kpiMetrics.daily_gold_recovery_g = Number(reportData.totalGoldRecoveryG);
      if (reportData.materialMinedM3) kpiMetrics.material_mined_m3 = Number(reportData.materialMinedM3);
      if (reportData.hoursWorked) kpiMetrics.operating_hours = Number(reportData.hoursWorked);
      if (reportData.totalIssued) kpiMetrics.fuel_issued_l = Number(reportData.totalIssued);
      if (reportData.fuelIssuedL) kpiMetrics.fuel_issued_l = Number(reportData.fuelIssuedL);
      if (reportData.grossWeightG) kpiMetrics.daily_gold_recovery_g = Number(reportData.grossWeightG);
      if (reportData.shakingTableRecoveryG) kpiMetrics.shaking_table_recovery_g = Number(reportData.shakingTableRecoveryG);
      if (reportData.concentrateWeightG) kpiMetrics.shaking_table_recovery_g = Number(reportData.concentrateWeightG);
      if (reportData.amountUSD) kpiMetrics.daily_expenses_usd = Number(reportData.amountUSD);
      if (reportData.totalCost) kpiMetrics.daily_expenses_usd = Number(reportData.totalCost);

      if (reportData.materialMinedM3 && reportData.fuelIssuedL) {
        kpiMetrics.fuel_efficiency_l_per_m3 = parseFloat((Number(reportData.fuelIssuedL) / Number(reportData.materialMinedM3)).toFixed(2));
      }

      if (Object.keys(kpiMetrics).length > 0) {
        try {
          await client.models.KPIEntry.create({
            orgId: user.orgId,
            siteId: user.siteId,
            userId: user.id,
            role: user.role,
            entryDate: todayStr,
            shift: 'DAY',
            kpiData: JSON.stringify(kpiMetrics),
            status: 'SUBMITTED',
            submittedAt: new Date().toISOString(),
            source: 'WEB',
          });
        } catch (kpiErr) {
          logger.warn('Failed to sync report KPI to AppSync:', kpiErr);
        }

        const kpiEntryObj = {
          id: `kpi_${Date.now()}`,
          userId: user.id,
          role: user.role,
          entryDate: todayStr,
          shift: 'DAY' as const,
          values: kpiMetrics,
          submittedAt: new Date().toISOString(),
          status: 'SUBMITTED' as const,
        };

        const userKey = `kpi_history_${user.id}`;
        const uHist = safeGetJSON<any[]>(userKey, []);
        uHist.unshift(kpiEntryObj);
        safeSetJSON(userKey, uHist);

        const siteKey = `kpi_site_${user.siteId}`;
        const sHist = safeGetJSON<any[]>(siteKey, []);
        sHist.unshift(kpiEntryObj);
        safeSetJSON(siteKey, sHist);
      }

      // Also keep in local history for quick access
      const historyKey = `history_${user.orgId}`;
      const history = safeGetJSON<any[]>(historyKey, []);
      history.unshift({ ...submission, id: `report_${Date.now()}` });
      safeSetJSON(historyKey, history);

      clearDraft(reportType);
      trackEvent(AnalyticsEvents.REPORT_SUBMITTED, { reportType });
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
      logger.error('Failed to fetch reports from AppSync, falling back to local:', err);
      toast.error('Unable to load reports from server. Showing cached data.');
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
