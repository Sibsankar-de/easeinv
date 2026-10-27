import React from "react";
import Link from "next/link";
import {
  FileText,
  Shield,
  Package,
  BarChart3,
  Check,
  ArrowUpRight,
} from "lucide-react";

export default function BentoGrid() {
  return (
    <section id="features" className="py-24 px-6 lg:px-12 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Supercharge Your Commerce Workflows
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            We have consolidated billing tools and inventory systems into one
            unified store dashboard, discarding the need to jump between disconnected
            platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Feature 1 - Billing */}
          <div className="md:col-span-8 bg-card border border-border/40 rounded-2xl p-8 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 shadow-sm flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Dynamic Invoicing Engine</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
                Compile client records, assign products, apply dynamic tax rules
                (GST/VAT), set custom discount structures, and render thermal
                receipts or invoices in milliseconds.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-border/40 flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-primary" /> VAT/GST Ready
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-primary" /> Multi-currency
                Support
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-primary" /> Instant Print & PDF
                exports
              </span>
            </div>
          </div>

          {/* Feature 2 - Security */}
          <div className="md:col-span-4 bg-card border border-border/40 rounded-2xl p-8 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 shadow-sm flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 group-hover:scale-105 transition-transform duration-300">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Secure Infrastructure</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Role-based database permissions secure your financial ledger.
                Regular safety backups guard store records from loss.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-border/40 text-xs font-semibold text-indigo-500 flex items-center gap-1 hover:underline">
              <Link
                href="/docs/authentication"
                className="flex items-center gap-1"
              >
                API Authorization Docs <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 3 - Inventory */}
          <div className="md:col-span-4 bg-card border border-border/40 rounded-2xl p-8 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 shadow-sm flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform duration-300">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Smart Inventory Tracking</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Set specific reorder alerts to prevent running out of stock.
                Track product classifications and units easily.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-border/40 text-xs font-semibold text-amber-500 flex items-center gap-1 hover:underline">
              <Link href="/docs/inventory" className="flex items-center gap-1">
                Read Inventory Guides <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 4 - Analytics */}
          <div className="md:col-span-8 bg-card border border-border/40 rounded-2xl p-8 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 shadow-sm flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 group-hover:scale-105 transition-transform duration-300">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Deep Sales Analytics</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
                Review revenue growth matrices, compare billing volumes, monitor
                product sales performance, and audit store performance logs from
                interactive graphs.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-border/40 flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-green-500" /> Revenue Growth
                Mapping
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-green-500" /> Average Transaction
                Logs
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-green-500" /> Exportable
                Accounting Reports
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
