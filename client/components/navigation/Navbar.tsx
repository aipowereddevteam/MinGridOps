"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  CalendarDays,
  LayoutGrid,
  BarChart3,
  ShieldAlert,
  LogOut,
  User as UserIcon,
} from "lucide-react";

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logoutUser, checkAuth } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated, checkAuth]);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* Desktop Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#090d16]/80 backdrop-blur-md px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/today" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 font-black text-white shadow-lg shadow-indigo-500/20">
              M
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Mingrid<span className="text-emerald-400">.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/today"
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                pathname === "/today"
                  ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CalendarDays className="h-4 w-4" /> Today&apos;s Routine
            </Link>

            <Link
              href="/overview"
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                pathname === "/overview"
                  ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="h-4 w-4" /> Command Center
            </Link>

            <Link
              href="/stats"
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                pathname === "/stats"
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart3 className="h-4 w-4 text-emerald-400" /> Analytics Stats
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  pathname === "/admin"
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    : "text-amber-400/80 hover:text-amber-300"
                }`}
              >
                <ShieldAlert className="h-4 w-4" /> Admin Console
              </Link>
            )}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200">
                {user?.name?.[0]?.toUpperCase() || <UserIcon className="h-4 w-4" />}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white leading-tight">
                  {user?.name || "User"}
                </p>
                <p className="text-[10px] text-slate-400 capitalize">
                  {user?.role || "Member"}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/10 bg-[#090d16]/90 backdrop-blur-lg px-4 py-2.5 md:hidden">
        <Link
          href="/today"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
            pathname === "/today" ? "text-indigo-400" : "text-slate-400"
          }`}
        >
          <CalendarDays className="h-5 w-5" />
          <span>Today</span>
        </Link>

        <Link
          href="/overview"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
            pathname === "/overview" ? "text-indigo-400" : "text-slate-400"
          }`}
        >
          <LayoutGrid className="h-5 w-5" />
          <span>Overview</span>
        </Link>

        <Link
          href="/stats"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
            pathname === "/stats" ? "text-emerald-400" : "text-slate-400"
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          <span>Stats</span>
        </Link>

        {isAdmin && (
          <Link
            href="/admin"
            className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
              pathname === "/admin" ? "text-amber-400" : "text-slate-400"
            }`}
          >
            <ShieldAlert className="h-5 w-5" />
            <span>Admin</span>
          </Link>
        )}
      </div>
    </>
  );
};
