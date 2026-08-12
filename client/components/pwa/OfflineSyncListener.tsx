"use client";

import React, { useEffect, useState } from "react";
import { processOfflineQueue } from "@/lib/offlineQueue";
import { useHabitStore } from "@/store/habitStore";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const OfflineSyncListener: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);

  const { fetchLogsForMonth, activeMonthYear } = useHabitStore();

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = async () => {
      setIsOnline(true);
      setSyncing(true);
      const count = await processOfflineQueue();
      setSyncing(false);

      if (count > 0) {
        setSyncedCount(count);
        fetchLogsForMonth(activeMonthYear);
        setTimeout(() => setSyncedCount(null), 4000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check on mount
    if (navigator.onLine) {
      processOfflineQueue().then((count) => {
        if (count > 0) {
          setSyncedCount(count);
          fetchLogsForMonth(activeMonthYear);
          setTimeout(() => setSyncedCount(null), 4000);
        }
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [fetchLogsForMonth, activeMonthYear]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/90 px-4 py-1.5 text-xs font-semibold text-amber-300 shadow-xl backdrop-blur-md"
        >
          <WifiOff className="h-3.5 w-3.5 animate-pulse text-amber-400" />
          <span>Offline Mode: Check-ins queued locally</span>
        </motion.div>
      )}

      {syncing && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-950/90 px-4 py-1.5 text-xs font-semibold text-indigo-300 shadow-xl backdrop-blur-md"
        >
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
          <span>Syncing offline habits with cloud...</span>
        </motion.div>
      )}

      {syncedCount !== null && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/90 px-4 py-1.5 text-xs font-semibold text-emerald-300 shadow-xl backdrop-blur-md"
        >
          <Wifi className="h-3.5 w-3.5 text-emerald-400" />
          <span>Synced {syncedCount} offline habit check-ins!</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
