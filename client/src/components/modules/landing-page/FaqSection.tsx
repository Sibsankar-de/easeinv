import React from "react";
import InteractiveAccordion from "./InteractiveAccordion";

export default function FaqSection() {
  const faqData = [
    {
      q: "Is my store data protected by encryption?",
      a: "Yes. All database connections and transit requests utilize bank-grade AES-256 encryption. We partition stores securely so your invoices, inventory records, and customer details are accessible only to you and your authorized staff.",
    },
    {
      q: "Can I manage multiple warehouse locations or stores?",
      a: "Absolutely. EaseInv allows you to create separate store locations under a single company account. You can track inventory levels uniquely for each site and select the active store layout when compiling invoices.",
    },
    {
      q: "What types of billing formats do you support?",
      a: "We support standardized business invoices, thermal receipts for retail stores, custom tax profiles, discounts, and credit note declarations. You can print invoices directly to standard thermal printers or export high-resolution PDFs.",
    },
    {
      q: "How does the low stock alert notification operate?",
      a: "For every inventory product, you can configure a unique 'reorder alert threshold'. Once active sales push stock quantities below this threshold, warning banners appear on your dashboard statistics dynamically.",
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-12 bg-card/25 border-t border-border/40">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-center mb-16">
          Frequently Asked Questions
        </h2>
        <InteractiveAccordion faqItems={faqData} />
      </div>
    </section>
  );
}
