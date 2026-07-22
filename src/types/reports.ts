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
}

export interface AttendanceRecord {
  staffName: string;
  role: string;
  status: "PRESENT" | "ABSENT" | "LEAVE";
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
  openingHours: number;
  closingHours: number;
  hoursWorked: number;
  fuelAddedL: number;
  workArea: string;
  breakdowns?: string;
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
  remarks?: string;
}

export interface MiningGeologyData extends BaseReportData {
  geologist: string;
  rows: GeologyRow[];
  totalVolume: number;
  avgGrade: number;
}

export interface DrumPumpRow {
  pumpUnit: string;
  operator: string;
  inletPressure: number;
  outletPressure: number;
  slurryDensity: number;
  operatingHours: number;
  remarks?: string;
}

export interface DrumSandPumpData extends BaseReportData {
  shift: string;
  rows: DrumPumpRow[];
}

export interface CentrifugeRow {
  centrifugeId: string;
  feedRateM3Hr: number;
  operatingHours: number;
  concentrateWeightG: number;
  cleanupOperator: string;
  remarks?: string;
}

export interface CentrifugeCleanupData extends BaseReportData {
  rows: CentrifugeRow[];
  totalConcentrate: number;
}

export interface ShakingTableRow {
  tableId: string;
  feedRateM3Hr: number;
  operatingHours: number;
  concentrateWeightG: number;
  operator: string;
  remarks?: string;
}

export interface ShakingTableData extends BaseReportData {
  rows: ShakingTableRow[];
  totalConcentrate: number;
}

export interface GoldRecoveryRow {
  source: string;
  grossWeightG: number;
  tareWeightG: number;
  netWeightG: number;
  purityPct: number;
  pureGoldG: number;
  vaultBoxId: string;
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
  machineId: string;
  greasingDone: boolean;
  filtersChanged: boolean;
  washingDone: boolean;
  sparesUsed: string;
  notes?: string;
}

export interface MaintenanceGreasingData extends BaseReportData {
  mechanicName: string;
  rows: MaintenanceRow[];
}

export interface GateMovementRecord {
  timeIn: string;
  timeOut: string;
  visitorName: string;
  company: string;
  vehiclePlate?: string;
  purpose: string;
  searchDone: boolean;
  itemsInOut: string;
}

export interface GateRegisterData extends BaseReportData {
  guardName: string;
  records: GateMovementRecord[];
}

export interface ExpenseRecord {
  itemName: string;
  vendor: string;
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
}

export interface ShiftHandoverData extends BaseReportData {
  outgoingSupervisor: string;
  incomingSupervisor: string;
  safetyIncidents: string;
  productionStatus: string;
  equipmentStatus: string;
  pendingTasks: string;
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
