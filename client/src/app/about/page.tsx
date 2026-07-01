import React from "react";
import { TopNav } from "@/components/modules/landing-page/TopNav";
import { Footer } from "@/components/layout/Footer";
import PageHeader from "@/components/ui/PageHeader";
import CompanyStory from "@/components/modules/about/CompanyStory";
import StatsSection from "@/components/modules/about/StatsSection";
import ValuesSection from "@/components/modules/about/ValuesSection";
import CtaBanner from "@/components/modules/landing-page/CtaBanner";
import { Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Our Mission, Vision & Team | EaseInv",
  description:
    "Learn how EaseInv empowers businesses with compliant invoicing engines, real-time inventory management, and developer-first sandbox billing platforms. Explore our story, milestones, and values.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col pt-16 bg-background text-foreground transition-colors duration-300">
      {/* Navigation Bar */}
      <TopNav />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Unified Page Header */}
        <PageHeader
          badgeLabel="Our Mission & Vision"
          badgeIcon={Sparkles}
          title={
            <>
              Pioneering the Next Generation of{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-indigo-500">
                Business Commerce
              </span>
            </>
          }
          description="EaseInv was founded with a singular purpose: to replace complex spreadsheets, disconnected inventory systems, and manual invoicing with a unified, compliant, and beautifully simple workspace."
        />

        {/* Company History / Story Section */}
        <CompanyStory />

        {/* Growth Stats Section */}
        <StatsSection />

        {/* Core Principles & Values Section */}
        <ValuesSection />

        {/* Call to Action Banner */}
        <CtaBanner />
      </main>

      {/* Footer Area */}
      <Footer />
    </div>
  );
}
