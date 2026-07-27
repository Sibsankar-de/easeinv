import React from "react";
import { TopNav } from "@/components/modules/landing-page/TopNav";
import { Footer } from "@/components/layout/Footer";
import FAQContent from "@/components/modules/faq/FAQContent";
import PageHeader from "@/components/ui/PageHeader";
import { HelpCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about EaseInv stores, pricing plans, daily invoice limits, receipt printing, and account setups.",
};

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col pt-16 bg-background text-foreground transition-colors duration-300">
      {/* Navigation */}
      <TopNav />

      {/* Main Content */}
      <main className="flex-1">
        {/* Unified Page Header */}
        <PageHeader
          badgeLabel="Help & Support Center"
          badgeIcon={HelpCircle}
          title="Frequently Asked Questions"
          description="Find answers to common questions about EaseInv stores, billing limits, receipt printing, and account configurations."
        />

        {/* Interactive FAQ Content (Client Component Leaf) */}
        <FAQContent />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
