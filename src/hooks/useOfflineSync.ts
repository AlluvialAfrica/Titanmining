import { useEffect, useState } from 'react';
import { getDataClient } from '../services/dataService';

interface QueuedSubmission {
  id: string;
  reportType: string;
  data: any;
  timestamp: number;
  retries: number;
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

    const saved = localStorage.getItem('offlineQueue');
    if (saved) setQueue(JSON.parse(saved));

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
    localStorage.setItem('offlineQueue', JSON.stringify(newQueue));
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
        localStorage.setItem('offlineQueue', JSON.stringify(newQueue));
      } catch (error) {
        console.error(`Failed to sync queued report ${item.id}:`, error);
        const newQueue = queue.map(q =>
          q.id === item.id ? { ...q, retries: q.retries + 1 } : q
        );
        setQueue(newQueue);
        localStorage.setItem('offlineQueue', JSON.stringify(newQueue));
      }
    }
  };

  return { isOnline, queue, addToQueue, processQueue };
}
