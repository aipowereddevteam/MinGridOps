import { api } from './api';

export interface PendingToggle {
  habitId: string;
  day: number;
  monthYear: string;
  timestamp: number;
}

const QUEUE_STORAGE_KEY = 'mingrid_offline_queue';

/**
 * Get all pending toggles from localStorage
 */
export function getPendingQueue(): PendingToggle[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save a new pending toggle to offline localStorage queue
 */
export function savePendingToggle(item: Omit<PendingToggle, 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  try {
    const queue = getPendingQueue();
    // Avoid duplicate toggles for same day & habit in queue
    const filtered = queue.filter(
      (q) => !(q.habitId === item.habitId && q.day === item.day && q.monthYear === item.monthYear)
    );

    filtered.push({
      ...item,
      timestamp: Date.now(),
    });

    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    // LocalStorage full or error
  }
}

/**
 * Clear the offline queue
 */
export function clearPendingQueue(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(QUEUE_STORAGE_KEY);
  } catch (e) {}
}

/**
 * Process and sync pending offline toggles sequentially with the backend
 */
export async function processOfflineQueue(): Promise<number> {
  const queue = getPendingQueue();
  if (queue.length === 0) return 0;

  let syncedCount = 0;
  const remainingQueue: PendingToggle[] = [];

  for (const item of queue) {
    try {
      await api.patch('/auth/me'); // Light connectivity ping check or direct toggle
      await api.patch('/habit-logs/toggle', {
        habitId: item.habitId,
        day: item.day,
        monthYear: item.monthYear,
      });
      syncedCount++;
    } catch (error: any) {
      // If server error or offline, keep in queue
      if (!error.response || error.code === 'ERR_NETWORK') {
        remainingQueue.push(item);
      }
    }
  }

  if (remainingQueue.length > 0) {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remainingQueue));
  } else {
    clearPendingQueue();
  }

  return syncedCount;
}
