import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useReport } from '../../hooks/useReport';
import { useLanguage } from '../../contexts/LanguageContext';
import MultiSignatureFooter from '../../components/MultiSignatureFooter';
import VarianceAlert from '../../components/VarianceAlert';
import DateInput from '../../components/DateInput';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MachineEntry {
  machineName: string;
  openingMeter: string;
  closingMeter: string;
  hoursWorked: number;
  fuelIssued: string;
  expectedLPerHr: string;
  actualLPerHr: number;
  issuedBy: string;
  receivedBy: string;
  remarks: string;
}

interface StockData {
  openingStock: string;
  received: string;
  totalAvailable: number;
  totalIssued: number;
  closingStock: string;
  variance: number;
  varianceReason: string;
}

const EMPTY_ENTRY: MachineEntry = {
  machineName: '',
  openingMeter: '',
  closingMeter: '',
  hoursWorked: 0,
  fuelIssued: '',
  expectedLPerHr: '',
  actualLPerHr: 0,
  issuedBy: '',
  receivedBy: '',
  remarks: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FuelReconciliation() {
  const { user } = useAuth();
  const { saveDraft, submitReport, loadDraft } = useReport();
  const { t } = useLanguage();

  // Load draft or defaults
  const draft = loadDraft('TEMPLATE_04');

  const [machineEntries, setMachineEntries] = useState<MachineEntry[]>(
    draft?.machineEntries?.length > 0
      ? draft.machineEntries
      : [{ ...EMPTY_ENTRY }],
  );

  const [stock, setStock] = useState<StockData>(
    draft?.stock || {
      openingStock: '',
      received: '',
      totalAvailable: 0,
      totalIssued: 0,
      closingStock: '',
      variance: 0,
      varianceReason: '',
    },
  );

  const [reportDate, setReportDate] = useState<string>(draft?.reportDate || '');
  const [site, setSite] = useState<string>(draft?.site || '');
  const [showVarianceAlert, setShowVarianceAlert] = useState(false);
  const [multiSignatures, setMultiSignatures] = useState<Record<string, string>>({});

  // ---- Auto-calculate hours worked and L/HR per machine entry ----
  const recalcEntry = useCallback((entry: MachineEntry): MachineEntry => {
    const opening = Number(entry.openingMeter || 0);
    const closing = Number(entry.closingMeter || 0);
    const hours = closing > opening ? parseFloat((closing - opening).toFixed(1)) : 0;
    const fuel = Number(entry.fuelIssued || 0);
    const actualLPerHr = hours > 0 ? parseFloat((fuel / hours).toFixed(2)) : 0;
    return { ...entry, hoursWorked: hours, actualLPerHr };
  }, []);

  // ---- Auto-sum fuel issued across all machines → totalIssued ----
  const totalFuelIssued = machineEntries.reduce(
    (sum, e) => sum + Number(e.fuelIssued || 0),
    0,
  );

  // ---- Auto-calculate stock reconciliation ----
  useEffect(() => {
    const oStock = Number(stock.openingStock || 0);
    const rec = Number(stock.received || 0);
    const totalAvail = oStock + rec;
    const cStock = Number(stock.closingStock || 0);
    const calcVariance = parseFloat(
      (cStock - (totalAvail - totalFuelIssued)).toFixed(2),
    );

    setStock((prev) => ({
      ...prev,
      totalAvailable: totalAvail,
      totalIssued: totalFuelIssued,
      variance: calcVariance,
    }));

    setShowVarianceAlert(Math.abs(calcVariance) > 50);
  }, [stock.openingStock, stock.received, stock.closingStock, totalFuelIssued]);

  // ---- Auto-save draft every 30 seconds ----
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft('TEMPLATE_04', {
        reportDate,
        site,
        machineEntries,
        stock,
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [reportDate, site, machineEntries, stock, saveDraft]);

  // ---- Auto-fill opening values from previous day's TEMPLATE_04 ----
  useEffect(() => {
    if (!user) return;
    try {
      const historyKey = `history_${user.orgId}`;
      const raw = localStorage.getItem(historyKey);
      if (!raw) return;
      const history: any[] = JSON.parse(raw);

      // Find the most recent TEMPLATE_04 submission before the current date
      const fuelReports = history
        .filter((h: any) => h.reportType === 'TEMPLATE_04')
        .sort((a: any, b: any) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));

      // If a reportDate is set, filter to reports before that date; otherwise use the latest
      const previousReport = reportDate
        ? fuelReports.find((h: any) => (h.reportDate || h.submittedAt?.slice(0, 10)) < reportDate)
        : fuelReports[0];

      if (!previousReport) return;

      const prevData = typeof previousReport.data === 'string'
        ? JSON.parse(previousReport.data)
        : previousReport.data;

      if (!prevData) return;

      // Auto-fill opening stock from previous closing stock (only if currently empty)
      if (prevData.stock?.closingStock && !stock.openingStock) {
        setStock((prev) => ({ ...prev, openingStock: String(prevData.stock.closingStock) }));
      }

      // Auto-fill machine opening meters from previous closing meters
      if (prevData.machineEntries?.length > 0) {
        setMachineEntries((prev) => {
          let changed = false;
          const updated = prev.map((entry) => {
            if (entry.openingMeter || !entry.machineName) return entry;
            const match = prevData.machineEntries.find(
              (pe: any) => pe.machineName && pe.machineName.trim().toLowerCase() === entry.machineName.trim().toLowerCase(),
            );
            if (match?.closingMeter) {
              changed = true;
              return recalcEntry({ ...entry, openingMeter: String(match.closingMeter) });
            }
            return entry;
          });
          return changed ? updated : prev;
        });
      }
    } catch (err) {
      // Silently fail — auto-fill is best-effort
    }
  }, [reportDate, user]);

  // ---- Machine entry helpers ----
  const updateEntry = (index: number, field: keyof MachineEntry, value: string) => {
    setMachineEntries((prev) => {
      const updated = [...prev];
      updated[index] = recalcEntry({ ...updated[index], [field]: value });
      return updated;
    });
  };

  const addMachine = () => {
    // Auto-save current state to draft before adding
    saveDraft('TEMPLATE_04', { reportDate, site, machineEntries, stock });
    setMachineEntries((prev) => [...prev, { ...EMPTY_ENTRY }]);
  };

  const removeMachine = (index: number) => {
    if (machineEntries.length <= 1) return;
    setMachineEntries((prev) => prev.filter((_, i) => i !== index));
  };

  // ---- Stock field helper ----
  const updateStock = (field: keyof StockData, value: string) => {
    setStock((prev) => ({ ...prev, [field]: value }));
  };

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!reportDate.trim()) {
      alert('Date is required.');
      return;
    }

    // Validate at least one machine entry has data
    const filledEntries = machineEntries.filter(
      (e) => e.machineName.trim() && Number(e.fuelIssued || 0) > 0,
    );
    if (filledEntries.length === 0) {
      alert('Enter at least one machine with fuel data.');
      return;
    }

    // SoD check: for each entry, issuedBy !== receivedBy
    for (const entry of filledEntries) {
      if (
        entry.issuedBy.trim() &&
        entry.receivedBy.trim() &&
        entry.issuedBy.trim() === entry.receivedBy.trim()
      ) {
        alert(
          t('fuelRecon.sodViolation') ||
            `Segregation of Duties: Fuel issuer and receiver must be different for ${entry.machineName}.`,
        );
        return;
      }
    }

    // Variance explanation check
    if (Math.abs(stock.variance) > 0 && !stock.varianceReason.trim()) {
      alert(
        t('fuelRecon.varianceRequired') ||
          'Variance explanation is required when there is a stock difference.',
      );
      return;
    }

    // Signature check
    const requiredSigs = ['fuelManager', 'siteController'];
    const missing = requiredSigs.filter((r) => !multiSignatures[r]);
    if (missing.length > 0) {
      alert(t('fuelRecon.signatureRequired') || 'All signatures are required.');
      return;
    }

    try {
      await submitReport('TEMPLATE_04', {
        reportDate,
        site,
        machineEntries: filledEntries,
        stock,
        signatures: multiSignatures,
      });
      alert(t('fuelRecon.submitSuccess') || 'Fuel reconciliation submitted.');
      setMultiSignatures({});
    } catch (err: any) {
      alert(err.message || t('reports_form.submissionFailed'));
    }
  };

  return (
    <div className="max-w-4xl py-4">
      {showVarianceAlert && (
        <VarianceAlert
          type="warning"
          message={
            t('fuelRecon.varianceWarning') ||
            'Fuel stock variance exceeds threshold. Please verify physical stock.'
          }
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Report header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="minimal-label">Date</label>
            <DateInput
              value={reportDate}
              onChange={setReportDate}
              required
            />
          </div>
          <div>
            <label className="minimal-label">Site</label>
            <input
              type="text"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              className="minimal-input"
              placeholder="Site name"
            />
          </div>
        </div>

        {/* ── Machine Fuel Entries ── */}
        <div className="border-t border-black pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif italic text-lg text-black">
              {t('fuelRecon.machineFuelSupply') || 'Machine Fuel Supply'}
            </h3>
            <span className="text-sm font-semibold text-zinc-600">
              Total Fuel Issued: {totalFuelIssued.toLocaleString()} L
            </span>
          </div>

          {machineEntries.map((entry, idx) => (
            <div
              key={idx}
              className="border border-zinc-200 p-4 mb-4 bg-white"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  Machine {idx + 1}
                </span>
                {machineEntries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMachine(idx)}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold uppercase tracking-wider"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Machine name — free text */}
                <div>
                  <label className="minimal-label">
                    {t('fuelRecon.machine') || 'Machine'}
                  </label>
                  <input
                    type="text"
                    value={entry.machineName}
                    onChange={(e) =>
                      updateEntry(idx, 'machineName', e.target.value)
                    }
                    className="minimal-input"
                    placeholder="e.g. CAT 1, SANY 3, Pump 2"
                    required
                  />
                </div>

                {/* Opening meter */}
                <div>
                  <label className="minimal-label">
                    {t('fuelRecon.openingMeter') || 'Opening Meter (Hrs)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={entry.openingMeter}
                    onChange={(e) =>
                      updateEntry(idx, 'openingMeter', e.target.value)
                    }
                    className="minimal-input"
                    placeholder="0.0"
                  />
                </div>

                {/* Closing meter */}
                <div>
                  <label className="minimal-label">
                    {t('fuelRecon.closingMeter') || 'Closing Meter (Hrs)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={entry.closingMeter}
                    onChange={(e) =>
                      updateEntry(idx, 'closingMeter', e.target.value)
                    }
                    className="minimal-input"
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                {/* Hours worked — auto */}
                <div>
                  <label className="minimal-label">
                    {t('fuelRecon.hoursWorked') || 'Hours Worked (Auto)'}
                  </label>
                  <input
                    type="number"
                    value={entry.hoursWorked}
                    disabled
                    className="minimal-input font-semibold bg-zinc-50"
                  />
                </div>

                {/* Fuel issued */}
                <div>
                  <label className="minimal-label">
                    {t('fuelRecon.fuelIssued') || 'Fuel Issued (L)'}
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={entry.fuelIssued}
                    onChange={(e) =>
                      updateEntry(idx, 'fuelIssued', e.target.value)
                    }
                    className="minimal-input"
                    placeholder="0"
                    required
                  />
                </div>

                {/* Expected L/HR */}
                <div>
                  <label className="minimal-label">
                    Expected L/HR
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={entry.expectedLPerHr}
                    onChange={(e) =>
                      updateEntry(idx, 'expectedLPerHr', e.target.value)
                    }
                    className="minimal-input"
                    placeholder="e.g. 18"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                {/* Actual L/HR — auto */}
                <div>
                  <label className="minimal-label">
                    Actual L/HR (Auto)
                  </label>
                  <input
                    type="number"
                    value={entry.actualLPerHr}
                    disabled
                    className={`minimal-input font-bold bg-zinc-50 ${
                      entry.expectedLPerHr && entry.actualLPerHr > Number(entry.expectedLPerHr) * 1.1
                        ? 'text-red-600 border-b-red-500'
                        : ''
                    }`}
                  />
                  {entry.expectedLPerHr && entry.actualLPerHr > 0 && (
                    <p className={`text-[10px] mt-1 font-semibold ${
                      entry.actualLPerHr > Number(entry.expectedLPerHr) * 1.1
                        ? 'text-red-600'
                        : entry.actualLPerHr <= Number(entry.expectedLPerHr)
                        ? 'text-green-600'
                        : 'text-amber-600'
                    }`}>
                      {entry.actualLPerHr <= Number(entry.expectedLPerHr)
                        ? 'WITHIN NORM'
                        : entry.actualLPerHr > Number(entry.expectedLPerHr) * 1.1
                        ? 'OVER CONSUMPTION — INVESTIGATE'
                        : 'SLIGHTLY ABOVE NORM'}
                    </p>
                  )}
                </div>

                {/* Issued by */}
                <div>
                  <label className="minimal-label">
                    {t('fuelRecon.issuedBy') || 'Issued By'}
                  </label>
                  <input
                    type="text"
                    value={entry.issuedBy}
                    onChange={(e) =>
                      updateEntry(idx, 'issuedBy', e.target.value)
                    }
                    className="minimal-input"
                    placeholder="Name"
                  />
                </div>

                {/* Received by */}
                <div>
                  <label className="minimal-label">
                    {t('fuelRecon.receivedBy') || 'Received By'}
                  </label>
                  <input
                    type="text"
                    value={entry.receivedBy}
                    onChange={(e) =>
                      updateEntry(idx, 'receivedBy', e.target.value)
                    }
                    className="minimal-input"
                    placeholder="Name"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div className="mt-3">
                <label className="minimal-label">
                  {t('fuelRecon.remarks') || 'Remarks'}
                </label>
                <input
                  type="text"
                  value={entry.remarks}
                  onChange={(e) =>
                    updateEntry(idx, 'remarks', e.target.value)
                  }
                  className="minimal-input"
                  placeholder="Optional notes"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addMachine}
            className="minimal-btn-secondary text-sm"
          >
            + Add Machine
          </button>
        </div>

        {/* ── Stock Reconciliation ── */}
        <div className="border-t border-black pt-6">
          <h3 className="font-serif italic text-lg mb-4 text-black">
            {t('fuelRecon.stockReconciliation') || 'Fuel Stock Reconciliation'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="minimal-label">
                {t('fuelRecon.openingPhysical') || 'Opening Meter (L)'}
              </label>
              <input
                type="number"
                value={stock.openingStock}
                onChange={(e) => updateStock('openingStock', e.target.value)}
                className="minimal-input"
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="minimal-label">
                {t('fuelRecon.closingPhysical') || 'Closing Meter (L)'}
              </label>
              <input
                type="number"
                value={stock.closingStock}
                onChange={(e) => updateStock('closingStock', e.target.value)}
                className="minimal-input"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="minimal-label">
                {t('fuelRecon.fuelReceived') || 'Fuel Received (L)'}
              </label>
              <input
                type="number"
                value={stock.received}
                onChange={(e) => updateStock('received', e.target.value)}
                className="minimal-input"
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="minimal-label">
                {t('fuelRecon.totalIssuedToday') || 'Total Issued Today (L)'}
                <span className="text-[10px] ml-1 text-zinc-400 font-normal">
                  (auto from machines)
                </span>
              </label>
              <input
                type="number"
                value={stock.totalIssued}
                disabled
                className="minimal-input font-bold bg-zinc-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="minimal-label">
                {t('fuelRecon.totalAvailable') || 'Total Available Stock (Auto)'}
              </label>
              <input
                type="number"
                value={stock.totalAvailable}
                disabled
                className="minimal-input font-semibold bg-zinc-50"
              />
            </div>
            <div>
              <label className="minimal-label">
                {t('fuelRecon.physicalVariance') || 'Physical Variance (L)'}
              </label>
              <input
                type="number"
                value={stock.variance}
                disabled
                className="minimal-input font-bold bg-zinc-50"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="minimal-label">
              {t('fuelRecon.varianceExplanation') || 'Variance Explanation'}
            </label>
            <input
              type="text"
              value={stock.varianceReason}
              onChange={(e) => updateStock('varianceReason', e.target.value)}
              className="minimal-input"
              placeholder={
                t('fuelRecon.variancePlaceholder') ||
                'Explain any stock difference'
              }
            />
          </div>
        </div>

        {/* Multi-Signature Footer */}
        <MultiSignatureFooter
          signatories={[
            {
              role: 'fuelManager',
              label: 'Fuel Manager',
              required: true,
            },
            {
              role: 'siteController',
              label:
                t('fuelRecon.siteControllerSignOff') || 'Site Controller',
              required: true,
            },
          ]}
          onSignaturesChange={setMultiSignatures}
        />

        {/* Actions */}
        <div className="flex gap-4 pt-6">
          <button type="submit" className="minimal-btn">
            {t('fuelRecon.submitReconciliation') || 'Submit Reconciliation'}
          </button>
          <button
            type="button"
            onClick={() => {
              saveDraft('TEMPLATE_04', {
                reportDate,
                site,
                machineEntries,
                stock,
              });
              alert(t('fuelRecon.draftSaved') || 'Draft saved.');
            }}
            className="minimal-btn-secondary"
          >
            {t('reports_form.saveDraft') || 'Save Draft'}
          </button>
        </div>
      </form>
    </div>
  );
}
