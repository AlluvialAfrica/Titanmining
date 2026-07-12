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
  userId: string;
  name: string;
  role: string;
  status: "PRESENT" | "ABSENT" | "LEAVE";
}

export interface StaffAttendanceData extends BaseReportData {
  reportDate: string;
  shift: "SHIFT_1" | "SHIFT_2" | "SHIFT_3";
  records: AttendanceRecord[];
  totalPresent: number;
  totalAbsent: number;
  totalVisitors: number;
  totalCasuals: number;
}

export interface MachineDailyLogData extends BaseReportData {
  machineId: string;
  operatorId: string;
  shift: string;
  openingMeter: number;
  closingMeter: number;
  hoursWorked: number;
  fuelAddedL: number;
  workArea: string;
  issuesDescription?: string;
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

export interface MiningGeologyData extends BaseReportData {
  pitBlock: string;
  benchLevel: number;
  materialType: "ALLUVIAL" | "OVERBURDEN" | "CLAY";
  volumeMinedM3: number;
  estGradeGPerTon: number;
  excavatorId: string;
}

export interface DrumSandPumpData extends BaseReportData {
  pumpId: string;
  openingMeter: number;
  closingMeter: number;
  hoursRun: number;
  pumpSpeedRpm: number;
  dischargePressureBar: number;
  sandSlurryDensity: number;
}

export interface CentrifugeCleanupData extends BaseReportData {
  centrifugeId: string;
  runTimeHrs: number;
  feedRateTph: number;
  concentrateWeightKg: number;
  estimatedGradeGPerTon: number;
  panCleanDone: boolean;
}

export interface ShakingTableData extends BaseReportData {
  tableId: string;
  feedSource: string;
  feedWeightKg: number;
  processTimeHrs: number;
  concentrateG: number;
  tailingsEstLossG: number;
}

export interface GoldRecoveryHandoverData extends BaseReportData {
  bagSealNo: string;
  source: string;
  wetConc: number;
  dryConc: number;
  goldWeight: number;
  receivedFrom: string;
  receivedBy: string;
  handedOverTo: string;
  signatures: {
    submitter: string;
    receiver: string;
    verifier?: string;
  };
}

export interface MaintenanceGreasingData extends BaseReportData {
  machineId: string;
  greasingPointsChecked: number;
  engineOilLevelChecked: boolean;
  hydraulicOilLevelChecked: boolean;
  transmissionOilLevelChecked: boolean;
  coolantLevelChecked: boolean;
  filtersCleanedOrReplaced: boolean;
  mechanicNotes?: string;
}

export interface GateMovementRecord {
  time: string;
  personName: string;
  itemDescription: string;
  direction: "IN" | "OUT";
  vehicleNo?: string;
  searchConducted: boolean;
}

export interface GateRegisterData extends BaseReportData {
  records: GateMovementRecord[];
}

export interface ExpenseRecord {
  item: string;
  category: string;
  qty: number;
  unitCost: number;
  totalCost: number;
  requestedBy: string;
  approvedBy: string;
  receiptUrl?: string;
}

export interface StoresExpensesData extends BaseReportData {
  records: ExpenseRecord[];
  totalExpenses: number;
}

export interface ShiftHandoverData extends BaseReportData {
  outgoingLeadId: string;
  incomingLeadId: string;
  department: string;
  operationalStatus: string;
  safetyIssuesDescription?: string;
  pendingTasksDescription?: string;
  keyIssuesFaced?: string;
}

export interface PettyCashTransaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "IN" | "OUT";
}

export interface PettyCashData extends BaseReportData {
  openingBalance: number;
  transactions: PettyCashTransaction[];
  totalIn: number;
  totalOut: number;
  closingBalance: number;
}
