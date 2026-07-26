"use client";

import { useState } from "react";
import { Sparkles, Printer, ShieldAlert } from "lucide-react";

export default function InteractiveWorkflow() {
  const [activeStep, setActiveStep] = useState(0);

  const workflowSteps = [
    {
      title: "Set up in 60 Seconds",
      description:
        "Enter your business name, logo, currency, and tax structure to generate your store.",
      preview: (
        <div className="bg-card/90 border border-border/60 rounded-xl p-6 shadow-lg space-y-4 text-left transition-all duration-300">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Store Generator
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Business Name
              </label>
              <div className="text-sm bg-background border border-border/40 px-3 py-2 rounded-lg text-foreground font-medium">
                Acme Corporation
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Currency
                </label>
                <div className="text-xs bg-background border border-border/40 px-3 py-2 rounded-lg text-foreground">
                  USD ($)
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Default Tax Rate
                </label>
                <div className="text-xs bg-background border border-border/40 px-3 py-2 rounded-lg text-foreground">
                  18% VAT
                </div>
              </div>
            </div>
            <div className="pt-2">
              <div className="w-full bg-primary text-primary-foreground font-semibold text-center text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" /> Setting Up Store...
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Load Your Inventory",
      description:
        "Import products dynamically or add them with unit types, purchase rates, sale prices, and stock counts.",
      preview: (
        <div className="bg-card/90 border border-border/60 rounded-xl p-6 shadow-lg space-y-4 text-left transition-all duration-300">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
              Inventory Sync
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
              Low Stock Alert
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 bg-background rounded-lg border border-border/40">
              <div>
                <div className="text-xs font-semibold text-foreground">
                  iPhone 15 Pro Max
                </div>
                <div className="text-[10px] text-muted-foreground">
                  SKU: IPH15PM-256
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-foreground">
                  12 Units
                </div>
                <div className="text-[10px] text-red-500 font-medium">
                  Reorder Limit: 15
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-background rounded-lg border border-border/40">
              <div>
                <div className="text-xs font-semibold text-foreground">
                  MacBook Air M3
                </div>
                <div className="text-[10px] text-muted-foreground">
                  SKU: MBA-M3-16
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-foreground">
                  45 Units
                </div>
                <div className="text-[10px] text-green-500 font-medium">
                  Optimal Stock
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/30 p-2 rounded">
              <span className="font-bold text-foreground">Pro-Tip:</span>{" "}
              Reorder limits trigger automated dashboard alerts.
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Draft & Print Invoices",
      description:
        "Bill customers instantly. Tax calculations, discounts, and print layouts are generated automatically.",
      preview: (
        <div className="bg-card/90 border border-border/60 rounded-xl p-6 shadow-lg space-y-4 text-left transition-all duration-300">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-green-500">
              Invoice Draft
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-500/10 text-green-600">
              Generated
            </span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between font-semibold text-foreground">
              <span>Bill To:</span>
              <span>John Doe (Client)</span>
            </div>
            <div className="border-t border-border/30 my-2 pt-2 space-y-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>iPhone 15 Pro Max x 1</span>
                <span className="font-medium text-foreground">$1,199.00</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18% VAT)</span>
                <span className="font-medium text-foreground">$215.82</span>
              </div>
            </div>
            <div className="border-t border-border/30 pt-2 flex justify-between font-bold text-sm text-foreground">
              <span>Total Amount:</span>
              <span className="text-primary">$1,414.82</span>
            </div>
            <div className="pt-3 flex gap-2">
              <button className="flex-1 py-1.5 rounded-lg border border-border text-center hover:bg-muted font-medium flex items-center justify-center gap-1 cursor-pointer">
                <Printer className="w-3.5 h-3.5" /> Print PDF
              </button>
              <button className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-center font-bold flex items-center justify-center gap-1 hover:bg-primary/95 transition-colors cursor-pointer">
                Send Invoice
              </button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div className="space-y-8">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Simple Setup Workflow
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Start Billing In Under 5 Minutes
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            EaseInv scales down manual billing setup times. Follow these three
            quick milestones to unlock your streamlined commerce operations
            space.
          </p>
        </div>

        {/* Clickable Workflow Steps */}
        <div className="space-y-4">
          {workflowSteps.map((step, idx) => (
            <div
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`flex items-start gap-4 p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                activeStep === idx
                  ? "bg-card border-primary/50 shadow-md translate-x-2"
                  : "bg-transparent border-transparent hover:bg-card/45 hover:border-border/30"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border ${
                  activeStep === idx
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border/60"
                }`}
              >
                0{idx + 1}
              </span>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-foreground">
                  {step.title}
                </h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Live Preview Output */}
      <div className="flex items-center justify-center relative min-h-[300px]">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full -z-10" />
        <div className="w-full max-w-sm">
          {workflowSteps[activeStep].preview}
        </div>
      </div>
    </div>
  );
}
