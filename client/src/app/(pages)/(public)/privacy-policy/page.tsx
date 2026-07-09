import React from "react";
import { TopNav } from "@/components/modules/landing-page/TopNav";
import { Footer } from "@/components/layout/Footer";
import PrivacyContent from "@/components/modules/privacy-policy/PrivacyContent";
import PageHeader from "@/components/ui/PageHeader";
import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | EaseInv",
  description:
    "Review EaseInv's privacy practices, security protocols, encryption details, workspace data separation, and user rights policies.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col pt-16 bg-background text-foreground transition-colors duration-300">
      {/* Navigation */}
      <TopNav />

      {/* Main Content */}
      <main className="flex-1">
        {/* Unified Page Header */}
        <PageHeader
          badgeLabel="Security & Trust First"
          badgeIcon={ShieldCheck}
          title="Privacy Policy"
          description="We are dedicated to safeguarding your ledger records, database tables, and merchant configurations."
        />

        {/* Detailed Privacy Content */}
        <PrivacyContent />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
