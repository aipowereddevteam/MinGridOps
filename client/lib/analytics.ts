import { Habit, HabitLog } from '@/store/habitStore';

const DEFAULT_31_ZERO_BITS = '0000000000000000000000000000000';

export interface DailyCompletionPoint {
  dayNumber: number;
  dayLabel: string;
  completed: number;
  open: number;
  total: number;
  rate: number;
}

export interface DoneVsOpenPoint {
  name: string;
  value: number;
  color: string;
}

export interface WeeklyTrendPoint {
  week: string;
  rate: number;
  completed: number;
  total: number;
}

export interface TopHabitPoint {
  name: string;
  color: string;
  completedCount: number;
  completionRate: number;
}

/**
 * Calculates daily completed vs open habits for each day of the month
 */
export function calculateDailyCompletionData(
  habits: Habit[],
  logs: Record<string, HabitLog>,
  daysInMonth: number
): DailyCompletionPoint[] {
  const totalHabits = habits.length;
  if (totalHabits === 0) return [];

  const data: DailyCompletionPoint[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const index = day - 1;
    let completedCount = 0;

    habits.forEach((h) => {
      const log = logs[h._id];
      const str = log?.completionString || DEFAULT_31_ZERO_BITS;
      if (str[index] === '1') {
        completedCount++;
      }
    });

    const openCount = totalHabits - completedCount;
    const rate = Math.round((completedCount / totalHabits) * 100);

    data.push({
      dayNumber: day,
      dayLabel: `Day ${day}`,
      completed: completedCount,
      open: openCount,
      total: totalHabits,
      rate,
    });
  }

  return data;
}

/**
 * Calculates total Done vs Open habits ratio for pie/donut chart
 */
export function calculateDoneVsOpenData(
  habits: Habit[],
  logs: Record<string, HabitLog>,
  daysInMonth: number
): DoneVsOpenPoint[] {
  const totalPossible = habits.length * daysInMonth;
  if (totalPossible === 0) {
    return [
      { name: 'Completed', value: 0, color: '#10b981' },
      { name: 'Pending', value: 1, color: '#1e293b' },
    ];
  }

  let totalCompleted = 0;

  habits.forEach((h) => {
    const log = logs[h._id];
    const str = log?.completionString || DEFAULT_31_ZERO_BITS;
    for (let i = 0; i < daysInMonth; i++) {
      if (str[i] === '1') {
        totalCompleted++;
      }
    }
  });

  const totalOpen = totalPossible - totalCompleted;

  return [
    { name: 'Completed', value: totalCompleted, color: '#10b981' },
    { name: 'Open / Pending', value: totalOpen, color: '#1e293b' },
  ];
}

/**
 * Calculates weekly completion trend (Week 1, Week 2, Week 3, Week 4)
 */
export function calculateWeeklyTrendData(
  habits: Habit[],
  logs: Record<string, HabitLog>,
  daysInMonth: number
): WeeklyTrendPoint[] {
  const dailyData = calculateDailyCompletionData(habits, logs, daysInMonth);
  if (dailyData.length === 0) return [];

  const weeks = [
    { label: 'Week 1', start: 1, end: 7 },
    { label: 'Week 2', start: 8, end: 14 },
    { label: 'Week 3', start: 15, end: 21 },
    { label: 'Week 4', start: 22, end: daysInMonth },
  ];

  return weeks.map((w) => {
    const daysInWeek = dailyData.filter(
      (d) => d.dayNumber >= w.start && d.dayNumber <= w.end
    );

    const completedSum = daysInWeek.reduce((sum, d) => sum + d.completed, 0);
    const totalSum = daysInWeek.reduce((sum, d) => sum + d.total, 0);
    const rate = totalSum > 0 ? Math.round((completedSum / totalSum) * 100) : 0;

    return {
      week: w.label,
      rate,
      completed: completedSum,
      total: totalSum,
    };
  });
}

/**
 * Calculates top habits by completion rate for horizontal bar chart
 */
export function calculateTopHabitsData(
  habits: Habit[],
  logs: Record<string, HabitLog>,
  daysInMonth: number
): TopHabitPoint[] {
  if (habits.length === 0) return [];

  const habitsWithStats = habits.map((h) => {
    const log = logs[h._id];
    const str = log?.completionString || DEFAULT_31_ZERO_BITS;
    let completedCount = 0;

    for (let i = 0; i < daysInMonth; i++) {
      if (str[i] === '1') {
        completedCount++;
      }
    }

    const completionRate = Math.round((completedCount / daysInMonth) * 100);

    return {
      name: h.title,
      color: h.color || '#6366f1',
      completedCount,
      completionRate,
    };
  });

  // Sort descending by completion rate
  return habitsWithStats.sort((a, b) => b.completionRate - a.completionRate);
}
