import { DEMO_USERS } from '../contexts/AuthContext';
import { ROLE_KPI_PROFILES } from '../types/kpiDefinitions';
import { Role } from '../types/roles';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface KPIEntry {
  id: string;
  userId: string;
  role: string;
  orgId: string;
  siteId: string;
  entryDate: string;       // YYYY-MM-DD
  shift: 'DAY' | 'NIGHT';
  values: Record<string, number>;
  submittedAt: string;      // ISO 8601
  status: 'SUBMITTED';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format a Date as YYYY-MM-DD using local calendar values.
 */
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Generate a randomised value around a target with +/- 20% variation.
 *
 * Special handling:
 *  - 'percentage' fields are clamped to [0, 100].
 *  - Fields whose target is 0 occasionally produce 0 or 1.
 */
function randomiseValue(
  defaultTarget: number,
  fieldType: string,
): number {
  // Target of 0 — occasionally produce 0 or 1
  if (defaultTarget === 0) {
    const roll = Math.random();
    if (roll < 0.7) return 0;   // 70 % chance of zero
    return 1;                    // 30 % chance of one
  }

  // +/- 20 % around the target
  const variation = defaultTarget * 0.2;
  const raw = defaultTarget + (Math.random() * 2 - 1) * variation;

  // Percentages must stay within [0, 100]
  if (fieldType === 'percentage') {
    return Math.round(Math.min(100, Math.max(0, raw)) * 100) / 100;
  }

  // Counts/integers — round to nearest whole number, minimum 0
  if (fieldType === 'count') {
    return Math.max(0, Math.round(raw));
  }

  // Everything else — two-decimal precision, minimum 0
  return Math.max(0, Math.round(raw * 100) / 100);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Seeds 30 days of realistic KPI data for every demo user (except
 * SYSTEM_ADMIN) on first load.  Subsequent calls are no-ops because a
 * sentinel key is written to localStorage after the first successful run.
 */
export function seedDemoKPIData(): void {
  // Guard — only seed once
  if (localStorage.getItem('demo_kpi_seeded')) {
    return;
  }

  const today = new Date();

  for (const user of DEMO_USERS) {
    // Skip the system administrator — no operational KPIs
    if (user.role === Role.SYSTEM_ADMIN) {
      continue;
    }

    const profile = ROLE_KPI_PROFILES[user.role as Role];
    if (!profile) {
      continue;
    }

    const history: KPIEntry[] = [];

    for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
      const entryDate = new Date(today);
      entryDate.setDate(today.getDate() - daysAgo);
      const dateString = formatDate(entryDate);

      // Alternate shift per day (even days = DAY, odd days = NIGHT)
      const shift: 'DAY' | 'NIGHT' = daysAgo % 2 === 0 ? 'DAY' : 'NIGHT';

      // Build the KPI values record from the profile
      const values: Record<string, number> = {};
      for (const category of profile.categories) {
        for (const field of category.fields) {
          values[field.key] = randomiseValue(field.defaultTarget, field.type);
        }
      }

      // Assemble the entry
      const entry: KPIEntry = {
        id: `seed_${user.id}_${dateString}`,
        userId: user.id,
        role: user.role,
        orgId: user.orgId,
        siteId: user.siteId,
        entryDate: dateString,
        shift,
        values,
        submittedAt: entryDate.toISOString(),
        status: 'SUBMITTED',
      };

      // Persist the individual entry
      const storageKey = `kpi_${user.id}_${dateString}_${shift}`;
      localStorage.setItem(storageKey, JSON.stringify(entry));

      history.push(entry);
    }

    // Persist the full history array for this user
    localStorage.setItem(`kpi_history_${user.id}`, JSON.stringify(history));
  }

  // Mark as seeded so we never run again
  localStorage.setItem('demo_kpi_seeded', 'true');
}

/**
 * Removes all seeded demo KPI data from localStorage.
 */
export function clearDemoData(): void {
  const today = new Date();

  for (const user of DEMO_USERS) {
    if (user.role === Role.SYSTEM_ADMIN) {
      continue;
    }

    // Remove individual day entries
    for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
      const entryDate = new Date(today);
      entryDate.setDate(today.getDate() - daysAgo);
      const dateString = formatDate(entryDate);
      const shift = daysAgo % 2 === 0 ? 'DAY' : 'NIGHT';

      localStorage.removeItem(`kpi_${user.id}_${dateString}_${shift}`);
    }

    // Remove the aggregated history
    localStorage.removeItem(`kpi_history_${user.id}`);
  }

  // Remove the sentinel so data can be re-seeded later
  localStorage.removeItem('demo_kpi_seeded');
}
