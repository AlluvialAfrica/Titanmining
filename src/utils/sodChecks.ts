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
      userRole === Role.SITE_CONTROLLER && 
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

  // Gold Recovery checks
  if (reportType === "TEMPLATE_09") {
    if (userRole === Role.SITE_CONTROLLER && (reportData.receivedFrom === userId || reportData.handedOverTo === userId)) {
      return {
        ruleId: "SOD_01",
        name: "Controller cannot handle gold",
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
