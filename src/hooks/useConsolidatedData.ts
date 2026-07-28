import { useState, useEffect } from 'react';
import { useReport } from './useReport';
import { logger } from '../utils/logger';

interface ConsolidatedData {
  // From TEMPLATE_04: Fuel data
  fuelOpeningStockL?: number;
  fuelReceivedL?: number;
  fuelIssuedL?: number;
  fuelClosingStockL?: number;
  fuelVarianceL?: number;
  // From TEMPLATE_02: Attendance data
  totalPresent?: number;
  totalAbsent?: number;
  totalLeave?: number;
  // From TEMPLATE_03: Machine data
  machineWorkingHours?: number;
  machineDowntime?: number;
  machinesDown?: number;
  downtimeReason?: string;
}

/**
 * Hook that fetches today's submitted reports across all templates
 * and merges cross-template data for pre-populating the Daily Site Summary.
 *
 * - TEMPLATE_04 fuel → TEMPLATE_01 fuel section
 * - TEMPLATE_02 attendance → TEMPLATE_01 staff section
 * - TEMPLATE_03 machines → TEMPLATE_01 machines section
 */
export function useConsolidatedData() {
  const { getReportHistory } = useReport();
  const [data, setData] = useState<ConsolidatedData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    consolidate();
  }, []);

  async function consolidate() {
    setLoading(true);
    try {
      const history = await getReportHistory();
      const today = new Date().toISOString().split('T')[0];

      const todayReports = history.filter((h: any) => {
        const reportDate = h.submittedAt ? new Date(h.submittedAt).toISOString().split('T')[0] : '';
        return reportDate === today;
      });

      const merged: ConsolidatedData = {};

      // Extract fuel data from TEMPLATE_04
      const fuelReport = todayReports.find((h: any) => h.reportType === 'TEMPLATE_04');
      if (fuelReport) {
        try {
          const fuelData = typeof fuelReport.data === 'string' ? JSON.parse(fuelReport.data) : (fuelReport.data || {});
          merged.fuelOpeningStockL = Number(fuelData.openingStock || fuelData.fuelOpeningStockL || 0);
          merged.fuelReceivedL = Number(fuelData.received || fuelData.fuelReceivedL || 0);
          merged.fuelIssuedL = Number(fuelData.totalIssued || fuelData.fuelIssuedL || 0);
          merged.fuelClosingStockL = Number(fuelData.closingStock || fuelData.fuelClosingStockL || 0);
          merged.fuelVarianceL = Number(fuelData.variance || fuelData.fuelVarianceL || 0);
        } catch { /* ignore parse errors */ }
      }

      // Extract attendance from TEMPLATE_02
      const attendanceReport = todayReports.find((h: any) => h.reportType === 'TEMPLATE_02');
      if (attendanceReport) {
        try {
          const attData = typeof attendanceReport.data === 'string' ? JSON.parse(attendanceReport.data) : (attendanceReport.data || {});
          merged.totalPresent = Number(attData.totalPresent || 0);
          merged.totalAbsent = Number(attData.totalAbsent || 0);
          merged.totalLeave = Number(attData.totalLeave || 0);
        } catch { /* ignore */ }
      }

      // Extract machine data from TEMPLATE_03
      const machineReport = todayReports.find((h: any) => h.reportType === 'TEMPLATE_03');
      if (machineReport) {
        try {
          const machData = typeof machineReport.data === 'string' ? JSON.parse(machineReport.data) : (machineReport.data || {});
          const rows = machData.rows || [];
          const totalHours = rows.reduce((sum: number, r: any) => sum + Number(r.hoursWorked || 0), 0);
          const downMachines = rows.filter((r: any) => r.breakdowns && r.breakdowns.trim() !== '');
          merged.machineWorkingHours = parseFloat(totalHours.toFixed(1));
          merged.machinesDown = downMachines.length;
          if (downMachines.length > 0) {
            merged.downtimeReason = downMachines.map((r: any) => `${r.machineId}: ${r.breakdowns}`).join('; ');
          }
        } catch { /* ignore */ }
      }

      setData(merged);
    } catch (err) {
      logger.error('Failed to consolidate cross-template data:', err);
    } finally {
      setLoading(false);
    }
  }

  return { consolidatedData: data, consolidatedLoading: loading };
}
