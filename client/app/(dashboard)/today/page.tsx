"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import {
  useHabitStore,
  calculateCurrentStreak,
} from "@/store/habitStore";
import { StreakBadge } from "@/components/gamification/StreakBadge";
import { DailyProgressRing } from "@/components/gamification/DailyProgressRing";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Check,
  Zap,
  Shield,
  Flame,
  Heart,
  BookOpen,
  Trash2,
  Sparkles,
} from "lucide-react";

const SUGGESTED_HABITS = [
  { title: "Deep Work (2 Hours)", icon: "Zap", color: "#6366f1" },
  { title: "No Alcohol", icon: "Shield", color: "#10b981" },
  { title: "No Porn / Retention", icon: "Flame", color: "#f43f5e" },
  { title: "Time with God & Prayer", icon: "Heart", color: "#8b5cf6" },
  { title: "Read 10 Pages", icon: "BookOpen", color: "#f59e0b" },
];

export default function TodayPage() {
  const { habits, logs, fetchHabits, fetchLogsForMonth, toggleDay, createHabit, deleteHabit, isLoading } =
    useHabitStore();

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("#10b981");

  const todayDate = new Date();
  const currentDay = todayDate.getDate();
  const monthYear = todayDate.toISOString().slice(0, 7); // "YYYY-MM"
  const formattedDate = todayDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    fetchHabits();
    fetchLogsForMonth(monthYear);
  }, [fetchHabits, fetchLogsForMonth, monthYear]);

  // Calculate completed count today
  const todayIndex = currentDay - 1;
  let completedTodayCount = 0;

  habits.forEach((habit) => {
    const log = logs[habit._id];
    const str = log?.completionString || "0".repeat(31);
    if (str[todayIndex] === "1") {
      completedTodayCount++;
    }
  });

  const handleAddSuggested = async (suggested: typeof SUGGESTED_HABITS[0]) => {
    await createHabit({
      title: suggested.title,
      icon: suggested.icon,
      color: suggested.color,
    });
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createHabit({
      title: newTitle,
      icon: "Flame",
      color: newColor,
    });
    setNewTitle("");
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-24">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pt-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              {formattedDate}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">
              Daily Focus Routines
            </h1>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20"
          >
            <Plus className="h-4 w-4" /> Add Custom Habit
          </motion.button>
        </div>

        {/* Gamification Telemetry Bar */}
        <div className="mt-6 grid gap-6 md:grid-cols-3 items-center">
          <div className="md:col-span-1">
            <DailyProgressRing
              completedCount={completedTodayCount}
              totalCount={habits.length}
            />
          </div>

          <div className="glass-panel md:col-span-2 rounded-3xl p-6 border border-white/10 flex flex-col justify-between h-full">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                <Sparkles className="h-3.5 w-3.5" /> Dopamine Mastery Loop
              </div>
              <h2 className="text-xl font-bold text-white mt-2">
                {completedTodayCount === habits.length && habits.length > 0
                  ? "🎉 All Routines Finished for Today!"
                  : "Keep the Momentum Alive!"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Check off your habits as you complete them. Complete all routines for the day to unlock confetti celebration fireworks.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-300 font-semibold">Active Habits: {habits.length}</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-semibold">Completed: {completedTodayCount}</span>
            </div>
          </div>
        </div>

        {/* Suggested Habits (If Empty) */}
        {habits.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 glass-panel rounded-3xl p-8 text-center border border-white/10"
          >
            <Sparkles className="mx-auto h-8 w-8 text-amber-400 animate-pulse" />
            <h3 className="mt-3 text-lg font-bold text-white">No Habits Configured Yet</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
              Start building high-impact routines right now. Click a suggested habit below to add it instantly to your workspace:
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {SUGGESTED_HABITS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddSuggested(item)}
                  className="glass-card flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-emerald-500/50 hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Habit List */}
        <div className="mt-8 space-y-3">
          <AnimatePresence>
            {habits.map((habit) => {
              const log = logs[habit._id];
              const completionString = log?.completionString || "0".repeat(31);
              const isChecked = completionString[todayIndex] === "1";
              const currentStreak = calculateCurrentStreak(completionString, currentDay);

              return (
                <motion.div
                  key={habit._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`glass-panel group flex items-center justify-between rounded-2xl p-4 transition-all duration-200 border ${
                    isChecked
                      ? "border-emerald-500/30 bg-emerald-950/20 shadow-lg shadow-emerald-950/20"
                      : "border-white/5 hover:border-indigo-500/30"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Interactive Checkbox Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => toggleDay(habit._id, currentDay, monthYear)}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                        isChecked
                          ? "bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/50"
                          : "border-2 border-slate-700 bg-slate-900/60 text-transparent hover:border-indigo-500"
                      }`}
                    >
                      <Check className={`h-5 w-5 stroke-[3] ${isChecked ? "opacity-100 scale-100" : "opacity-0 scale-50"} transition-all`} />
                    </motion.button>

                    <div>
                      <h4
                        className={`text-base font-bold transition ${
                          isChecked ? "text-slate-300 line-through decoration-emerald-500/50" : "text-white"
                        }`}
                      >
                        {habit.title}
                      </h4>
                      <div className="mt-1 flex items-center gap-2">
                        <StreakBadge streak={currentStreak} size="sm" />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => deleteHabit(habit._id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 transition hover:text-rose-400"
                    title="Delete Habit"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* Add Custom Habit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel w-full max-w-md rounded-3xl p-6 border border-white/10 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white">Add New Habit Routine</h3>

            <form onSubmit={handleCreateCustom} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Habit Title</label>
                <input
                  type="text"
                  placeholder="e.g. Read 20 Pages, Cold Shower"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="glass-input w-full rounded-xl py-2.5 px-4 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Color Theme</label>
                <div className="flex items-center gap-2">
                  {["#6366f1", "#10b981", "#8b5cf6", "#f43f5e", "#f59e0b", "#06b6d4"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className={`h-7 w-7 rounded-full border-2 transition ${
                        newColor === c ? "border-white scale-110" : "border-transparent opacity-60"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
