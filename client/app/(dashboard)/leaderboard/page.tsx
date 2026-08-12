"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Calendar,
  Sparkles,
  User as UserIcon,
  Users,
  Flame,
} from "lucide-react";

type Timeframe = "today" | "week" | "month" | "quarter" | "year";

interface LeaderboardUser {
  rank: number;
  userId: string;
  name: string;
  email: string;
  avatar: string;
  score: number;
}

interface LeaderboardResponse {
  timeframe: Timeframe;
  topUsers: LeaderboardUser[];
  allUsers: LeaderboardUser[];
  currentUserRank: LeaderboardUser;
  totalParticipants: number;
}

export default function LeaderboardPage() {
  const { user: currentUser } = useAuthStore();
  const [timeframe, setTimeframe] = useState<Timeframe>("month");
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/leaderboard?timeframe=${timeframe}`);
        setData(response.data);
      } catch (err) {
        // Fallback or handle error
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeframe]);

  const allUsers = data?.allUsers || data?.topUsers || [];
  const totalParticipants = data?.totalParticipants || allUsers.length;

  const firstPlace = allUsers.find((u) => u.rank === 1);
  const secondPlace = allUsers.find((u) => u.rank === 2);
  const thirdPlace = allUsers.find((u) => u.rank === 3);
  const runnersUp = allUsers.filter((u) => u.rank > 3);

  const currentUserRank = data?.currentUserRank;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-36">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pt-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-400 border border-amber-500/20">
            <Trophy className="h-4 w-4" /> Community Leaderboard
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Users className="h-3.5 w-3.5 text-indigo-400" /> {totalParticipants} Active Members
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-3">
            Habit Champions Podium
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Social accountability and consistency rankings powered by MongoDB bit-packed aggregations.
          </p>
        </div>

        {/* Timeframe Tabs */}
        <div className="mt-6 flex items-center justify-center gap-2 overflow-x-auto py-1">
          {(["today", "week", "month", "quarter", "year"] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`rounded-xl px-4 py-2 text-xs font-bold capitalize transition-all ${
                timeframe === tf
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-105"
                  : "glass-panel text-slate-400 hover:text-white hover:border-white/20"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Empty State Callout */}
        {!isLoading && allUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 glass-panel rounded-3xl p-8 text-center border border-white/10"
          >
            <Sparkles className="mx-auto h-8 w-8 text-amber-400 animate-bounce" />
            <h3 className="mt-3 text-lg font-bold text-white">Be the First on the Board!</h3>
            <p className="text-xs text-slate-400 mt-1">
              No habit check-ins have been logged for this timeframe yet. Check off your routines now to claim #1!
            </p>
          </motion.div>
        )}

        {/* Top 3 Podium Display */}
        {!isLoading && allUsers.length > 0 && (
          <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-6 items-end justify-center max-w-2xl mx-auto px-2">
            {/* 2nd Place (Silver - Left) */}
            <div className="flex flex-col items-center">
              {secondPlace ? (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex flex-col items-center w-full"
                >
                  <div className="relative mb-2">
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-slate-800 border-2 border-slate-300 flex items-center justify-center text-slate-200 font-bold shadow-lg overflow-hidden">
                      {secondPlace.avatar ? (
                        <img src={secondPlace.avatar} alt={secondPlace.name} className="h-full w-full object-cover" />
                      ) : (
                        secondPlace.name[0]?.toUpperCase()
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-slate-950 font-black text-xs shadow">
                      2
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-[90px] text-center">
                    {secondPlace.name}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 mt-0.5">
                    {secondPlace.score} Check-ins
                  </span>

                  {/* Silver Podium Pillar */}
                  <div className="mt-3 h-28 sm:h-36 w-full rounded-t-2xl bg-gradient-to-b from-slate-400/30 to-slate-700/20 border-t-2 border-slate-300 flex items-center justify-center text-slate-300 font-extrabold text-2xl shadow-inner">
                    🥈
                  </div>
                </motion.div>
              ) : (
                <div className="h-28 w-full rounded-t-2xl bg-slate-900/30 border-t border-dashed border-white/10 flex items-center justify-center text-slate-600 text-xs font-bold">
                  #2 Spot
                </div>
              )}
            </div>

            {/* 1st Place (Gold - Center Elevated) */}
            <div className="flex flex-col items-center">
              {firstPlace ? (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, type: "spring" }}
                  className="flex flex-col items-center w-full"
                >
                  <div className="relative mb-2">
                    <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 h-6 w-6 text-amber-400 animate-bounce" />
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-amber-950 border-2 border-amber-400 flex items-center justify-center text-amber-300 font-bold shadow-xl shadow-amber-500/20 overflow-hidden ring-4 ring-amber-500/30">
                      {firstPlace.avatar ? (
                        <img src={firstPlace.avatar} alt={firstPlace.name} className="h-full w-full object-cover" />
                      ) : (
                        firstPlace.name[0]?.toUpperCase()
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-lg">
                      1
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-amber-300 truncate max-w-[100px] text-center">
                    {firstPlace.name}
                  </span>
                  <span className="text-xs font-bold text-amber-400/90 mt-0.5">
                    {firstPlace.score} Check-ins
                  </span>

                  {/* Gold Podium Pillar */}
                  <div className="mt-3 h-36 sm:h-48 w-full rounded-t-2xl bg-gradient-to-b from-amber-500/40 via-amber-600/20 to-slate-900/40 border-t-4 border-amber-400 flex items-center justify-center text-amber-300 font-extrabold text-3xl shadow-xl shadow-amber-500/10">
                    👑
                  </div>
                </motion.div>
              ) : (
                <div className="h-36 w-full rounded-t-2xl bg-slate-900/30 border-t border-dashed border-white/10 flex items-center justify-center text-slate-600 text-xs font-bold">
                  #1 Spot
                </div>
              )}
            </div>

            {/* 3rd Place (Bronze - Right) */}
            <div className="flex flex-col items-center">
              {thirdPlace ? (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex flex-col items-center w-full"
                >
                  <div className="relative mb-2">
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-amber-950/60 border-2 border-amber-600 flex items-center justify-center text-amber-500 font-bold shadow-lg overflow-hidden">
                      {thirdPlace.avatar ? (
                        <img src={thirdPlace.avatar} alt={thirdPlace.name} className="h-full w-full object-cover" />
                      ) : (
                        thirdPlace.name[0]?.toUpperCase()
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-slate-950 font-black text-xs shadow">
                      3
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-[90px] text-center">
                    {thirdPlace.name}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 mt-0.5">
                    {thirdPlace.score} Check-ins
                  </span>

                  {/* Bronze Podium Pillar */}
                  <div className="mt-3 h-24 sm:h-28 w-full rounded-t-2xl bg-gradient-to-b from-amber-700/30 to-slate-800/20 border-t-2 border-amber-600 flex items-center justify-center text-amber-500 font-extrabold text-2xl shadow-inner">
                    🥉
                  </div>
                </motion.div>
              ) : (
                <div className="h-24 w-full rounded-t-2xl bg-slate-900/30 border-t border-dashed border-white/10 flex items-center justify-center text-slate-600 text-xs font-bold">
                  #3 Spot
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Participants Member List (Ranks 4..N) */}
        {!isLoading && runnersUp.length > 0 && (
          <div className="mt-10 space-y-3 max-w-2xl mx-auto">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Full Community Rankings ({runnersUp.length} Members)
              </h4>
              <span className="text-[11px] text-slate-500">Sorted by Total Check-ins</span>
            </div>

            <div className="space-y-2">
              {runnersUp.map((u) => {
                const isCurrentUser = u.userId === currentUserRank?.userId;
                return (
                  <motion.div
                    key={u.userId}
                    whileHover={{ scale: 1.01 }}
                    className={`glass-panel flex items-center justify-between rounded-2xl px-4 py-3 border transition ${
                      isCurrentUser
                        ? "border-amber-500/40 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                        : "border-white/5 hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">
                        #{u.rank}
                      </span>
                      <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                        ) : (
                          u.name[0]?.toUpperCase()
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white flex items-center gap-2">
                          {u.name}
                          {isCurrentUser && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                              You
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      {u.score} Check-ins
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Sticky Personal Rank Card at Bottom */}
      {currentUserRank && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl"
        >
          <div className="glass-panel flex items-center justify-between rounded-2xl px-5 py-3 border border-amber-500/40 bg-[#090d16]/95 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20">
                #{currentUserRank.rank}
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  Your Rank: <span className="text-amber-400">#{currentUserRank.rank}</span> of {totalParticipants} Members
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {timeframe.toUpperCase()}
                  </span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Keep completing routines to climb the global podium!
                </p>
              </div>
            </div>

            <div className="text-right pl-2">
              <span className="text-lg font-black text-amber-300">{currentUserRank.score}</span>
              <span className="block text-[10px] font-semibold text-slate-400">Habits Logged</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
