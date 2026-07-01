import React from "react";
import { ShieldCheck, Zap, BarChart3, HeartHandshake } from "lucide-react";

export default function ValuesSection() {
  const values = [
    {
      title: "Precision & Compliance",
      description:
        "Localized billing engines built to correctly handle international VAT/GST laws, flat tax rates, and complex discount workflows.",
      icon: ShieldCheck,
      colorClass: "text-primary bg-primary/10 border-primary/20",
    },
    {
      title: "Unrivaled Performance",
      description:
        "Fast loading times, instant thermal receipt compilation, and real-time inventory updates that keep operations moving under pressure.",
      icon: Zap,
      colorClass: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Data-Driven Transparency",
      description:
        "Detailed sales charts, earnings metrics, and low-stock alerts that provide store managers with crystal clear operational insights.",
      icon: BarChart3,
      colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Customer-First Support",
      description:
        "Full documentation guides, sandbox testing routes, developer-first APIs, and support channels always ready to assist.",
      icon: HeartHandshake,
      colorClass: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-12 bg-card/25 border-b border-border/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Our Core Values
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The principles that drive our engineering decisions and customer
            commitments every single day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div
                key={idx}
                className="flex gap-5 p-6 rounded-2xl border border-border/30 bg-background shadow-xs hover:shadow-sm hover:border-primary/25 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${val.colorClass}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-lg text-foreground">
                    {val.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {val.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
