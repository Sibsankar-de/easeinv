import React from "react";
import { FileCheck2, Users2, ShieldAlert, Globe2 } from "lucide-react";

export default function StatsSection() {
  const stats = [
    {
      value: "5M+",
      label: "Invoices Compiled",
      description:
        "Billings generated across global retail, SaaS, and digital markets.",
      icon: FileCheck2,
      colorClass: "text-primary bg-primary/10 border-primary/20",
    },
    {
      value: "15k+",
      label: "Active Workspaces",
      description:
        "SMEs, digital creators, and warehouse hubs managing inventory daily.",
      icon: Users2,
      colorClass: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      value: "99.99%",
      label: "Uptime SLA",
      description:
        "Highly redundant database infrastructure built for peak business traffic.",
      icon: ShieldAlert,
      colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      value: "140+",
      label: "Countries Supported",
      description:
        "Compliant localized tax calculation engines and multi-currency formats.",
      icon: Globe2,
      colorClass: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-12 bg-background border-b border-border/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            EaseInv in Numbers
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            From sole traders to scaling international supply networks, we
            deliver speed and accuracy where it matters most.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="bg-card border border-border/40 rounded-2xl p-6 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 shadow-xs flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.colorClass} group-hover:scale-105 transition-transform duration-300`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-extrabold text-foreground tracking-tight">
                      {stat.value}
                    </h3>
                    <p className="text-sm font-bold text-foreground mt-1">
                      {stat.label}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {stat.description}
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
