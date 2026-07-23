import { Role } from './roles';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export type KPIFieldType = 'number' | 'percentage' | 'hours' | 'count' | 'currency';

export interface KPIField {
  key: string;
  labelKey: string; // i18n key like 'kpi.fields.hoursOperated'
  type: KPIFieldType;
  unit?: string;
  defaultTarget: number;
  required: boolean;
  calculated?: boolean;
}

export interface KPICategory {
  categoryKey: string; // i18n key like 'kpi.categories.production'
  fields: KPIField[];
}

export interface KPIProfile {
  categories: KPICategory[];
}

// ---------------------------------------------------------------------------
// Helper - keeps each field definition concise
// ---------------------------------------------------------------------------

const field = (
  key: string,
  type: KPIFieldType,
  defaultTarget: number,
  options?: { unit?: string; required?: boolean; calculated?: boolean },
): KPIField => ({
  key,
  labelKey: `kpi.fields.${key}`,
  type,
  ...(options?.unit ? { unit: options.unit } : {}),
  defaultTarget,
  required: options?.required ?? true,
  ...(options?.calculated ? { calculated: true } : {}),
});

const category = (name: string, fields: KPIField[]): KPICategory => ({
  categoryKey: `kpi.categories.${name}`,
  fields,
});

// ---------------------------------------------------------------------------
// Role KPI profiles — 8 lean roles
// ---------------------------------------------------------------------------

export const ROLE_KPI_PROFILES: Partial<Record<Role, KPIProfile>> = {
  // -- A.1 SITE_CONTROLLER --
  [Role.SITE_CONTROLLER]: {
    categories: [
      category('management', [
        field('siteInspections', 'count', 2),
        field('reportsReviewed', 'count', 14),
        field('goldHandovers', 'count', 1),
        field('shiftHandovers', 'count', 2),
        field('meetingsHeld', 'count', 3),
        field('decisionsDocumented', 'count', 5),
        field('complianceChecks', 'count', 3),
      ]),
    ],
  },

  // -- A.2 MINING_GEOLOGY_LEAD --
  [Role.MINING_GEOLOGY_LEAD]: {
    categories: [
      category('geology', [
        field('samplesCollected', 'count', 10),
        field('oreGradeAvg', 'number', 2, { unit: 'g/t' }),
        field('pitAdvanceM', 'number', 5, { unit: 'm' }),
        field('geologicalMaps', 'count', 1),
        field('hoursOperated', 'hours', 8, { unit: 'hrs' }),
        field('materialMovedM3', 'number', 500, { unit: 'm³' }),
      ]),
    ],
  },

  // -- A.3 PROCESSING_RECOVERY_LEAD --
  [Role.PROCESSING_RECOVERY_LEAD]: {
    categories: [
      category('processing', [
        field('concentrateRecoveredG', 'number', 300, { unit: 'g' }),
        field('recoveryRatePct', 'percentage', 85, { unit: '%' }),
        field('feedRateM3Hr', 'number', 15, { unit: 'm³/hr' }),
        field('cleanupsConducted', 'count', 2),
        field('plantUptimeHrs', 'hours', 20, { unit: 'hrs' }),
        field('goldHandovers', 'count', 1),
      ]),
    ],
  },

  // -- A.4 FUEL_ADMIN_LOGISTICS --
  [Role.FUEL_ADMIN_LOGISTICS]: {
    categories: [
      category('fuel', [
        field('fuelIssuedL', 'number', 1500, { unit: 'L' }),
        field('fuelVarianceL', 'number', 0, { unit: 'L' }),
        field('stockReconciliations', 'count', 2),
        field('shiftReportsFiled', 'count', 2),
      ]),
      category('administration', [
        field('invoicesVerified', 'count', 10),
        field('attendanceReports', 'count', 2),
        field('purchaseOrdersProcessed', 'count', 8),
      ]),
    ],
  },

  // -- A.5 ENGINE_MECHANIC --
  [Role.ENGINE_MECHANIC]: {
    categories: [
      category('maintenance', [
        field('repairsCompleted', 'count', 4),
        field('partsUsed', 'count', 10),
        field('machineUptimePct', 'percentage', 90, { unit: '%' }),
        field('preventiveMaintenanceDone', 'count', 2),
        field('breakdownResponseMinutes', 'number', 30, { unit: 'min' }),
      ]),
    ],
  },

  // -- A.6 ELECTRICAL_MECHANIC --
  [Role.ELECTRICAL_MECHANIC]: {
    categories: [
      category('maintenance', [
        field('electricalRepairs', 'count', 3),
        field('motorServiced', 'count', 2),
        field('cableRepairs', 'count', 2),
        field('machineUptimePct', 'percentage', 90, { unit: '%' }),
      ]),
    ],
  },

  // -- A.7 GREASING_WASHING_HELPER --
  [Role.GREASING_WASHING_HELPER]: {
    categories: [
      category('maintenance', [
        field('machinesGreased', 'count', 6),
        field('washCompleted', 'count', 3),
        field('helperTasks', 'count', 8),
      ]),
    ],
  },

  // -- A.8 GATE_SECURITY --
  [Role.GATE_SECURITY]: {
    categories: [
      category('security', [
        field('gateLogsRecorded', 'count', 30),
        field('searchesConducted', 'count', 20),
        field('incidentsReported', 'count', 0),
        field('patrolRounds', 'count', 4),
        field('unauthorizedAttempts', 'count', 0),
      ]),
    ],
  },
};
