export enum Role {
  // --- Consolidated management roles ---
  SITE_MANAGER = "SITE_MANAGER",
  FUEL_MANAGER = "FUEL_MANAGER",

  // --- Legacy aliases (backward compat, map to SITE_MANAGER behavior) ---
  SITE_CONTROLLER = "SITE_CONTROLLER",
  MINE_MANAGER = "MINE_MANAGER",
  SYSTEM_ADMIN = "SYSTEM_ADMIN",

  // --- Operational roles (unchanged) ---
  MINING_GEOLOGY_LEAD = "MINING_GEOLOGY_LEAD",
  PROCESSING_RECOVERY_LEAD = "PROCESSING_RECOVERY_LEAD",
  ENGINE_MECHANIC = "ENGINE_MECHANIC",
  ELECTRICAL_MECHANIC = "ELECTRICAL_MECHANIC",
  GREASING_WASHING_HELPER = "GREASING_WASHING_HELPER",
  GATE_SECURITY = "GATE_SECURITY",
  EXCAVATOR_OPERATOR = "EXCAVATOR_OPERATOR",
  DRUM_PUMP_SUPERVISOR = "DRUM_PUMP_SUPERVISOR",
  DRUM_PUMP_ASSISTANT = "DRUM_PUMP_ASSISTANT",
  CENTRIFUGE_OPERATOR = "CENTRIFUGE_OPERATOR",
  SHAKING_TABLE_OPERATOR = "SHAKING_TABLE_OPERATOR",

  // Management
  OPERATIONS_MANAGER = "OPERATIONS_MANAGER",
  FINANCE_MANAGER = "FINANCE_MANAGER",
  HR_MANAGER = "HR_MANAGER",
  SAFETY_COMPLIANCE_MANAGER = "SAFETY_COMPLIANCE_MANAGER",

  // Operations
  MINE_FOREMAN = "MINE_FOREMAN",
  PLANT_MANAGER = "PLANT_MANAGER",
  DREDGE_OPERATOR = "DREDGE_OPERATOR",
  PROCESS_PLANT_OPERATOR = "PROCESS_PLANT_OPERATOR",
  PUMP_OPERATOR = "PUMP_OPERATOR",
  DRILLER_SAMPLING_CREW = "DRILLER_SAMPLING_CREW",

  // Admin/Commercial
  ACCOUNTANT = "ACCOUNTANT",
  PROCUREMENT_OFFICER = "PROCUREMENT_OFFICER",
  ASSAY_LAB_TECHNICIAN = "ASSAY_LAB_TECHNICIAN",
  COMMUNITY_RELATIONS_OFFICER = "COMMUNITY_RELATIONS_OFFICER",
  ADMIN_CLERK = "ADMIN_CLERK",

  // Security/Support
  SECURITY_MANAGER = "SECURITY_MANAGER",
  SECURITY_GUARD = "SECURITY_GUARD",
  MEDICAL_OFFICER = "MEDICAL_OFFICER",
  CAMP_MANAGER = "CAMP_MANAGER",
  LOGISTICS_TRANSPORT_COORDINATOR = "LOGISTICS_TRANSPORT_COORDINATOR",

  // Maintenance
  WORKSHOP_MANAGER = "WORKSHOP_MANAGER",
  HEAVY_EQUIPMENT_MECHANIC = "HEAVY_EQUIPMENT_MECHANIC",
  AUTO_ELECTRICIAN = "AUTO_ELECTRICIAN",
  WELDER_FABRICATOR = "WELDER_FABRICATOR",
  LIGHT_VEHICLE_MECHANIC = "LIGHT_VEHICLE_MECHANIC",

  // General
  GENERAL_WORKER = "GENERAL_WORKER",

  // Legacy (kept for backward compat, folded into FINANCE_MANAGER)
  SITE_PETTY_CASH_MANAGER = "SITE_PETTY_CASH_MANAGER",
  // Legacy (kept for backward compat, mapped to FUEL_MANAGER)
  FUEL_ADMIN_LOGISTICS = "FUEL_ADMIN_LOGISTICS",
}

