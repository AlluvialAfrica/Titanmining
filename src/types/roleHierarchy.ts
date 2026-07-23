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
 * Flat role hierarchy matching the PDF Site Work Structure.
 * SITE_CONTROLLER sits at the top as root.
 * All 7 operational roles report directly to SITE_CONTROLLER,
 * except GREASING_WASHING_HELPER which reports to ENGINE_MECHANIC per PDF.
 */
export const ROLE_HIERARCHY: Record<Role, RoleHierarchyNode> = {
  [Role.SITE_CONTROLLER]: {
    role: Role.SITE_CONTROLLER,
    department: "Site Management",
    directReports: [
      Role.MINING_GEOLOGY_LEAD,
      Role.PROCESSING_RECOVERY_LEAD,
      Role.FUEL_ADMIN_LOGISTICS,
      Role.ENGINE_MECHANIC,
      Role.ELECTRICAL_MECHANIC,
      Role.GATE_SECURITY,
    ],
  },

  [Role.MINING_GEOLOGY_LEAD]: {
    role: Role.MINING_GEOLOGY_LEAD,
    department: "Mining & Geology",
    directReports: [],
  },

  [Role.PROCESSING_RECOVERY_LEAD]: {
    role: Role.PROCESSING_RECOVERY_LEAD,
    department: "Processing & Recovery",
    directReports: [],
  },

  [Role.FUEL_ADMIN_LOGISTICS]: {
    role: Role.FUEL_ADMIN_LOGISTICS,
    department: "Fuel, Admin & Logistics",
    directReports: [],
  },

  [Role.ENGINE_MECHANIC]: {
    role: Role.ENGINE_MECHANIC,
    department: "Maintenance (Engine)",
    directReports: [
      Role.GREASING_WASHING_HELPER,
    ],
  },

  [Role.ELECTRICAL_MECHANIC]: {
    role: Role.ELECTRICAL_MECHANIC,
    department: "Maintenance (Electrical)",
    directReports: [],
  },

  [Role.GREASING_WASHING_HELPER]: {
    role: Role.GREASING_WASHING_HELPER,
    department: "Maintenance (Support)",
    directReports: [],
  },

  [Role.GATE_SECURITY]: {
    role: Role.GATE_SECURITY,
    department: "Security",
    directReports: [],
  },

  [Role.SYSTEM_ADMIN]: {
    role: Role.SYSTEM_ADMIN,
    department: "System Administration",
    directReports: [],
  },
};

/**
 * Recursively collects all subordinate roles beneath the given role
 * in the hierarchy tree.
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
 * hierarchy (SITE_CONTROLLER). The returned array starts with the immediate
 * supervisor and ends with the top-level role.
 */
export function getReportingChain(role: Role): Role[] {
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
