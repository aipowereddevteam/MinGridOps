"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { useHabitStore } from "@/store/habitStore";
import {
  calculateDailyCompletionData,
  calculateDoneVsOpenData,
  calculateWeeklyTrendData,
  calculateTopHabitsData,
} from "@/lib/analytics";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function StatsPage() {
  const { habits, logs, fetchHabits, fetchLogsForMonth } = useHabitStore();

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

  // Recharts Data Transformations
  const dailyData = calculateDailyCompletionData(habits, logs, daysInMonth);
  const doneVsOpenData = calculateDoneVsOpenData(habits, logs, daysInMonth);
  const weeklyData = calculateWeeklyTrendData(habits, logs, daysInMonth);
  const topHabitsData = calculateTopHabitsData(habits, logs, daysInMonth);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-24">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <BarChart3 className="h-3.5 w-3.5" /> Recharts Advanced Analytics
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
              Habit Performance & Trends
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

        {/* 2x2 Analytics Grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Chart 1: Done vs Open Ratio (Pie / Donut) */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <PieIcon className="h-5 w-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Done vs Open Ratio</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={doneVsOpenData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {doneVsOpenData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      color: "#f8fafc",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Completed ({doneVsOpenData[0]?.value || 0})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-800" />
                <span className="text-slate-400">Open ({doneVsOpenData[1]?.value || 0})</span>
              </div>
            </div>
          </div>

          {/* Chart 2: Weekly Trend (Line Chart) */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Weekly Completion Trend (%)</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      color: "#f8fafc",
                    }}
                    formatter={(value: any) => [`${value}%`, "Completion Rate"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: "#6366f1", r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Top Habits (Horizontal Bar Chart) */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Top Habits Completion Rate (%)</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topHabitsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      color: "#f8fafc",
                    }}
                    formatter={(value: any) => [`${value}%`, "Success Rate"]}
                  />
                  <Bar dataKey="completionRate" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Daily Breakdown (Bar Chart) */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-violet-400" />
              <h3 className="text-lg font-bold text-white">Daily Completed Habits Breakdown</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="dayNumber" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      color: "#f8fafc",
                    }}
                  />
                  <Bar dataKey="completed" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
