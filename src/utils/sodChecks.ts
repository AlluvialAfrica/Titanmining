import { Role } from '../types/roles';

export interface SodViolation {
  ruleId: string;
  name: string;
  violation: string;
}

export const SOD_RULES = [
  {
    id: "SOD_01",
    name: "Controller cannot handle gold",
    description: "Site Controller cannot be listed as 'Received From' or 'Handed Over To' in Gold Recovery",
    check: (report: any, userRole: Role, userId: string) =>
      (userRole === Role.SITE_CONTROLLER || userRole === Role.SYSTEM_ADMIN) &&
      (report.receivedFrom === userId || report.handedOverTo === userId),
    violation: "Site Controller cannot physically handle gold recovery",
  },
  {
    id: "SOD_02",
    name: "Controller cannot issue fuel alone",
    description: "Fuel issue requires dual signature (issuer + receiver must be different)",
    check: (report: any) =>
      report.issuedBy && report.receivedBy && report.issuedBy === report.receivedBy,
    violation: "Fuel issue requires different issuer and receiver",
  },
  {
    id: "SOD_03",
    name: "Recovery Lead cannot store gold",
    description: "Gold handover requires third-party (Controller) sign-off",
    check: (report: any) =>
      report.receivedBy && report.handedOverTo && report.receivedBy === report.handedOverTo,
    violation: "Gold handover requires independent verifier",
  },
  {
    id: "SOD_04",
    name: "Gate Security isolation",
    description: "Gate Security cannot access Processing, Recovery, or Fuel forms",
    check: (reportType: string, userRole: Role) =>
      userRole === Role.GATE_SECURITY &&
      ["TEMPLATE_04", "TEMPLATE_06", "TEMPLATE_07", "TEMPLATE_08", "TEMPLATE_09"].includes(reportType),
    violation: "Gate Security cannot access operational forms",
  },
  {
    id: "SOD_05",
    name: "Greasing/Washing Helper isolation",
    description: "Greasing, Washing & Mechanic Helper cannot access forms outside maintenance",
    check: (reportType: string, userRole: Role) =>
      userRole === Role.GREASING_WASHING_HELPER &&
      ["TEMPLATE_04", "TEMPLATE_06", "TEMPLATE_07", "TEMPLATE_08", "TEMPLATE_09", "TEMPLATE_12", "TEMPLATE_14", "TEMPLATE_15"].includes(reportType),
    violation: "Greasing/Washing Helper cannot access non-maintenance forms",
  },
];

export function checkSoD(reportType: string, reportData: any, userRole: Role, userId: string): SodViolation | null {
  // Gate Security Isolation
  if (userRole === Role.GATE_SECURITY && ["TEMPLATE_04", "TEMPLATE_06", "TEMPLATE_07", "TEMPLATE_08", "TEMPLATE_09"].includes(reportType)) {
    return {
      ruleId: "SOD_04",
      name: "Gate Security isolation",
      violation: "Gate Security cannot access operational forms",
    };
  }

  // Greasing/Washing Helper Isolation
  if (userRole === Role.GREASING_WASHING_HELPER && ["TEMPLATE_04", "TEMPLATE_06", "TEMPLATE_07", "TEMPLATE_08", "TEMPLATE_09", "TEMPLATE_12", "TEMPLATE_14", "TEMPLATE_15"].includes(reportType)) {
    return {
      ruleId: "SOD_05",
      name: "Greasing/Washing Helper isolation",
      violation: "Greasing/Washing Helper cannot access non-maintenance forms",
    };
  }

  // Gold Recovery checks
  if (reportType === "TEMPLATE_09") {
    if ((userRole === Role.SITE_CONTROLLER || userRole === Role.SYSTEM_ADMIN) && (reportData.receivedFrom === userId || reportData.handedOverTo === userId)) {
      return {
        ruleId: "SOD_01",
        name: "Site Controller cannot handle gold",
        violation: "Site Controller cannot physically handle gold recovery",
      };
    }
    if (reportData.receivedBy && reportData.handedOverTo && reportData.receivedBy === reportData.handedOverTo) {
      return {
        ruleId: "SOD_03",
        name: "Recovery Lead cannot store gold",
        violation: "Gold handover requires independent verifier",
      };
    }
  }

  // Fuel Reconciliation checks
  if (reportType === "TEMPLATE_04") {
    if (reportData.issuedBy && reportData.receivedBy && reportData.issuedBy === reportData.receivedBy) {
      return {
        ruleId: "SOD_02",
        name: "Controller cannot issue fuel alone",
        violation: "Fuel issue requires different issuer and receiver",
      };
    }
  }

  return null;
}
