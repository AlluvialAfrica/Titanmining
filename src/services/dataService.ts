// ---------------------------------------------------------------------------
// dataService.ts
// Abstraction layer for data persistence.
// Uses Amplify AppSync/DynamoDB when configured, localStorage as fallback.
// ---------------------------------------------------------------------------

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

let _client: ReturnType<typeof generateClient<Schema>> | null = null;

/**
 * Returns true when AWS Amplify has been configured with valid credentials.
 */
export function isAmplifyConfigured(): boolean {
  try {
    // Check if Amplify outputs have real (non-placeholder) values
    const outputs = (window as any).__amplify_outputs__ || {};
    if (outputs?.auth?.user_pool_id?.includes('placeholder')) return false;
    return true;
  } catch (err) {
    console.warn('[dataService] isAmplifyConfigured check failed:', err);
    return false;
  }
}

/**
 * Get the singleton Amplify data client.
 */
export function getDataClient() {
  if (!_client) {
    _client = generateClient<Schema>();
  }
  return _client;
}

// ---------------------------------------------------------------------------
// CRUD helpers – localStorage implementation (fallback mode)
// ---------------------------------------------------------------------------

export function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`[dataService] saveData failed for key "${key}":`, err);
  }
}

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

export function removeData(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`[dataService] removeData failed for key "${key}":`, err);
  }
}

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
          } catch (parseErr) {
            console.warn(`[dataService] queryData: failed to parse key "${key}":`, parseErr);
          }
        }
      }
    }
  } catch (err) {
    console.error(`[dataService] queryData failed for prefix "${prefix}":`, err);
  }
  return results;
}
