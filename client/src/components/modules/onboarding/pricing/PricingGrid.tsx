"use client";

import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export default function PricingGrid() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">(
    "annually",
  );

  const plans = [
    {
      name: "Starter",
      badge: "Freelancers & Sole Traders",
      desc: "Perfect for single-owner storefronts and freelancers needing standard compliant billing.",
      price: {
        monthly: 0,
        annually: 0,
      },
      features: [
        "50 Invoices / Day",
        "1 Store Location",
        "25 Product Listings limit",
        "Single User access",
        "Standard POS thermal printing",
        "Basic CSV reports download",
        "Community forum support",
      ],
      cta: "Sign Up Free",
      popular: false,
    },
    {
      name: "Pro",
      badge: "Growing Operations",
      desc: "Ideal for retail stores and commerce teams requiring multi-store stock audits.",
      price: {
        monthly: 19,
        annually: 15,
      },
      features: [
        "Unlimited Invoices / Day",
        "3 Store Locations",
        "1,000 Product Listings limit",
        "5 Team Members access",
        "Access to Developer API Keys",
        "Thermal & A4 printing stylesheet",
        "Advanced Revenue Analytics",
        "24/7 Email & Chat support",
      ],
      cta: "Coming Soon",
      popular: true,
    },
    {
      name: "Enterprise",
      badge: "Scale & High Volume",
      desc: "Designed for high-throughput chains requiring custom tax structures and sandbox API integrations.",
      price: {
        monthly: 49,
        annually: 39,
      },
      features: [
        "Unlimited Invoices / Day",
        "Unlimited Store Locations",
        "Unlimited Product Listings",
        "Unlimited Team Members",
        "Unlimited API Keys & Sandbox",
        "Custom VAT/GST tax rate builder",
        "Granular Role-based permissions",
        "Dedicated account manager",
        "99.9% SLA uptime guarantee",
      ],
      cta: "Coming Soon",
      popular: false,
    },
  ];

  return (
    <div className="space-y-16">
      {/* Monthly / Yearly Toggle */}
      <div className="flex justify-center items-center gap-4">
        <span
          className={`text-xs font-semibold ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}
        >
          Billed Monthly
        </span>
        <button
          onClick={() =>
            setBillingCycle(billingCycle === "monthly" ? "annually" : "monthly")
          }
          className="w-14 h-8 bg-muted border border-border/60 hover:border-border rounded-full p-1 transition-colors relative flex items-center cursor-pointer"
          aria-label="Toggle billing cycle"
        >
          <div
            className={`w-5.5 h-5.5 rounded-full bg-primary shadow-sm transition-transform duration-300 ${
              billingCycle === "annually"
                ? "translate-x-6 bg-primary"
                : "translate-x-0"
            }`}
          />
        </button>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold ${billingCycle === "annually" ? "text-foreground" : "text-muted-foreground"}`}
          >
            Billed Annually
          </span>
          <Badge variant="success">Save 20%</Badge>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`bg-card border rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative shadow-sm ${
              plan.popular
                ? "border-primary ring-2 ring-primary/10 scale-102 z-10 shadow-md"
                : "border-border/40"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                Most Popular
              </span>
            )}

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-primary block mb-1 uppercase tracking-wider">
                  {plan.badge}
                </span>
                <h3 className="text-2xl font-black text-foreground">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed mt-2">
                  {plan.desc}
                </p>
              </div>

              <div className="flex items-baseline gap-1.5 pt-2 border-t border-border/30">
                <span className="text-4xl font-black text-foreground">
                  $
                  {billingCycle === "monthly"
                    ? plan.price.monthly
                    : plan.price.annually}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">
                  / month
                </span>
              </div>

              <ul className="space-y-3.5 pt-4 text-xs font-medium text-foreground">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4">
              {plan.cta === "Coming Soon" ? (
                <div className="w-full py-3.5 rounded-lg text-center text-xs font-extrabold flex items-center justify-center gap-1.5 bg-muted text-muted-foreground border border-border/40 cursor-not-allowed">
                  <span>Coming Soon</span>
                </div>
              ) : (
                <Link
                  href="/auth/signup"
                  className={`w-full py-3.5 rounded-lg text-center text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/95 shadow-md"
                      : "bg-secondary/40 text-foreground border border-border/60 hover:bg-secondary/60 hover:border-border"
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
