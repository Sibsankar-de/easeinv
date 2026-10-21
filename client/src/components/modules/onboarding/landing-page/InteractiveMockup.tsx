"use client";

import { useState } from "react";
import { Lock, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function InteractiveMockup() {
  const [activeMockupTab, setActiveMockupTab] = useState<
    "dashboard" | "invoices" | "inventory"
  >("dashboard");

  return (
    <div className="w-full max-w-5xl rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Top Browser Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-border/40 bg-muted/15">
        <div className="flex items-center gap-4">
          {/* Dots */}
          <div className="flex gap-1.5 font-bold">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          {/* Mode Selector Tabs */}
          <div className="flex bg-muted/40 p-1 rounded-lg border border-border/30">
            <button
              onClick={() => setActiveMockupTab("dashboard")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeMockupTab === "dashboard"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dashboard View
            </button>
            <button
              onClick={() => setActiveMockupTab("invoices")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeMockupTab === "invoices"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Invoicing Grid
            </button>
            <button
              onClick={() => setActiveMockupTab("inventory")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeMockupTab === "inventory"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Stock Ledger
            </button>
          </div>
        </div>
        <div className="hidden md:flex bg-background/60 rounded-lg px-4 py-1.5 text-xs text-muted-foreground items-center gap-2 border border-border/30">
          <Lock className="w-3.5 h-3.5 text-green-500" />
          easeinv.app/dashboard
        </div>
      </div>

      {/* Mockup Canvas */}
      <div className="aspect-video w-full bg-background p-4 sm:p-8 flex flex-col overflow-hidden relative">
        {activeMockupTab === "dashboard" && (
          <div className="space-y-6 text-left animate-in fade-in duration-300 flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Sales Snapshot
                </h3>
                <p className="text-xs text-muted-foreground">
                  Monitor revenue totals and invoice statuses
                </p>
              </div>
              <span className="text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full">
                July 2026
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card border border-border/40 p-4 rounded-xl shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">
                  Total Revenue
                </div>
                <div className="text-2xl font-black text-foreground">
                  $48,250.00
                </div>
                <div className="text-[10px] text-green-500 font-semibold mt-1 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" /> +14.2% from last month
                </div>
              </div>
              <div className="bg-card border border-border/40 p-4 rounded-xl shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">
                  Pending Invoices
                </div>
                <div className="text-2xl font-black text-foreground">
                  8 Pending
                </div>
                <div className="text-[10px] text-amber-500 font-semibold mt-1">
                  Average age: 4.2 Days
                </div>
              </div>
              <div className="bg-card border border-border/40 p-4 rounded-xl shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">
                  Active Customers
                </div>
                <div className="text-2xl font-black text-foreground">
                  248 Customers
                </div>
                <div className="text-[10px] text-indigo-500 font-semibold mt-1">
                  12 added this week
                </div>
              </div>
            </div>

            {/* Revenue Chart Visualizer */}
            <div className="bg-card border border-border/40 p-4 rounded-xl shadow-sm flex-1 flex flex-col justify-between min-h-[140px]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-foreground">
                  Monthly Earnings
                </span>
                <span className="text-[10px] text-muted-foreground">
                  USD ($)
                </span>
              </div>
              <div className="h-full w-full pt-4 flex flex-col justify-between flex-1 min-h-[110px]">
                <div className="relative w-full flex-1">
                  <svg
                    viewBox="0 0 500 100"
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary, #4f39f6)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="var(--color-primary, #4f39f6)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Background Grid Lines */}
                    <line x1="0" y1="20" x2="500" y2="20" stroke="var(--color-border, rgba(0,0,0,0.06))" strokeDasharray="4 4" strokeWidth="1" />
                    <line x1="0" y1="50" x2="500" y2="50" stroke="var(--color-border, rgba(0,0,0,0.06))" strokeDasharray="4 4" strokeWidth="1" />
                    <line x1="0" y1="80" x2="500" y2="80" stroke="var(--color-border, rgba(0,0,0,0.06))" strokeDasharray="4 4" strokeWidth="1" />

                    {/* Gradient Area */}
                    <path
                      d="M 0.0 68.0 L 45.5 54.5 L 90.9 72.5 L 136.4 41.0 L 181.8 50.0 L 227.3 30.0 L 272.7 14.0 L 318.2 23.0 L 363.6 9.5 L 409.1 36.5 L 454.5 18.5 L 500.0 5.0 L 500 100 L 0 100 Z"
                      fill="url(#chartGradient)"
                    />

                    {/* Line Stroke */}
                    <path
                      d="M 0.0 68.0 L 45.5 54.5 L 90.9 72.5 L 136.4 41.0 L 181.8 50.0 L 227.3 30.0 L 272.7 14.0 L 318.2 23.0 L 363.6 9.5 L 409.1 36.5 L 454.5 18.5 L 500.0 5.0"
                      fill="none"
                      stroke="var(--color-primary, #4f39f6)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Active Point Circle */}
                    <circle
                      cx="500"
                      cy="5.0"
                      r="4"
                      fill="var(--color-primary, #4f39f6)"
                      stroke="var(--background, #ffffff)"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <div className="flex justify-between w-full pt-2">
                  {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map((m, i) => (
                    <span key={i} className="text-[9px] text-muted-foreground font-semibold w-6 text-center">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMockupTab === "invoices" && (
          <div className="space-y-6 text-left animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Invoice Directory
                </h3>
                <p className="text-xs text-muted-foreground">
                  Manage and track billing invoices
                </p>
              </div>
              <Link
                href="/auth/signup"
                className="text-xs font-bold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/95 transition-colors"
              >
                + Create Invoice
              </Link>
            </div>

            <div className="border border-border/50 rounded-xl overflow-hidden bg-card">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/30 border-b border-border/40 text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">Invoice ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-foreground font-medium">
                  <tr>
                    <td className="p-3 text-primary font-bold">INV-2026-004</td>
                    <td className="p-3">Globex Corp</td>
                    <td className="p-3">Jul 01, 2026</td>
                    <td className="p-3 font-bold">$1,450.00</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/10 text-green-600 font-bold border border-green-500/20">
                        Paid
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-primary font-bold">INV-2026-003</td>
                    <td className="p-3">Acme Industries</td>
                    <td className="p-3">Jun 28, 2026</td>
                    <td className="p-3 font-bold">$840.50</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 font-bold border border-amber-500/20">
                        Pending
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-primary font-bold">INV-2026-002</td>
                    <td className="p-3">Wayne Enterprises</td>
                    <td className="p-3">Jun 25, 2026</td>
                    <td className="p-3 font-bold">$3,120.00</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-600 font-bold border border-red-500/20">
                        Overdue
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMockupTab === "inventory" && (
          <div className="space-y-6 text-left animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Stock Registry
                </h3>
                <p className="text-xs text-muted-foreground">
                  Monitor real-time product quantities and margins
                </p>
              </div>
              <span className="text-[11px] bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full font-semibold border border-amber-500/20">
                2 Items Low Stock
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-card border border-border/40 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Item Name
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      Apple MacBook Pro 14"
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] bg-green-500/10 text-green-600 border border-green-500/20 font-bold">
                    In Stock
                  </span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: "80%" }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                  <span>40/50 Units</span>
                  <span>Margin: 35%</span>
                </div>
              </div>

              <div className="bg-card border border-border/40 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Item Name
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      Sony WH-1000XM5
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20 font-semibold">
                    Low Stock
                  </span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: "20%" }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                  <span>3/15 Units</span>
                  <span>Margin: 28%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
