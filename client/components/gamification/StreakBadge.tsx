"use client";

import React from "react";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";

interface StreakBadgeProps {
  streak: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  streak,
  label = "Streak",
  size = "md",
}) => {
  const isHighStreak = streak >= 7;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-semibold backdrop-blur-md transition ${
        isHighStreak
          ? "border-amber-500/40 bg-amber-500/10 text-amber-300 shadow-lg shadow-amber-500/15"
          : streak > 0
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border-slate-800 bg-slate-900/60 text-slate-400"
      } ${
        size === "sm"
          ? "text-xs py-0.5 px-2.5"
          : size === "lg"
          ? "text-sm py-1.5 px-4"
          : "text-xs"
      }`}
    >
      <Flame
        className={`h-3.5 w-3.5 ${
          streak > 0
            ? "animate-pulse fill-amber-400 text-amber-500"
            : "text-slate-500"
        }`}
      />
      <span>
        {streak} {streak === 1 ? "Day" : "Days"} {label && size !== "sm" ? label : ""}
      </span>
    </motion.div>
  );
};
