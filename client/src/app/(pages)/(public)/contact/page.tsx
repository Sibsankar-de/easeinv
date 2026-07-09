import React from "react";
import { TopNav } from "@/components/modules/landing-page/TopNav";
import { Footer } from "@/components/layout/Footer";
import ContactForm from "@/components/modules/contact/ContactForm";
import PageHeader from "@/components/ui/PageHeader";
import { MessageSquare } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | EaseInv Support",
  description:
    "Have questions about billing plans, tax setups, or multi-store inventory tools? Send us a message or email support@easeinv.com.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col pt-16 bg-background text-foreground transition-colors duration-300">
      {/* Navigation */}
      <TopNav />

      {/* Main Content */}
      <main className="flex-1">
        {/* Unified Page Header */}
        <PageHeader
          badgeLabel="Direct Support Channels"
          badgeIcon={MessageSquare}
          title="Connect With Our Team"
          description="We are here to help you get configured, resolve billing queries, or walk you through onboarding."
        />

        {/* Detailed Contact Content & Form */}
        <ContactForm />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
