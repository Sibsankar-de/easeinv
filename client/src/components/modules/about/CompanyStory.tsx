import React from "react";
import { BookOpen, Compass, Target } from "lucide-react";

export default function CompanyStory() {
  return (
    <section className="py-24 px-6 lg:px-12 bg-card/25 border-b border-border/40">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Story Column */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                How We Started
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                In 2024, our founders noticed a recurring headache for mid-sized
                retail operators and digital merchants: spreadsheets were too
                fragile, and enterprise ERP systems were too complex and
                expensive. Managing tax compliance rules, inventory stock
                alerts, and receipt printing required jumping between three
                different tools.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We set out to construct a unified hub. One that matches
                compliance workflows in multiple countries while keeping
                transactions fast and intuitive. Today, EaseInv powers thousands
                of workspaces, simplifying invoice compliance, warehouse sync,
                and commerce ledger reporting.
              </p>
            </div>

            {/* Strategic Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="p-5 bg-background border border-border/40 rounded-xl space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Target className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-foreground">
                  Our Vision
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  To build the most accessible, high-performance financial
                  workspace for growing businesses.
                </p>
              </div>

              <div className="p-5 bg-background border border-border/40 rounded-xl space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                  <Compass className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-foreground">Our Focus</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Eliminating overhead by automating local tax calculation and
                  low-stock alerts.
                </p>
              </div>
            </div>
          </div>

          {/* Visual Column / Timeline */}
          <div className="bg-background border border-border/50 rounded-2xl p-8 shadow-md space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
            <h3 className="font-bold text-lg text-foreground border-b border-border/40 pb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Journey Milestones
            </h3>

            <div className="relative border-l-2 border-primary/25 pl-6 ml-2 space-y-8 text-left">
              {/* Milestone 1 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                <span className="text-xs font-bold text-primary block">
                  Q1 2024
                </span>
                <h4 className="text-sm font-extrabold text-foreground mt-0.5">
                  The Seed Idea
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  EaseInv prototype built to automate thermal receipt layout and
                  multi-currency billing templates.
                </p>
              </div>

              {/* Milestone 2 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                <span className="text-xs font-bold text-primary block">
                  Q4 2024
                </span>
                <h4 className="text-sm font-extrabold text-foreground mt-0.5">
                  Tax Compliance Update
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Launched dynamic GST/VAT rules engines to support EU, US, and
                  APAC regional billing demands.
                </p>
              </div>

              {/* Milestone 3 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                <span className="text-xs font-bold text-primary block">
                  Q2 2025
                </span>
                <h4 className="text-sm font-extrabold text-foreground mt-0.5">
                  Next-Gen Release
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Rolled out collaborative stores, real-time analytics graphs,
                  API keys, and Sandbox testing features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
