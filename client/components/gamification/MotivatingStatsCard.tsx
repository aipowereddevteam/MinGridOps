"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";

interface MotivatingStatsCardProps {
  completedCount: number;
  totalCount: number;
  openCount?: number;
}

export const MotivatingStatsCard: React.FC<MotivatingStatsCardProps> = ({
  completedCount,
  totalCount,
  openCount: explicitOpenCount,
}) => {
  const openCount = explicitOpenCount ?? Math.max(0, totalCount - completedCount);
  const total = completedCount + openCount;
  const donePercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const openPercentage = 100 - donePercentage;

  return (
    <div className="grid gap-4 sm:grid-cols-2 w-full">
      {/* Card 1: Done vs Open Bar */}
      <motion.div
        whileHover={{ y: -2 }}
        className="glass-panel flex flex-col justify-between rounded-3xl p-5 border border-white/10 shadow-xl bg-[#0d1424]/90"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white tracking-wide">Done vs Open</span>
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> {donePercentage}% Ratio
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="mt-4">
          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-800/80 p-0.5 border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${donePercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shadow-lg shadow-emerald-500/30"
            />
          </div>

          {/* Sub-labels */}
          <div className="mt-2.5 flex items-center justify-between text-xs font-bold">
            <span className="text-emerald-400">{donePercentage}% Done</span>
            <span className="text-slate-400">{openPercentage}% Open</span>
          </div>
        </div>
      </motion.div>

      {/* Card 2: Daily Routine Progress (Numbers + Sparklines) */}
      <motion.div
        whileHover={{ y: -2 }}
        className="glass-panel flex flex-col justify-between rounded-3xl p-5 border border-white/10 shadow-xl bg-[#0d1424]/90"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white tracking-wide">Daily Routine Progress</span>
          <TrendingUp className="h-4 w-4 text-cyan-400" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-4 items-end">
          {/* Done Stat */}
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white tracking-tight">{completedCount}</span>
            <span className="text-xs font-semibold text-slate-400 mb-1">Done</span>

            {/* Glowing Green Sparkline */}
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 30" fill="none">
              <path
                d="M0 25 C20 20, 30 28, 50 12 C70 -4, 80 20, 100 5"
                stroke="url(#doneGradient)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="100" cy="5" r="3" fill="#10b981" className="animate-ping" />
              <circle cx="100" cy="5" r="3.5" fill="#10b981" />
              <defs>
                <linearGradient id="doneGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Open Stat */}
          <div className="flex flex-col border-l border-white/10 pl-4">
            <span className="text-2xl font-black text-slate-200 tracking-tight">{openCount}</span>
            <span className="text-xs font-semibold text-slate-400 mb-1">Open</span>

            {/* Glowing Cyan Sparkline */}
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 30" fill="none">
              <path
                d="M0 20 C25 25, 40 10, 60 22 C80 30, 90 8, 100 12"
                stroke="url(#openGradient)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="100" cy="12" r="3.5" fill="#06b6d4" />
              <defs>
                <linearGradient id="openGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
