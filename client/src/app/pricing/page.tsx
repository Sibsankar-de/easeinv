import React from "react";
import Link from "next/link";
import { TopNav } from "@/components/modules/landing-page/TopNav";
import { Footer } from "@/components/layout/Footer";
import PricingGrid from "@/components/modules/pricing/PricingGrid";
import InteractiveAccordion from "@/components/modules/landing-page/InteractiveAccordion";
import PageHeader from "@/components/ui/PageHeader";
import { ArrowRight, Gem } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simple & Transparent Pricing Plans | EaseInv",
  description:
    "Review our flexible pricing tiers—Starter, Pro, and Enterprise. Save 20% on annual cycles. Get started on a 14-day free trial today.",
};

export default function PricingPage() {
  const compareFeatures = [
    {
      category: "Usage Details",
      items: [
        {
          name: "Monthly Invoices",
          starter: "50",
          pro: "Unlimited",
          enterprise: "Unlimited",
        },
        {
          name: "Store Locations",
          starter: "1",
          pro: "3",
          enterprise: "Unlimited",
        },
        {
          name: "Inventory Products",
          starter: "200",
          pro: "2,000",
          enterprise: "Unlimited",
        },
        {
          name: "Team Members Access",
          starter: "1",
          pro: "5",
          enterprise: "Unlimited",
        },
      ],
    },
    {
      category: "Billing & Output",
      items: [
        {
          name: "VAT/GST Tax Engine",
          starter: "Standard Only",
          pro: "Standard Only",
          enterprise: "Fully Custom Builder",
        },
        {
          name: "POS Thermal 80mm/58mm Sheets",
          starter: "Yes",
          pro: "Yes",
          enterprise: "Yes",
        },
        {
          name: "A4 PDF Export",
          starter: "Yes",
          pro: "Yes",
          enterprise: "Yes",
        },
        {
          name: "Custom Logo Branding",
          starter: "No",
          pro: "Yes",
          enterprise: "Yes",
        },
      ],
    },
    {
      category: "Integrations & API",
      items: [
        {
          name: "Developer API Key",
          starter: "No",
          pro: "1 Active",
          enterprise: "Unlimited Active",
        },
        {
          name: "Interactive Sandbox Test",
          starter: "No",
          pro: "Read-Only",
          enterprise: "Read & Write",
        },
        {
          name: "Audit logs & Actions history",
          starter: "No",
          pro: "No",
          enterprise: "Yes",
        },
      ],
    },
  ];

  const faqData = [
    {
      q: "Can I switch billing plans later?",
      a: "Yes. You can upgrade, downgrade, or cancel your active subscription plan directly from your Store Settings panel. Upgrades take effect immediately; downgrades are calculated pro-rata at the end of your billing run.",
    },
    {
      q: "Is there a free trial period?",
      a: "All new workspaces start on a 14-day free trial of our Pro tier. No credit card information is required to get started.",
    },
    {
      q: "Do you offer discounts for annual commitments?",
      a: "Yes. Selecting our annual billing cycle grants you a 20% discount across all paid subscription tiers.",
    },
    {
      q: "What happens if I reach the inventory limit?",
      a: "If your stock registry exceeds your plan limits (e.g. 200 items on Starter), you can still bill existing items, but you won't be able to list new SKU variants until you delete older entries or upgrade to Pro.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col pt-16 bg-background text-foreground transition-colors duration-300">
      <TopNav />

      <main className="flex-1">
        {/* Unified Page Header */}
        <PageHeader
          badgeLabel="Flexible Business Subscriptions"
          badgeIcon={Gem}
          title="Fair Pricing, Built To Scale With You"
          description="Start on our feature-packed 14-day free trial. Choose a plan that matches your current commerce and billing operations."
        />

        {/* Pricing toggle & grid (Client component leaf) */}
        <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
          <PricingGrid />
        </section>

        {/* Feature Comparison Grid */}
        <section className="py-20 px-6 lg:px-12 bg-card/25 border-y border-border/40">
          <div className="max-w-4xl mx-auto text-center space-y-16">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Compare Full Plan Details
            </h2>

            <div className="border border-border/50 rounded-2xl bg-card overflow-hidden text-left shadow-sm">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/35 border-b border-border/40 font-bold text-muted-foreground text-center">
                    <th className="p-4 text-left">Plan Metrics</th>
                    <th className="p-4">Starter</th>
                    <th className="p-4 text-primary">Pro</th>
                    <th className="p-4">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-foreground font-medium">
                  {compareFeatures.map((cat, idx) => (
                    <React.Fragment key={idx}>
                      <tr className="bg-muted/10 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
                        <td colSpan={4} className="p-3 pl-4">
                          {cat.category}
                        </td>
                      </tr>
                      {cat.items.map((item, i) => (
                        <tr
                          key={i}
                          className="hover:bg-muted/5 transition-colors"
                        >
                          <td className="p-4 font-semibold">{item.name}</td>
                          <td className="p-4 text-center text-muted-foreground">
                            {item.starter}
                          </td>
                          <td className="p-4 text-center font-bold">
                            {item.pro}
                          </td>
                          <td className="p-4 text-center text-muted-foreground">
                            {item.enterprise}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Accordion FAQs */}
        <section className="py-24 px-6 lg:px-12 bg-background">
          <div className="max-w-3xl mx-auto space-y-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-center">
              Pricing FAQ
            </h2>
            <InteractiveAccordion faqItems={faqData} />
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-20 px-6 lg:px-12 text-center bg-linear-to-b from-card/30 to-secondary/15 border-t border-border/40 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[110px] -z-10" />

          <div className="max-w-3xl mx-auto space-y-8 relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Unify Your Billing & Stock Operations Now
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Create your workspace in seconds. All new signups enjoy 14 days of
              Pro-tier features for free.
            </p>
            <div className="flex justify-center">
              <Link
                href="/auth/signup"
                className="group flex items-center justify-center gap-2 bg-primary text-primary-foreground px-10 py-4.5 rounded-lg text-base font-extrabold hover:bg-primary/95 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 duration-200"
              >
                Create Workspace
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
