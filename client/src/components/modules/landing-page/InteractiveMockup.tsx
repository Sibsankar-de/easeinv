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
              <div className="flex items-end justify-between h-full gap-2 pt-4">
                {[30, 45, 25, 60, 50, 75, 90, 80, 95, 65, 85, 100].map(
                  (height, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1.5"
                    >
                      <div
                        className="w-full bg-primary/80 hover:bg-primary transition-all duration-300 rounded-t-sm"
                        style={{ height: `${height * 0.8}%`, minHeight: "4px" }}
                      />
                      <span className="text-[9px] text-muted-foreground font-medium hidden sm:inline">
                        {
                          [
                            "J",
                            "F",
                            "M",
                            "A",
                            "M",
                            "J",
                            "J",
                            "A",
                            "S",
                            "O",
                            "N",
                            "D",
                          ][i]
                        }
                      </span>
                    </div>
                  ),
                )}
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
