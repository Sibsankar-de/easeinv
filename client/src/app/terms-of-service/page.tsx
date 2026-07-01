import React from "react";
import { TopNav } from "@/components/modules/landing-page/TopNav";
import { Footer } from "@/components/layout/Footer";
import TermsContent from "@/components/modules/terms-of-service/TermsContent";
import PageHeader from "@/components/ui/PageHeader";
import { Scale } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | EaseInv",
  description:
    "Read EaseInv's Terms of Service governing platform subscription structures, business ledger audits, software licenses, liabilities, and governance policies.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col pt-16 bg-background text-foreground transition-colors duration-300">
      {/* Navigation */}
      <TopNav />

      {/* Main Content */}
      <main className="flex-1">
        {/* Unified Page Header */}
        <PageHeader
          badgeLabel="Fair Rules For Scaling Teams"
          badgeIcon={Scale}
          title="Terms of Service"
          description="Please review the licensing terms, subscription models, and limits that govern your billing workspaces."
        />

        {/* Detailed Terms Content */}
        <TermsContent />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
