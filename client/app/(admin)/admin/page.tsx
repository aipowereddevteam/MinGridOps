"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navigation/Navbar";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  UserCheck,
  UserX,
  ShieldAlert,
  Loader2,
  Users,
  Search,
  CheckCircle2,
} from "lucide-react";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function initAdmin() {
      await checkAuth();
    }
    initAdmin();
  }, [checkAuth]);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/today");
    } else if (user && user.role === "admin") {
      fetchUsers();
    }
  }, [user, router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/users");
      setUsersList(response.data);
    } catch (e) {
      // Error fetching users
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    setActionLoading(userId);
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`);
      await fetchUsers();
    } catch (e) {
      // Error
    } finally {
      setActionLoading(null);
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    setActionLoading(userId);
    try {
      await api.patch(`/admin/users/${userId}/make-admin`);
      await fetchUsers();
    } catch (e) {
      // Error
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-24">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <ShieldAlert className="h-3.5 w-3.5" /> Enterprise Administration
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
              User Management & Access Control
            </h1>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full rounded-xl py-2 pl-9 pr-4 text-xs"
            />
          </div>
        </div>

        {/* User Stats Bar */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="glass-panel rounded-3xl p-5 border border-white/10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Registered Users</p>
              <p className="text-2xl font-bold text-white">{usersList.length}</p>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-5 border border-white/10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Active Accounts</p>
              <p className="text-2xl font-bold text-white">
                {usersList.filter((u) => u.isActive).length}
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-5 border border-white/10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Admin Accounts</p>
              <p className="text-2xl font-bold text-white">
                {usersList.filter((u) => u.role === "admin").length}
              </p>
            </div>
          </div>
        </div>

        {/* Enterprise User Table */}
        <div className="mt-8 glass-panel rounded-3xl p-6 border border-white/10 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs font-semibold text-slate-400 uppercase">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition"
                  >
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="text-sm font-bold text-white">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {u.role === "admin" && <ShieldCheck className="h-3 w-3 text-amber-400" />}
                        {u.role.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          u.isActive
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {u.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Active Button */}
                        <button
                          onClick={() => handleToggleStatus(u._id)}
                          disabled={actionLoading === u._id}
                          className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                            u.isActive
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                          }`}
                        >
                          {actionLoading === u._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : u.isActive ? (
                            "Deactivate"
                          ) : (
                            "Activate"
                          )}
                        </button>

                        {/* Promote to Admin Button */}
                        {u.role !== "admin" && (
                          <button
                            onClick={() => handleMakeAdmin(u._id)}
                            disabled={actionLoading === u._id}
                            className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition"
                          >
                            Make Admin
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
