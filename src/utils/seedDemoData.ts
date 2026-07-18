// ---------------------------------------------------------------------------
// seedDemoData.ts
// Demo data seeding - disabled in production mode.
// This module is retained for local development/testing only.
// ---------------------------------------------------------------------------

/**
 * No-op in production. Demo data seeding is disabled when Amplify
 * is configured with a real backend.
 */
export function seedDemoKPIData(): void {
  // Disabled — real data comes from AppSync/DynamoDB
}

export function clearDemoData(): void {
  // No-op
}
