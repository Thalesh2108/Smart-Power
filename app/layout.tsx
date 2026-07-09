import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "SmartPower – AI-Powered Electricity Bill Monitoring",
  description:
    "AI-powered smart electricity bill monitoring and prediction for Indian households. Track usage, predict bills, and save energy with SmartPower.",
  keywords:
    "electricity bill, AI prediction, India, energy saving, kWh tracker, smart meter",
  authors: [{ name: "SmartPower Team" }],
  openGraph: {
    title: "SmartPower – AI-Powered Electricity Bill Monitoring",
    description:
      "Track electricity usage, predict your bill, and save energy with AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "hsl(220, 40%, 14%)",
              border: "1px solid hsl(220, 30%, 22%)",
              color: "hsl(210, 40%, 98%)",
            },
          }}
          richColors
        />
      </body>
    </html>
  );
}
