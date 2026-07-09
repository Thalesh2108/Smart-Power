"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame, Zap, Wallet, TrendingDown, Sun, Lightbulb, Lock, CheckCircle, Play } from "lucide-react";
import { useUsage } from "@/hooks/useUsage";
import { useSettings } from "@/hooks/useSettings";
import {
  ALL_CHALLENGES,
  evaluateChallenges,
  acceptChallenge,
  getCompletedChallengeIds,
  getAcceptedChallengeIds,
  type ChallengeProgress,
} from "@/lib/ai/challenges";

const ICON_MAP: Record<string, React.ElementType> = {
  Zap, Wallet, TrendingDown, Flame, Sun, Lightbulb, Trophy,
};

const DIFFICULTY_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  easy: { label: "Easy", bg: "bg-emerald-100", text: "text-emerald-700" },
  medium: { label: "Medium", bg: "bg-amber-100", text: "text-amber-700" },
  hard: { label: "Hard", bg: "bg-red-100", text: "text-red-700" },
};

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  );
}

export default function ChallengesPage() {
  const { usageData } = useUsage();
  const { tariff, budget } = useSettings();
  const [accepted, setAccepted] = useState<string[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  useEffect(() => {
    setAccepted(getAcceptedChallengeIds());
    setCompleted(getCompletedChallengeIds());
  }, []);

  const progressMap = useMemo((): Record<string, ChallengeProgress> => {
    const results = evaluateChallenges(usageData, tariff, budget);
    return Object.fromEntries(results.map((r) => [r.challengeId, r]));
  }, [usageData, tariff, budget]);

  function handleAccept(id: string) {
    acceptChallenge(id);
    setAccepted((prev) => [...prev, id]);
  }

  // Confetti-style completion feedback
  useEffect(() => {
    if (justCompleted) {
      const t = setTimeout(() => setJustCompleted(null), 3000);
      return () => clearTimeout(t);
    }
  }, [justCompleted]);

  const completedChallenges = ALL_CHALLENGES.filter((c) => completed.includes(c.id));
  const activeChallenges = ALL_CHALLENGES.filter((c) => accepted.includes(c.id) && !completed.includes(c.id));
  const lockedChallenges = ALL_CHALLENGES.filter((c) => !accepted.includes(c.id) && !completed.includes(c.id));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Smart Challenges 🏆
          </h1>
          <p className="text-sm text-slate-500">
            Gamified energy-saving challenges — earn badges by hitting real efficiency targets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
            🏅 {completed.length} Badges Earned
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-blue-100 text-blue-800 text-xs font-bold">
            ⚡ {activeChallenges.length} Active
          </div>
        </div>
      </div>

      {/* Completion Toast */}
      <AnimatePresence>
        {justCompleted && (
          <motion.div
            className="rounded-2xl p-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-center shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            🎉 Challenge Completed! Badge Earned!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Earned Badges */}
      {completedChallenges.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-700 mb-3">🏅 Earned Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {completedChallenges.map((ch) => {
              const Icon = ICON_MAP[ch.icon] ?? Trophy;
              return (
                <motion.div
                  key={ch.id}
                  className="rounded-2xl p-4 border border-slate-200 bg-white shadow-sm flex items-center gap-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="p-2.5 rounded-xl" style={{ background: `${ch.badgeColor}18` }}>
                    <Icon size={20} style={{ color: ch.badgeColor }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">{ch.title}</p>
                    <p className="text-[11px] font-semibold mt-0.5" style={{ color: ch.badgeColor }}>{ch.reward}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-700 mb-3">⚡ Active Challenges</h2>
          <div className="space-y-4">
            {activeChallenges.map((ch, i) => {
              const Icon = ICON_MAP[ch.icon] ?? Zap;
              const progress = progressMap[ch.id];
              const diff = DIFFICULTY_BADGE[ch.difficulty];
              return (
                <motion.div
                  key={ch.id}
                  className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: `${ch.badgeColor}18` }}>
                      <Icon size={20} style={{ color: ch.badgeColor }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900">{ch.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${diff.bg} ${diff.text}`}>
                          {diff.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{ch.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-600 font-semibold">
                      <span>Progress: {progress?.currentValue ?? 0} / {ch.target} {ch.unit}</span>
                      <span style={{ color: ch.badgeColor }}>{progress?.progressPct.toFixed(0)}%</span>
                    </div>
                    <ProgressBar pct={progress?.progressPct ?? 0} color={ch.badgeColor} />
                    <p className="text-[11px] text-slate-400">Reward: {ch.reward}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Challenges */}
      {lockedChallenges.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-700 mb-3">🎯 Available Challenges</h2>
          <div className="space-y-4">
            {lockedChallenges.map((ch, i) => {
              const Icon = ICON_MAP[ch.icon] ?? Zap;
              const progress = progressMap[ch.id];
              const diff = DIFFICULTY_BADGE[ch.difficulty];
              return (
                <motion.div
                  key={ch.id}
                  className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl flex-shrink-0 bg-slate-100">
                      <Icon size={20} className="text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900">{ch.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${diff.bg} ${diff.text}`}>
                          {diff.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{ch.description}</p>
                      <p className="text-[11px] text-slate-400 mt-1">Reward: {ch.reward}</p>
                    </div>
                    <button
                      onClick={() => handleAccept(ch.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex-shrink-0"
                    >
                      <Play size={12} /> Accept
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Motivation banner */}
      {activeChallenges.length === 0 && lockedChallenges.length > 0 && (
        <div className="rounded-2xl p-5 bg-gradient-to-br from-indigo-600 to-violet-700 text-white text-center">
          <Trophy size={28} className="mx-auto mb-2 opacity-80" />
          <p className="font-bold text-lg" style={{ fontFamily: "Outfit, sans-serif" }}>Ready to save energy?</p>
          <p className="text-sm opacity-90 mt-1">Accept a challenge above to start earning badges and reducing your electricity bill!</p>
        </div>
      )}
    </div>
  );
}
