import { Role } from "./roles";

/**
 * Represents a node in the role hierarchy tree.
 * Each node defines a role, its department, and which roles report directly to it.
 */
export interface RoleHierarchyNode {
  role: Role;
  department: string;
  directReports: Role[];
}

/**
 * Complete role hierarchy mapping for the Titan Mining organisation.
 * Each role is mapped to its department and direct reports.
 */
export const ROLE_HIERARCHY: Record<Role, RoleHierarchyNode> = {
  // --- Management ---
  [Role.MINE_MANAGER]: {
    role: Role.MINE_MANAGER,
    department: "Management",
    directReports: [
      Role.OPERATIONS_MANAGER,
      Role.FINANCE_MANAGER,
      Role.HR_MANAGER,
      Role.SAFETY_COMPLIANCE_MANAGER,
    ],
  },
  [Role.OPERATIONS_MANAGER]: {
    role: Role.OPERATIONS_MANAGER,
    department: "Management",
    directReports: [
      Role.MINE_FOREMAN,
      Role.PLANT_MANAGER,
      Role.WORKSHOP_MANAGER,
      Role.SECURITY_MANAGER,
      Role.CAMP_MANAGER,
      Role.LOGISTICS_TRANSPORT_COORDINATOR,
      Role.SITE_CONTROLLER,
    ],
  },
  [Role.FINANCE_MANAGER]: {
    role: Role.FINANCE_MANAGER,
    department: "Finance",
    directReports: [
      Role.ACCOUNTANT,
      Role.SITE_PETTY_CASH_MANAGER,
      Role.FUEL_ADMIN_LOGISTICS,
      Role.PROCUREMENT_OFFICER,
    ],
  },
  [Role.HR_MANAGER]: {
    role: Role.HR_MANAGER,
    department: "HR & Admin",
    directReports: [
      Role.ADMIN_CLERK,
      Role.COMMUNITY_RELATIONS_OFFICER,
      Role.MEDICAL_OFFICER,
    ],
  },
  [Role.SAFETY_COMPLIANCE_MANAGER]: {
    role: Role.SAFETY_COMPLIANCE_MANAGER,
    department: "Management",
    directReports: [],
  },

  // --- Operations (Mining) ---
  [Role.MINE_FOREMAN]: {
    role: Role.MINE_FOREMAN,
    department: "Operations (Mining)",
    directReports: [
      Role.EXCAVATOR_OPERATOR,
      Role.MINING_GEOLOGY_LEAD,
      Role.DRILLER_SAMPLING_CREW,
      Role.GENERAL_WORKER,
    ],
  },
  [Role.MINING_GEOLOGY_LEAD]: {
    role: Role.MINING_GEOLOGY_LEAD,
    department: "Operations (Mining)",
    directReports: [],
  },
  [Role.EXCAVATOR_OPERATOR]: {
    role: Role.EXCAVATOR_OPERATOR,
    department: "Operations (Mining)",
    directReports: [],
  },
  [Role.DRILLER_SAMPLING_CREW]: {
    role: Role.DRILLER_SAMPLING_CREW,
    department: "Operations (Mining)",
    directReports: [],
  },
  [Role.GENERAL_WORKER]: {
    role: Role.GENERAL_WORKER,
    department: "Operations (Mining)",
    directReports: [],
  },

  // --- Operations (Processing) ---
  [Role.PLANT_MANAGER]: {
    role: Role.PLANT_MANAGER,
    department: "Operations (Processing)",
    directReports: [
      Role.PROCESSING_RECOVERY_LEAD,
      Role.DRUM_PUMP_SUPERVISOR,
      Role.DRUM_PUMP_ASSISTANT,
      Role.CENTRIFUGE_OPERATOR,
      Role.SHAKING_TABLE_OPERATOR,
      Role.DREDGE_OPERATOR,
      Role.PROCESS_PLANT_OPERATOR,
      Role.PUMP_OPERATOR,
      Role.ASSAY_LAB_TECHNICIAN,
    ],
  },
  [Role.PROCESSING_RECOVERY_LEAD]: {
    role: Role.PROCESSING_RECOVERY_LEAD,
    department: "Operations (Processing)",
    directReports: [],
  },
  [Role.DRUM_PUMP_SUPERVISOR]: {
    role: Role.DRUM_PUMP_SUPERVISOR,
    department: "Operations (Processing)",
    directReports: [],
  },
  [Role.DRUM_PUMP_ASSISTANT]: {
    role: Role.DRUM_PUMP_ASSISTANT,
    department: "Operations (Processing)",
    directReports: [],
  },
  [Role.CENTRIFUGE_OPERATOR]: {
    role: Role.CENTRIFUGE_OPERATOR,
    department: "Operations (Processing)",
    directReports: [],
  },
  [Role.SHAKING_TABLE_OPERATOR]: {
    role: Role.SHAKING_TABLE_OPERATOR,
    department: "Operations (Processing)",
    directReports: [],
  },
  [Role.DREDGE_OPERATOR]: {
    role: Role.DREDGE_OPERATOR,
    department: "Operations (Processing)",
    directReports: [],
  },
  [Role.PROCESS_PLANT_OPERATOR]: {
    role: Role.PROCESS_PLANT_OPERATOR,
    department: "Operations (Processing)",
    directReports: [],
  },
  [Role.PUMP_OPERATOR]: {
    role: Role.PUMP_OPERATOR,
    department: "Operations (Processing)",
    directReports: [],
  },
  [Role.ASSAY_LAB_TECHNICIAN]: {
    role: Role.ASSAY_LAB_TECHNICIAN,
    department: "Operations (Processing)",
    directReports: [],
  },

  // --- Operations (Maintenance) ---
  [Role.WORKSHOP_MANAGER]: {
    role: Role.WORKSHOP_MANAGER,
    department: "Operations (Maintenance)",
    directReports: [
      Role.ENGINE_MECHANIC,
      Role.ELECTRICAL_MECHANIC,
      Role.HEAVY_EQUIPMENT_MECHANIC,
      Role.AUTO_ELECTRICIAN,
      Role.WELDER_FABRICATOR,
      Role.LIGHT_VEHICLE_MECHANIC,
      Role.GREASING_WASHING_HELPER,
    ],
  },
  [Role.ENGINE_MECHANIC]: {
    role: Role.ENGINE_MECHANIC,
    department: "Operations (Maintenance)",
    directReports: [],
  },
  [Role.ELECTRICAL_MECHANIC]: {
    role: Role.ELECTRICAL_MECHANIC,
    department: "Operations (Maintenance)",
    directReports: [],
  },
  [Role.HEAVY_EQUIPMENT_MECHANIC]: {
    role: Role.HEAVY_EQUIPMENT_MECHANIC,
    department: "Operations (Maintenance)",
    directReports: [],
  },
  [Role.AUTO_ELECTRICIAN]: {
    role: Role.AUTO_ELECTRICIAN,
    department: "Operations (Maintenance)",
    directReports: [],
  },
  [Role.WELDER_FABRICATOR]: {
    role: Role.WELDER_FABRICATOR,
    department: "Operations (Maintenance)",
    directReports: [],
  },
  [Role.LIGHT_VEHICLE_MECHANIC]: {
    role: Role.LIGHT_VEHICLE_MECHANIC,
    department: "Operations (Maintenance)",
    directReports: [],
  },
  [Role.GREASING_WASHING_HELPER]: {
    role: Role.GREASING_WASHING_HELPER,
    department: "Operations (Maintenance)",
    directReports: [],
  },

  // --- Security ---
  [Role.SECURITY_MANAGER]: {
    role: Role.SECURITY_MANAGER,
    department: "Security",
    directReports: [
      Role.GATE_SECURITY,
      Role.SECURITY_GUARD,
    ],
  },
  [Role.GATE_SECURITY]: {
    role: Role.GATE_SECURITY,
    department: "Security",
    directReports: [],
  },
  [Role.SECURITY_GUARD]: {
    role: Role.SECURITY_GUARD,
    department: "Security",
    directReports: [],
  },

  // --- Finance ---
  [Role.ACCOUNTANT]: {
    role: Role.ACCOUNTANT,
    department: "Finance",
    directReports: [],
  },
  [Role.SITE_PETTY_CASH_MANAGER]: {
    role: Role.SITE_PETTY_CASH_MANAGER,
    department: "Finance",
    directReports: [],
  },
  [Role.FUEL_ADMIN_LOGISTICS]: {
    role: Role.FUEL_ADMIN_LOGISTICS,
    department: "Finance",
    directReports: [],
  },
  [Role.PROCUREMENT_OFFICER]: {
    role: Role.PROCUREMENT_OFFICER,
    department: "Finance",
    directReports: [],
  },

  // --- HR & Admin ---
  [Role.ADMIN_CLERK]: {
    role: Role.ADMIN_CLERK,
    department: "HR & Admin",
    directReports: [],
  },
  [Role.COMMUNITY_RELATIONS_OFFICER]: {
    role: Role.COMMUNITY_RELATIONS_OFFICER,
    department: "HR & Admin",
    directReports: [],
  },
  [Role.MEDICAL_OFFICER]: {
    role: Role.MEDICAL_OFFICER,
    department: "HR & Admin",
    directReports: [],
  },

  // --- Support ---
  [Role.SITE_CONTROLLER]: {
    role: Role.SITE_CONTROLLER,
    department: "Support",
    directReports: [],
  },
  [Role.CAMP_MANAGER]: {
    role: Role.CAMP_MANAGER,
    department: "Support",
    directReports: [],
  },
  [Role.LOGISTICS_TRANSPORT_COORDINATOR]: {
    role: Role.LOGISTICS_TRANSPORT_COORDINATOR,
    department: "Support",
    directReports: [],
  },
  [Role.SYSTEM_ADMIN]: {
    role: Role.SYSTEM_ADMIN,
    department: "Support",
    directReports: [],
  },
};

