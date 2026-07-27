import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useReport } from '../../hooks/useReport';
import { useLanguage } from '../../contexts/LanguageContext';
import SignatureOrOtp from '../../components/SignatureOrOtp';
import MultiSignatureFooter, { SignatorySlot } from '../../components/MultiSignatureFooter';
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
  secondaryTableTitle?: string;
  secondaryTableColumns?: ColumnDef[];
  secondarySummaryFields?: FieldSpec[];
  secondaryCalculateRow?: (row: Record<string, any>, index: number) => Record<string, any>;
  secondaryCalculateSummary?: (rows: Record<string, any>[], setValue: any) => void;
  footerSignatories?: SignatorySlot[];
}

// ---------------------------------------------------------------------------
// Footer configs per template
// ---------------------------------------------------------------------------

const templateFooters: Record<string, SignatorySlot[]> = {
  TEMPLATE_02: [
    { role: 'hrManager', label: 'HR Manager', required: true },
    { role: 'siteController', label: 'Site Controller', required: true },
  ],
  TEMPLATE_03: [
    { role: 'maintenanceManager', label: 'Maintenance Manager', required: true },
    { role: 'siteController', label: 'Site Controller', required: true },
  ],
  TEMPLATE_05: [
    { role: 'leadGeologist', label: 'Lead Geologist', required: true },
    { role: 'siteController', label: 'Site Controller', required: true },
  ],
  TEMPLATE_06: [
    { role: 'pumpSupervisor', label: 'Pump Supervisor', required: true },
    { role: 'siteController', label: 'Site Controller', required: true },
  ],
  TEMPLATE_07: [
    { role: 'labManager', label: 'Lab Manager', required: true },
    { role: 'siteController', label: 'Site Controller', required: true },
  ],
  TEMPLATE_08: [
    { role: 'labManager', label: 'Lab Manager', required: true },
    { role: 'siteController', label: 'Site Controller', required: true },
  ],
  TEMPLATE_09: [
    { role: 'labManager', label: 'Lab Manager', required: true },
    { role: 'siteController', label: 'Site Controller', required: true },
  ],
  TEMPLATE_10: [
    { role: 'maintenanceManager', label: 'Maintenance Manager', required: true },
    { role: 'siteController', label: 'Site Controller', required: true },
  ],
  TEMPLATE_11: [
    { role: 'gateSecurity', label: 'Gate Security', required: true },
    { role: 'siteController', label: 'Site Controller', required: true },
  ],
  TEMPLATE_12: [
    { role: 'financeManager', label: 'Finance Manager', required: true },
    { role: 'siteController', label: 'Site Controller', required: true },
  ],
  TEMPLATE_13: [
    { role: 'outgoingShiftLead', label: 'Outgoing Shift Lead', required: true },
    { role: 'incomingShiftLead', label: 'Incoming Shift Lead', required: true },
    { role: 'siteController', label: 'Site Controller', required: true },
  ],
  TEMPLATE_14: [
    { role: 'hrManager', label: 'HR Manager', required: true },
    { role: 'siteController', label: 'Site Controller', required: true },
  ],
  TEMPLATE_15: [
    { role: 'financeManager', label: 'Finance Manager', required: true },
    { role: 'siteController', label: 'Site Controller', required: true },
  ],
  TEMPLATE_16: [
    { role: 'financeManager', label: 'Finance Manager', required: true },
    { role: 'siteController', label: 'Site Controller', required: true },
  ],
};

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
      { name: 'timeIn', label: 'Time In', type: 'time' },
      { name: 'timeOut', label: 'Time Out', type: 'time' },
      { name: 'leaveType', label: 'Leave Type', type: 'select', options: [{ value: 'NORMAL', label: 'Normal' }, { value: 'SICK', label: 'Sick' }, { value: 'COMPASSIONATE', label: 'Compassionate' }] },
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
      { name: 'machineId', label: 'Machine ID', type: 'text' },
      { name: 'shift', label: 'Row Shift', type: 'select', options: [{ value: 'SHIFT_1', label: 'Shift 1' }, { value: 'SHIFT_2', label: 'Shift 2' }, { value: 'SHIFT_3', label: 'Shift 3' }] },
      { name: 'brand', label: 'Brand', type: 'text', disabled: true },
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
      const machineId = String(row.machineId || '').toUpperCase();
      let brand = '';
      if (machineId.includes('CAT')) brand = 'Caterpillar';
      else if (machineId.includes('SANY')) brand = 'Sany';
      return { ...row, hoursWorked: closing >= opening ? parseFloat((closing - opening).toFixed(1)) : 0, brand };
    },
  },

  // ---- TEMPLATE_05: Mining & Geology Daily Sheet ----
  TEMPLATE_05: {
    title: 'Template 05: Mining & Geology Daily Sheet',
    headerFields: [
      { name: 'reportDate', label: 'Date', type: 'text', required: true },
      { name: 'site', label: 'Site', type: 'text', required: true },
      { name: 'shift', label: 'Shift', type: 'select', required: true, options: [{ value: 'DAY', label: 'Day Shift' }, { value: 'NIGHT', label: 'Night Shift' }] },
      { name: 'geologist', label: 'Geologist Name', type: 'text', required: true },
    ],
    fields: [],
    tableColumns: [
      { name: 'pitArea', label: 'Pit / Area', type: 'text', required: true },
      { name: 'sampleRef', label: 'Sample Ref', type: 'text' },
      { name: 'gravelThickness', label: 'Gravel Thickness (m)', type: 'number' },
      { name: 'overburden', label: 'Overburden (m)', type: 'number' },
      { name: 'visualGradeRemarks', label: 'Visual Grade / Remarks', type: 'text' },
      { name: 'decision', label: 'Decision', type: 'select', options: [{ value: 'MINE', label: 'Mine' }, { value: 'STOP', label: 'Stop' }, { value: 'TEST', label: 'Test' }] },
      { name: 'machineAssigned', label: 'Machine Assigned', type: 'text' },
      { name: 'geologistInitials', label: 'Geologist Initials', type: 'text' },
    ],
    secondaryTableTitle: 'Tomorrow Mining Direction',
    secondaryTableColumns: [
      { name: 'direction', label: 'Direction', type: 'text', required: true },
      { name: 'reason', label: 'Reason', type: 'text', required: true },
      { name: 'riskCaution', label: 'Risk / Caution', type: 'text' },
      { name: 'approvedBy', label: 'Approved By', type: 'text' },
    ],
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
      { name: 'timeBlock', label: 'Time Block', type: 'text' },
      { name: 'drumRunning', label: 'Drum Running?', type: 'checkbox' },
      { name: 'pumpRunning', label: 'Pump Running?', type: 'checkbox' },
      { name: 'feedCondition', label: 'Feed Condition', type: 'text' },
      { name: 'waterPressureFlow', label: 'Water Pressure/Flow', type: 'text' },
      { name: 'assistantOnDuty', label: 'Assistant on Duty', type: 'text' },
      { name: 'downtimeReason', label: 'Downtime Reason', type: 'text' },
      { name: 'actionTaken', label: 'Action Taken', type: 'text' },
    ],
    secondaryTableTitle: 'Team Duties',
    secondaryTableColumns: [
      { name: 'teamMember', label: 'Team Member', type: 'text', required: true },
      { name: 'assignedDuty', label: 'Assigned Duty', type: 'text', required: true },
      { name: 'confirmedDone', label: 'Confirmed Done?', type: 'checkbox' },
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
      { name: 'startTime', label: 'Start Time', type: 'time' },
      { name: 'stopTime', label: 'Stop Time', type: 'time' },
      { name: 'feedSource', label: 'Feed Source', type: 'text' },
      { name: 'feedRateM3Hr', label: 'Feed Rate (m\u00B3/Hr)', type: 'number' },
      { name: 'operatingHours', label: 'Op. Hours', type: 'number' },
      { name: 'waterPressure', label: 'Water Pressure', type: 'number' },
      { name: 'bowlSpeedOk', label: 'Bowl/Speed OK?', type: 'checkbox' },
      { name: 'concentrateWeightG', label: 'Concentrate (g)', type: 'number' },
      { name: 'cleanupTime', label: 'Cleanup Time', type: 'time' },
      { name: 'cleanupOperator', label: 'Cleanup Operator', type: 'text' },
      { name: 'verifier', label: 'Verifier', type: 'text' },
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
      { name: 'batchNo', label: 'Batch No.', type: 'text' },
      { name: 'concentrateReceived', label: 'Concentrate Received (g)', type: 'number' },
      { name: 'startTime', label: 'Start Time', type: 'time' },
      { name: 'endTime', label: 'End Time', type: 'time' },
      { name: 'feedRateM3Hr', label: 'Feed Rate (m\u00B3/Hr)', type: 'number' },
      { name: 'operatingHours', label: 'Op. Hours', type: 'number' },
      { name: 'tableSettings', label: 'Table Settings / Water', type: 'text' },
      { name: 'concentrateWeightG', label: 'Concentrate Output (g)', type: 'number' },
      { name: 'tailingsKept', label: 'Tailings Kept?', type: 'checkbox' },
      { name: 'operator', label: 'Operator', type: 'text' },
      { name: 'verifier', label: 'Verifier', type: 'text' },
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
      { name: 'time', label: 'Time', type: 'time' },
      { name: 'source', label: 'Source', type: 'text', required: true },
      { name: 'wetConc', label: 'Wet Conc. (g)', type: 'number' },
      { name: 'dryConc', label: 'Dry Conc. (g)', type: 'number' },
      { name: 'grossWeightG', label: 'Gross (g)', type: 'number', required: true },
      { name: 'tareWeightG', label: 'Tare (g)', type: 'number', required: true },
      { name: 'netWeightG', label: 'Net (g)', type: 'number', disabled: true },
      { name: 'purityPct', label: 'Purity (%)', type: 'number' },
      { name: 'pureGoldG', label: 'Pure Gold (g)', type: 'number', disabled: true },
      { name: 'vaultBoxId', label: 'Bag/Seal No.', type: 'text' },
      { name: 'receivedFrom', label: 'Received From', type: 'text' },
      { name: 'receivedBy', label: 'Received By', type: 'text' },
      { name: 'handoverTo', label: 'Handover To', type: 'text' },
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
      { name: 'machine', label: 'Machine / Equipment', type: 'text', required: true },
      { name: 'reportedFault', label: 'Reported Fault', type: 'text' },
      { name: 'personResponsible', label: 'Person Responsible', type: 'text' },
      { name: 'startTime', label: 'Start Time', type: 'time' },
      { name: 'endTime', label: 'End Time', type: 'time' },
      { name: 'partsUsed', label: 'Parts Used', type: 'text' },
      { name: 'machineStatus', label: 'Machine Status', type: 'select', options: [{ value: 'RUNNING', label: 'Running' }, { value: 'DOWN', label: 'Down' }, { value: 'NEEDS_PARTS', label: 'Needs Parts' }] },
      { name: 'nextAction', label: 'Next Action', type: 'text' },
    ],
    summaryFields: [
      { name: 'mechanicRemarks', label: 'Mechanic Remarks', type: 'textarea' },
    ],
    secondaryTableTitle: 'Preventive Maintenance Checklist',
    secondaryTableColumns: [
      { name: 'task', label: 'Preventive Task', type: 'text', required: true },
      { name: 'cat1', label: 'CAT 1', type: 'checkbox' },
      { name: 'cat2', label: 'CAT 2', type: 'checkbox' },
      { name: 'sany1', label: 'SANY 1', type: 'checkbox' },
      { name: 'sany2', label: 'SANY 2', type: 'checkbox' },
      { name: 'remarks', label: 'Remarks', type: 'text' },
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
      { name: 'direction', label: 'Direction', type: 'select', options: [{ value: 'IN', label: 'In' }, { value: 'OUT', label: 'Out' }] },
      { name: 'searchDone', label: 'Search', type: 'checkbox', required: true },
      { name: 'itemsIn', label: 'Items In', type: 'text' },
      { name: 'itemsOut', label: 'Items Out', type: 'text' },
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
      { name: 'itemDescription', label: 'Item Description', type: 'text', required: true },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'supplier', label: 'Supplier / Vendor', type: 'text' },
      { name: 'qty', label: 'Qty', type: 'number', required: true },
      { name: 'unit', label: 'Unit', type: 'text' },
      { name: 'unitPrice', label: 'Unit Price (USD)', type: 'number', required: true },
      { name: 'totalAmount', label: 'Total (USD)', type: 'number', disabled: true },
      { name: 'paymentMode', label: 'Payment Mode', type: 'text' },
      { name: 'receiptNo', label: 'Receipt No.', type: 'text' },
      { name: 'requestedBy', label: 'Requested By', type: 'text' },
      { name: 'approvedBy', label: 'Approved By', type: 'text' },
    ],
    calculateRow: (row) => {
      const qty = Number(row.qty || 0);
      const price = Number(row.unitPrice || 0);
      return { ...row, totalAmount: parseFloat((qty * price).toFixed(2)) };
    },
    summaryFields: [
      { name: 'purchasesTotal', label: 'Purchases Total (USD)', type: 'number', disabled: true },
      { name: 'cashOpening', label: 'Cash Opening (USD)', type: 'number' },
      { name: 'cashReceived', label: 'Cash Received (USD)', type: 'number' },
      { name: 'cashTotalAvailable', label: 'Total Available (USD)', type: 'number', disabled: true },
      { name: 'cashTotalSpent', label: 'Total Spent (USD)', type: 'number', disabled: true },
      { name: 'cashClosing', label: 'Cash Closing (USD)', type: 'number' },
      { name: 'cashVariance', label: 'Variance (USD)', type: 'number', disabled: true },
      { name: 'cashExplanation', label: 'Variance Explanation', type: 'textarea' },
    ],
    calculateSummary: (rows, setValue) => {
      setValue('purchasesTotal', parseFloat(rows.reduce((s, r) => s + Number(r.totalAmount || 0), 0).toFixed(2)));
    },
    calculate: (values, setValue) => {
      const cashOpening = Number(values.cashOpening || 0);
      const cashReceived = Number(values.cashReceived || 0);
      const available = parseFloat((cashOpening + cashReceived).toFixed(2));
      setValue('cashTotalAvailable', available);
      const purchasesTotal = Number(values.purchasesTotal || 0);
      const expensesTotal = Number(values.expensesTotal || 0);
      const totalSpent = parseFloat((purchasesTotal + expensesTotal).toFixed(2));
      setValue('cashTotalSpent', totalSpent);
      const cashClosing = Number(values.cashClosing || 0);
      const variance = parseFloat((cashClosing - (available - totalSpent)).toFixed(2));
      setValue('cashVariance', variance);
    },
    secondaryTableTitle: 'Expenses',
    secondaryTableColumns: [
      { name: 'description', label: 'Description', type: 'text', required: true },
      { name: 'amount', label: 'Amount (USD)', type: 'number', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'paymentMode', label: 'Payment Mode', type: 'text' },
      { name: 'receiptNo', label: 'Receipt No.', type: 'text' },
      { name: 'approvedBy', label: 'Approved By', type: 'text' },
    ],
    secondarySummaryFields: [
      { name: 'expensesTotal', label: 'Expenses Total (USD)', type: 'number', disabled: true },
      { name: 'combinedTotal', label: 'Combined Total (USD)', type: 'number', disabled: true },
    ],
    secondaryCalculateSummary: (rows, setValue) => {
      const expTotal = parseFloat(rows.reduce((s, r) => s + Number(r.amount || 0), 0).toFixed(2));
      setValue('expensesTotal', expTotal);
    },
  },

  // ---- TEMPLATE_13: Shift Handover Certificate ----
  TEMPLATE_13: {
    title: 'Template 13: Shift Handover Certificate',
    headerFields: [
      { name: 'outgoingSupervisor', label: 'Outgoing Shift Supervisor', type: 'text', required: true },
      { name: 'incomingSupervisor', label: 'Incoming Shift Supervisor', type: 'text', required: true },
    ],
    fields: [],
    tableColumns: [
      { name: 'handoverItem', label: 'Handover Item', type: 'text', disabled: true },
      { name: 'statusEndOfShift', label: 'Status at End of Shift', type: 'text', required: true },
      { name: 'issueRisk', label: 'Issue / Risk', type: 'text' },
      { name: 'actionRequired', label: 'Action Required', type: 'text' },
    ],
    summaryFields: [
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

  // ---- TEMPLATE_14: HR Payroll & Leave Record ----
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

  // ---- TEMPLATE_15: Petty Cash Daily Report ----
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

  // ---- TEMPLATE_16: Purchase Requisition ----
  TEMPLATE_16: {
    title: 'Template 16: Purchase Requisition',
    headerFields: [
      { name: 'reportDate', label: 'Date', type: 'text', required: true },
      { name: 'site', label: 'Site', type: 'text', required: true },
      { name: 'requisitionNo', label: 'Requisition Number', type: 'text', required: true },
      { name: 'requestedBy', label: 'Requested By', type: 'text', required: true },
      { name: 'department', label: 'Department', type: 'text', required: true },
    ],
    fields: [],
    tableColumns: [
      { name: 'itemDescription', label: 'Item Description', type: 'text', required: true },
      { name: 'specifications', label: 'Specifications / Details', type: 'text' },
      { name: 'qty', label: 'Qty', type: 'number', required: true },
      { name: 'unit', label: 'Unit', type: 'text' },
      { name: 'estimatedUnitPrice', label: 'Est. Unit Price (USD)', type: 'number', required: true },
      { name: 'estimatedTotal', label: 'Est. Total (USD)', type: 'number', disabled: true },
      { name: 'preferredSupplier', label: 'Preferred Supplier', type: 'text' },
      { name: 'urgency', label: 'Urgency', type: 'select', options: [{ value: 'NORMAL', label: 'Normal' }, { value: 'URGENT', label: 'Urgent' }, { value: 'CRITICAL', label: 'Critical' }] },
      { name: 'justification', label: 'Justification / Purpose', type: 'text' },
    ],
    calculateRow: (row) => {
      const qty = Number(row.qty || 0);
      const price = Number(row.estimatedUnitPrice || 0);
      return { ...row, estimatedTotal: parseFloat((qty * price).toFixed(2)) };
    },
    summaryFields: [
      { name: 'grandTotal', label: 'Grand Total (USD)', type: 'number', disabled: true },
      { name: 'budgetCode', label: 'Budget Code / Account', type: 'text' },
      { name: 'approvalNotes', label: 'Approval Notes', type: 'textarea' },
    ],
    calculateSummary: (rows, setValue) => {
      setValue('grandTotal', parseFloat(rows.reduce((s, r) => s + Number(r.estimatedTotal || 0), 0).toFixed(2)));
    },
  },
};

// Pre-populate handover items for TEMPLATE_13
const HANDOVER_ITEMS = [
  'Machines condition',
  'Fuel balance',
  'Plant / drum / pump',
  'Centrifuge',
  'Shaking table',
  'Gold / concentrate',
  'Staff issues',
  'Security / gate',
  'Pending repairs',
  'Urgent supplies',
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GenericReportForm({ templateId }: { templateId: string }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { saveDraft, submitReport, loadDraft } = useReport();

  const [signature, setSignature] = useState<string>('');
  const [multiSignatures, setMultiSignatures] = useState<Record<string, string>>({});
  const [varianceMessage, setVarianceMessage] = useState<string | null>(null);
  const [tableRows, setTableRows] = useState<Record<string, any>[]>([{}]);
  const [secondaryTableRows, setSecondaryTableRows] = useState<Record<string, any>[]>([{}]);

  const spec = formSpecs[templateId];
  const footerConfig = templateFooters[templateId];

  const { control, watch, setValue, handleSubmit, formState: { errors } } = useForm<any>({
    defaultValues: loadDraft(templateId) || {},
  });

  const formValues = watch();

  // Pre-populate handover items for TEMPLATE_13
  useEffect(() => {
    if (templateId === 'TEMPLATE_13') {
      const draft = loadDraft(templateId);
      if (draft?.rows && Array.isArray(draft.rows) && draft.rows.length > 0) {
        setTableRows(draft.rows);
      } else {
        setTableRows(HANDOVER_ITEMS.map(item => ({ handoverItem: item, statusEndOfShift: '', issueRisk: '', actionRequired: '' })));
      }
    }
  }, [templateId]);

  // Load saved rows from draft
  useEffect(() => {
    if (templateId === 'TEMPLATE_13') return; // handled above
    const draft = loadDraft(templateId);
    if (draft?.rows && Array.isArray(draft.rows)) {
      setTableRows(draft.rows);
    }
    if (draft?.secondaryRows && Array.isArray(draft.secondaryRows)) {
      setSecondaryTableRows(draft.secondaryRows);
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

  // Run secondary summary calculations when secondary rows change
  useEffect(() => {
    if (spec?.secondaryCalculateSummary) {
      spec.secondaryCalculateSummary(secondaryTableRows, setValue);
    }
    // Calculate combinedTotal if both primary and secondary totals exist
    if (spec?.secondaryTableColumns) {
      const purchasesTotal = Number(formValues.purchasesTotal || formValues.grandTotal || 0);
      const expensesTotal = Number(formValues.expensesTotal || 0);
      if (purchasesTotal || expensesTotal) {
        setValue('combinedTotal', parseFloat((purchasesTotal + expensesTotal).toFixed(2)));
      }
    }
  }, [secondaryTableRows, spec, setValue, formValues.purchasesTotal, formValues.grandTotal, formValues.expensesTotal]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft(templateId, { ...formValues, rows: tableRows, secondaryRows: secondaryTableRows });
    }, 30000);
    return () => clearInterval(interval);
  }, [formValues, tableRows, secondaryTableRows, templateId, saveDraft]);

  if (!spec) {
    return (
      <div className="border border-black p-8 text-center text-zinc-500 font-serif italic">
        {t('reports_form.specNotDefined', { templateId })}
      </div>
    );
  }

  const isTableForm = !!spec.tableColumns;
  const hasMultiSignature = !!footerConfig;

  const handleRowsChange = (rows: Record<string, any>[]) => {
    setTableRows(rows);
  };

  const handleSecondaryRowsChange = (rows: Record<string, any>[]) => {
    setSecondaryTableRows(rows);
  };

  const onSubmit = async (data: any) => {
    if (hasMultiSignature) {
      const requiredMissing = footerConfig.filter(s => s.required && !multiSignatures[s.role]);
      if (requiredMissing.length > 0) {
        alert(`Missing required signatures: ${requiredMissing.map(s => s.label).join(', ')}`);
        return;
      }
    } else if (!signature) {
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
        ...(spec.secondaryTableColumns ? { secondaryRows: secondaryTableRows } : {}),
        ...(hasMultiSignature ? { signatures: multiSignatures } : { signature }),
      });
      alert(`${spec.title} ${t('reports_form.submittedSuccess')}`);
      setSignature('');
      setMultiSignatures({});
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

            {/* Secondary table */}
            {spec.secondaryTableColumns && (
              <>
                <h3 className="text-sm uppercase tracking-widest font-semibold text-zinc-600 mt-10 mb-4 border-b border-zinc-300 pb-2">
                  {spec.secondaryTableTitle || 'Additional Records'}
                </h3>
                <MultiRowTable
                  columns={spec.secondaryTableColumns}
                  rows={secondaryTableRows}
                  onRowsChange={handleSecondaryRowsChange}
                  onCalculateRow={spec.secondaryCalculateRow}
                  minRows={1}
                  showRowNumbers={true}
                />
                {spec.secondarySummaryFields && spec.secondarySummaryFields.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 bg-zinc-50 p-4 border border-zinc-200">
                    {spec.secondarySummaryFields.map(renderField)}
                  </div>
                )}
              </>
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

        {/* Digital Signature / Multi-Signature Footer */}
        {hasMultiSignature ? (
          <MultiSignatureFooter
            signatories={footerConfig}
            onSignaturesChange={setMultiSignatures}
          />
        ) : (
          <div className="border-t border-black pt-6">
            <label className="minimal-label mb-2">{t('reports_form.digitalSignature')}</label>
            <SignatureOrOtp onVerified={setSignature} />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-6">
          <button type="submit" className="minimal-btn">
            {t('reports_form.submitReport')}
          </button>
          <button
            type="button"
            onClick={() => {
              saveDraft(templateId, { ...formValues, rows: tableRows, secondaryRows: secondaryTableRows });
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
