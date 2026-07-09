"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, CheckCircle, AlertTriangle, ArrowRight,
  TrendingDown, Info, HelpCircle, Send, Sparkles, RefreshCw, X, FileUp
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

// Types for parsed bill
interface ParsedBill {
  discomName: string;
  state: string;
  month: string;
  consumerName: string;
  units: number;
  totalBill: number;
  fixedCharges: number;
  energyCharges: number;
  fpppa: number;
  dutyTax: number;
  meterNo: string;
  dueDate: string;
  savingsPotential: number;
  breakdown: { label: string; amount: number; percentage: number; desc: string }[];
  recommendations: { title: string; desc: string; savings: string; priority: "high" | "medium" | "low" }[];
  qnaAnswers: Record<string, string>;
}

// Sample Bills Pre-sets
const SAMPLE_BILLS: Record<string, ParsedBill> = {
  msedcl: {
    discomName: "MSEDCL (Maharashtra State Electricity)",
    state: "Maharashtra",
    month: "June 2026",
    consumerName: "Rahul Sharma",
    units: 342,
    totalBill: 3124,
    fixedCharges: 125,
    energyCharges: 2433,
    fpppa: 182,
    dutyTax: 384,
    meterNo: "MS-902183",
    dueDate: "25/07/2026",
    savingsPotential: 540,
    breakdown: [
      { label: "Energy Slab Charges", amount: 2433, percentage: 77.8, desc: "Cost of actual units consumed computed across residential slabs." },
      { label: "Fixed / Wheeling Charges", amount: 125, percentage: 4.0, desc: "Fixed connection & delivery fee charged by MSEDCL." },
      { label: "FPPPA (Fuel adjustment)", amount: 182, percentage: 5.8, desc: "Fuel Cost Adjustment charged due to coal/gas price volatility." },
      { label: "Electricity Duty & Tax", amount: 384, percentage: 12.4, desc: "State electricity tax calculated as 16% on bill components." }
    ],
    recommendations: [
      { title: "Avoid Slab Escalation Above 300 Units", desc: "Your usage is 342 units. Crossing 300 units pushes the tariff rate from ₹7.10/unit to ₹9.95/unit. Reduce AC usage slightly or improve efficiency to stay below 300 units.", savings: "Save ₹418/month", priority: "high" },
      { title: "Optimize AC Temperature Setting", desc: "Setting your home cooling to 24°C instead of 20°C can save up to 24% of your compressor energy consumption.", savings: "Save ₹180/month", priority: "high" },
      { title: "Unplug Phantom Entertainment Loads", desc: "Turn off microwave, TV console, and gaming system sockets at night. Phantom standby power adds about 15 units monthly.", savings: "Save ₹106/month", priority: "medium" }
    ],
    qnaAnswers: {
      "why is my bill so high": "Your bill is high primarily because you crossed the 300 units slab threshold. In Maharashtra, rates increase sharply from ₹7.10 to ₹9.95 once you cross 300 kWh, making those final 42 units very expensive. Also, the State Government levies a 16% electricity duty on residential consumption.",
      "what is fpppa in this bill": "FPPPA stands for Fuel Purchase and Power Agreement Adjustment. It is a fuel adjustment charge. Since MSEDCL purchases thermal power whose coal prices vary monthly, they pass these fluctuating fuel costs directly onto consumers. In your bill, this amounts to ₹182.",
      "how can i save money on this bill": "The best step is to drop your usage below 300 units. You are at 342 units. Eliminating just 42 units of wastage will drop your highest tariff tier entirely, saving you ₹418 in energy charges and another ₹66 in electricity duty."
    }
  },
  bescom: {
    discomName: "BESCOM (Bengaluru Electricity Supply Co.)",
    state: "Karnataka",
    month: "June 2026",
    consumerName: "Priya Patel",
    units: 195,
    totalBill: 1580,
    fixedCharges: 110,
    energyCharges: 1285,
    fpppa: 65,
    dutyTax: 120,
    meterNo: "BC-108392",
    dueDate: "20/07/2026",
    savingsPotential: 260,
    breakdown: [
      { label: "Energy Slab Charges", amount: 1285, percentage: 81.3, desc: "Usage tariff charges computed based on Karnataka slab rules." },
      { label: "Fixed Charges", amount: 110, percentage: 7.0, desc: "Fixed rate based on sanctioned load of 3 kW." },
      { label: "FPPPA (Fuel surcharge)", amount: 65, percentage: 4.1, desc: "Power purchase cost adjustments passed by KERC." },
      { label: "Electricity Tax", amount: 120, percentage: 7.6, desc: "Karnataka state government tax on energy consumption." }
    ],
    recommendations: [
      { title: "Limit Consumption Below 200 Units", desc: "You consumed 195 units. Crossing 200 units triggers a higher fixed rate and slab tariff. Maintain active tracking to stay under the 200 threshold.", savings: "Save ₹150/month", priority: "high" },
      { title: "Switch to 5-Star Ceiling Fans", desc: "Upgrading 2 old ceiling fans to BLDC (Brushless DC) 5-star fans will cut fan consumption by 60%, reducing monthly load by 22 units.", savings: "Save ₹90/month", priority: "medium" },
      { title: "Clean AC Filters Monthly", desc: "Clogged filters force the compressor to work harder, increasing power draw by 10%.", savings: "Save ₹70/month", priority: "low" }
    ],
    qnaAnswers: {
      "why is my bill so high": "Your usage is 195 units, which is quite close to the 200-unit slab boundary. In Bengaluru, keeping usage under 200 units is highly beneficial. Fixed charges are moderate, but they will spike if your sanctioned load is exceeded.",
      "what is fpppa in this bill": "Under BESCOM, FPPPA is the Fuel Cost Adjustment. Since Karnataka purchases hydel and thermal power, any deficit is met through thermal purchases, causing fluctuating surcharges approved by KERC. It is ₹65 on your current bill.",
      "how can i save money on this bill": "Ensure your sanctioned load is correct (e.g. 2kW or 3kW). Exceeding it results in heavy penalty charges on your fixed billing. Also, transitioning to BLDC fans will easily lower your units to stay safely below the 200 unit threshold."
    }
  },
  tata: {
    discomName: "Tata Power Delhi Distribution Ltd.",
    state: "Delhi",
    month: "June 2026",
    consumerName: "Amit Kumar",
    units: 480,
    totalBill: 4110,
    fixedCharges: 150,
    energyCharges: 3260,
    fpppa: 280,
    dutyTax: 420,
    meterNo: "TP-55291",
    dueDate: "18/07/2026",
    savingsPotential: 850,
    breakdown: [
      { label: "Energy Slab Charges", amount: 3260, percentage: 79.3, desc: "Delhi residential tariff slab rates." },
      { label: "Fixed Charges", amount: 150, percentage: 3.6, desc: "Fixed charge based on 4 kW load connection." },
      { label: "FPPPA Surcharges", amount: 280, percentage: 6.8, desc: "Power Purchase Cost Adjustment Charges (PPAC)." },
      { label: "Delhi Surcharge & Tax", amount: 420, percentage: 10.3, desc: "Includes 8% Pension Trust surcharge and state taxes." }
    ],
    recommendations: [
      { title: "Control Usage to Avoid 400 Unit Slab Spike", desc: "In Delhi, crossing 400 units removes the state subsidy entirely, and tariff jumps. Your usage is 480. Saving 80 units will reduce your bill dramatically.", savings: "Save ₹650/month", priority: "high" },
      { title: "Run Heavy Appliances in Off-Peak Hours", desc: "If you have a Time-of-Day meter, run washing machines and dishwashers during morning hours (10 AM to 5 PM) when tariffs are discounted.", savings: "Save ₹120/month", priority: "medium" },
      { title: "Upgrade to LED Tube Lights", desc: "Replace old 40W fluorescent tube lights with modern 18W LEDs, which cut lighting power in half.", savings: "Save ₹80/month", priority: "low" }
    ],
    qnaAnswers: {
      "why is my bill so high": "Your bill is very high because you consumed 480 units, crossing Delhi's crucial 400-unit subsidy threshold. Once you cross 400 units, you lose the 50% state subsidy entirely, causing a significant leap in the billing rate.",
      "what is fpppa in this bill": "In Delhi, PPAC (Power Purchase Adjustment Charge) is calculated as a percentage of the energy charges to meet the dynamic wholesale purchase costs of power. In your bill, this is ₹280.",
      "how can i save money on this bill": "The single most important goal is to drop below 400 units. You are currently at 480 units. Shaving off 81 units will reclaim the Delhi government subsidy, which cuts your entire bill by nearly 40%!"
    }
  }
};

