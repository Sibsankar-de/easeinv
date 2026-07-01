import React from "react";
import { Shield, Lock, Eye, RefreshCw, HelpCircle } from "lucide-react";

export default function PrivacyContent() {
  const sections = [
    {
      id: "introduction",
      title: "1. Introduction & Overview",
      icon: HelpCircle,
      content: (
        <>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Welcome to EaseInv (referred to as "EaseInv," "we," "our," or "us"). We are committed to protecting your privacy and securing the transactional and operational data you trust us with.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed mt-4">
            This Privacy Policy explains how we collect, process, share, and protect your store ledger information, customer directories, billing logs, and personal details when you interact with our platform.
          </p>
        </>
      ),
    },
    {
      id: "information-collected",
      title: "2. Information We Collect",
      icon: Eye,
      content: (
        <>
          <p className="text-muted-foreground text-sm leading-relaxed">
            To provide robust invoicing and real-time inventory management, we collect data across several categories:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-xs text-muted-foreground leading-relaxed">
            <li>
              <strong>Workspace & Account Information:</strong> Your name, store name, email address, password hashes, and company profile configurations.
            </li>
            <li>
              <strong>Billing & Invoicing Ledger Data:</strong> Customer details (names, contact info), VAT/GST tax profiles, discount rules, product listings, pricing sheets, and historical sales transactions.
            </li>
            <li>
              <strong>Inventory & Stock Records:</strong> Product stock levels, reorder threshold limits, product images, and warehouse classifications.
            </li>
            <li>
              <strong>Technical Usage Details:</strong> IP addresses, browser types, session activity logs, API key usage statistics, and device profiles.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "data-usage",
      title: "3. How We Use Your Data",
      icon: RefreshCw,
      content: (
        <>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We use your collected details strictly to power, support, and secure your business operations:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-xs text-muted-foreground leading-relaxed">
            <li>To compile and format invoices and thermal receipts.</li>
            <li>To alert store managers when product items fall below configured low-stock thresholds.</li>
            <li>To process database records dynamically in your dashboard workspace.</li>
            <li>To authorize API requests securely via developer tokens.</li>
            <li>To monitor security, prevent fraudulent entries, and audit actions.</li>
          </ul>
        </>
      ),
    },
    {
      id: "security",
      title: "4. Infrastructure & Data Security",
      icon: Lock,
      content: (
        <>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We enforce strict bank-grade safety measures to protect all database elements from unauthorized access or modification:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-xs text-muted-foreground leading-relaxed">
            <li>
              <strong>Encryption:</strong> All transit data utilizes TLS 1.3 encryption, and database tables are encrypted at rest using AES-256 keys.
            </li>
            <li>
              <strong>Role-based Authorization:</strong> Workspace permissions prevent team members from viewing unauthorized pages (e.g. settings vs billing panels).
            </li>
            <li>
              <strong>Safe Sandboxing:</strong> Our API sandboxes and testing environments are separated from production databases to avoid leakage.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "sharing-rights",
      title: "5. Sharing & International Rights",
      icon: Shield,
      content: (
        <>
          <p className="text-muted-foreground text-sm leading-relaxed">
            EaseInv does not sell or lease your business files, inventory data, or client contacts to third parties. We share data only with verified sub-processors (e.g., cloud hosting, email deliverability APIs, payment handlers) necessary to operate our service.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed mt-4">
            Under global laws like GDPR and CCPA, you retain full rights to request exports of your business ledger, delete your workspace records completely, or modify inaccurate billing profiles at any time from your Store Settings panel.
          </p>
        </>
      ),
    },
  ];

  return (
    <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Table of Contents Side Panel */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-6">
          <div className="border border-border/40 rounded-2xl p-6 bg-card">
            <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider mb-4">
              Sections
            </h3>
            <nav className="space-y-3 flex flex-col text-xs font-semibold">
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 py-1"
                >
                  <sec.icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                  {sec.title}
                </a>
              ))}
            </nav>
            <div className="border-t border-border/40 mt-6 pt-6 text-xxs text-muted-foreground leading-relaxed">
              Last updated: July 1, 2026. For privacy concerns, reach our compliance team at privacy@easeinv.com.
            </div>
          </div>
        </aside>

        {/* Content Panel */}
        <div className="lg:col-span-8 space-y-16">
          {sections.map((sec) => (
            <div
              key={sec.id}
              id={sec.id}
              className="scroll-mt-28 p-8 border border-border/40 bg-card rounded-2xl shadow-xs space-y-4 hover:border-primary/20 transition-all duration-300"
            >
              <h3 className="font-extrabold text-lg text-foreground flex items-center gap-3">
                <span className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                  <sec.icon className="w-5 h-5" />
                </span>
                {sec.title}
              </h3>
              <div className="pt-2">
                {sec.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
