import { create } from 'zustand';
import { api } from '@/lib/api';
import confetti from 'canvas-confetti';

export interface Habit {
  _id: string;
  title: string;
  icon: string;
  color: string;
  position: number;
  createdAt?: string;
}

export interface HabitLog {
  _id: string;
  userId: string;
  habitId: string;
  monthYear: string;
  completionString: string;
}

interface HabitState {
  habits: Habit[];
  logs: Record<string, HabitLog>; // Key: habitId
  activeMonthYear: string;
  isLoading: boolean;
  error: string | null;

  fetchHabits: () => Promise<void>;
  createHabit: (data: { title: string; icon?: string; color?: string }) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  fetchLogsForMonth: (monthYear: string) => Promise<void>;
  toggleDay: (habitId: string, day: number, monthYear: string) => Promise<void>;
  clearError: () => void;
}

const DEFAULT_31_ZERO_BITS = '0000000000000000000000000000000';

export const triggerConfetti = () => {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e'],
  });
};

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  logs: {},
  activeMonthYear: new Date().toISOString().slice(0, 7), // "YYYY-MM"
  isLoading: false,
  error: null,

  fetchHabits: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/habits');
      set({ habits: response.data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to load habits' });
    }
  },

  createHabit: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/habits', data);
      const newHabit = response.data;
      set((state) => ({
        habits: [...state.habits, newHabit],
        isLoading: false,
      }));
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to create habit' });
      throw err;
    }
  },

  deleteHabit: async (habitId) => {
    try {
      await api.delete(`/habits/${habitId}`);
      set((state) => {
        const newLogs = { ...state.logs };
        delete newLogs[habitId];
        return {
          habits: state.habits.filter((h) => h._id !== habitId),
          logs: newLogs,
        };
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete habit' });
    }
  },

  fetchLogsForMonth: async (monthYear) => {
    set({ activeMonthYear: monthYear, error: null });
    try {
      const response = await api.get(`/habit-logs/${monthYear}`);
      const logsArray: HabitLog[] = response.data;
      const logsMap: Record<string, HabitLog> = {};

      logsArray.forEach((log) => {
        logsMap[log.habitId] = log;
      });

      set({ logs: logsMap });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load habit logs' });
    }
  },

  toggleDay: async (habitId, day, monthYear) => {
    const { habits, logs } = get();
    const existingLog = logs[habitId];
    const currentString = existingLog?.completionString || DEFAULT_31_ZERO_BITS;
    const paddedString = currentString.length < 31 ? currentString.padEnd(31, '0') : currentString;

    const index = day - 1;
    const currentChar = paddedString[index] || '0';
    const newChar = currentChar === '1' ? '0' : '1';
    const newString =
      paddedString.substring(0, index) + newChar + paddedString.substring(index + 1);

    // Optimistic UI Update
    const optimisticLog: HabitLog = {
      _id: existingLog?._id || 'temp-' + Date.now(),
      userId: existingLog?.userId || '',
      habitId,
      monthYear,
      completionString: newString,
    };

    set({
      logs: {
        ...logs,
        [habitId]: optimisticLog,
      },
    });

    // Check if ALL habits for this day are completed
    const updatedLogs = { ...logs, [habitId]: optimisticLog };
    const todayIndex = new Date().getDate() - 1;
    const isToday = day === new Date().getDate();

    if (isToday && habits.length > 0 && newChar === '1') {
      const allCompleted = habits.every((h) => {
        const log = updatedLogs[h._id];
        const str = log?.completionString || DEFAULT_31_ZERO_BITS;
        return str[todayIndex] === '1';
      });

      if (allCompleted) {
        triggerConfetti();
      }
    }

    try {
      const response = await api.patch('/habit-logs/toggle', {
        habitId,
        day,
        monthYear,
      });

      set({
        logs: {
          ...get().logs,
          [habitId]: response.data,
        },
      });
    } catch (err: any) {
      // Revert on failure
      set({ logs });
      set({ error: 'Failed to update habit status' });
    }
  },

  clearError: () => set({ error: null }),
}));

// Helper logic to calculate streaks from bit string
export function calculateCurrentStreak(completionString: string = DEFAULT_31_ZERO_BITS, targetDay: number = new Date().getDate()): number {
  let streak = 0;
  const index = targetDay - 1;

  for (let i = index; i >= 0; i--) {
    if (completionString[i] === '1') {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function calculateLongestStreak(completionString: string = DEFAULT_31_ZERO_BITS): number {
  let maxStreak = 0;
  let currentStreak = 0;

  for (let i = 0; i < completionString.length; i++) {
    if (completionString[i] === '1') {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
}
