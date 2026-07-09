# ⚡ SmartPower

> AI-Powered Smart Electricity Bill Monitoring & Prediction for India 🇮🇳

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)

---

## 📋 Overview

SmartPower is a production-quality SaaS web application that helps Indian households track electricity usage, predict monthly bills using AI, detect anomalies, and get personalized energy-saving recommendations.

**No IoT/hardware required** — users manually enter daily electricity readings.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏠 Dashboard | Stats cards, budget ring, AI score, anomaly alerts, charts |
| ⚡ Daily Usage Entry | Full CRUD with date search and sort |
| 🧮 Bill Calculator | Flat rate + Indian slab rate (MSEDCL) |
| 🤖 AI Predictions | Linear regression for month-end bill prediction |
| 🔍 Anomaly Detection | Z-score based unusual consumption detection |
| 💡 Recommendations | Context-aware energy-saving tips |
| 📊 Analytics | Daily/Weekly/Monthly/Bill Trend charts |
| 📄 Reports | Monthly PDF export with jsPDF |
| ⚙️ Settings | Tariff, budget, alerts, profile |
| ℹ️ About | Problem statement, AI model, tech stack |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Dark Theme
- **Auth + DB**: Supabase (PostgreSQL + Auth)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **PDF Export**: jsPDF
- **Notifications**: Sonner
- **Icons**: Lucide React

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/smartpower.git
cd smartpower
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Settings → API** and copy your URL and anon key

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Database Schema

```
auth.users         ← Supabase managed
user_settings      ← Tariff, budget, notification limit
electricity_usage  ← Daily unit readings
predictions        ← AI prediction cache
reports            ← Monthly report summaries
```

All tables have **Row Level Security (RLS)** — users can only access their own data.

---

## 🤖 AI Modules

### Linear Regression (lib/ai/linear-regression.ts)
- Ordinary Least Squares implementation in pure TypeScript
- Predicts month-end units and bill
- Calculates R² confidence score

### Anomaly Detection (lib/ai/anomaly-detection.ts)
- Z-score based detection: `Z = (x - μ) / σ`
- Three severity levels: low, medium, high
- Rule-based threshold alerts

### Recommendation Engine (lib/ai/recommendations.ts)
- 12 predefined energy-saving tips
- Context-aware selection based on usage patterns
- Categories: appliance, habit, billing, seasonal

---

## 📦 Deployment on Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

---

## 🇮🇳 Indian Electricity System

- Currency: Indian Rupee (₹)
- Date format: DD/MM/YYYY
- Default tariff: ₹7/unit
- Slab rates: MSEDCL example (Maharashtra)
- Default budget: ₹2500/month
- Supports all Indian DISCOM tariff rates

---

## 📁 Project Structure

```
smartpower/
├── app/
│   ├── (auth)/              ← Login, Signup, Forgot Password
│   ├── (dashboard)/         ← All dashboard pages
│   └── page.tsx             ← Splash screen
├── components/
│   └── layout/              ← Sidebar, TopNav
├── hooks/                   ← useUsage, useSettings
├── lib/
│   ├── ai/                  ← Linear regression, anomaly, recommendations
│   ├── supabase/            ← Client, server
│   ├── utils/               ← date, currency, bill
│   └── validations/         ← Zod schemas
├── types/                   ← TypeScript interfaces
├── supabase/
│   └── schema.sql           ← Database setup
└── middleware.ts             ← Auth protection
```

---

## 📄 License

MIT License — Free to use and modify.

---

Made with ❤️ for India 🇮🇳 | SmartPower v1.0
