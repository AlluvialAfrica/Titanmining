export interface BaseReportData {
  submittedBy: string;
  submittedAt: string;
  signature: string;
  remarks?: string;
}

export interface SiteDailySummaryData extends BaseReportData {
  materialMinedM3: number;
  materialProcessedM3: number;
  pitAreaWorked: string;
  centrifugeRecoveryG: number;
  shakingTableRecoveryG: number;
  sluiceCleanupG: number;
  totalGoldRecoveryG: number;
  fuelOpeningStockL: number;
  fuelReceivedL: number;
  fuelIssuedL: number;
  fuelClosingStockL: number;
  fuelVarianceL: number;
  // Machines section
  machineWorkingHours?: number;
  machineDowntime?: number;
  machinesDown?: number;
  downtimeReason?: string;
  // Staff section
  totalPresent?: number;
  totalAbsent?: number;
  visitors?: number;
  casualsUsed?: number;
  // Security/Gate section
  securityItemsInOut?: string;
  searchesDone?: number;
  securityIncidents?: string;
  vehicleMovements?: number;
  // Expenses section
  cashUsed?: number;
  purchasesTotal?: number;
  pendingRequirements?: string;
  // Tomorrow Plan section
  pitToMine?: string;
  plantTarget?: string;
  repairPriority?: string;
  suppliesNeeded?: string;
  // Multi-signature
  signatures?: Record<string, string>;
}

export interface AttendanceRecord {
  staffName: string;
  role: string;
  status: "PRESENT" | "ABSENT" | "LEAVE";
  timeIn?: string;
  timeOut?: string;
  leaveType?: "NORMAL" | "SICK" | "COMPASSIONATE";
  remarks?: string;
}

export interface StaffAttendanceData extends BaseReportData {
  reportDate: string;
  shift: "DAY" | "NIGHT";
  supervisor: string;
  records: AttendanceRecord[];
  totalPresent: number;
  totalAbsent: number;
  totalLeave: number;
}

export interface MachineLogRow {
  machineId: string;
  operator: string;
  shift?: string;
  brand?: string;
  openingHours: number;
  closingHours: number;
  hoursWorked: number;
  workArea: string;
  breakdowns?: string;
  breakdownStatus?: 'REGISTERED' | 'REPAIR_UNDERWAY' | 'REPAIRED' | 'WRITTEN_OFF';
}

export interface MachineDailyLogData extends BaseReportData {
  shift: string;
  rows: MachineLogRow[];
}

export interface FuelReconciliationData extends BaseReportData {
  machineId: string;
  openingMeter: number;
  closingMeter: number;
  hoursWorked: number;
  fuelIssued: number;
  expectedLPerHr: number;
  actualLPerHr: number;
  issuedBy: string;
  receivedBy: string;
  openingStock: number;
  received: number;
  totalAvailable: number;
  totalIssued: number;
  closingStock: number;
  variance: number;
  varianceReason?: string;
}

export interface GeologyRow {
  pitBlock: string;
  benchLevel: number;
  materialType: string;
  volumeMinedM3: number;
  estGradeGPerTon: number;
  excavatorId: string;
  sampleRef?: string;
  gravelThickness?: number;
  overburden?: number;
  decision?: "MINE" | "STOP" | "TEST";
  remarks?: string;
}

export interface TomorrowMiningDirection {
  direction: string;
  reason: string;
  riskCaution: string;
  approvedBy: string;
}

export interface MiningGeologyData extends BaseReportData {
  geologist: string;
  rows: GeologyRow[];
  totalVolume: number;
  avgGrade: number;
  tomorrowDirections?: TomorrowMiningDirection[];
}

export interface DrumPumpRow {
  timeBlock: string;
  drumRunning: boolean;
  pumpRunning: boolean;
  feedCondition: string;
  waterPressureFlow: string;
  assistantOnDuty: string;
  downtimeReason: string;
  actionTaken: string;
}

export interface DrumPumpDutyRow {
  teamMember: string;
  assignedDuty: string;
  confirmedDone: boolean;
}

export interface DrumSandPumpData extends BaseReportData {
  shift: string;
  rows: DrumPumpRow[];
  dutyRows?: DrumPumpDutyRow[];
}

export interface CentrifugeRow {
  centrifugeId: string;
  startTime?: string;
  stopTime?: string;
  feedSource?: string;
  feedRateM3Hr: number;
  operatingHours: number;
  waterPressure?: number;
  bowlSpeedOk?: boolean;
  concentrateWeightG: number;
  cleanupTime?: string;
  cleanupOperator: string;
  verifier?: string;
  remarks?: string;
}

