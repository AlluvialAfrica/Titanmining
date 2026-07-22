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
// Role KPI profiles
// ---------------------------------------------------------------------------

export const ROLE_KPI_PROFILES: Partial<Record<Role, KPIProfile>> = {
  // -- SITE_MANAGER (merged SITE_CONTROLLER + MINE_MANAGER KPIs) --
  [Role.SITE_MANAGER]: {
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

  // -- FUEL_MANAGER (copied from FUEL_ADMIN_LOGISTICS) --
  [Role.FUEL_MANAGER]: {
    categories: [
      category('fuel', [
        field('fuelIssuedL', 'number', 1500, { unit: 'L' }),
        field('fuelVarianceL', 'number', 0, { unit: 'L' }),
        field('stockReconciliations', 'count', 2),
        field('shiftReportsFiled', 'count', 2),
      ]),
    ],
  },

  // -- 1. EXCAVATOR_OPERATOR -------------------------------------
  [Role.EXCAVATOR_OPERATOR]: {
    categories: [
      category('production', [
        field('hoursOperated', 'hours', 8, { unit: 'hrs' }),
        field('materialMovedM3', 'number', 500, { unit: 'm³' }),
        field('loadsHauled', 'count', 40),
        field('downtimeHrs', 'hours', 1, { unit: 'hrs' }),
        field('fuelConsumedL', 'number', 200, { unit: 'L' }),
        field('utilizationPct', 'percentage', 85, { unit: '%', calculated: true }),
      ]),
    ],
  },

  // -- 2. ENGINE_MECHANIC ----------------------------------------
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

  // -- 3. ELECTRICAL_MECHANIC ------------------------------------
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

  // -- 4. GREASING_WASHING_HELPER --------------------------------
  [Role.GREASING_WASHING_HELPER]: {
    categories: [
      category('maintenance', [
        field('machinesGreased', 'count', 6),
        field('washCompleted', 'count', 3),
        field('helperTasks', 'count', 8),
      ]),
    ],
  },

  // -- 5. GATE_SECURITY ------------------------------------------
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

  // -- 6. SECURITY_GUARD -----------------------------------------
  [Role.SECURITY_GUARD]: {
    categories: [
      category('security', [
        field('areasPatrolled', 'count', 6),
        field('accessControlChecks', 'count', 15),
        field('incidentsReported', 'count', 0),
        field('patrolRounds', 'count', 6),
      ]),
    ],
  },

  // -- 7. MINE_MANAGER -------------------------------------------
  [Role.MINE_MANAGER]: {
    categories: [
      category('management', [
        field('siteInspections', 'count', 2),
        field('reportsReviewed', 'count', 10),
        field('meetingsHeld', 'count', 3),
        field('decisionsDocumented', 'count', 5),
        field('complianceChecks', 'count', 2),
      ]),
    ],
  },

  // -- 8. OPERATIONS_MANAGER -------------------------------------
  [Role.OPERATIONS_MANAGER]: {
    categories: [
      category('management', [
        field('operationalReviews', 'count', 3),
        field('productionMeetings', 'count', 2),
        field('kpiReviews', 'count', 5),
        field('processOptimizations', 'count', 1),
        field('shiftHandovers', 'count', 2),
      ]),
    ],
  },

  // -- 9. FINANCE_MANAGER ----------------------------------------
  [Role.FINANCE_MANAGER]: {
    categories: [
      category('finance', [
        field('invoicesVerified', 'count', 10),
        field('budgetVariancePct', 'percentage', 5, { unit: '%' }),
        field('purchaseOrdersProcessed', 'count', 8),
        field('stockReconciliations', 'count', 2),
      ]),
    ],
  },

  // -- 10. HR_MANAGER ---------------------------------------------
  [Role.HR_MANAGER]: {
    categories: [
      category('hr', [
        field('attendanceReports', 'count', 2),
        field('newHiresProcessed', 'count', 1),
        field('trainingsSessions', 'count', 1),
        field('staffAttendancePct', 'percentage', 95, { unit: '%' }),
      ]),
    ],
  },

  // -- 11. SAFETY_COMPLIANCE_MANAGER ------------------------------
  [Role.SAFETY_COMPLIANCE_MANAGER]: {
    categories: [
      category('safety', [
        field('safetyDrills', 'count', 1),
        field('hseInspections', 'count', 3),
        field('nearMissReports', 'count', 0),
        field('safetyMeetings', 'count', 1),
        field('auditFindings', 'count', 2),
        field('regulatorySubmissions', 'count', 1),
      ]),
    ],
  },

  // -- 12. MINE_FOREMAN -------------------------------------------
  [Role.MINE_FOREMAN]: {
    categories: [
      category('production', [
        field('shiftReportsFiled', 'count', 2),
        field('taskAssignments', 'count', 10),
        field('safetyIncidents', 'count', 0),
        field('productionMeetings', 'count', 1),
      ]),
    ],
  },

  // -- 13. PLANT_MANAGER ------------------------------------------
  [Role.PLANT_MANAGER]: {
    categories: [
      category('processing', [
        field('goldHandovers', 'count', 1),
        field('shiftHandovers', 'count', 2),
        field('processOptimizations', 'count', 1),
        field('plantUptimeHrs', 'hours', 20, { unit: 'hrs' }),
      ]),
    ],
  },

  // -- 14. MINING_GEOLOGY_LEAD ------------------------------------
  [Role.MINING_GEOLOGY_LEAD]: {
    categories: [
      category('geology', [
        field('samplesCollected', 'count', 10),
        field('oreGradeAvg', 'number', 2, { unit: 'g/t' }),
        field('pitAdvanceM', 'number', 5, { unit: 'm' }),
        field('geologicalMaps', 'count', 1),
      ]),
    ],
  },

  // -- 15. PROCESSING_RECOVERY_LEAD -------------------------------
  [Role.PROCESSING_RECOVERY_LEAD]: {
    categories: [
      category('processing', [
        field('concentrateRecoveredG', 'number', 300, { unit: 'g' }),
        field('recoveryRatePct', 'percentage', 85, { unit: '%' }),
        field('feedRateM3Hr', 'number', 15, { unit: 'm³/hr' }),
        field('cleanupsConducted', 'count', 2),
      ]),
    ],
  },

  // -- 16. FUEL_ADMIN_LOGISTICS -----------------------------------
  [Role.FUEL_ADMIN_LOGISTICS]: {
    categories: [
      category('fuel', [
        field('fuelIssuedL', 'number', 1500, { unit: 'L' }),
        field('fuelVarianceL', 'number', 0, { unit: 'L' }),
        field('stockReconciliations', 'count', 2),
        field('shiftReportsFiled', 'count', 2),
      ]),
    ],
  },

  // -- 17. DRUM_PUMP_SUPERVISOR -----------------------------------
  [Role.DRUM_PUMP_SUPERVISOR]: {
    categories: [
      category('production', [
        field('pumpOperatingHrs', 'hours', 8, { unit: 'hrs' }),
        field('slurryProcessedM3', 'number', 200, { unit: 'm³' }),
        field('pressureChecks', 'count', 4),
      ]),
    ],
  },

  // -- 18. DRUM_PUMP_ASSISTANT ------------------------------------
  [Role.DRUM_PUMP_ASSISTANT]: {
    categories: [
      category('production', [
        field('pumpOperatingHrs', 'hours', 8, { unit: 'hrs' }),
        field('helperTasks', 'count', 6),
      ]),
    ],
  },

  // -- 19. CENTRIFUGE_OPERATOR ------------------------------------
  [Role.CENTRIFUGE_OPERATOR]: {
    categories: [
      category('processing', [
        field('centrifugeRunsCompleted', 'count', 3),
        field('concentrateRecoveredG', 'number', 100, { unit: 'g' }),
        field('plantUptimeHrs', 'hours', 8, { unit: 'hrs' }),
      ]),
    ],
  },

  // -- 20. SHAKING_TABLE_OPERATOR ---------------------------------
  [Role.SHAKING_TABLE_OPERATOR]: {
    categories: [
      category('processing', [
        field('tableRunsCompleted', 'count', 4),
        field('concentrateRecoveredG', 'number', 80, { unit: 'g' }),
        field('plantUptimeHrs', 'hours', 8, { unit: 'hrs' }),
      ]),
    ],
  },

  // -- 21. SITE_PETTY_CASH_MANAGER --------------------------------
  [Role.SITE_PETTY_CASH_MANAGER]: {
    categories: [
      category('finance', [
        field('cashDisbursements', 'count', 10),
        field('receiptsRecorded', 'count', 10),
        field('cashVariance', 'currency', 0, { unit: 'USD' }),
      ]),
    ],
  },

  // -- 22. DREDGE_OPERATOR ----------------------------------------
  [Role.DREDGE_OPERATOR]: {
    categories: [
      category('production', [
        field('dredgeOpHrs', 'hours', 8, { unit: 'hrs' }),
        field('dredgeAreaM2', 'number', 500, { unit: 'm²' }),
        field('sedimentProcessedM3', 'number', 300, { unit: 'm³' }),
      ]),
    ],
  },

  // -- 23. PROCESS_PLANT_OPERATOR ---------------------------------
  [Role.PROCESS_PLANT_OPERATOR]: {
    categories: [
      category('processing', [
        field('plantUptimeHrs', 'hours', 8, { unit: 'hrs' }),
        field('feedRateM3Hr', 'number', 15, { unit: 'm³/hr' }),
        field('cleanupsConducted', 'count', 1),
      ]),
    ],
  },

  // -- 24. PUMP_OPERATOR ------------------------------------------
  [Role.PUMP_OPERATOR]: {
    categories: [
      category('production', [
        field('pumpOperatingHrs', 'hours', 8, { unit: 'hrs' }),
        field('pressureChecks', 'count', 6),
        field('slurryProcessedM3', 'number', 150, { unit: 'm³' }),
      ]),
    ],
  },

  // -- 25. DRILLER_SAMPLING_CREW ----------------------------------
  [Role.DRILLER_SAMPLING_CREW]: {
    categories: [
      category('geology', [
        field('samplesCollected', 'count', 15),
        field('hoursOperated', 'hours', 8, { unit: 'hrs' }),
      ]),
    ],
  },

  // -- 26. ACCOUNTANT ---------------------------------------------
  [Role.ACCOUNTANT]: {
    categories: [
      category('finance', [
        field('invoicesVerified', 'count', 15),
        field('purchaseOrdersProcessed', 'count', 5),
        field('budgetVariancePct', 'percentage', 5, { unit: '%' }),
      ]),
    ],
  },

  // -- 27. PROCUREMENT_OFFICER ------------------------------------
  [Role.PROCUREMENT_OFFICER]: {
    categories: [
      category('finance', [
        field('procurementRequests', 'count', 5),
        field('suppliersManaged', 'count', 3),
        field('costSavingsUSD', 'currency', 100, { unit: 'USD' }),
      ]),
    ],
  },

  // -- 28. ASSAY_LAB_TECHNICIAN -----------------------------------
  [Role.ASSAY_LAB_TECHNICIAN]: {
    categories: [
      category('quality', [
        field('assaysCompleted', 'count', 8),
        field('samplesTested', 'count', 12),
        field('reportsPrepared', 'count', 4),
      ]),
    ],
  },

  // -- 29. COMMUNITY_RELATIONS_OFFICER ----------------------------
  [Role.COMMUNITY_RELATIONS_OFFICER]: {
    categories: [
      category('administration', [
        field('communityMeetings', 'count', 2),
        field('grievancesResolved', 'count', 3),
        field('engagementActivities', 'count', 1),
      ]),
    ],
  },

  // -- 30. ADMIN_CLERK --------------------------------------------
  [Role.ADMIN_CLERK]: {
    categories: [
      category('administration', [
        field('documentsProcessed', 'count', 20),
        field('recordsUpdated', 'count', 10),
        field('correspondenceHandled', 'count', 15),
      ]),
    ],
  },

  // -- 31. MEDICAL_OFFICER ----------------------------------------
  [Role.MEDICAL_OFFICER]: {
    categories: [
      category('administration', [
        field('medicalConsultations', 'count', 10),
        field('firstAidCases', 'count', 2),
        field('healthScreenings', 'count', 5),
      ]),
    ],
  },

  // -- 32. CAMP_MANAGER -------------------------------------------
  [Role.CAMP_MANAGER]: {
    categories: [
      category('administration', [
        field('mealsServed', 'count', 100),
        field('accommodationChecks', 'count', 3),
        field('facilityInspections', 'count', 2),
      ]),
    ],
  },

  // -- 33. LOGISTICS_TRANSPORT_COORDINATOR ------------------------
  [Role.LOGISTICS_TRANSPORT_COORDINATOR]: {
    categories: [
      category('logistics', [
        field('tripsCompleted', 'count', 5),
        field('deliveriesCoordinated', 'count', 8),
        field('fleetChecks', 'count', 3),
      ]),
    ],
  },

  // -- 34. WORKSHOP_MANAGER ---------------------------------------
  [Role.WORKSHOP_MANAGER]: {
    categories: [
      category('maintenance', [
        field('equipmentRepairs', 'count', 5),
        field('preventiveMaintenanceDone', 'count', 3),
        field('machineUptimePct', 'percentage', 90, { unit: '%' }),
        field('shiftHandovers', 'count', 2),
      ]),
    ],
  },

  // -- 35. HEAVY_EQUIPMENT_MECHANIC -------------------------------
  [Role.HEAVY_EQUIPMENT_MECHANIC]: {
    categories: [
      category('maintenance', [
        field('repairsCompleted', 'count', 3),
        field('partsUsed', 'count', 8),
        field('machineUptimePct', 'percentage', 88, { unit: '%' }),
      ]),
    ],
  },

  // -- 36. AUTO_ELECTRICIAN ---------------------------------------
  [Role.AUTO_ELECTRICIAN]: {
    categories: [
      category('maintenance', [
        field('electricalRepairs', 'count', 4),
        field('motorServiced', 'count', 2),
        field('cableRepairs', 'count', 3),
      ]),
    ],
  },

  // -- 37. WELDER_FABRICATOR --------------------------------------
  [Role.WELDER_FABRICATOR]: {
    categories: [
      category('maintenance', [
        field('weldingJobs', 'count', 3),
        field('repairsCompleted', 'count', 2),
        field('partsUsed', 'count', 5),
      ]),
    ],
  },

  // -- 38. LIGHT_VEHICLE_MECHANIC ---------------------------------
  [Role.LIGHT_VEHICLE_MECHANIC]: {
    categories: [
      category('maintenance', [
        field('vehicleServiced', 'count', 3),
        field('repairsCompleted', 'count', 2),
        field('partsUsed', 'count', 6),
      ]),
    ],
  },

  // -- 39. GENERAL_WORKER -----------------------------------------
  [Role.GENERAL_WORKER]: {
    categories: [
      category('general', [
        field('taskAssignments', 'count', 8),
        field('hoursOperated', 'hours', 8, { unit: 'hrs' }),
      ]),
    ],
  },

  // -- 40. SECURITY_MANAGER ---------------------------------------
  [Role.SECURITY_MANAGER]: {
    categories: [
      category('security', [
        field('incidentsReported', 'count', 0),
        field('patrolRounds', 'count', 8),
        field('searchesConducted', 'count', 10),
        field('safetyMeetings', 'count', 1),
      ]),
    ],
  },

  // -- 41. SITE_CONTROLLER ----------------------------------------
  [Role.SITE_CONTROLLER]: {
    categories: [
      category('management', [
        field('reportsReviewed', 'count', 14),
        field('goldHandovers', 'count', 1),
        field('shiftHandovers', 'count', 2),
        field('complianceChecks', 'count', 3),
      ]),
    ],
  },
};
