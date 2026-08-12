"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = Router();
  const { loginUser, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  function Router() {
    return useRouter();
  }

  const onSubmit = async (data: LoginFormValues) => {
    clearError();
    try {
      await loginUser(data);
      router.push("/dashboard");
    } catch (e) {
      // Error handled by store
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090d16] px-4 py-12 text-slate-100">
      {/* Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 right-10 -z-10 h-[400px] w-[500px] rounded-full bg-emerald-500/15 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-2xl border border-white/10"
      >
        {/* Logo Branding */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 font-black text-xl text-white shadow-lg shadow-indigo-500/30">
            M
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
            Welcome Back to Mingrid
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Sign in to access your Enterprise Habit Command Center
          </p>
        </div>

        {/* Global Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                {...register("email")}
                type="email"
                placeholder="name@company.com"
                className="glass-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-500"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="glass-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-500"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Sign In to Workspace <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
          >
            Create your account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
