"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Zap, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signupSchema, type SignupFormData } from "@/lib/validations/auth";
import { initializeDemoMode } from "@/lib/demo/seed";
import { logLogin, registerUserInDb } from "@/lib/utils/admin-client";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password", "");

  const passwordChecks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "One number", valid: /[0-9]/.test(password) },
  ];

  const handleDemoLogin = async (fullName: string, email: string) => {
    setIsDemoLoading(true);
    initializeDemoMode();
    await registerUserInDb(fullName, email);
    await logLogin(email, "success", "user");
    toast.success("Account created & activated in Demo Mode! 🎉");
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 400);
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.full_name },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        if (error.message.includes("fetch")) {
          await handleDemoLogin(data.full_name, data.email);
          return;
        }
        await logLogin(data.email, "failed", "user", "Signup failed: " + error.message);
        toast.error(error.message || "Signup failed. Please try again.");
        return;
      }

      await registerUserInDb(data.full_name, data.email);
      await logLogin(data.email, "success", "user");
      toast.success("Account created! Redirecting to SmartPower... 🎉");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      await logLogin(data.email, "failed", "user", "Signup fallback error: " + err?.message);
      await handleDemoLogin(data.full_name, data.email);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 relative overflow-hidden text-slate-900">
      {/* Subtle Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      {/* Left Panel */}
      <motion.div
        className="hidden lg:flex flex-1 flex-col justify-center items-center relative p-12 bg-white/70 backdrop-blur-md border-r border-slate-200"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/25">
              <Zap size={28} className="text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                SmartPower
              </h1>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                AI Electricity Tracker
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>
            Start Managing Your Household Electricity
          </h2>

          <div className="space-y-3">
            {[
              "Track daily electricity units & bills",
              "AI Linear Regression month-end prediction",
              "Z-score Anomaly Detection alerts",
              "Downloadable monthly PDF reports",
              "Tailored for Indian electricity tariffs (₹)",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-100/80 border border-slate-200/80">
                <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                <span className="text-sm font-semibold text-slate-800">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Panel – Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 z-10">
        <motion.div
          className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              Create an account
            </h2>
            <p className="text-sm text-slate-500">
              Get started with AI electricity monitoring
            </p>
          </div>

          {/* Instant Preview Box - Perfectly Spaced */}
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide">
                <Sparkles size={14} className="text-emerald-600" /> Instant Preview Mode
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                No Setup Needed
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleDemoLogin("Aarav Sharma (Demo)", "aarav@demo.com")}
              disabled={isDemoLoading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
            >
              {isDemoLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} fill="currentColor" />}
              Launch Instant Demo Account
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("full_name")}
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-base bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
              {errors.full_name && (
                <p className="text-sm mt-1 text-red-600 font-medium">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-base bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-sm mt-1 text-red-600 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-base bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm mt-1 text-red-600 font-medium">{errors.password.message}</p>
              )}
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {passwordChecks.map((check, i) => (
                  <span key={i} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    check.valid ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {check.valid ? "✓" : "○"} {check.label}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-base bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm mt-1 text-red-600 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || isDemoLoading}
              className="w-full py-3 rounded-xl text-base font-semibold flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-emerald-600 hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
