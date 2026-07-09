"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Zap, Lightbulb, TrendingUp, Wallet, AlertTriangle } from "lucide-react";
import { useUsage } from "@/hooks/useUsage";
import { useSettings } from "@/hooks/useSettings";
import { calculateBill } from "@/lib/utils/bill";
import { formatCurrency } from "@/lib/utils/currency";
import { calculateHealthScore } from "@/lib/ai/health-score";
import { getBudgetCoachInsights } from "@/lib/ai/budget-coach";
import { calculateCO2 } from "@/lib/ai/sustainability";
import { getCurrentDayOfMonth, getDaysInCurrentMonth } from "@/lib/utils/date";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

const SUGGESTIONS = [
  "Why is my bill increasing?",
  "How can I reduce my bill?",
  "Which appliance consumes the most?",
  "How much can I save by reducing AC?",
  "Will I exceed my budget?",
  "What is my carbon footprint?",
  "What's my energy health score?",
  "Give me a tip to save electricity",
];

function getTime() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function AIAssistantPage() {
  const { usageData, totalUnits, avgDailyUnits, dailyUnitsArray } = useUsage();
  const { tariff, budget } = useSettings();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "👋 Hi! I'm **SmartPower AI**, your personal electricity intelligence assistant.\n\nI can answer questions about your usage, bill, savings opportunities, and sustainability. Ask me anything — or tap a suggestion below!",
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentDay = getCurrentDayOfMonth();
  const totalDays = getDaysInCurrentMonth();
  const estimatedBill = useMemo(() => calculateBill(totalUnits, tariff), [totalUnits, tariff]);
  const healthResult = useMemo(
    () => calculateHealthScore(avgDailyUnits, budget, tariff, dailyUnitsArray, 0),
    [avgDailyUnits, budget, tariff, dailyUnitsArray]
  );
  const budgetCoach = useMemo(
    () => getBudgetCoachInsights(totalUnits, currentDay, totalDays, tariff, budget),
    [totalUnits, currentDay, totalDays, tariff, budget]
  );
  const co2 = useMemo(() => calculateCO2(avgDailyUnits * 30), [avgDailyUnits]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function generateResponse(query: string): string {
    const q = query.toLowerCase().trim();

    // Bill increasing
    if (q.includes("bill increasing") || q.includes("bill increase") || q.includes("why") && q.includes("bill")) {
      const sorted = [...usageData].sort((a, b) => a.date.localeCompare(b.date));
      if (sorted.length >= 7) {
        const recent = sorted.slice(-7).reduce((s, u) => s + Number(u.units), 0) / 7;
        const prev = sorted.slice(-14, -7).reduce((s, u) => s + Number(u.units), 0) / 7;
        const pct = prev > 0 ? ((recent - prev) / prev * 100).toFixed(0) : 0;
        if (Number(pct) > 5) {
          return `📈 Your bill is increasing because your average daily consumption rose by **${pct}%** over the past week (from ${prev.toFixed(1)} kWh to ${recent.toFixed(1)} kWh/day).\n\n**Likely causes:**\n• Increased AC usage during hot weather\n• More appliances in standby mode\n• Weekend usage spikes\n• Geyser running longer\n\n💡 Try using the **Smart Savings Simulator** to see exactly how much you can save.`;
        }
      }
      return `📊 Based on your data, your usage is relatively **stable** at ${avgDailyUnits.toFixed(1)} kWh/day. Your projected bill of ${formatCurrency(budgetCoach.projectedBill, 0)} is at ${(budgetCoach.projectedBill / budget * 100).toFixed(0)}% of your budget.\n\nIf you noticed a spike on your physical bill, it may be due to **seasonal changes** or **appliance additions**. Use the Analytics page to spot specific days with high usage.`;
    }

    // Reduce bill
    if (q.includes("reduce") && (q.includes("bill") || q.includes("usage")) || q.includes("save electricity") || q.includes("save power")) {
      return `💡 Here are the **top ways to reduce your electricity bill** for Indian homes:\n\n1. ❄️ **AC at 24°C** — saves 6% per degree (vs 18°C)\n2. 🌀 **Use fans over AC** — fans use 75W vs AC's 1500W\n3. 💡 **Switch to LED bulbs** — 75% less energy\n4. 🔌 **Unplug standby devices** — TVs, chargers waste ~10% passively\n5. 🚿 **Reduce geyser time** — 2 kW geyser running 30 mins less saves ~30 units/month\n6. 🫧 **Full laundry loads** — saves ~2 units per avoided cycle\n\n🎮 Try the **Smart Savings Simulator** to calculate exact savings for your household!`;
    }

    // Which appliance
    if (q.includes("appliance") && (q.includes("most") || q.includes("highest") || q.includes("consume") || q.includes("uses"))) {
      return `🔌 **Typical Indian household appliance power consumption:**\n\n| Appliance | Wattage | Monthly cost (8hrs/day) |\n|---|---|---|\n| Air Conditioner | 1500W | ~${formatCurrency(1500/1000*8*30*tariff, 0)} |\n| Water Heater | 2000W | ~${formatCurrency(2000/1000*2*30*tariff, 0)} |\n| Refrigerator | 150W | ~${formatCurrency(150/1000*24*30*tariff, 0)} |\n| TV | 80W | ~${formatCurrency(80/1000*8*30*tariff, 0)} |\n| Fan | 75W | ~${formatCurrency(75/1000*8*30*tariff, 0)} |\n| LED Bulb | 9W | ~${formatCurrency(9/1000*8*30*tariff, 0)} |\n\n🧮 Use the **Appliance Cost Estimator** for a personalised breakdown!`;
    }

    // AC savings
    if ((q.includes("ac") || q.includes("air condition")) && (q.includes("save") || q.includes("reduce") || q.includes("less"))) {
      const saving2hrs = 1.5 * 2 * 30; // 2 hrs less/day × 30 days
      const moneySaving = saving2hrs * tariff;
      return `❄️ **AC Savings Calculation:**\n\nReducing AC by **2 hours/day** saves:\n• 📦 ${saving2hrs.toFixed(0)} kWh/month\n• 💰 ${formatCurrency(moneySaving, 0)}/month\n• 🌿 ${(saving2hrs * 0.82).toFixed(0)} kg CO₂ avoided\n\nAdditional tips:\n• Set temperature to **24°C** (not 18°C) — saves another 36% of AC cost\n• Use **sleep mode** at night (raises temp to 28°C automatically)\n• Clean AC filters monthly for 5–10% efficiency gain\n\n🎯 Use the **Savings Simulator** to model different scenarios!`;
    }

    // Budget
    if (q.includes("exceed") && q.includes("budget") || q.includes("over budget") || q.includes("budget") && (q.includes("will") || q.includes("going"))) {
      return `💰 **Budget Coach Analysis:**\n\n• **Projected bill:** ${formatCurrency(budgetCoach.projectedBill, 0)}\n• **Your budget:** ${formatCurrency(budget, 0)}\n• **Probability of exceeding:** ${budgetCoach.probability}% (${budgetCoach.probabilityLabel})\n• **Days remaining:** ${budgetCoach.daysRemaining}\n• **Safe daily limit:** ${budgetCoach.dailyLimitUnits.toFixed(1)} kWh/day\n\n${budgetCoach.message}`;
    }

    // Carbon footprint
    if (q.includes("carbon") || q.includes("co2") || q.includes("environment") || q.includes("emission")) {
      const trees = Math.ceil(co2 / (21.7 / 12));
      return `🌿 **Your Environmental Impact:**\n\n• Monthly CO₂ emissions: **${co2.toFixed(1)} kg**\n• Annual projected: **${(co2 * 12).toFixed(0)} kg CO₂**\n• Trees needed to offset: **${trees} trees/month**\n• Equivalent to driving: **${Math.round(co2 / 0.12).toLocaleString("en-IN")} km** by car\n\nIndia's grid emits 0.82 kg CO₂ per kWh (CEA 2023).\n\n🌍 Visit the **Sustainability Dashboard** for full environmental analysis!`;
    }

    // Health score
    if (q.includes("health score") || q.includes("efficiency score") || q.includes("energy score")) {
      return `💚 **Your AI Energy Health Score: ${healthResult.score}/100 (${healthResult.label})**\n\n**Breakdown:**\n• Usage Efficiency: ${healthResult.components.usageScore}/100\n• Budget Adherence: ${healthResult.components.budgetScore}/100\n• Consistency: ${healthResult.components.consistencyScore}/100\n• Anomaly Score: ${healthResult.components.anomalyScore}/100\n\n**Top improvement:** ${healthResult.improvements[0] ?? "Keep up the great work!"}\n\n🔍 Visit the **AI Energy Health Score** page for full details!`;
    }

    // Tip
    if (q.includes("tip") || q.includes("suggestion") || q.includes("advice") || q.includes("recommend")) {
      const tips = [
        "💡 Set your AC to 24°C instead of 18°C. Each degree lower increases consumption by 6% — that's ₹150–300/month in savings!",
        "🌀 Use ceiling fans alongside AC — you can raise the AC temp by 2°C with a fan on, saving significant power.",
        "🔌 Unplug your TV, set-top box, and mobile chargers when not in use. Standby power wastes ~10% of your bill.",
        "🫧 Run your washing machine only with full loads and use cold water when possible — saves 30–40% per cycle.",
        "💡 Replace any remaining incandescent bulbs with LEDs. A 9W LED delivers same light as a 60W bulb.",
        "🚿 Limit geyser use to 15–20 minutes. A 2 kW geyser running 30 mins less per day saves ~30 units/month.",
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    }

    // Usage status
    if (q.includes("usage") || q.includes("consumption") || q.includes("how much") || q.includes("status")) {
      return `📊 **Your Current Usage Status:**\n\n• **Daily average:** ${avgDailyUnits.toFixed(2)} kWh/day\n• **Month total:** ${totalUnits.toFixed(1)} kWh (${usageData.length} days)\n• **Bill accrued:** ${formatCurrency(estimatedBill, 0)}\n• **Days recorded:** ${currentDay} of ${totalDays}\n• **Tariff:** ₹${tariff}/unit\n• **Projected bill:** ${formatCurrency(budgetCoach.projectedBill, 0)}\n\n${budgetCoach.message}`;
    }

    // Hello/greeting
    if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.length < 5) {
      return `👋 Hello! I'm SmartPower AI. I can help you understand your electricity usage, find ways to save money, and reduce your carbon footprint.\n\nTry asking me:\n• "Why is my bill increasing?"\n• "How can I save electricity?"\n• "What's my carbon footprint?"\n• "Will I exceed my budget?"`;
    }

    // Default
    return `🤖 I can help you with electricity usage insights, bill analysis, savings opportunities, and sustainability metrics.\n\nHere are things you can ask me:\n• **"Why is my bill increasing?"** — usage trend analysis\n• **"How to reduce my bill?"** — actionable tips\n• **"Which appliance uses the most?"** — wattage guide\n• **"Will I exceed my budget?"** — budget prediction\n• **"What's my carbon footprint?"** — CO₂ analysis\n• **"What's my health score?"** — efficiency rating\n\nYour current projected bill is **${formatCurrency(budgetCoach.projectedBill, 0)}** (${(budgetCoach.projectedBill / budget * 100).toFixed(0)}% of ₹${budget.toLocaleString("en-IN")} budget).`;
  }

  async function handleSend(text?: string) {
    const query = (text ?? input).trim();
    if (!query) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: query, time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 600));

    const response = generateResponse(query);
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", text: response, time: getTime() };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
    inputRef.current?.focus();
  }

  // Simple markdown bold parser
  function renderText(text: string) {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className={i > 0 ? "mt-1.5" : ""}>
          {parts.map((p, j) =>
            j % 2 === 1 ? <strong key={j}>{p}</strong> : p
          )}
        </p>
      );
    });
  }

  return (
    <div className="flex flex-col max-w-4xl mx-auto h-[calc(100vh-140px)] min-h-[500px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-md">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            SmartPower AI Assistant 🤖
          </h1>
          <p className="text-xs text-slate-500">
            Intelligent energy advisor powered by your real usage data
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Online
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                msg.role === "assistant"
                  ? "bg-gradient-to-br from-indigo-600 to-violet-700"
                  : "bg-emerald-600"
              }`}>
                {msg.role === "assistant" ? <Bot size={16} className="text-white" /> : <User size={16} className="text-white" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-50 border border-slate-200 text-slate-800"
                }`}>
                  {renderText(msg.text)}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-slate-400"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.6 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.slice(0, 4).map((s) => (
          <button
            key={s}
            onClick={() => handleSend(s)}
            disabled={isTyping}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-800 transition disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="mt-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !isTyping) handleSend(); }}
          placeholder="Ask me about your electricity usage..."
          disabled={isTyping}
          className="flex-1 px-4 py-3 rounded-xl text-sm bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-60"
        />
        <button
          onClick={() => handleSend()}
          disabled={isTyping || !input.trim()}
          className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50 flex items-center gap-2 font-semibold text-sm"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
