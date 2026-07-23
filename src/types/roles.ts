export enum Role {
  SITE_CONTROLLER = "SITE_CONTROLLER",
  MINING_GEOLOGY_LEAD = "MINING_GEOLOGY_LEAD",
  PROCESSING_RECOVERY_LEAD = "PROCESSING_RECOVERY_LEAD",
  FUEL_ADMIN_LOGISTICS = "FUEL_ADMIN_LOGISTICS",
  ENGINE_MECHANIC = "ENGINE_MECHANIC",
  ELECTRICAL_MECHANIC = "ELECTRICAL_MECHANIC",
  GREASING_WASHING_HELPER = "GREASING_WASHING_HELPER",
  GATE_SECURITY = "GATE_SECURITY",
  SYSTEM_ADMIN = "SYSTEM_ADMIN",
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

/** Full SITE_CONTROLLER permissions (all templates, all admin). */
const SITE_CONTROLLER_PERMISSIONS: RolePermissions = {
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
  [Role.SITE_CONTROLLER]: { ...SITE_CONTROLLER_PERMISSIONS },

  [Role.MINING_GEOLOGY_LEAD]: {
    canCreate: ["TEMPLATE_03", "TEMPLATE_05", "TEMPLATE_13"],
    canRead: ["TEMPLATE_03", "TEMPLATE_05"],
    canVerify: ["TEMPLATE_03"],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: true,
  },

  [Role.PROCESSING_RECOVERY_LEAD]: {
    canCreate: ["TEMPLATE_06", "TEMPLATE_07", "TEMPLATE_08", "TEMPLATE_09", "TEMPLATE_13"],
    canRead: ["TEMPLATE_06", "TEMPLATE_07", "TEMPLATE_08", "TEMPLATE_09"],
    canVerify: ["TEMPLATE_07", "TEMPLATE_08", "TEMPLATE_09"],
    canManageUsers: false,
    canEditProfile: false,
    canExport: false,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: true,
  },

  [Role.FUEL_ADMIN_LOGISTICS]: {
    canCreate: ["TEMPLATE_02", "TEMPLATE_04", "TEMPLATE_12", "TEMPLATE_14", "TEMPLATE_15"],
    canRead: ["TEMPLATE_02", "TEMPLATE_04", "TEMPLATE_12", "TEMPLATE_14", "TEMPLATE_15"],
    canVerify: ["TEMPLATE_02", "TEMPLATE_04", "TEMPLATE_12"],
    canManageUsers: false,
    canEditProfile: false,
    canExport: true,
    canViewKPI: true,
    canInputKPI: true,
    canViewTeamKPI: true,
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

  [Role.SYSTEM_ADMIN]: { ...SITE_CONTROLLER_PERMISSIONS },
};

/**
 * Maps legacy Cognito role strings to the new lean roles.
 * Used when building user from Cognito attributes.
 */
export function mapLegacyRole(role: string): Role {
  switch (role) {
    // Management → SITE_CONTROLLER
    case "SITE_MANAGER":
    case "MINE_MANAGER":
    case "OPERATIONS_MANAGER":
    case "SAFETY_COMPLIANCE_MANAGER":
    case Role.SITE_CONTROLLER:
      return Role.SITE_CONTROLLER;

    // Mining → MINING_GEOLOGY_LEAD
    case "MINE_FOREMAN":
    case "EXCAVATOR_OPERATOR":
    case "DRILLER_SAMPLING_CREW":
    case Role.MINING_GEOLOGY_LEAD:
      return Role.MINING_GEOLOGY_LEAD;

    // Processing → PROCESSING_RECOVERY_LEAD
    case "PLANT_MANAGER":
    case "DRUM_PUMP_SUPERVISOR":
    case "DRUM_PUMP_ASSISTANT":
    case "CENTRIFUGE_OPERATOR":
    case "SHAKING_TABLE_OPERATOR":
    case "DREDGE_OPERATOR":
    case "PROCESS_PLANT_OPERATOR":
    case "PUMP_OPERATOR":
    case "ASSAY_LAB_TECHNICIAN":
    case Role.PROCESSING_RECOVERY_LEAD:
      return Role.PROCESSING_RECOVERY_LEAD;

    // Admin/Logistics → FUEL_ADMIN_LOGISTICS
    case "FUEL_MANAGER":
    case "FINANCE_MANAGER":
    case "HR_MANAGER":
    case "ACCOUNTANT":
    case "PROCUREMENT_OFFICER":
    case "COMMUNITY_RELATIONS_OFFICER":
    case "ADMIN_CLERK":
    case "MEDICAL_OFFICER":
    case "CAMP_MANAGER":
    case "LOGISTICS_TRANSPORT_COORDINATOR":
    case "SITE_PETTY_CASH_MANAGER":
    case Role.FUEL_ADMIN_LOGISTICS:
      return Role.FUEL_ADMIN_LOGISTICS;

    // Maintenance → ENGINE_MECHANIC
    case "WORKSHOP_MANAGER":
    case "HEAVY_EQUIPMENT_MECHANIC":
    case "WELDER_FABRICATOR":
    case "LIGHT_VEHICLE_MECHANIC":
    case Role.ENGINE_MECHANIC:
      return Role.ENGINE_MECHANIC;

    // Electrical → ELECTRICAL_MECHANIC
    case "AUTO_ELECTRICIAN":
    case Role.ELECTRICAL_MECHANIC:
      return Role.ELECTRICAL_MECHANIC;

    // Security → GATE_SECURITY
    case "SECURITY_MANAGER":
    case "SECURITY_GUARD":
    case Role.GATE_SECURITY:
      return Role.GATE_SECURITY;

    // Helper → GREASING_WASHING_HELPER
    case "GENERAL_WORKER":
    case Role.GREASING_WASHING_HELPER:
      return Role.GREASING_WASHING_HELPER;

    // System Admin stays
    case Role.SYSTEM_ADMIN:
      return Role.SYSTEM_ADMIN;

    default:
      return role as Role;
  }
}

/**
 * Checks whether the given role should have admin dashboard access.
 */
export function hasAdminAccess(role: Role): boolean {
  return role === Role.SITE_CONTROLLER || role === Role.SYSTEM_ADMIN;
}
