"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "hsl(222, 47%, 11%)" }}>

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            background: "radial-gradient(circle, hsla(220,91%,54%,0.2) 0%, transparent 70%)",
            top: "10%",
            left: "10%",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full"
          style={{
            background: "radial-gradient(circle, hsla(142,71%,45%,0.15) 0%, transparent 70%)",
            bottom: "15%",
            right: "10%",
          }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full"
          style={{
            background: "radial-gradient(circle, hsla(48,96%,53%,0.1) 0%, transparent 70%)",
            top: "50%",
            right: "20%",
          }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(hsl(210,40%,98%) 1px, transparent 1px), linear-gradient(90deg, hsl(210,40%,98%) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main content */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          className="relative"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(220,91%,54%) 0%, hsl(250,91%,60%) 100%)",
              boxShadow: "0 0 60px hsla(220,91%,54%,0.5)",
            }}>
            <Zap size={48} className="text-white" fill="white" />
          </div>
          {/* Orbiting dot */}
          <motion.div
            className="absolute w-4 h-4 rounded-full"
            style={{
              background: "hsl(48,96%,53%)",
              top: -4,
              right: -4,
              boxShadow: "0 0 12px hsl(48,96%,53%)",
            }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>

        {/* App name */}
        <div className="text-center">
          <motion.h1
            className="text-5xl font-bold tracking-tight"
            style={{
              fontFamily: "Outfit, sans-serif",
              background: "linear-gradient(135deg, hsl(210,40%,98%) 0%, hsl(220,91%,80%) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            SmartPower
          </motion.h1>
          <motion.p
            className="mt-2 text-sm font-medium tracking-widest uppercase"
            style={{ color: "hsl(142,71%,45%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            AI-Powered Electricity Monitoring
          </motion.p>
        </div>

        {/* Loading bar */}
        <motion.div
          className="w-48 h-1 rounded-full overflow-hidden"
          style={{ background: "hsl(220,30%,22%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, hsl(220,91%,54%), hsl(142,71%,45%))",
            }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.8, duration: 1.6, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.p
          className="text-xs"
          style={{ color: "hsl(215,16%,65%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Initializing AI Engine...
        </motion.p>
      </motion.div>

      {/* Bottom branding */}
      <motion.div
        className="absolute bottom-8 text-xs"
        style={{ color: "hsl(215,16%,50%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        Made for India 🇮🇳
      </motion.div>
    </div>
  );
}