export interface CentrifugeCleanupData extends BaseReportData {
  rows: CentrifugeRow[];
  totalConcentrate: number;
}

export interface ShakingTableRow {
  tableId: string;
  batchNo?: string;
  concentrateReceived?: number;
  startTime?: string;
  endTime?: string;
  feedRateM3Hr: number;
  operatingHours: number;
  tableSettings?: string;
  concentrateWeightG: number;
  tailingsKept?: boolean;
  operator: string;
  verifier?: string;
  remarks?: string;
}

export interface ShakingTableData extends BaseReportData {
  rows: ShakingTableRow[];
  totalConcentrate: number;
}

export interface GoldRecoveryRow {
  time?: string;
  source: string;
  wetConc?: number;
  dryConc?: number;
  grossWeightG: number;
  tareWeightG: number;
  netWeightG: number;
  purityPct: number;
  pureGoldG: number;
  vaultBoxId: string;
  receivedFrom?: string;
  receivedBy?: string;
  handoverTo?: string;
}

export interface GoldRecoveryHandoverData extends BaseReportData {
  recoveryOfficer: string;
  witness: string;
  rows: GoldRecoveryRow[];
  totalNetWeight: number;
  totalPureGold: number;
  signatures: {
    submitter: string;
    receiver: string;
    verifier?: string;
  };
}

export interface MaintenanceRow {
  machine: string;
  reportedFault: string;
  personResponsible: string;
  startTime?: string;
  endTime?: string;
  partsUsed: string;
  machineStatus: "RUNNING" | "DOWN" | "NEEDS_PARTS" | "WRITTEN_OFF";
  nextAction: string;
}

export interface PreventiveMaintenanceRow {
  task: string;
  cat1?: boolean;
  cat2?: boolean;
  sany1?: boolean;
  sany2?: boolean;
  remarks?: string;
}

export interface MaintenanceGreasingData extends BaseReportData {
  mechanicName: string;
  rows: MaintenanceRow[];
  preventiveRows?: PreventiveMaintenanceRow[];
}

export interface GateMovementRecord {
  timeIn: string;
  timeOut: string;
  visitorName: string;
  company: string;
  vehiclePlate?: string;
  purpose: string;
  direction: "IN" | "OUT";
  searchDone: boolean;
  itemsIn: string;
  itemsOut: string;
}

export interface GateRegisterData extends BaseReportData {
  guardName: string;
  records: GateMovementRecord[];
}

export interface ExpenseRecord {
  itemName: string;
  vendor: string;
  department: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
  receiptNo: string;
}

export interface StoresExpensesData extends BaseReportData {
  purchaserName: string;
  records: ExpenseRecord[];
  grandTotal: number;
  // Cash reconciliation
  cashOpening?: number;
  cashReceived?: number;
  cashTotalAvailable?: number;
  cashTotalSpent?: number;
  cashClosing?: number;
  cashVariance?: number;
  cashExplanation?: string;
}

export interface HandoverItem {
  handoverItem: string;
  statusEndOfShift: string;
  issueRisk: string;
  actionRequired: string;
}

export interface ShiftHandoverData extends BaseReportData {
  outgoingSupervisor: string;
  incomingSupervisor: string;
  handoverItems: HandoverItem[];
  handoverApproved: boolean;
}

// TEMPLATE_14: HR Payroll & Leave Record (NEW)
export interface HRPayrollRow {
  staffName: string;
  role: string;
  daysPresent: number;
  daysAbsent: number;
  leaveDays: number;
  advance: number;
  salaryDue: number;
  netPay: number;
  remarks?: string;
}

export interface HRPayrollData extends BaseReportData {
  period: string;
  hrOfficer: string;
  rows: HRPayrollRow[];
  totalAdvances: number;
  totalSalaries: number;
  totalNetPay: number;
}

// TEMPLATE_15: Petty Cash Daily Report (renumbered from old TEMPLATE_14)
export interface PettyCashRow {
  description: string;
  amount: number;
  category: string;
  receiptNo: string;
  approvedBy: string;
}

export interface PettyCashData extends BaseReportData {
  cashierName: string;
  openingBalance: number;
  rows: PettyCashRow[];
  totalExpenses: number;
  closingBalance: number;
  actualBalance: number;
  variance: number;
}

// TEMPLATE_17: Mercury Based Recovery Log
export interface MercuryRecoveryRow {
  time?: string;
  numberOfBasins: number;
  pureGoldGms: number;
}

export interface MercuryRecoveryData extends BaseReportData {
  witness: string;
  rows: MercuryRecoveryRow[];
  totalNetWeight: number;
  totalPureGold: number;
}