export default function BillUploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningStep, setScanningStep] = useState("");
  const [activeTab, setActiveTab] = useState<"breakdown" | "explainer" | "saving" | "chat">("breakdown");
  
  // Chat State
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: "Hello! I have analyzed your uploaded bill. Feel free to ask me questions like: 'Why is my bill high?' or 'What is FPPPA?'" }
  ]);
  const [inputValue, setInputValue] = useState("");

  // Result parsed bill state
  const [parsedResult, setParsedResult] = useState<ParsedBill | null>(null);

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setFile(file);
    simulateOCR();
  };

  // Simulate AI Scan
  const simulateOCR = (sampleKey?: string) => {
    setIsScanning(true);
    const steps = [
      "Initializing AI Document Parser...",
      "Executing OCR text extraction...",
      "Locating Consumer Details & Meter Number...",
      "Extracting Energy Consumption Units (kWh)...",
      "Mapping Indian State DISCOM Tariff tiers...",
      "Analyzing taxes, duties & FPPPA adjustment surcharge...",
      "Structuring saving recommendations plan..."
    ];

    let currentStep = 0;
    setScanningStep(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setScanningStep(steps[currentStep]);
      } else {
        clearInterval(interval);
        setIsScanning(false);
        // Default to MSEDCL if a random file was uploaded, otherwise load selected sample
        const parsedKey = sampleKey || "msedcl";
        setParsedResult(SAMPLE_BILLS[parsedKey]);
        setActiveTab("breakdown");
        setMessages([
          { sender: "ai", text: `I've finished analyzing your ${SAMPLE_BILLS[parsedKey].discomName} bill. I found that you consumed ${SAMPLE_BILLS[parsedKey].units} units and have a potential monthly savings of ${formatCurrency(SAMPLE_BILLS[parsedKey].savingsPotential)}. How can I help explain this bill?` }
        ]);
      }
    }, 600);
  };

  const handleSampleClick = (key: string) => {
    simulateOCR(key);
  };

  const handleReset = () => {
    setFile(null);
    setParsedResult(null);
    setMessages([
      { sender: "ai", text: "Hello! I have analyzed your uploaded bill. Feel free to ask me questions like: 'Why is my bill high?' or 'What is FPPPA?'" }
    ]);
  };

  // Chat Send Handler
  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || !parsedResult) return;

    const userMsg = { sender: "user" as const, text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");

    // Look for matching mock responses based on parsed bill
    setTimeout(() => {
      const cleanQuery = text.toLowerCase();
      let replyText = "I see. In Indian power bills, overall costs are determined by your units consumed multiplied by the slab tariff rate, plus static duties and municipal adjustments. Let me know if you want to know about saving plans!";

      if (cleanQuery.includes("high") || cleanQuery.includes("why is my bill")) {
        replyText = parsedResult.qnaAnswers["why is my bill so high"] || replyText;
      } else if (cleanQuery.includes("fpppa") || cleanQuery.includes("fuel") || cleanQuery.includes("adjustment") || cleanQuery.includes("surcharge") || cleanQuery.includes("ppac")) {
        replyText = parsedResult.qnaAnswers["what is fpppa in this bill"] || replyText;
      } else if (cleanQuery.includes("save") || cleanQuery.includes("reduce") || cleanQuery.includes("money") || cleanQuery.includes("cut")) {
        replyText = parsedResult.qnaAnswers["how can i save money on this bill"] || replyText;
      }

      setMessages(prev => [...prev, { sender: "ai", text: replyText }]);
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            AI Bill Explainer & Optimizer 📄
          </h1>
          <p className="text-sm text-slate-500">
            Upload any Indian electricity bill to analyze slab charges, hidden taxes, and get expert saving plans.
          </p>
        </div>
        {parsedResult && (
          <button
            onClick={handleReset}
            className="px-4 py-2 text-xs font-semibold border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-xl flex items-center gap-1.5 transition-all"
          >
            <RefreshCw size={14} /> Upload Another Bill
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── CASE 1: SCANNING PROGRESS OVERLAY ─── */}
        {isScanning && (
          <motion.div
            key="scanning"
            className="rounded-2xl p-10 bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-6 min-h-[350px]"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-emerald-600 animate-spin" />
              <Sparkles size={24} className="text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 text-lg">AI Document Analysis in Progress</h3>
              <p className="text-sm text-emerald-700 font-semibold flex items-center justify-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-ping" />
                {scanningStep}
              </p>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              We are parsing your state electricity board tariffs, extracting units consumed, and generating optimization models.
            </p>
          </motion.div>
        )}

        {/* ─── CASE 2: MAIN EXPLORE & DASHBOARD TABS ─── */}
        {!isScanning && parsedResult && (
          <motion.div
            key="dashboard"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Left 2 Columns: Main Tabs & Visuals */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tab Navigation */}
              <div className="flex gap-2 p-1.5 rounded-xl bg-slate-200/80 w-fit">
                {[
                  { id: "breakdown", label: "Bill Breakdown", icon: FileText },
                  { id: "explainer", label: "Charge Glossary", icon: Info },
                  { id: "saving", label: "Savings Checklist", icon: TrendingDown },
                  { id: "chat", label: "Ask AI Assistant", icon: HelpCircle }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeTab === tab.id
                          ? "bg-white text-emerald-800 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Icon size={14} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Panel */}
              <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm min-h-[400px]">
                {/* ─── TAB 1: BILL BREAKDOWN ─── */}
                {activeTab === "breakdown" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {parsedResult.state} • DISCOM
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-1">{parsedResult.discomName}</h3>
                        <p className="text-xs text-slate-500">Consumer: {parsedResult.consumerName} | Meter: {parsedResult.meterNo}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-slate-400">Total Bill Amount</p>
                        <p className="text-2xl font-black text-slate-900">{formatCurrency(parsedResult.totalBill)}</p>
                        <p className="text-[11px] font-bold text-emerald-600">Consumption: {parsedResult.units} kWh</p>
                      </div>
                    </div>

                    {/* Progress bars of components */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Cost Component Breakdown</h4>
                      <div className="space-y-3">
                        {parsedResult.breakdown.map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-700">{item.label}</span>
                              <span className="text-slate-900 font-bold">{formatCurrency(item.amount)} ({item.percentage}%)</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-emerald-600 rounded-full"
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-slate-500 italic">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Quick Facts */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-[11px] text-slate-500">Average Unit Cost</p>
                        <p className="text-base font-bold text-slate-800">₹{(parsedResult.totalBill / parsedResult.units).toFixed(2)}/unit</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-[11px] text-slate-500">Surcharge Ratio</p>
                        <p className="text-base font-bold text-slate-800">
                          {(( (parsedResult.fpppa + parsedResult.dutyTax) / parsedResult.totalBill ) * 100).toFixed(1)}% of bill
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 2: EXPLAINER / GLOSSARY ─── */}
                {activeTab === "explainer" && (
                  <div className="space-y-6">
                    <h3 className="text-base font-bold text-slate-900">Understanding Your Bill Charges 💡</h3>
                    <p className="text-xs text-slate-500">
                      Indian electricity bills consist of multiple complex tariff items. Here is what your specific bill charges mean:
                    </p>

                    <div className="space-y-4 divide-y divide-slate-100">
                      <div className="pt-0">
                        <h4 className="text-xs font-bold text-emerald-800 mb-1">1. Fixed / Demand Charges</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          This is a fixed monthly tariff levied by the DISCOM based on your sanctioned load (e.g. 2kW or 3kW). It must be paid even if you consume 0 units. Reducing your load limit can drop this charge.
                        </p>
                      </div>

                      <div className="pt-4">
                        <h4 className="text-xs font-bold text-emerald-800 mb-1">2. Energy Slab Charges</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          The actual cost of energy consumed. India uses slab tariffs, meaning the rate increases as you consume more. In your current bill, your average energy cost is ₹{(parsedResult.energyCharges / parsedResult.units).toFixed(2)} per kWh.
                        </p>
                      </div>

                      <div className="pt-4">
                        <h4 className="text-xs font-bold text-emerald-800 mb-1">3. FPPPA (Fuel Cost Adjustment)</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Fuel Purchase and Power Agreement Adjustment is charged because fuel costs (coal, gas, oil) fluctuate. State utilities adjust rates monthly or quarterly based on actual power procurement bills.
                        </p>
                      </div>

                      <div className="pt-4">
                        <h4 className="text-xs font-bold text-emerald-800 mb-1">4. Electricity Duty & Municipal Tax</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Tax collected by the state government and municipal corporation. In {parsedResult.state}, this is calculated as a percentage of your total bill items.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 3: AI SAVINGS CHECKLIST ─── */}
                {activeTab === "saving" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      <div>
                        <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">AI Saving Strategy</p>
                        <h4 className="text-base font-bold text-emerald-950 mt-0.5">Potential Savings Detected</h4>
                      </div>
                      <span className="text-xl font-extrabold text-emerald-700">{formatCurrency(parsedResult.savingsPotential)}/mo</span>
                    </div>

                    <div className="space-y-4">
                      {parsedResult.recommendations.map((rec, i) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex items-start gap-3">
                          <div className={`p-1.5 rounded-lg mt-0.5 ${
                            rec.priority === "high" ? "bg-red-50 text-red-700" : rec.priority === "medium" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                          }`}>
                            <AlertTriangle size={15} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <h5 className="text-sm font-bold text-slate-900">{rec.title}</h5>
                              <span className="text-xs font-bold text-emerald-700">{rec.savings}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rec.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── TAB 4: ASK AI CHAT ─── */}
                {activeTab === "chat" && (
                  <div className="flex flex-col h-[420px] bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                    {/* Chat Messages */}
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                      {messages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-xs p-3 rounded-2xl text-xs leading-relaxed ${
                            msg.sender === "user"
                              ? "bg-slate-950 text-white rounded-tr-none"
                              : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Preset suggested queries */}
                    <div className="p-2 border-t border-slate-200 bg-white flex gap-1.5 overflow-x-auto flex-wrap">
                      <button
                        onClick={() => handleSendMessage("Why is my bill high?")}
                        className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-700 transition-colors"
                      >
                        Why is my bill high?
                      </button>
                      <button
                        onClick={() => handleSendMessage("What is FPPPA in my bill?")}
                        className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-700 transition-colors"
                      >
                        What is FPPPA?
                      </button>
                      <button
                        onClick={() => handleSendMessage("How can I save money on this bill?")}
                        className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-700 transition-colors"
                      >
                        How to save money?
                      </button>
                    </div>

                    {/* Input message form */}
                    <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                      <input
                        type="text"
                        placeholder="Ask about this parsed bill..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => handleSendMessage()}
                        className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Dynamic Side Panel with Saving Meter */}
            <div className="space-y-6">
              <div className="rounded-2xl p-6 bg-slate-900 text-white space-y-4">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded">
                  Saving Meter
                </span>
                <div>
                  <p className="text-xs opacity-75">Optimized Target Bill</p>
                  <p className="text-3xl font-black mt-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                    {formatCurrency(parsedResult.totalBill - parsedResult.savingsPotential)}
                  </p>
                  <p className="text-xs opacity-80 mt-1">
                    Reduced from original {formatCurrency(parsedResult.totalBill)}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="opacity-75">Potential Cost Reduction:</span>
                    <span className="font-bold text-emerald-400">
                      -{((parsedResult.savingsPotential / parsedResult.totalBill) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="opacity-75">Slab Target:</span>
                    <span className="font-bold text-amber-300">Keep under {parsedResult.units > 300 ? "300" : "200"} units</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("saving")}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <TrendingDown size={14} /> See Action Plan
                </button>
              </div>

              {/* Explainer card */}
              <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Sparkles size={14} className="text-emerald-600" />
                  India Slab Rate Notice
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Indian DISCOMs charge residential tariffs based on graded tiers. Crossing slabs (like 100, 200, 300, or 400 units) significantly escalates the per-unit price. Staying slightly under these boundaries is the easiest way to save.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── CASE 3: DROPZONE & SAMPLE SELECTOR ─── */}
        {!isScanning && !parsedResult && (
          <motion.div
            key="dropzone"
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Drag & Drop File Zone */}
            <div
              className={`rounded-3xl p-10 border-2 border-dashed text-center flex flex-col items-center justify-center min-h-[300px] transition-all bg-white shadow-sm ${
                dragActive
                  ? "border-emerald-500 bg-emerald-50/20"
                  : "border-slate-300 hover:border-slate-400 bg-white"
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 shadow-inner">
                <FileUp size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-800" style={{ fontFamily: "Outfit, sans-serif" }}>
                Drag & drop your electricity bill file
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Supports PDF statements, JPEG, or PNG scans from any Indian DISCOM (MSEDCL, BESCOM, Tata Power, BSES, etc.)
              </p>
              
              <div className="relative mt-5">
                <input
                  type="file"
                  id="bill-file-selector"
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="bill-file-selector"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-emerald-600/20 transition-all inline-block"
                >
                  Browse Files
                </label>
              </div>
            </div>

            {/* Pre-loaded Sample Bills Selector */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                Or Try with Sample Indian Bills
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => handleSampleClick("msedcl")}
                  className="p-4 bg-white border border-slate-200 rounded-2xl hover:shadow-md hover:border-emerald-500 transition-all text-left space-y-2 group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase px-1.5 py-0.5 rounded bg-emerald-50">
                      MSEDCL (Mumbai)
                    </span>
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">June Residential Statement</h4>
                  <p className="text-xs text-slate-500">342 units • ₹3,124 total bill</p>
                </button>

                <button
                  onClick={() => handleSampleClick("bescom")}
                  className="p-4 bg-white border border-slate-200 rounded-2xl hover:shadow-md hover:border-emerald-500 transition-all text-left space-y-2 group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase px-1.5 py-0.5 rounded bg-emerald-50">
                      BESCOM (Bengaluru)
                    </span>
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">June Standard Statement</h4>
                  <p className="text-xs text-slate-500">195 units • ₹1,580 total bill</p>
                </button>

                <button
                  onClick={() => handleSampleClick("tata")}
                  className="p-4 bg-white border border-slate-200 rounded-2xl hover:shadow-md hover:border-emerald-500 transition-all text-left space-y-2 group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase px-1.5 py-0.5 rounded bg-emerald-50">
                      Tata Power (Delhi)
                    </span>
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">June Medium Load</h4>
                  <p className="text-xs text-slate-500">480 units • ₹4,110 total bill</p>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
