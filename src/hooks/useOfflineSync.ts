import { useEffect, useState } from 'react';

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

    // Load queue from localStorage
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
        // In a real app we would call AppSync API here
        console.log(`Syncing report ${item.reportType} offline draft to backend...`);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Remove from queue on success
        const newQueue = queue.filter(q => q.id !== item.id);
        setQueue(newQueue);
        localStorage.setItem('offlineQueue', JSON.stringify(newQueue));
      } catch (error) {
        // Increment retry count
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
