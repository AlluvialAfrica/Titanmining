import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useReport } from '../../hooks/useReport';
import { useLanguage } from '../../contexts/LanguageContext';
import DigitalSignature from '../../components/DigitalSignature';
import VarianceAlert from '../../components/VarianceAlert';
import MultiRowTable, { ColumnDef } from '../../components/MultiRowTable';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FieldSpec {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'time';
  options?: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
}

interface FormSpec {
  title: string;
  headerFields?: FieldSpec[];
  fields: FieldSpec[];
  tableColumns?: ColumnDef[];
  summaryFields?: FieldSpec[];
  calculate?: (values: any, setValue: any) => void;
  calculateRow?: (row: Record<string, any>, index: number) => Record<string, any>;
  calculateSummary?: (rows: Record<string, any>[], setValue: any) => void;
  validate?: (values: any) => string | null;
  getVarianceMessage?: (values: any) => string | null;
}

// ---------------------------------------------------------------------------
// Template Specs
// ---------------------------------------------------------------------------

const formSpecs: Record<string, FormSpec> = {
  // ---- TEMPLATE_02: Staff Attendance & Shift Roster ----
  TEMPLATE_02: {
    title: 'Template 02: Staff Attendance & Shift Roster',
    headerFields: [
      { name: 'reportDate', label: 'Date', type: 'text', required: true },
      { name: 'site', label: 'Site', type: 'text', required: true },
      { name: 'shift', label: 'Shift', type: 'select', required: true, options: [{ value: 'DAY', label: 'Day Shift' }, { value: 'NIGHT', label: 'Night Shift' }] },
      { name: 'supervisor', label: 'Supervisor', type: 'text', required: true },
    ],
    fields: [],
    tableColumns: [
      { name: 'staffName', label: 'Staff Name', type: 'text', required: true },
      { name: 'role', label: 'Role / Designation', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: [{ value: 'PRESENT', label: 'Present' }, { value: 'ABSENT', label: 'Absent' }, { value: 'LEAVE', label: 'Leave' }] },
      { name: 'remarks', label: 'Remarks', type: 'text' },
    ],
    summaryFields: [
      { name: 'totalPresent', label: 'Total Present', type: 'number', disabled: true },
      { name: 'totalAbsent', label: 'Total Absent', type: 'number', disabled: true },
      { name: 'totalLeave', label: 'Total Leave', type: 'number', disabled: true },
      { name: 'supervisorRemarks', label: 'Supervisor Remarks', type: 'textarea' },
    ],
    calculateSummary: (rows, setValue) => {
      setValue('totalPresent', rows.filter(r => r.status === 'PRESENT').length);
      setValue('totalAbsent', rows.filter(r => r.status === 'ABSENT').length);
      setValue('totalLeave', rows.filter(r => r.status === 'LEAVE').length);
    },
  },

  // ---- TEMPLATE_03: Excavator / Machine Daily Log ----
  TEMPLATE_03: {
    title: 'Template 03: Excavator / Machine Daily Log',
    headerFields: [
      { name: 'reportDate', label: 'Date', type: 'text', required: true },
      { name: 'site', label: 'Site', type: 'text', required: true },
      { name: 'shift', label: 'Shift', type: 'select', required: true, options: [{ value: 'DAY', label: 'Day Shift' }, { value: 'NIGHT', label: 'Night Shift' }] },
    ],
    fields: [],
    tableColumns: [
      { name: 'machineId', label: 'Machine ID', type: 'select', options: [{ value: 'CAT_1', label: 'CAT 1' }, { value: 'CAT_2', label: 'CAT 2' }, { value: 'SANY_1', label: 'SANY 1' }, { value: 'SANY_2', label: 'SANY 2' }] },
      { name: 'operator', label: 'Operator', type: 'text', required: true },
      { name: 'openingHours', label: 'Opening Hrs', type: 'number', required: true },
      { name: 'closingHours', label: 'Closing Hrs', type: 'number', required: true },
      { name: 'hoursWorked', label: 'Hrs Worked', type: 'number', disabled: true },
      { name: 'fuelAddedL', label: 'Fuel (L)', type: 'number' },
      { name: 'workArea', label: 'Work Area', type: 'text' },
      { name: 'breakdowns', label: 'Breakdowns / Issues', type: 'text' },
    ],
    calculateRow: (row) => {
      const opening = Number(row.openingHours || 0);
      const closing = Number(row.closingHours || 0);
      return { ...row, hoursWorked: closing >= opening ? parseFloat((closing - opening).toFixed(1)) : 0 };
    },
  },

  // ---- TEMPLATE_05: Mining & Geology Daily Sheet ----
  TEMPLATE_05: {
    title: 'Template 05: Mining & Geology Daily Sheet',
    headerFields: [
      { name: 'reportDate', label: 'Date', type: 'text', required: true },
      { name: 'site', label: 'Site', type: 'text', required: true },
      { name: 'geologist', label: 'Geologist Name', type: 'text', required: true },
    ],
    fields: [],
    tableColumns: [
      { name: 'pitBlock', label: 'Pit / Block', type: 'text', required: true },
      { name: 'benchLevel', label: 'Bench Level', type: 'number' },
      { name: 'materialType', label: 'Material Type', type: 'select', options: [{ value: 'ALLUVIAL', label: 'Alluvial' }, { value: 'OVERBURDEN', label: 'Overburden' }, { value: 'CLAY', label: 'Clay' }] },
      { name: 'volumeMinedM3', label: 'Volume (m\u00B3)', type: 'number', required: true },
      { name: 'estGradeGPerTon', label: 'Grade (g/ton)', type: 'number' },
      { name: 'excavatorId', label: 'Excavator ID', type: 'text' },
      { name: 'remarks', label: 'Remarks', type: 'text' },
    ],
    summaryFields: [
      { name: 'totalVolume', label: 'Total Volume (m\u00B3)', type: 'number', disabled: true },
      { name: 'avgGrade', label: 'Avg Grade (g/ton)', type: 'number', disabled: true },
    ],
    calculateSummary: (rows, setValue) => {
      const totalVol = rows.reduce((s, r) => s + Number(r.volumeMinedM3 || 0), 0);
      setValue('totalVolume', parseFloat(totalVol.toFixed(2)));
      const weighted = rows.reduce((s, r) => s + Number(r.volumeMinedM3 || 0) * Number(r.estGradeGPerTon || 0), 0);
      setValue('avgGrade', totalVol > 0 ? parseFloat((weighted / totalVol).toFixed(2)) : 0);
    },
  },

  // ---- TEMPLATE_06: Drum & Sand Pump Shift Log ----
  TEMPLATE_06: {
    title: 'Template 06: Drum & Sand Pump Shift Log',
    headerFields: [
      { name: 'reportDate', label: 'Date', type: 'text', required: true },
      { name: 'site', label: 'Site', type: 'text', required: true },
      { name: 'shift', label: 'Shift', type: 'select', required: true, options: [{ value: 'DAY', label: 'Day Shift' }, { value: 'NIGHT', label: 'Night Shift' }] },
    ],
    fields: [],
    tableColumns: [
      { name: 'pumpUnit', label: 'Pump Unit', type: 'select', options: [{ value: 'PUMP_01', label: 'Sand Pump 1' }, { value: 'PUMP_02', label: 'Sand Pump 2' }] },
      { name: 'operator', label: 'Operator', type: 'text', required: true },
      { name: 'inletPressure', label: 'Inlet Press.', type: 'number' },
      { name: 'outletPressure', label: 'Outlet Press.', type: 'number' },
      { name: 'slurryDensity', label: 'Slurry Density', type: 'number' },
      { name: 'operatingHours', label: 'Op. Hours', type: 'number' },
      { name: 'remarks', label: 'Remarks', type: 'text' },
    ],
  },

  // ---- TEMPLATE_07: Centrifuge Operation & Cleanup Log ----
  TEMPLATE_07: {
    title: 'Template 07: Centrifuge Operation & Cleanup Log',
    headerFields: [
      { name: 'reportDate', label: 'Date', type: 'text', required: true },
      { name: 'site', label: 'Site', type: 'text', required: true },
    ],
    fields: [],
    tableColumns: [
      { name: 'centrifugeId', label: 'Centrifuge ID', type: 'select', options: [{ value: 'CENT_1', label: 'Centrifuge 1' }, { value: 'CENT_2', label: 'Centrifuge 2' }] },
      { name: 'feedRateM3Hr', label: 'Feed Rate (m\u00B3/Hr)', type: 'number' },
      { name: 'operatingHours', label: 'Op. Hours', type: 'number' },
      { name: 'concentrateWeightG', label: 'Concentrate (g)', type: 'number' },
      { name: 'cleanupOperator', label: 'Cleanup Operator', type: 'text' },
      { name: 'remarks', label: 'Remarks', type: 'text' },
    ],
    summaryFields: [
      { name: 'totalConcentrate', label: 'Total Concentrate (g)', type: 'number', disabled: true },
    ],
    calculateSummary: (rows, setValue) => {
      setValue('totalConcentrate', parseFloat(rows.reduce((s, r) => s + Number(r.concentrateWeightG || 0), 0).toFixed(2)));
    },
  },

  // ---- TEMPLATE_08: Shaking Table Operation Log ----
  TEMPLATE_08: {
    title: 'Template 08: Shaking Table Operation Log',
    headerFields: [
      { name: 'reportDate', label: 'Date', type: 'text', required: true },
      { name: 'site', label: 'Site', type: 'text', required: true },
    ],
    fields: [],
    tableColumns: [
      { name: 'tableId', label: 'Table ID', type: 'select', options: [{ value: 'TABLE_1', label: 'Shaking Table 1' }, { value: 'TABLE_2', label: 'Shaking Table 2' }] },
      { name: 'feedRateM3Hr', label: 'Feed Rate (m\u00B3/Hr)', type: 'number' },
      { name: 'operatingHours', label: 'Op. Hours', type: 'number' },
      { name: 'concentrateWeightG', label: 'Concentrate (g)', type: 'number' },
      { name: 'operator', label: 'Operator', type: 'text' },
      { name: 'remarks', label: 'Remarks', type: 'text' },
    ],
    summaryFields: [
      { name: 'totalConcentrate', label: 'Total Concentrate (g)', type: 'number', disabled: true },
    ],
    calculateSummary: (rows, setValue) => {
      setValue('totalConcentrate', parseFloat(rows.reduce((s, r) => s + Number(r.concentrateWeightG || 0), 0).toFixed(2)));
    },
  },

  // ---- TEMPLATE_09: Gold Recovery & Handover Register ----
  TEMPLATE_09: {
    title: 'Template 09: Gold Recovery & Handover Register',
    headerFields: [
      { name: 'reportDate', label: 'Date', type: 'text', required: true },
      { name: 'site', label: 'Site', type: 'text', required: true },
      { name: 'recoveryOfficer', label: 'Recovery Officer', type: 'text', required: true },
      { name: 'witness', label: 'Witness (Security / Management)', type: 'text', required: true },
    ],
    fields: [],
    tableColumns: [
      { name: 'source', label: 'Source', type: 'text', required: true },
      { name: 'grossWeightG', label: 'Gross (g)', type: 'number', required: true },
      { name: 'tareWeightG', label: 'Tare (g)', type: 'number', required: true },
      { name: 'netWeightG', label: 'Net (g)', type: 'number', disabled: true },
      { name: 'purityPct', label: 'Purity (%)', type: 'number' },
      { name: 'pureGoldG', label: 'Pure Gold (g)', type: 'number', disabled: true },
      { name: 'vaultBoxId', label: 'Vault Box ID', type: 'text' },
    ],
    calculateRow: (row) => {
      const gross = Number(row.grossWeightG || 0);
      const tare = Number(row.tareWeightG || 0);
      const net = gross >= tare ? parseFloat((gross - tare).toFixed(2)) : 0;
      const purity = Number(row.purityPct || 0);
      const pureGold = parseFloat((net * purity / 100).toFixed(2));
      return { ...row, netWeightG: net, pureGoldG: pureGold };
    },
    summaryFields: [
      { name: 'totalNetWeight', label: 'Total Net Weight (g)', type: 'number', disabled: true },
      { name: 'totalPureGold', label: 'Total Pure Gold (g)', type: 'number', disabled: true },
    ],
    calculateSummary: (rows, setValue) => {
      setValue('totalNetWeight', parseFloat(rows.reduce((s, r) => s + Number(r.netWeightG || 0), 0).toFixed(2)));
      setValue('totalPureGold', parseFloat(rows.reduce((s, r) => s + Number(r.pureGoldG || 0), 0).toFixed(2)));
    },
    validate: (values) => {
      if (values.recoveryOfficer && values.witness && values.recoveryOfficer === values.witness) {
        return 'Segregation of Duties: Recovery Officer and Witness must be different individuals.';
      }
      return null;
    },
  },

  // ---- TEMPLATE_10: Maintenance, Greasing & Washing Log ----
  TEMPLATE_10: {
    title: 'Template 10: Maintenance, Greasing & Washing Log',
    headerFields: [
      { name: 'reportDate', label: 'Date', type: 'text', required: true },
      { name: 'site', label: 'Site', type: 'text', required: true },
      { name: 'mechanicName', label: 'Mechanic Name', type: 'text', required: true },
    ],
    fields: [],
    tableColumns: [
      { name: 'machineId', label: 'Machine ID', type: 'select', options: [{ value: 'CAT_1', label: 'CAT 1' }, { value: 'CAT_2', label: 'CAT 2' }, { value: 'SANY_1', label: 'SANY 1' }, { value: 'SANY_2', label: 'SANY 2' }] },
      { name: 'greasingDone', label: 'Greasing', type: 'checkbox' },
      { name: 'filtersChanged', label: 'Filters', type: 'checkbox' },
      { name: 'washingDone', label: 'Washing', type: 'checkbox' },
      { name: 'sparesUsed', label: 'Spares Used', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'text' },
    ],
    summaryFields: [
      { name: 'mechanicRemarks', label: 'Mechanic Remarks', type: 'textarea' },
    ],
  },

  // ---- TEMPLATE_11: Gate, Search & Items Movement Register ----
  TEMPLATE_11: {
    title: 'Template 11: Gate, Search & Items Movement Register',
    headerFields: [
      { name: 'reportDate', label: 'Date', type: 'text', required: true },
      { name: 'site', label: 'Site', type: 'text', required: true },
      { name: 'guardName', label: 'Guard Name', type: 'text', required: true },
    ],
    fields: [],
    tableColumns: [
      { name: 'timeIn', label: 'Time In', type: 'time', required: true },
      { name: 'timeOut', label: 'Time Out', type: 'time' },
      { name: 'visitorName', label: 'Visitor Name', type: 'text', required: true },
      { name: 'company', label: 'Company', type: 'text' },
      { name: 'vehiclePlate', label: 'Vehicle Plate', type: 'text' },
      { name: 'purpose', label: 'Purpose', type: 'text', required: true },
      { name: 'searchDone', label: 'Search', type: 'checkbox', required: true },
      { name: 'itemsInOut', label: 'Items In/Out', type: 'text' },
    ],
  },

  // ---- TEMPLATE_12: Stores, Purchases & Expense Sheet ----
  TEMPLATE_12: {
    title: 'Template 12: Stores, Purchases & Expense Sheet',
    headerFields: [
      { name: 'reportDate', label: 'Date', type: 'text', required: true },
      { name: 'site', label: 'Site', type: 'text', required: true },
      { name: 'purchaserName', label: 'Purchaser Name', type: 'text', required: true },
    ],
    fields: [],
    tableColumns: [
      { name: 'itemName', label: 'Item Name', type: 'text', required: true },
      { name: 'vendor', label: 'Vendor', type: 'text' },
      { name: 'quantity', label: 'Qty', type: 'number', required: true },
      { name: 'unitPrice', label: 'Unit Price (USD)', type: 'number', required: true },
      { name: 'total', label: 'Total (USD)', type: 'number', disabled: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'receiptNo', label: 'Receipt No.', type: 'text' },
    ],
    calculateRow: (row) => {
      const qty = Number(row.quantity || 0);
      const price = Number(row.unitPrice || 0);
      return { ...row, total: parseFloat((qty * price).toFixed(2)) };
    },
    summaryFields: [
      { name: 'grandTotal', label: 'Grand Total (USD)', type: 'number', disabled: true },
    ],
    calculateSummary: (rows, setValue) => {
      setValue('grandTotal', parseFloat(rows.reduce((s, r) => s + Number(r.total || 0), 0).toFixed(2)));
    },
  },

  // ---- TEMPLATE_13: Shift Handover Certificate (flat form) ----
  TEMPLATE_13: {
    title: 'Template 13: Shift Handover Certificate',
    fields: [
      { name: 'outgoingSupervisor', label: 'Outgoing Shift Supervisor', type: 'text', required: true },
      { name: 'incomingSupervisor', label: 'Incoming Shift Supervisor', type: 'text', required: true },
      { name: 'safetyIncidents', label: 'Safety / Security Incidents', type: 'textarea', required: true },
      { name: 'productionStatus', label: 'Production Status & Bench Handover', type: 'textarea', required: true },
      { name: 'equipmentStatus', label: 'Equipment Status', type: 'textarea', required: true },
      { name: 'pendingTasks', label: 'Pending Tasks', type: 'textarea', required: true },
      { name: 'handoverApproved', label: 'Handover Confirmed & Approved', type: 'checkbox', required: true },
    ],
    validate: (values) => {
      if (values.outgoingSupervisor === values.incomingSupervisor) {
        return 'Segregation of Duties: Outgoing and Incoming supervisors must be different individuals.';
      }
      if (values.handoverApproved !== true) {
        return 'Both supervisors must confirm and approve handover checkbox to submit.';
      }
      return null;
    },
  },

  // ---- TEMPLATE_14: HR Payroll & Leave Record (NEW) ----
  TEMPLATE_14: {
    title: 'Template 14: HR Payroll & Leave Record',
    headerFields: [
      { name: 'reportDate', label: 'Date', type: 'text', required: true },
      { name: 'site', label: 'Site', type: 'text', required: true },
      { name: 'period', label: 'Period (Month / Year)', type: 'text', required: true },
      { name: 'hrOfficer', label: 'HR Officer Name', type: 'text', required: true },
    ],
    fields: [],
    tableColumns: [
      { name: 'staffName', label: 'Staff Name', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'text' },
      { name: 'daysPresent', label: 'Days Present', type: 'number' },
      { name: 'daysAbsent', label: 'Days Absent', type: 'number' },
      { name: 'leaveDays', label: 'Leave Days', type: 'number' },
      { name: 'advance', label: 'Advance (USD)', type: 'number' },
      { name: 'salaryDue', label: 'Salary Due (USD)', type: 'number' },
      { name: 'netPay', label: 'Net Pay (USD)', type: 'number', disabled: true },
      { name: 'remarks', label: 'Remarks', type: 'text' },
    ],
    calculateRow: (row) => {
      const salary = Number(row.salaryDue || 0);
      const advance = Number(row.advance || 0);
      return { ...row, netPay: parseFloat((salary - advance).toFixed(2)) };
    },
    summaryFields: [
      { name: 'totalAdvances', label: 'Total Advances (USD)', type: 'number', disabled: true },
      { name: 'totalSalaries', label: 'Total Salaries (USD)', type: 'number', disabled: true },
      { name: 'totalNetPay', label: 'Total Net Pay (USD)', type: 'number', disabled: true },
    ],
    calculateSummary: (rows, setValue) => {
      setValue('totalAdvances', parseFloat(rows.reduce((s, r) => s + Number(r.advance || 0), 0).toFixed(2)));
      setValue('totalSalaries', parseFloat(rows.reduce((s, r) => s + Number(r.salaryDue || 0), 0).toFixed(2)));
      setValue('totalNetPay', parseFloat(rows.reduce((s, r) => s + Number(r.netPay || 0), 0).toFixed(2)));
    },
  },

  // ---- TEMPLATE_15: Petty Cash Daily Report (renumbered from old 14) ----
  TEMPLATE_15: {
    title: 'Template 15: Petty Cash Daily Report',
    headerFields: [
      { name: 'reportDate', label: 'Date', type: 'text', required: true },
      { name: 'site', label: 'Site', type: 'text', required: true },
      { name: 'cashierName', label: 'Cashier Name', type: 'text', required: true },
      { name: 'openingBalance', label: 'Opening Balance (USD)', type: 'number', required: true },
    ],
    fields: [],
    tableColumns: [
      { name: 'description', label: 'Description', type: 'text', required: true },
      { name: 'amount', label: 'Amount (USD)', type: 'number', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'receiptNo', label: 'Receipt No.', type: 'text' },
      { name: 'approvedBy', label: 'Approved By', type: 'text' },
    ],
    summaryFields: [
      { name: 'totalExpenses', label: 'Total Expenses (USD)', type: 'number', disabled: true },
      { name: 'closingBalance', label: 'Expected Closing Balance (USD)', type: 'number', disabled: true },
      { name: 'actualBalance', label: 'Actual Cash Balance (USD)', type: 'number' },
      { name: 'variance', label: 'Variance (USD)', type: 'number', disabled: true },
    ],
    calculateSummary: (rows, setValue) => {
      const totalExp = parseFloat(rows.reduce((s, r) => s + Number(r.amount || 0), 0).toFixed(2));
      setValue('totalExpenses', totalExp);
    },
    calculate: (values, setValue) => {
      const opening = Number(values.openingBalance || 0);
      const totalExp = Number(values.totalExpenses || 0);
      const closing = parseFloat((opening - totalExp).toFixed(2));
      setValue('closingBalance', closing);
      const actual = Number(values.actualBalance || 0);
      setValue('variance', parseFloat((actual - closing).toFixed(2)));
    },
    getVarianceMessage: (values) => {
      const opening = Number(values.openingBalance || 0);
      const totalExp = Number(values.totalExpenses || 0);
      const closing = opening - totalExp;
      const actual = Number(values.actualBalance || 0);
      const variance = actual - closing;
      if (actual && Math.abs(variance) > 0) {
        return `Petty cash variance detected. Discrepancy: ${variance > 0 ? '+' : ''}${variance.toFixed(2)} USD. Please explain the cash drawer variance.`;
      }
      return null;
    },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GenericReportForm({ templateId }: { templateId: string }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { saveDraft, submitReport, loadDraft } = useReport();

  const [signature, setSignature] = useState<string>('');
  const [varianceMessage, setVarianceMessage] = useState<string | null>(null);
  const [tableRows, setTableRows] = useState<Record<string, any>[]>([{}]);

  const spec = formSpecs[templateId];

  const { control, watch, setValue, handleSubmit, formState: { errors } } = useForm<any>({
    defaultValues: loadDraft(templateId) || {},
  });

  const formValues = watch();

  // Load saved rows from draft
  useEffect(() => {
    const draft = loadDraft(templateId);
    if (draft?.rows && Array.isArray(draft.rows)) {
      setTableRows(draft.rows);
    }
  }, [templateId]);

  // Run flat-field calculations and variance checks
  useEffect(() => {
    if (spec?.calculate) {
      spec.calculate(formValues, setValue);
    }
    if (spec?.getVarianceMessage) {
      setVarianceMessage(spec.getVarianceMessage(formValues));
    } else {
      setVarianceMessage(null);
    }
  }, [formValues, setValue, spec]);

  // Run summary calculations when rows change
  useEffect(() => {
    if (spec?.calculateSummary) {
      spec.calculateSummary(tableRows, setValue);
    }
  }, [tableRows, spec, setValue]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft(templateId, { ...formValues, rows: tableRows });
    }, 30000);
    return () => clearInterval(interval);
  }, [formValues, tableRows, templateId, saveDraft]);

  if (!spec) {
    return (
      <div className="border border-black p-8 text-center text-zinc-500 font-serif italic">
        {t('reports_form.specNotDefined', { templateId })}
      </div>
    );
  }

  const isTableForm = !!spec.tableColumns;

  const handleRowsChange = (rows: Record<string, any>[]) => {
    setTableRows(rows);
  };

  const onSubmit = async (data: any) => {
    if (!signature) {
      alert(t('reports_form.signatureRequired'));
      return;
    }

    if (spec.validate) {
      const errorMsg = spec.validate(data);
      if (errorMsg) {
        alert(errorMsg);
        return;
      }
    }

    try {
      await submitReport(templateId, {
        ...data,
        ...(isTableForm ? { rows: tableRows } : {}),
        signature,
      });
      alert(`${spec.title} ${t('reports_form.submittedSuccess')}`);
      setSignature('');
    } catch (err: any) {
      alert(err.message || t('reports_form.submissionFailed'));
    }
  };

  // Render a single field
  const renderField = (f: FieldSpec) => (
    <div key={f.name}>
      <label className="minimal-label">{f.label}</label>
      <Controller
        name={f.name}
        control={control}
        rules={{ required: f.required ? `${f.label} is required` : false }}
        render={({ field }) => {
          if (f.type === 'select') {
            return (
              <select {...field} className="minimal-select">
                <option value="">{t('reports_form.select')}</option>
                {f.options?.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            );
          }
          if (f.type === 'textarea') {
            return <textarea {...field} rows={3} className="minimal-input w-full" placeholder={t('reports_form.enterDetails')} />;
          }
          if (f.type === 'checkbox') {
            return (
              <input
                type="checkbox"
                checked={!!field.value}
                onChange={e => field.onChange(e.target.checked)}
                className="mt-2 h-4 w-4 border-black text-black focus:ring-black accent-black cursor-pointer"
              />
            );
          }
          return (
            <input
              type={f.type}
              {...field}
              className="minimal-input"
              disabled={f.disabled}
              placeholder={f.disabled ? '(auto)' : t('reports_form.enterValue')}
            />
          );
        }}
      />
      {errors[f.name] && (
        <span className="text-xs text-red-600 mt-1 block">{(errors[f.name] as any).message}</span>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl py-4">
      {varianceMessage && <VarianceAlert type="warning" message={varianceMessage} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* --- Table-based layout --- */}
        {isTableForm ? (
          <>
            {/* Header fields */}
            {spec.headerFields && spec.headerFields.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {spec.headerFields.map(renderField)}
              </div>
            )}

            {/* Multi-row table */}
            <MultiRowTable
              columns={spec.tableColumns!}
              rows={tableRows}
              onRowsChange={handleRowsChange}
              onCalculateRow={spec.calculateRow}
              minRows={1}
              showRowNumbers={true}
            />

            {/* Summary fields */}
            {spec.summaryFields && spec.summaryFields.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 bg-zinc-50 p-4 border border-zinc-200">
                {spec.summaryFields.map(renderField)}
              </div>
            )}
          </>
        ) : (
          /* --- Flat field layout (backward compat) --- */
          <>
            {spec.fields.map(renderField)}

            {/* Calculated fields display (backward compat for flat forms) */}
            {formValues.hoursWorked !== undefined && (
              <div className="bg-zinc-50 p-4 border border-zinc-200">
                <label className="minimal-label">Calculated Hours Worked (Auto)</label>
                <input type="text" value={formValues.hoursWorked} disabled className="minimal-input font-semibold" />
              </div>
            )}
          </>
        )}

        {/* Digital Signature */}
        <div className="border-t border-black pt-6">
          <label className="minimal-label mb-2">{t('reports_form.digitalSignature')}</label>
          <DigitalSignature onSign={setSignature} />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6">
          <button type="submit" className="minimal-btn">
            {t('reports_form.submitReport')}
          </button>
          <button
            type="button"
            onClick={() => {
              saveDraft(templateId, { ...formValues, rows: tableRows });
              alert(t('reports_form.draftSaved'));
            }}
            className="minimal-btn-secondary"
          >
            {t('reports_form.saveDraft')}
          </button>
        </div>
      </form>
    </div>
  );
}
