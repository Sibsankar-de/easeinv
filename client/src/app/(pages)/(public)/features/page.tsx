import React from "react";
import Link from "next/link";
import { TopNav } from "@/components/modules/landing-page/TopNav";
import { Footer } from "@/components/layout/Footer";
import InteractiveFeaturesTabs from "@/components/modules/features/InteractiveFeaturesTabs";
import PageHeader from "@/components/ui/PageHeader";
import {
  Sliders,
  Printer,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing & Inventory Platform Features | EaseInv",
  description:
    "Explore EaseInv's compliant invoicing engines, POS thermal receipt prints, low stock alert limits, customer directories, and earnings graphs.",
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col pt-16 bg-background text-foreground transition-colors duration-300">
      <TopNav />

      <main className="flex-1">
        {/* Unified Page Header */}
        <PageHeader
          badgeLabel="Full Features Directory"
          badgeIcon={Sparkles}
          title="Smarter Commerce Tools For Growing Businesses"
          description="Discard spreadsheet chaos. EaseInv delivers invoicing, stock monitoring, customer relationship data, and reports in one clean layout."
        />

        {/* Dynamic Features Tabs (Client Component Leaf) */}
        <InteractiveFeaturesTabs />

        {/* Feature Deep Dive Breakdown */}
        <section className="py-24 px-6 lg:px-12 bg-card/25 border-t border-border/40">
          <div className="max-w-7xl mx-auto space-y-24">
            <h2 className="text-3xl md:text-5xl font-extrabold text-center tracking-tight max-w-2xl mx-auto">
              A Complete Solution Built For Operations Teams
            </h2>

            {/* Detailed Feature 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6 text-left order-2 lg:order-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Sliders className="w-6 h-6" />
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-foreground">
                  Custom Taxes & Discounts
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Every business operations model requires localized taxes and
                  billing rates. EaseInv includes dynamic configurations to
                  customize VAT rates, GST percentages, flat tax rules, and
                  promotional discounts per transaction.
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <Link
                    href="/docs/billing"
                    className="hover:underline flex items-center gap-1"
                  >
                    Read Customization Guides{" "}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="order-1 lg:order-2 bg-background border border-border/50 rounded-2xl p-8 shadow-md">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs border-b border-border/40 pb-3">
                    <span className="font-bold text-foreground">
                      Tax & Discount Profiles
                    </span>
                    <span className="text-primary font-semibold">Active</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/20 border border-border/30 rounded-lg">
                      <span className="text-xs text-foreground font-semibold">
                        VAT Standard (EU)
                      </span>
                      <span className="text-xs font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
                        20%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/20 border border-border/30 rounded-lg">
                      <span className="text-xs text-foreground font-semibold">
                        GST Standard (IN)
                      </span>
                      <span className="text-xs font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
                        18%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/20 border border-border/30 rounded-lg">
                      <span className="text-xs text-foreground font-semibold">
                        Summer Promo Flat
                      </span>
                      <span className="text-xs font-bold bg-green-500/10 text-green-600 border border-green-500/20 px-2 py-0.5 rounded">
                        -$50.00
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Feature 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="bg-background border border-border/50 rounded-2xl p-8 shadow-md">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs border-b border-border/40 pb-3">
                    <span className="font-bold text-foreground">
                      Physical Printing Interfaces
                    </span>
                    <span className="text-green-500 font-semibold">
                      Thermal & A4 Mode
                    </span>
                  </div>
                  <div className="p-4 bg-muted/20 border border-border/30 rounded-lg text-center space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Printer className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                      Our print stylesheets strip down margins, fonts, and
                      borders to display optimally on 80mm/58mm thermal receipts
                      or standard A4 pages.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-6 text-left">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                  <Printer className="w-6 h-6" />
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-foreground">
                  POS Receipt Formatting
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Run a physical store checkout? Easily print transactions
                  directly to standard POS thermal paper or download standard
                  invoice structures to compile physical packages.
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500">
                  <Link
                    href="/docs/billing"
                    className="hover:underline flex items-center gap-1"
                  >
                    Print Formatting Guides <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 lg:px-12 text-center bg-linear-to-b from-card/30 to-secondary/15 border-t border-border/40 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[110px] -z-10" />

          <div className="max-w-3xl mx-auto space-y-8 relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Ready to Upgrade Your Operations?
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Start setting up your store ledger and issuing compliant invoices
              under 60 seconds. Free onboarding guides included.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="group flex items-center justify-center gap-2 bg-primary text-primary-foreground px-10 py-4.5 rounded-lg text-base font-extrabold hover:bg-primary/95 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 duration-200"
              >
                Create Free Workspace
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/pricing"
                className="flex items-center justify-center px-10 py-4.5 rounded-lg text-base font-semibold border border-border/60 hover:bg-secondary/40 transition-colors"
              >
                View Plans & Pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