/** All template IDs used across the system. */
const ALL_TEMPLATES = [
  "TEMPLATE_01", "TEMPLATE_02", "TEMPLATE_03", "TEMPLATE_04", "TEMPLATE_05",
  "TEMPLATE_06", "TEMPLATE_07", "TEMPLATE_08", "TEMPLATE_09", "TEMPLATE_10",
  "TEMPLATE_11", "TEMPLATE_12", "TEMPLATE_13", "TEMPLATE_14", "TEMPLATE_15",
];

export interface RolePermissions {
  canCreate: string[];
  canRead: string[];
  canVerify: string[];
  canManageUsers: boolean;
  canEditProfile: boolean;
  canExport: boolean;
  canViewKPI: boolean;
  canInputKPI: boolean;
  canViewTeamKPI: boolean;
}

/** Full SITE_MANAGER permissions (all templates, all admin). */
const SITE_MANAGER_PERMISSIONS: RolePermissions = {
  canCreate: ALL_TEMPLATES,
  canRead: ["ALL"],
  canVerify: ALL_TEMPLATES,
  canManageUsers: true,
  canEditProfile: true,
  canExport: true,
  canViewKPI: true,
  canInputKPI: true,
  canViewTeamKPI: true,
};

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  // --- Consolidated roles ---
  [Role.SITE_MANAGER]: { ...SITE_MANAGER_PERMISSIONS },

  [Role.FUEL_MANAGER]: {
    canCreate: ["TEMPLATE_04"],
    canRead: ["TEMPLATE_04"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },

  // --- Legacy aliases → same as SITE_MANAGER ---
  [Role.SITE_CONTROLLER]: { ...SITE_MANAGER_PERMISSIONS },
  [Role.MINE_MANAGER]: { ...SITE_MANAGER_PERMISSIONS },
  [Role.SYSTEM_ADMIN]: { ...SITE_MANAGER_PERMISSIONS },

  // --- Management roles ---
  [Role.OPERATIONS_MANAGER]: {
    canCreate: ["TEMPLATE_01", "TEMPLATE_13"],
    canRead: ["ALL"],
    canVerify: ["TEMPLATE_01", "TEMPLATE_09", "TEMPLATE_13"],
    canManageUsers: true,
    canEditProfile: false,
    canExport: true,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: true,
  },
  [Role.FINANCE_MANAGER]: {
    canCreate: ["TEMPLATE_12", "TEMPLATE_15"],
    canRead: ["TEMPLATE_04", "TEMPLATE_12", "TEMPLATE_15"],
    canVerify: ["TEMPLATE_04", "TEMPLATE_12", "TEMPLATE_15"],
    canManageUsers: false,
    canEditProfile: false,
    canExport: true,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: true,
  },
  [Role.HR_MANAGER]: {
    canCreate: ["TEMPLATE_02", "TEMPLATE_14"],
    canRead: ["TEMPLATE_02", "TEMPLATE_14"],
    canVerify: ["TEMPLATE_02", "TEMPLATE_14"],
    canManageUsers: false,
    canEditProfile: false,
    canExport: true,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: true,
  },
  [Role.SAFETY_COMPLIANCE_MANAGER]: {
    canCreate: ["TEMPLATE_02", "TEMPLATE_13"],
    canRead: ["ALL"],
    canVerify: ["TEMPLATE_13"],
    canManageUsers: false,
    canEditProfile: false,
    canExport: true,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: true,
  },

  // --- Operational roles ---
  [Role.MINING_GEOLOGY_LEAD]: {
    canCreate: ["TEMPLATE_05"],
    canRead: ["TEMPLATE_03", "TEMPLATE_05"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.PROCESSING_RECOVERY_LEAD]: {
    canCreate: ["TEMPLATE_07", "TEMPLATE_08", "TEMPLATE_09"],
    canRead: ["TEMPLATE_06", "TEMPLATE_07", "TEMPLATE_08", "TEMPLATE_09"],
    canVerify: ["TEMPLATE_07", "TEMPLATE_08"],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.ENGINE_MECHANIC]: {
    canCreate: ["TEMPLATE_10"],
    canRead: ["TEMPLATE_03", "TEMPLATE_10"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.ELECTRICAL_MECHANIC]: {
    canCreate: ["TEMPLATE_10"],
    canRead: ["TEMPLATE_03", "TEMPLATE_10"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.GREASING_WASHING_HELPER]: {
    canCreate: ["TEMPLATE_10"],
    canRead: ["TEMPLATE_10"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.GATE_SECURITY]: {
    canCreate: ["TEMPLATE_11"],
    canRead: ["TEMPLATE_11"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.EXCAVATOR_OPERATOR]: {
    canCreate: ["TEMPLATE_03"],
    canRead: ["TEMPLATE_03"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.DRUM_PUMP_SUPERVISOR]: {
    canCreate: ["TEMPLATE_06"],
    canRead: ["TEMPLATE_06"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.DRUM_PUMP_ASSISTANT]: {
    canCreate: ["TEMPLATE_06"],
    canRead: ["TEMPLATE_06"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.CENTRIFUGE_OPERATOR]: {
    canCreate: ["TEMPLATE_07"],
    canRead: ["TEMPLATE_07"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.SHAKING_TABLE_OPERATOR]: {
    canCreate: ["TEMPLATE_08"],
    canRead: ["TEMPLATE_08"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },

  // Legacy: SITE_PETTY_CASH_MANAGER → folded into FINANCE_MANAGER
  [Role.SITE_PETTY_CASH_MANAGER]: {
    canCreate: ["TEMPLATE_15"],
    canRead: ["TEMPLATE_12", "TEMPLATE_15"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },

  // Legacy: FUEL_ADMIN_LOGISTICS → mapped to FUEL_MANAGER
  [Role.FUEL_ADMIN_LOGISTICS]: {
    canCreate: ["TEMPLATE_04"],
    canRead: ["TEMPLATE_04"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },

  // Operations roles
  [Role.MINE_FOREMAN]: {
    canCreate: ["TEMPLATE_03", "TEMPLATE_05", "TEMPLATE_13"],
    canRead: ["TEMPLATE_03", "TEMPLATE_05", "TEMPLATE_13"],
    canVerify: ["TEMPLATE_03"],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: true,
  },
  [Role.PLANT_MANAGER]: {
    canCreate: ["TEMPLATE_06", "TEMPLATE_07", "TEMPLATE_08", "TEMPLATE_09", "TEMPLATE_13"],
    canRead: ["TEMPLATE_06", "TEMPLATE_07", "TEMPLATE_08", "TEMPLATE_09", "TEMPLATE_13"],
    canVerify: ["TEMPLATE_07", "TEMPLATE_08", "TEMPLATE_09"],
    canManageUsers: false,
    canEditProfile: false,
    canExport: true,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: true,
  },
  [Role.DREDGE_OPERATOR]: {
    canCreate: ["TEMPLATE_03"],
    canRead: ["TEMPLATE_03"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.PROCESS_PLANT_OPERATOR]: {
    canCreate: ["TEMPLATE_07", "TEMPLATE_08"],
    canRead: ["TEMPLATE_07", "TEMPLATE_08"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.PUMP_OPERATOR]: {
    canCreate: ["TEMPLATE_06"],
    canRead: ["TEMPLATE_06"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.DRILLER_SAMPLING_CREW]: {
    canCreate: ["TEMPLATE_05"],
    canRead: ["TEMPLATE_05"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },

  // Admin/Commercial roles
  [Role.ACCOUNTANT]: {
    canCreate: ["TEMPLATE_12", "TEMPLATE_15"],
    canRead: ["TEMPLATE_04", "TEMPLATE_12", "TEMPLATE_15"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: true,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.PROCUREMENT_OFFICER]: {
    canCreate: ["TEMPLATE_12"],
    canRead: ["TEMPLATE_12"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.ASSAY_LAB_TECHNICIAN]: {
    canCreate: ["TEMPLATE_09"],
    canRead: ["TEMPLATE_09"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.COMMUNITY_RELATIONS_OFFICER]: {
    canCreate: ["TEMPLATE_02"],
    canRead: ["TEMPLATE_02"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.ADMIN_CLERK]: {
    canCreate: ["TEMPLATE_02", "TEMPLATE_12"],
    canRead: ["TEMPLATE_02", "TEMPLATE_12"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },

  // Security/Support roles
  [Role.SECURITY_MANAGER]: {
    canCreate: ["TEMPLATE_11", "TEMPLATE_13"],
    canRead: ["TEMPLATE_11", "TEMPLATE_13"],
    canVerify: ["TEMPLATE_11"],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: true,
  },
  [Role.SECURITY_GUARD]: {
    canCreate: ["TEMPLATE_11"],
    canRead: ["TEMPLATE_11"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.MEDICAL_OFFICER]: {
    canCreate: ["TEMPLATE_02"],
    canRead: ["TEMPLATE_02"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.CAMP_MANAGER]: {
    canCreate: ["TEMPLATE_02", "TEMPLATE_12"],
    canRead: ["TEMPLATE_02", "TEMPLATE_12"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.LOGISTICS_TRANSPORT_COORDINATOR]: {
    canCreate: ["TEMPLATE_04", "TEMPLATE_12"],
    canRead: ["TEMPLATE_04", "TEMPLATE_12"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },

  // Maintenance roles
  [Role.WORKSHOP_MANAGER]: {
    canCreate: ["TEMPLATE_10", "TEMPLATE_13"],
    canRead: ["TEMPLATE_03", "TEMPLATE_10", "TEMPLATE_13"],
    canVerify: ["TEMPLATE_10"],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: true,
  },
  [Role.HEAVY_EQUIPMENT_MECHANIC]: {
    canCreate: ["TEMPLATE_10"],
    canRead: ["TEMPLATE_03", "TEMPLATE_10"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.AUTO_ELECTRICIAN]: {
    canCreate: ["TEMPLATE_10"],
    canRead: ["TEMPLATE_03", "TEMPLATE_10"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.WELDER_FABRICATOR]: {
    canCreate: ["TEMPLATE_10"],
    canRead: ["TEMPLATE_10"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
  [Role.LIGHT_VEHICLE_MECHANIC]: {
    canCreate: ["TEMPLATE_10"],
    canRead: ["TEMPLATE_03", "TEMPLATE_10"],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },

  // General
  [Role.GENERAL_WORKER]: {
    canCreate: [],
    canRead: [],
    canVerify: [],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: false,
  },
};

/**
 * Maps legacy Cognito role strings to the consolidated role.
 * Used when building user from Cognito attributes.
 */
export function mapLegacyRole(role: string): Role {
  switch (role) {
    case Role.SITE_CONTROLLER:
    case Role.MINE_MANAGER:
    case Role.SYSTEM_ADMIN:
      return Role.SITE_MANAGER;
    case Role.FUEL_ADMIN_LOGISTICS:
      return Role.FUEL_MANAGER;
    case Role.SITE_PETTY_CASH_MANAGER:
      return Role.FINANCE_MANAGER;
    default:
      return role as Role;
  }
}

/**
 * Checks whether the given role should have admin dashboard access.
 */
export function hasAdminAccess(role: Role): boolean {
  return role === Role.SITE_MANAGER ||
    role === Role.SYSTEM_ADMIN ||
    role === Role.SITE_CONTROLLER ||
    role === Role.MINE_MANAGER;
}