/**
 * Recursively collects all subordinate roles beneath the given role
 * in the hierarchy tree.
 *
 * @param role - The role whose subordinates to retrieve.
 * @returns An array of all roles that fall under the given role, at any depth.
 */
export function getAllSubordinates(role: Role): Role[] {
  const node = ROLE_HIERARCHY[role];
  if (!node || node.directReports.length === 0) {
    return [];
  }

  const subordinates: Role[] = [];

  for (const directReport of node.directReports) {
    subordinates.push(directReport);
    subordinates.push(...getAllSubordinates(directReport));
  }

  return subordinates;
}

/**
 * Returns the reporting chain from the given role up to the top of the
 * hierarchy (MINE_MANAGER). The returned array starts with the immediate
 * supervisor and ends with the top-level role.
 *
 * If the role is already at the top (MINE_MANAGER) or has no supervisor,
 * an empty array is returned.
 *
 * @param role - The role whose upward reporting chain to retrieve.
 * @returns An ordered array of roles from the immediate supervisor to the top.
 */
export function getReportingChain(role: Role): Role[] {
  // Build a reverse lookup: child -> parent
  const parentMap = new Map<Role, Role>();

  for (const [parentRole, node] of Object.entries(ROLE_HIERARCHY)) {
    for (const directReport of node.directReports) {
      parentMap.set(directReport, parentRole as Role);
    }
  }

  const chain: Role[] = [];
  let current: Role | undefined = parentMap.get(role);

  while (current !== undefined) {
    chain.push(current);
    current = parentMap.get(current);
  }

  return chain;
}
