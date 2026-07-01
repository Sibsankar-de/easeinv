import React from "react";
import { Scale, Shield, Landmark, AlertTriangle, FileText } from "lucide-react";

export default function TermsContent() {
  const sections = [
    {
      id: "agreement",
      title: "1. Agreement to Terms",
      icon: Scale,
      content: (
        <>
          <p className="text-muted-foreground text-sm leading-relaxed">
            By creating an account, launching a workspace, or using EaseInv (referred to as the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed mt-4">
            These terms govern all users, store owners, developers using our API, and team members accessing EaseInv dashboards.
          </p>
        </>
      ),
    },
    {
      id: "workspaces",
      title: "2. Accounts & Workspaces",
      icon: Shield,
      content: (
        <>
          <p className="text-muted-foreground text-sm leading-relaxed">
            To unlock our billing and inventory capabilities, you must register a workspace:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-xs text-muted-foreground leading-relaxed">
            <li>You must provide accurate, current, and complete registration information.</li>
            <li>You are solely responsible for securing your account credentials and managing API tokens.</li>
            <li>You must notify us immediately of any unauthorized breach of security or access to your billing ledger.</li>
            <li>We reserve the right to suspend accounts that engage in illegal sales, fraudulent tax profiles, or malicious API traffic.</li>
          </ul>
        </>
      ),
    },
    {
      id: "billing",
      title: "3. Pricing, Subscriptions & Fees",
      icon: Landmark,
      content: (
        <>
          <p className="text-muted-foreground text-sm leading-relaxed">
            All paid plans (Starter, Pro, and Enterprise) are subject to standard payment schedules:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-xs text-muted-foreground leading-relaxed">
            <li>
              <strong>Free Trial:</strong> New workspaces enjoy a 14-day free trial on our Pro tier. No credit card is required to begin.
            </li>
            <li>
              <strong>Subscriptions:</strong> Fees are billed in advance on a recurring monthly or annual cycle. Selecting annual billing grants a 20% discount.
            </li>
            <li>
              <strong>Plan Changes:</strong> Upgrades take effect immediately, while downgrades are adjusted at the end of the current billing run.
            </li>
            <li>
              <strong>Cancellations:</strong> You can cancel your subscription at any time from your Store Settings page. No refunds are provided for partial-month usage.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "liabilities",
      title: "4. Limitation of Liability",
      icon: AlertTriangle,
      content: (
        <>
          <p className="text-muted-foreground text-sm leading-relaxed">
            EaseInv provides tax-compliant billing layouts, stock alerts, and transaction records:
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed mt-4">
            However, we are not tax advisors or legal counsel. It is your responsibility to confirm that configured tax profiles (GST/VAT rates) comply with your local jurisdiction laws. To the maximum extent permitted by law, EaseInv shall not be liable for any indirect, incidental, or consequential damages resulting from lost sales or transaction logging interruptions.
          </p>
        </>
      ),
    },
    {
      id: "governance",
      title: "5. Governance & Amendments",
      icon: FileText,
      content: (
        <>
          <p className="text-muted-foreground text-sm leading-relaxed">
            These Terms of Service shall be governed by and construed in accordance with standard international business governance frameworks.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed mt-4">
            We reserve the right to modify these terms at any time. When we make updates, we will update the "Last Updated" date on this page. Your continued use of the Service following amendments constitutes agreement to the updated terms.
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
              Last updated: July 1, 2026. For questions regarding our Terms, please contact support@easeinv.com.
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
