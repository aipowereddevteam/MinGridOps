"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import {
  useHabitStore,
  calculateCurrentStreak,
} from "@/store/habitStore";
import { StreakBadge } from "@/components/gamification/StreakBadge";
import { MotivatingStatsCard } from "@/components/gamification/MotivatingStatsCard";
import { calculateDoneVsOpenData } from "@/lib/analytics";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  Smartphone,
  Lock,
} from "lucide-react";

export default function OverviewPage() {
  const { habits, logs, fetchHabits, fetchLogsForMonth, toggleDay } = useHabitStore();

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthYearStr = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const now = new Date();
  const realCurrentYear = now.getFullYear();
  const realCurrentMonth = now.getMonth();
  const realTodayDay = now.getDate();

  const isFutureMonth =
    year > realCurrentYear || (year === realCurrentYear && month > realCurrentMonth);
  const isCurrentMonth = year === realCurrentYear && month === realCurrentMonth;

  useEffect(() => {
    fetchHabits();
    fetchLogsForMonth(monthYearStr);
  }, [fetchHabits, fetchLogsForMonth, monthYearStr]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Creation-Date Aware Analytics Calculation
  const doneVsOpenPoints = calculateDoneVsOpenData(habits, logs, daysInMonth, monthYearStr);
  const totalCheckedCheckins = doneVsOpenPoints[0]?.value || 0;
  const openCheckinsCount = doneVsOpenPoints[1]?.value || 0;
  const totalActiveOpportunities = totalCheckedCheckins + openCheckinsCount;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-24">
      <Navbar />

      <main className="mx-auto max-w-7xl px-3 sm:px-6 pt-4 sm:pt-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-[11px] sm:text-xs font-semibold text-indigo-300">
              <Calendar className="h-3.5 w-3.5 text-emerald-400" /> Command Center Matrix
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1.5">
              Habit Overview Matrix
            </h1>
          </div>

          {/* Month Selector */}
          <div className="glass-panel flex items-center gap-3 rounded-2xl px-3.5 py-1.5 border border-white/10 shadow-lg">
            <button
              onClick={handlePrevMonth}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs sm:text-sm font-bold text-white min-w-[120px] text-center">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Motivating Stats Widgets (Mid-Month Creation Date Aware) */}
        <div className="mt-5 sm:mt-6">
          <MotivatingStatsCard
            completedCount={totalCheckedCheckins}
            totalCount={totalActiveOpportunities}
            openCount={openCheckinsCount}
          />
        </div>

        {/* Mobile Swipe Hint */}
        <div className="mt-4 flex items-center justify-between text-[11px] font-semibold text-slate-400 md:hidden px-1">
          <span className="flex items-center gap-1 text-indigo-300">
            <Smartphone className="h-3.5 w-3.5" /> Mobile View Optimized
          </span>
          <span className="text-slate-400">Swipe horizontally ➔</span>
        </div>

        {/* Matrix Grid Container with Optimized Mobile Sticky Column */}
        <div className="mt-2 sm:mt-6 glass-panel rounded-2xl sm:rounded-3xl p-2 sm:p-6 border border-white/10 overflow-x-auto shadow-2xl relative">
          <div className="min-w-full inline-block align-middle">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  {/* Sticky Column 1: Habit Routine (Compact on Mobile) */}
                  <th className="sticky left-0 z-30 bg-[#0d1424] text-left py-2.5 px-2 sm:px-3 text-[11px] sm:text-xs font-bold text-slate-300 uppercase min-w-[95px] max-w-[110px] sm:min-w-[160px] sm:max-w-[180px] border-r border-white/10 shadow-md">
                    Habit
                  </th>

                  {/* Sticky Column 2: Streak (Hidden on mobile to save screen space) */}
                  <th className="hidden md:table-cell sticky left-[160px] z-30 bg-[#0d1424] py-2.5 px-2 text-xs font-bold text-slate-300 uppercase text-center min-w-[70px] border-r border-white/10 shadow-md">
                    Streak
                  </th>

                  {/* Days 1..N Header */}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const isToday =
                      day === realTodayDay && isCurrentMonth;
                    const isFutureDay =
                      isFutureMonth || (isCurrentMonth && day > realTodayDay);

                    return (
                      <th
                        key={day}
                        className={`py-2 px-0.5 text-[10px] sm:text-[11px] font-bold text-center min-w-[30px] sm:min-w-[34px] ${
                          isToday
                            ? "text-emerald-400 bg-emerald-500/10 rounded-t-lg font-black"
                            : isFutureDay
                            ? "text-slate-600"
                            : "text-slate-400"
                        }`}
                      >
                        {day}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {habits.map((habit) => {
                  const log = logs[habit._id];
                  const completionString = log?.completionString || "0".repeat(31);
                  const currentStreak = calculateCurrentStreak(completionString);

                  return (
                    <tr
                      key={habit._id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition group"
                    >
                      {/* Sticky Cell 1: Habit Routine Title */}
                      <td className="sticky left-0 z-20 bg-[#0d1424] py-2.5 px-2 sm:px-3 font-semibold text-xs sm:text-sm text-white border-r border-white/10 shadow-md">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div
                            className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: habit.color || "#10b981" }}
                          />
                          <span className="truncate max-w-[80px] sm:max-w-[140px] font-bold text-[11px] sm:text-xs">
                            {habit.title}
                          </span>
                        </div>
                      </td>

                      {/* Sticky Cell 2: Streak (Hidden on mobile) */}
                      <td className="hidden md:table-cell sticky left-[160px] z-20 bg-[#0d1424] py-2.5 px-2 text-center border-r border-white/10 shadow-md">
                        <StreakBadge streak={currentStreak} size="sm" label="" />
                      </td>

                      {/* Days Checkbox Cells */}
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                        const index = day - 1;
                        const isChecked = completionString[index] === "1";
                        const isToday = day === realTodayDay && isCurrentMonth;
                        const isFutureDay =
                          isFutureMonth || (isCurrentMonth && day > realTodayDay);

                        return (
                          <td
                            key={day}
                            className={`py-1.5 px-0.5 text-center ${
                              isToday ? "bg-emerald-500/5" : ""
                            }`}
                          >
                            <motion.button
                              whileHover={isFutureDay ? {} : { scale: 1.15 }}
                              whileTap={isFutureDay ? {} : { scale: 0.85 }}
                              disabled={isFutureDay}
                              onClick={() => {
                                if (!isFutureDay) {
                                  toggleDay(habit._id, day, monthYearStr);
                                }
                              }}
                              className={`mx-auto flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-md sm:rounded-lg transition-all duration-200 ${
                                isFutureDay
                                  ? "bg-slate-950/40 border border-white/5 text-slate-700 opacity-30 cursor-not-allowed"
                                  : isChecked
                                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-bold"
                                  : "bg-slate-900/80 border border-white/10 text-transparent hover:border-indigo-500/50"
                              }`}
                              title={isFutureDay ? "Cannot check off future dates" : `Day ${day}`}
                            >
                              <Check
                                className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                                  isChecked ? "opacity-100 stroke-[3]" : "opacity-0"
                                }`}
                              />
                            </motion.button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
