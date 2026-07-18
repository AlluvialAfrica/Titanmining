import { useEffect, useState } from 'react';
import { getDataClient } from '../services/dataService';
import { logger } from '../utils/logger';

const MAX_QUEUE_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_QUEUE_SIZE = 100;
const MAX_RETRIES = 3;

interface QueuedSubmission {
  id: string;
  reportType: string;
  data: any;
  timestamp: number;
  retries: number;
}

function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    logger.warn(`Failed to parse localStorage key "${key}":`, err);
    return fallback;
  }
}

function safeSetJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    logger.error(`Failed to write localStorage key "${key}":`, err);
  }
}

/**
 * Remove expired items (older than MAX_QUEUE_AGE_MS) and items that
 * have exceeded MAX_RETRIES from the queue.
 */
function cleanQueue(items: QueuedSubmission[]): QueuedSubmission[] {
  const now = Date.now();
  return items.filter(item => {
    if (now - item.timestamp > MAX_QUEUE_AGE_MS) {
      logger.warn(`Removing expired offline queue item ${item.id} (age: ${Math.round((now - item.timestamp) / 86400000)}d)`);
      return false;
    }
    if (item.retries >= MAX_RETRIES) {
      logger.warn(`Removing failed offline queue item ${item.id} (retries: ${item.retries})`);
      return false;
    }
    return true;
  });
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<QueuedSubmission[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load and clean queue on mount
    const raw = safeGetJSON<QueuedSubmission[]>('offlineQueue', []);
    const cleaned = cleanQueue(raw);
    if (cleaned.length !== raw.length) {
      safeSetJSON('offlineQueue', cleaned);
    }
    setQueue(cleaned);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToQueue = (submission: Omit<QueuedSubmission, 'id' | 'timestamp' | 'retries'>) => {
    const item: QueuedSubmission = {
      ...submission,
      id: `queue_${Date.now()}`,
      timestamp: Date.now(),
      retries: 0,
    };

    // Enforce max queue size by dropping oldest items
    let newQueue = [...queue, item];
    if (newQueue.length > MAX_QUEUE_SIZE) {
      const overflow = newQueue.length - MAX_QUEUE_SIZE;
      logger.warn(`Offline queue full (${MAX_QUEUE_SIZE}), dropping ${overflow} oldest items.`);
      newQueue = newQueue.slice(overflow);
    }

    setQueue(newQueue);
    safeSetJSON('offlineQueue', newQueue);
  };

  const processQueue = async () => {
    const pending = queue.filter(item => item.retries < MAX_RETRIES);

    for (const item of pending) {
      try {
        const client = getDataClient();
        await client.models.DailyReport.create(item.data);

        // Remove from queue on success
        const newQueue = queue.filter(q => q.id !== item.id);
        setQueue(newQueue);
        safeSetJSON('offlineQueue', newQueue);
      } catch (error) {
        logger.error(`Failed to sync queued report ${item.id}:`, error);
        const newQueue = queue.map(q =>
          q.id === item.id ? { ...q, retries: q.retries + 1 } : q
        );
        setQueue(newQueue);
        safeSetJSON('offlineQueue', newQueue);
      }
    }
  };

  return { isOnline, queue, addToQueue, processQueue };
}
