"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  ShieldCheck,
  Smartphone,
  LayoutGrid,
  BarChart3,
  Flame,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#090d16] text-slate-100">
      {/* Dynamic Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -left-40 -z-10 h-[400px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-10 -right-40 -z-10 h-[500px] w-[600px] rounded-full bg-violet-600/15 blur-[130px]" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#090d16]/70 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 font-black text-white shadow-lg shadow-indigo-500/20">
              M
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Mingrid<span className="text-emerald-400">.</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-90 active:scale-95"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md"
          >
            <Zap className="h-3.5 w-3.5 text-emerald-400" /> Enterprise-Grade Bit-Packed Habit Tracking
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
          >
            Master Your Daily Routines. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
              Command Your Destiny.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-400"
          >
            Mingrid delivers a dense, high-performance habit command center. Track daily deep work, discipline, and routines with instant bit-level persistence and glassmorphic telemetry.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="flex h-12 items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 px-8 text-base font-semibold text-white shadow-xl shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
            >
              Start Free Trial <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="glass-card flex h-12 items-center gap-2 rounded-xl px-7 text-base font-medium text-slate-200 transition hover:border-indigo-500/40"
            >
              <Lock className="h-4 w-4 text-emerald-400" /> Enter Workspace
            </Link>
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1: Command Center */}
            <motion.div
              whileHover={{ y: -5 }}
              className="glass-panel relative overflow-hidden rounded-2xl p-8 transition"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <LayoutGrid className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">Desktop Command Center</h3>
              <p className="mt-2 text-sm text-slate-400">
                Dense side-by-side layout featuring daily routines, monthly heatmaps, keyboard navigation, and focus mode.
              </p>
            </motion.div>

            {/* Card 2: Bit Packing */}
            <motion.div
              whileHover={{ y: -5 }}
              className="glass-panel relative overflow-hidden rounded-2xl p-8 transition"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">Bit-Packed Database Engine</h3>
              <p className="mt-2 text-sm text-slate-400">
                Optimized 1 document per habit per month storage strategy. Extreme performance and minimum database footprint.
              </p>
            </motion.div>

            {/* Card 3: Mobile & PWA */}
            <motion.div
              whileHover={{ y: -5 }}
              className="glass-panel relative overflow-hidden rounded-2xl p-8 transition"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">Mobile PWA & Swipe Gestures</h3>
              <p className="mt-2 text-sm text-slate-400">
                Touch-optimized experience for daily routines like Deep Work, No Porn, and Time with God with offline sync.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Routines Highlight */}
        <section className="mx-auto max-w-5xl px-6 py-12">
          <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <Flame className="h-3.5 w-3.5" /> High-Impact Habits
              </div>
              <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                Pre-configured Enterprise Routines
              </h2>
              <p className="mt-2 text-sm text-slate-400 max-w-lg">
                Includes specialized daily focus cards: Deep Work, No Porn, No Alcohol, and Time with God.
              </p>
            </div>
            <Link
              href="/register"
              className="whitespace-nowrap rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 active:scale-95"
            >
              Launch Dashboard
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Mingrid Enterprise Habit System. Built with Next.js & Nest.js.</p>
      </footer>
    </div>
  );
}

