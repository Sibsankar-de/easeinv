import React from "react";
import { Zap, TrendingUp, Clock, Layers } from "lucide-react";

export default function BenefitsGrid() {
  return (
    <section className="py-24 px-6 lg:px-12 bg-secondary/15 border-t border-border/40">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-center mb-16">
          Why Operations Teams Prefer EaseInv
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: "Automate Tasks",
              desc: "Say goodbye to spreadsheets. Auto-calculate tax rates, invoices, margins, and stock balances.",
              icon: <Zap className="w-5 h-5 text-primary" />,
            },
            {
              title: "Quantified Margins",
              desc: "Configure product purchase rates and billing sale prices to analyze profits accurately.",
              icon: <TrendingUp className="w-5 h-5 text-green-500" />,
            },
            {
              title: "Reduce Stockouts",
              desc: "Automated alert flags trigger immediately when active billing pushes quantities past warning thresholds.",
              icon: <Clock className="w-5 h-5 text-amber-500" />,
            },
            {
              title: "API-First Access",
              desc: "Integrate with third-party invoicing nodes or billing checkouts using secure developer API keys.",
              icon: <Layers className="w-5 h-5 text-indigo-500" />,
            },
          ].map((benefit, idx) => (
            <div
              key={idx}
              className="bg-card border border-border/40 p-6 rounded-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary/40 flex items-center justify-center mb-5 shrink-0">
                {benefit.icon}
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
