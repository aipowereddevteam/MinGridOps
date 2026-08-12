"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Trophy } from "lucide-react";

interface DailyProgressRingProps {
  completedCount: number;
  totalCount: number;
  size?: number;
  strokeWidth?: number;
}

export const DailyProgressRing: React.FC<DailyProgressRingProps> = ({
  completedCount,
  totalCount,
  size = 120,
  strokeWidth = 10,
}) => {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = totalCount > 0 && completedCount === totalCount;

  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="glass-panel relative flex flex-col items-center justify-center rounded-3xl p-6 border border-white/10 shadow-xl">
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="-rotate-90 transform">
          {/* Background Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Progress Ring */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            stroke={isComplete ? "#10b981" : "#6366f1"}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Label */}
        <div className="absolute flex flex-col items-center text-center">
          {isComplete ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-emerald-400"
            >
              <Trophy className="h-7 w-7 animate-bounce" />
            </motion.div>
          ) : (
            <>
              <span className="text-2xl font-black tracking-tight text-white">
                {percentage}%
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Done
              </span>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-center">
        <CheckCircle2
          className={`h-4 w-4 ${isComplete ? "text-emerald-400" : "text-indigo-400"}`}
        />
        <span className="text-xs font-semibold text-slate-200">
          {completedCount} of {totalCount} Habits Completed
        </span>
      </div>
    </div>
  );
};
