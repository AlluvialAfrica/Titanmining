import { useEffect, useState } from 'react';
import { getDataClient } from '../services/dataService';

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
  } catch {
    return fallback;
  }
}

function safeSetJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write localStorage key "${key}":`, err);
  }
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

    setQueue(safeGetJSON<QueuedSubmission[]>('offlineQueue', []));

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
    const newQueue = [...queue, item];
    setQueue(newQueue);
    safeSetJSON('offlineQueue', newQueue);
  };

  const processQueue = async () => {
    const pending = queue.filter(item => item.retries < 3);

    for (const item of pending) {
      try {
        const client = getDataClient();
        await client.models.DailyReport.create(item.data);

        // Remove from queue on success
        const newQueue = queue.filter(q => q.id !== item.id);
        setQueue(newQueue);
        safeSetJSON('offlineQueue', newQueue);
      } catch (error) {
        console.error(`Failed to sync queued report ${item.id}:`, error);
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
