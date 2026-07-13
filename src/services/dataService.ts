// ---------------------------------------------------------------------------
// dataService.ts
// Abstraction layer for data persistence.
// In demo mode every operation targets localStorage.
// When Amplify / DynamoDB is wired up, swap the implementation behind
// these same function signatures so the rest of the app stays unchanged.
// ---------------------------------------------------------------------------

/**
 * Returns true when AWS Amplify has been configured with valid credentials.
 * For now this is a placeholder that always returns false (demo mode).
 */
export function isAmplifyConfigured(): boolean {
  // TODO: check Amplify.configure() state / env vars once backend is live
  return false;
}

// ---------------------------------------------------------------------------
// CRUD helpers – localStorage implementation (demo mode)
// ---------------------------------------------------------------------------

/**
 * Persist a JSON-serialisable value under the given key.
 */
export function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`[dataService] saveData failed for key "${key}":`, err);
  }
}

/**
 * Load a previously-persisted value. Returns `null` when the key does not
 * exist or the stored value cannot be parsed.
 */
export function loadData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`[dataService] loadData failed for key "${key}":`, err);
    return null;
  }
}

/**
 * Remove a single key from the store.
 */
export function removeData(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`[dataService] removeData failed for key "${key}":`, err);
  }
}

/**
 * Return all stored entries whose key starts with the given prefix.
 * Each result contains the full `key` and the parsed `value`.
 *
 * This is the localStorage equivalent of a DynamoDB `begins_with` query –
 * useful for fetching all KPI entries for a particular user, etc.
 */
export function queryData<T>(prefix: string): Array<{ key: string; value: T }> {
  const results: Array<{ key: string; value: T }> = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const raw = localStorage.getItem(key);
        if (raw !== null) {
          try {
            results.push({ key, value: JSON.parse(raw) as T });
          } catch {
            // skip unparseable entries
          }
        }
      }
    }
  } catch (err) {
    console.error(`[dataService] queryData failed for prefix "${prefix}":`, err);
  }

  return results;
}
