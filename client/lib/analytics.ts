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
 * Calculates start day for a habit in a target month (1-indexed day).
 * Handles habits created mid-month or in previous/future months.
 */
export function getHabitStartDayInMonth(habit: Habit, monthYearStr: string): number {
  if (!habit.createdAt) return 1;

  try {
    const createdDate = new Date(habit.createdAt);
    const createdYear = createdDate.getFullYear();
    const createdMonth = createdDate.getMonth() + 1; // 1-indexed

    const [targetYearStr, targetMonthStr] = monthYearStr.split('-');
    const targetYear = parseInt(targetYearStr, 10);
    const targetMonth = parseInt(targetMonthStr, 10);

    if (createdYear < targetYear || (createdYear === targetYear && createdMonth < targetMonth)) {
      return 1; // Created in past month -> active from Day 1
    }

    if (createdYear === targetYear && createdMonth === targetMonth) {
      return createdDate.getDate(); // Created this month -> active from created day
    }

    return 32; // Created in future month -> 0 active days
  } catch (e) {
    return 1;
  }
}

/**
 * Calculates daily completed vs open habits for each day of the month
 */
export function calculateDailyCompletionData(
  habits: Habit[],
  logs: Record<string, HabitLog>,
  daysInMonth: number,
  monthYearStr: string = new Date().toISOString().slice(0, 7)
): DailyCompletionPoint[] {
  if (habits.length === 0) return [];

  const data: DailyCompletionPoint[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const index = day - 1;
    let completedCount = 0;
    let activeHabitsCount = 0;

    habits.forEach((h) => {
      const startDay = getHabitStartDayInMonth(h, monthYearStr);
      if (day >= startDay) {
        activeHabitsCount++;
        const log = logs[h._id];
        const str = log?.completionString || DEFAULT_31_ZERO_BITS;
        if (str[index] === '1') {
          completedCount++;
        }
      }
    });

    const openCount = Math.max(0, activeHabitsCount - completedCount);
    const rate = activeHabitsCount > 0 ? Math.round((completedCount / activeHabitsCount) * 100) : 0;

    data.push({
      dayNumber: day,
      dayLabel: `Day ${day}`,
      completed: completedCount,
      open: openCount,
      total: activeHabitsCount,
      rate,
    });
  }

  return data;
}

/**
 * Calculates total Done vs Open habits ratio for pie/donut chart and summary metrics
 * Takes habit creation dates into account so mid-month habits are NOT penalized for prior days!
 */
export function calculateDoneVsOpenData(
  habits: Habit[],
  logs: Record<string, HabitLog>,
  daysInMonth: number,
  monthYearStr: string = new Date().toISOString().slice(0, 7)
): DoneVsOpenPoint[] {
  const now = new Date();
  const currentMonthStr = now.toISOString().slice(0, 7);

  // If active month is current month, evaluate up to today's date
  let maxDayToEvaluate = daysInMonth;
  if (monthYearStr === currentMonthStr) {
    maxDayToEvaluate = now.getDate();
  }

  let totalActiveOpportunities = 0;
  let totalCompleted = 0;

  habits.forEach((h) => {
    const startDay = getHabitStartDayInMonth(h, monthYearStr);
    const log = logs[h._id];
    const str = log?.completionString || DEFAULT_31_ZERO_BITS;

    for (let day = startDay; day <= maxDayToEvaluate; day++) {
      if (day <= daysInMonth) {
        totalActiveOpportunities++;
        if (str[day - 1] === '1') {
          totalCompleted++;
        }
      }
    }
  });

  if (totalActiveOpportunities === 0) {
    return [
      { name: 'Completed', value: 0, color: '#10b981' },
      { name: 'Open / Pending', value: 1, color: '#1e293b' },
    ];
  }

  const totalOpen = Math.max(0, totalActiveOpportunities - totalCompleted);

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
  daysInMonth: number,
  monthYearStr: string = new Date().toISOString().slice(0, 7)
): WeeklyTrendPoint[] {
  const dailyData = calculateDailyCompletionData(habits, logs, daysInMonth, monthYearStr);
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
  daysInMonth: number,
  monthYearStr: string = new Date().toISOString().slice(0, 7)
): TopHabitPoint[] {
  if (habits.length === 0) return [];

  const now = new Date();
  const currentMonthStr = now.toISOString().slice(0, 7);
  let maxDayToEvaluate = daysInMonth;
  if (monthYearStr === currentMonthStr) {
    maxDayToEvaluate = now.getDate();
  }

  const habitsWithStats = habits.map((h) => {
    const startDay = getHabitStartDayInMonth(h, monthYearStr);
    const log = logs[h._id];
    const str = log?.completionString || DEFAULT_31_ZERO_BITS;

    let activeDaysCount = 0;
    let completedCount = 0;

    for (let day = startDay; day <= maxDayToEvaluate; day++) {
      if (day <= daysInMonth) {
        activeDaysCount++;
        if (str[day - 1] === '1') {
          completedCount++;
        }
      }
    }

    const completionRate = activeDaysCount > 0 ? Math.round((completedCount / activeDaysCount) * 100) : 0;

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
