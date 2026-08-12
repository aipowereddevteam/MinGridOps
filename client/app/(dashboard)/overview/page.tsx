"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import {
  useHabitStore,
  calculateCurrentStreak,
  calculateLongestStreak,
} from "@/store/habitStore";
import { StreakBadge } from "@/components/gamification/StreakBadge";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Flame,
  Calendar,
  BarChart3,
  Sparkles,
} from "lucide-react";

export default function OverviewPage() {
  const { habits, logs, fetchHabits, fetchLogsForMonth, toggleDay } = useHabitStore();

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthYearStr = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

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

  // Helper to compute overall monthly completion rate
  let totalPossibleCheckins = habits.length * daysInMonth;
  let totalCheckedCheckins = 0;

  habits.forEach((h) => {
    const log = logs[h._id];
    const str = log?.completionString || "0".repeat(31);
    for (let i = 0; i < daysInMonth; i++) {
      if (str[i] === "1") {
        totalCheckedCheckins++;
      }
    }
  });

  const monthCompletionPercentage =
    totalPossibleCheckins > 0
      ? Math.round((totalCheckedCheckins / totalPossibleCheckins) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-24">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pt-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              <Calendar className="h-3.5 w-3.5 text-emerald-400" /> Bit-Packed Telemetry Matrix
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
              Desktop Command Center
            </h1>
          </div>

          {/* Month Selector */}
          <div className="glass-panel flex items-center gap-4 rounded-2xl px-4 py-2 border border-white/10">
            <button
              onClick={handlePrevMonth}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold text-white min-w-[140px] text-center">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Analytics Highlights */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Monthly Completion
            </p>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-3xl font-black text-white">{monthCompletionPercentage}%</span>
              <span className="text-xs text-emerald-400 font-semibold">
                {totalCheckedCheckins} / {totalPossibleCheckins} Checks
              </span>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Habit Routines
            </p>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-3xl font-black text-indigo-400">{habits.length}</span>
              <span className="text-xs text-slate-400 font-medium">Configured Routines</span>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Storage Engine Status
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
              <span className="text-sm font-bold text-white">1 Doc / Habit / Month</span>
            </div>
          </div>
        </div>

        {/* Matrix Grid Container */}
        <div className="mt-8 glass-panel rounded-3xl p-6 border border-white/10 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase min-w-[200px]">
                  Habit Routine
                </th>
                <th className="py-3 px-2 text-xs font-bold text-slate-400 uppercase text-center min-w-[80px]">
                  Streak
                </th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const isToday =
                    day === new Date().getDate() &&
                    month === new Date().getMonth() &&
                    year === new Date().getFullYear();

                  return (
                    <th
                      key={day}
                      className={`py-2 px-1 text-[11px] font-bold text-center min-w-[32px] ${
                        isToday
                          ? "text-emerald-400 bg-emerald-500/10 rounded-t-lg"
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
                    className="border-b border-white/5 hover:bg-white/[0.02] transition"
                  >
                    <td className="py-3 px-4 font-semibold text-sm text-white">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: habit.color || "#10b981" }}
                        />
                        <span className="truncate max-w-[180px]">{habit.title}</span>
                      </div>
                    </td>

                    <td className="py-3 px-2 text-center">
                      <StreakBadge streak={currentStreak} size="sm" label="" />
                    </td>

                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                      const index = day - 1;
                      const isChecked = completionString[index] === "1";
                      const isToday =
                        day === new Date().getDate() &&
                        month === new Date().getMonth() &&
                        year === new Date().getFullYear();

                      return (
                        <td key={day} className={`py-2 px-1 text-center ${isToday ? "bg-emerald-500/5" : ""}`}>
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={() => toggleDay(habit._id, day, monthYearStr)}
                            className={`mx-auto flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${
                              isChecked
                                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold"
                                : "bg-slate-900/80 border border-white/10 text-transparent hover:border-indigo-500/50"
                            }`}
                          >
                            <Check className={`h-3.5 w-3.5 ${isChecked ? "opacity-100" : "opacity-0"}`} />
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
      </main>
    </div>
  );
}
