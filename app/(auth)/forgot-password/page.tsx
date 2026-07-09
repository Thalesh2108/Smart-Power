"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, ArrowLeft, Zap, Loader2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/dashboard`,
      });

      if (error) {
        toast.error(error.message || "Failed to send reset email.");
        return;
      }

      setSent(true);
      toast.success("Password reset email sent!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, hsl(220,91%,54%) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "linear-gradient(hsl(210,40%,98%) 1px, transparent 1px), linear-gradient(90deg, hsl(210,40%,98%) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(220,91%,54%) 0%, hsl(250,91%,60%) 100%)" }}>
            <Zap size={20} className="text-white" fill="white" />
          </div>
          <span className="text-xl font-bold" style={{ fontFamily: "Outfit, sans-serif" }}>SmartPower</span>
        </div>

        <div className="glass rounded-2xl p-8" style={{ border: "1px solid hsl(220,30%,22%)" }}>
          {!sent ? (
            <>
              <div className="mb-7">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "hsla(220,91%,54%,0.15)", border: "1px solid hsla(220,91%,54%,0.3)" }}>
                  <Mail size={24} style={{ color: "hsl(220,91%,70%)" }} />
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Forgot Password?
                </h2>
                <p className="text-sm" style={{ color: "hsl(215,16%,60%)" }}>
                  No worries! Enter your registered email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "hsl(210,40%,85%)" }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: "hsl(215,16%,55%)" }} />
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="yourname@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all"
                      style={{
                        background: "hsl(220,40%,11%)",
                        border: errors.email ? "1px solid hsl(0,72%,51%)" : "1px solid hsl(220,30%,22%)",
                        color: "hsl(210,40%,98%)",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "hsl(220,91%,54%)")}
                      onBlur={(e) => (e.target.style.borderColor = errors.email ? "hsl(0,72%,51%)" : "hsl(220,30%,22%)")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs mt-1" style={{ color: "hsl(0,72%,65%)" }}>{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, hsl(220,91%,54%) 0%, hsl(250,91%,60%) 100%)",
                    color: "white",
                    boxShadow: "0 4px 20px hsla(220,91%,54%,0.35)",
                  }}
                >
                  {isLoading ? (
                    <><Loader2 size={16} className="animate-spin" />Sending...</>
                  ) : (
                    <><Send size={16} />Send Reset Link</>
                  )}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              className="text-center py-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "hsla(142,71%,45%,0.15)", border: "1px solid hsla(142,71%,45%,0.4)" }}>
                <Send size={28} style={{ color: "hsl(142,71%,55%)" }} />
              </div>
              <h3 className="text-xl font-bold mb-2">Check Your Email</h3>
              <p className="text-sm mb-1" style={{ color: "hsl(215,16%,60%)" }}>
                We&apos;ve sent a password reset link to:
              </p>
              <p className="font-semibold text-sm mb-6" style={{ color: "hsl(220,91%,70%)" }}>
                {getValues("email")}
              </p>
              <p className="text-xs" style={{ color: "hsl(215,16%,50%)" }}>
                Didn&apos;t receive it? Check your spam folder.
              </p>
            </motion.div>
          )}

          <Link href="/login"
            className="flex items-center gap-2 justify-center text-sm mt-6 hover:opacity-70 transition-opacity"
            style={{ color: "hsl(215,16%,60%)" }}>
            <ArrowLeft size={14} />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
