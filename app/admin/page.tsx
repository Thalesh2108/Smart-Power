"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Shield, Users, ClipboardList, Trash2, ArrowLeft, LogOut, CheckCircle, XCircle, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { formatIndianDate } from "@/lib/utils/date";

interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

interface LoginLog {
  id: string;
  email: string;
  timestamp: string;
  status: "success" | "failed";
  role: "user" | "admin";
  userAgent: string;
  ip: string;
  error?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Check session storage on mount to see if admin is already logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const logged = sessionStorage.getItem("smartpower_admin_active");
      if (logged === "true") {
        setIsAdminLoggedIn(true);
        fetchData();
      }
    }
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, logsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/logins"),
      ]);

      if (usersRes.ok && logsRes.ok) {
        const usersData = await usersRes.json();
        const logsData = await logsRes.json();
        setUsers(usersData);
        setLogs(logsData);
      } else {
        toast.error("Failed to load user and log data.");
      }
    } catch (err) {
      toast.error("Failed to connect to admin APIs.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitLoading(true);

    // Support admin or admin@smartpower.in as username, and admin or admin123 as password
    const validUsername = username.toLowerCase() === "admin" || username.toLowerCase() === "admin@smartpower.in";
    const validPassword = password === "admin" || password === "admin123";

    setTimeout(async () => {
      if (validUsername && validPassword) {
        sessionStorage.setItem("smartpower_admin_active", "true");
        setIsAdminLoggedIn(true);
        toast.success("Welcome back, Admin! 🛡️");
        // Log this successful admin login
        await fetch("/api/admin/logins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: username, status: "success", role: "admin" }),
        });
        fetchData();
      } else {
        toast.error("Invalid administrator credentials");
        // Log this failed admin login
        await fetch("/api/admin/logins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: username || "unknown-admin", status: "failed", role: "admin", error: "Invalid password credentials" }),
        });
      }
      setIsSubmitLoading(false);
    }, 600);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("smartpower_admin_active");
    setIsAdminLoggedIn(false);
    setUsername("");
    setPassword("");
    toast.success("Logged out from admin panel");
  };

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear all login logs? This cannot be undone.")) {
      return;
    }
    try {
      const res = await fetch("/api/admin/logins", { method: "DELETE" });
      if (res.ok) {
        toast.success("Login history cleared!");
        setLogs([]);
      } else {
        toast.error("Failed to clear logs");
      }
    } catch {
      toast.error("Error clearing logs");
    }
  };

  // Filter logs based on search query
  const filteredLogs = logs.filter(
    (log) =>
      log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip.includes(searchQuery) ||
      log.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSuccess = logs.filter((l) => l.status === "success").length;
  const totalFailed = logs.filter((l) => l.status === "failed").length;

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden text-slate-100 p-6">
        {/* Glowing backdrops */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <motion.div
          className="w-full max-w-md bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-slate-700 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield size={32} className="text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-extrabold tracking-tight text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                SmartPower Admin
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Enter credentials to watch the user database & login logs
              </p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Admin Username / Email
              </label>
              <input
                type="text"
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-base bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-base bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitLoading}
              className="w-full py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/10 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitLoading ? "Authenticating..." : "Login Securely"}
            </button>
          </form>

          <div className="mt-6 flex justify-between items-center text-xs text-slate-400 pt-5 border-t border-slate-700">
            <Link href="/login" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <ArrowLeft size={14} /> Back to User Login
            </Link>
            <span>Tip: admin / admin123</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Grid */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                Admin Control Room
              </h1>
              <p className="text-sm text-slate-400">
                Authorized Access • SmartPower Local User Database & Logs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw size={15} /> Refresh
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-2"
            >
              <ArrowLeft size={15} /> Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-950/80 hover:bg-red-900/80 text-red-200 border border-red-900 transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex items-center gap-5">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Registered Users</p>
              <p className="text-3xl font-extrabold text-white mt-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                {users.length}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex items-center gap-5">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
              <ClipboardList size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Login Logs</p>
              <p className="text-3xl font-extrabold text-white mt-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                {logs.length}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex items-center gap-5">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Success Logins</p>
              <p className="text-3xl font-extrabold text-emerald-400 mt-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                {totalSuccess}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex items-center gap-5">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
              <XCircle size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Failed Attempts</p>
              <p className="text-3xl font-extrabold text-red-400 mt-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                {totalFailed}
              </p>
            </div>
          </div>
        </div>

        {/* Database Content Tabs / Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* User Database Panel */}
          <div className="lg:col-span-1 bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={20} className="text-emerald-500" /> User Database
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                {users.length} Users
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 scrollbar-thin">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Loading users...
                </div>
              ) : users.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm text-center p-6 border border-dashed border-slate-800 rounded-2xl">
                  No registered users in local database yet.
                </div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="p-4 bg-slate-800/50 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <p className="font-bold text-white text-sm">{user.fullName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800">
                      <span>ID: {user.id.substring(0, 12)}...</span>
                      <span>Registered: {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Login logs Panel */}
          <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col h-[600px]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ClipboardList size={20} className="text-indigo-500" /> Watch Login Details
              </h2>
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 w-44 sm:w-56 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <button
                  onClick={handleClearLogs}
                  disabled={logs.length === 0}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-900/60 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Clear history log"
                >
                  <Trash2 size={13} /> Clear Logs
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Loading login logs...
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm text-center p-6 border border-dashed border-slate-800 rounded-2xl">
                  {searchQuery ? "No logs match your search filter." : "No login records stored."}
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider">
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3">Email</th>
                      <th className="pb-3 px-3">Role</th>
                      <th className="pb-3 px-3">IP / Location</th>
                      <th className="pb-3 px-3">Device & Browser</th>
                      <th className="pb-3 px-3">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-800/60 hover:bg-slate-800/35 transition-colors">
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                            log.status === "success"
                              ? "bg-emerald-950/60 text-emerald-400 border-emerald-900/80"
                              : "bg-red-950/60 text-red-400 border-red-900/80"
                          }`}>
                            {log.status === "success" ? "Success" : "Failed"}
                          </span>
                          {log.error && (
                            <p className="text-[10px] text-red-500 mt-1 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={log.error}>
                              Error: {log.error}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-200">{log.email}</td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            log.role === "admin" ? "bg-purple-950 text-purple-300" : "bg-slate-800 text-slate-300"
                          }`}>
                            {log.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{log.ip}</td>
                        <td className="py-3 px-3 text-slate-400 max-w-[160px] truncate" title={log.userAgent}>
                          {log.userAgent}
                        </td>
                        <td className="py-3 px-3 text-slate-400 font-medium">
                          {new Date(log.timestamp).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
