"use client";

import { useState } from "react";
import {
  FileText,
  Package,
  Users,
  BarChart3,
  Check,
  Printer,
  ShieldAlert,
  TrendingUp
} from "lucide-react";

export default function InteractiveFeaturesTabs() {
  const [activeTab, setActiveTab] = useState<"invoices" | "inventory" | "crm" | "analytics">("invoices");

  const tabContent = {
    invoices: {
      title: "Customizable Invoicing System",
      badge: "Billing Node",
      desc: "Produce compliant billing invoices, receipts, and ledger files in seconds. Configure automated tax structures, custom discount variables, and print templates easily.",
      bullets: [
        "Dynamic VAT/GST tax rate templates.",
        "Staggered discounts per item or flat rates.",
        "Pre-configured print stylesheets for POS thermal paper and A4 pages.",
        "Automatic tracking for unpaid, partially paid, or overdue bills."
      ],
      preview: (
        <div className="w-full bg-card border border-border/50 rounded-2xl p-6 shadow-xl space-y-4 text-left animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-border/40 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-primary tracking-widest block">Invoice Receipt</span>
              <span className="text-sm font-bold text-foreground">INV-2026-89</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/10 text-green-600 font-bold border border-green-500/20">PAID</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client Name:</span>
              <span className="font-semibold text-foreground">Wayne Enterprises</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Billing Date:</span>
              <span className="font-medium text-foreground">Jul 01, 2026</span>
            </div>
            <div className="border-t border-border/30 my-3 pt-3 space-y-2 text-muted-foreground">
              <div className="flex justify-between text-xs">
                <span>Sony Headset M5 x 2</span>
                <span className="font-semibold text-foreground">$640.00</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>MacBook Air M3 x 1</span>
                <span className="font-semibold text-foreground">$1,299.00</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Tax (18% VAT)</span>
                <span className="font-semibold text-foreground">$349.02</span>
              </div>
            </div>
            <div className="border-t border-border/30 pt-3 flex justify-between text-sm font-bold text-foreground">
              <span>Total Dues:</span>
              <span className="text-primary">$2,288.02</span>
            </div>
          </div>
          <div className="pt-2 flex gap-2">
            <button className="flex-1 py-2 text-center rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer">
              <Printer className="w-3.5 h-3.5" /> Thermal POS
            </button>
            <button className="flex-1 py-2 text-center rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1 hover:bg-primary/95 transition-colors cursor-pointer">
              Print PDF A4
            </button>
          </div>
        </div>
      )
    },
    inventory: {
      title: "Real-Time Inventory Controls",
      badge: "Stock Manager",
      desc: "Maintain constant audits on multi-store inventory counts. Avoid involuntary stock exhaustion with dynamic reorder alert thresholds.",
      bullets: [
        "Set reorder limits per item to get instant low stock notifications.",
        "Track purchase costs vs selling prices to analyze margins dynamically.",
        "Standardize items by categories, custom SKUs, and custom units (pcs, kg, box).",
        "Automated batch adjustments for swift warehouse reconciliations."
      ],
      preview: (
        <div className="w-full bg-card border border-border/50 rounded-2xl p-6 shadow-xl space-y-5 text-left animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-border/40 pb-3">
            <span className="text-xs font-bold text-foreground">Low Stock Alert Panel</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-foreground">
                <span>iPad Pro M4 (SKU-882)</span>
                <span className="text-amber-600">3/10 units left</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: "30%" }} />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-foreground">
                <span>Logitech MX Master (SKU-102)</span>
                <span className="text-red-500">1/12 units left</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: "8%" }} />
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-600 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Threshold reached. Generate purchase requisition?</span>
            </div>
          </div>
        </div>
      )
    },
    crm: {
      title: "Unified Customer Directories",
      badge: "CRM Integration",
      desc: "Record customer profiles, ledger entries, and transaction logs. Track client dues, balance histories, and payment frequencies to manage business relationships.",
      bullets: [
        "Complete customer ledger directories.",
        "Audit logs of historical invoicing records per client.",
        "Track pending client dues and credit adjustments automatically.",
        "Inline profiles containing emails, phone numbers, and addresses."
      ],
      preview: (
        <div className="w-full bg-card border border-border/50 rounded-2xl p-6 shadow-xl space-y-4 text-left animate-in fade-in duration-300">
          <div className="flex items-center gap-3 border-b border-border/40 pb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              ER
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Elena Rostova</h4>
              <p className="text-[10px] text-muted-foreground">elena@company.com</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-muted/20 border border-border/40 rounded-lg">
              <span className="text-[10px] text-muted-foreground block">Total Revenue</span>
              <span className="font-bold text-foreground text-sm">$8,450.00</span>
            </div>
            <div className="p-3 bg-muted/20 border border-border/40 rounded-lg">
              <span className="text-[10px] text-muted-foreground block">Pending Dues</span>
              <span className="font-bold text-red-500 text-sm">$1,200.00</span>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">Recent Activity</span>
            <div className="flex justify-between items-center text-xs p-2 bg-background border border-border/30 rounded">
              <span>INV-2026-004</span>
              <span className="font-bold text-foreground">$1,450.00</span>
              <span className="text-green-500 font-bold">Paid</span>
            </div>
          </div>
        </div>
      )
    },
    analytics: {
      title: "Dynamic Business Dashboards",
      badge: "Accounting Node",
      desc: "Gain instant visibility into store health. Track total revenues, profit margins, active invoices, and low-stock alerts without building complex spreadsheets.",
      bullets: [
        "Monthly revenue growth charts and profit logs.",
        "Compare volumes between POS thermal billing and standard invoices.",
        "Download data summaries in standard CSV formats.",
        "Filter stats across custom dates and specific store divisions."
      ],
      preview: (
        <div className="w-full bg-card border border-border/50 rounded-2xl p-6 shadow-xl space-y-4 text-left animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-border/40 pb-3">
            <span className="text-xs font-bold text-foreground">Earnings Analysis</span>
            <span className="text-[10px] text-green-500 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +24% YoY
            </span>
          </div>
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-end h-28 gap-1.5 pt-2">
              {[40, 60, 35, 75, 55, 90, 80, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-primary/20 hover:bg-primary/80 transition-colors duration-300 rounded-t-sm h-full flex items-end">
                  <div className="w-full bg-primary rounded-t-sm" style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground border-t border-border/30 pt-2 font-semibold">
              <span>Jan - Mar</span>
              <span>Apr - Jun</span>
              <span>Jul - Sep</span>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Tab buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-16 p-1.5 bg-muted/30 border border-border/40 rounded-xl">
        {[
          { id: "invoices", label: "Invoicing", icon: <FileText className="w-4 h-4" /> },
          { id: "inventory", label: "Inventory", icon: <Package className="w-4 h-4" /> },
          { id: "crm", label: "CRM Records", icon: <Users className="w-4 h-4" /> },
          { id: "analytics", label: "Dashboards", icon: <BarChart3 className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-card text-primary shadow-sm border border-border/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left detail description */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <span className="text-xs font-bold text-primary border border-primary/20 bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
            {tabContent[activeTab].badge}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {tabContent[activeTab].title}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            {tabContent[activeTab].desc}
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {tabContent[activeTab].bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground">
                <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary" />
                </span>
                <span className="leading-normal">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right graphic preview */}
        <div className="lg:col-span-5 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-primary/5 blur-[90px] rounded-full -z-10" />
          <div className="w-full max-w-sm">
            {tabContent[activeTab].preview}
          </div>
        </div>
      </div>
    </section>
  );
}
