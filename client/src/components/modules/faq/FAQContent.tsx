"use client";

import React, { useState, useMemo } from "react";
import { 
  HelpCircle, 
  Store, 
  Printer, 
  ShieldCheck, 
  Search, 
  ChevronDown,
  ArrowRight,
  MessageSquare
} from "lucide-react";
import Link from "next/link";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: FaqItem[];
}

const faqData: FaqCategory[] = [
  {
    id: "general",
    label: "General",
    icon: HelpCircle,
    items: [
      {
        q: "What is EaseInv?",
        a: "EaseInv is a unified billing, invoicing, and inventory management platform designed for retail shops, digital merchants, and growing business networks. We replace manual spreadsheets and disconnected stock tracking tools with a single, fast, compliant dashboard."
      },
      {
        q: "How do I get started?",
        a: "Getting started takes less than a minute. Create an account on our free Starter plan, configure your first store (name, currency, tax parameters), add your inventory items, and you are ready to issue invoices instantly."
      },
      {
        q: "Do I need a credit card to sign up?",
        a: "No. Our Starter tier is completely free to use and does not require any credit card information to sign up or get started."
      }
    ]
  },
  {
    id: "stores-inventory",
    label: "Stores & Inventory",
    icon: Store,
    items: [
      {
        q: "How many stores can I manage?",
        a: "On the free Starter plan, you can manage 1 store. The Pro plan allows up to 3 store locations, and the Enterprise plan supports unlimited store configurations under a single account."
      },
      {
        q: "What are the inventory product limits?",
        a: "The Starter tier supports up to 25 active product listings. The Pro tier expands this limit to 1,000 product listings, and the Enterprise tier provides unlimited listings for high-volume operations."
      },
      {
        q: "What happens if I exceed my product listing limit?",
        a: "If you hit the product limit on your plan, you can still bill existing items without issue. However, you will not be able to list new SKU variants or product categories until you delete older entries or upgrade your subscription plan."
      },
      {
        q: "Can I manage multiple warehouse stocks uniquely?",
        a: "Yes. For plans that support multiple stores (Pro & Enterprise), inventory stock counts, reorder thresholds, and alerts are tracked uniquely per location. You can choose the active store context from your dashboard sidebar."
      }
    ]
  },
  {
    id: "billing-printing",
    label: "Billing & Printing",
    icon: Printer,
    items: [
      {
        q: "How many invoices can I issue?",
        a: "The free Starter plan includes a limit of 50 invoices per day. Both the Pro and Enterprise plans allow unlimited invoice drafting and daily transaction runs."
      },
      {
        q: "Do you support standard thermal receipt printing?",
        a: "Yes. EaseInv includes standard POS thermal printing stylesheets optimized for 80mm and 58mm roll widths, alongside traditional A4 PDF downloads, so you can issue physical slips at retail checkouts easily."
      },
      {
        q: "Can I customize taxes and discounts per invoice?",
        a: "Absolutely. EaseInv features a robust tax engine that supports flat VAT percentages, GST rates, custom service tax profiles, and line-item or invoice-level discount configurations."
      }
    ]
  },
  {
    id: "security",
    label: "Security & Sandbox",
    icon: ShieldCheck,
    items: [
      {
        q: "Is my business data secure?",
        a: "Yes, security is our primary focus. All database transit requests use TLS 1.3 encryption. Ledger details and customer directories are encrypted at rest using AES-256 keys, and data is partitioned securely between merchants."
      },
      {
        q: "Do you provide developer API keys?",
        a: "Yes. Pro plan subscribers get access to Developer API keys, and Enterprise plan subscribers enjoy unlimited API keys and full read-write sandboxing to test custom integrations before pushing them live."
      },
      {
        q: "Can I assign custom roles to my team?",
        a: "Yes. Our role-based access control (RBAC) allows you to invite managers, cashiers, and accountants, restricting dashboard panels so employees only see their assigned workflows."
      }
    ]
  }
];

export default function FAQContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedFaqs, setExpandedFaqs] = useState<Record<string, boolean>>({});

  const toggleFaq = (id: string) => {
    setExpandedFaqs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFaqs = useMemo(() => {
    return faqData.map((category) => {
      if (activeCategory !== "all" && category.id !== activeCategory) {
        return { ...category, items: [] };
      }

      const filteredItems = category.items.filter((item) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
          item.q.toLowerCase().includes(query) ||
          item.a.toLowerCase().includes(query)
        );
      });

      return {
        ...category,
        items: filteredItems,
      };
    }).filter((category) => category.items.length > 0);
  }, [searchQuery, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    faqData.forEach((category) => {
      const matchingItems = category.items.filter((item) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
          item.q.toLowerCase().includes(query) ||
          item.a.toLowerCase().includes(query)
        );
      });
      counts[category.id] = matchingItems.length;
      counts.all += matchingItems.length;
    });
    return counts;
  }, [searchQuery]);

  const totalResults = useMemo(() => {
    return filteredFaqs.reduce((sum, cat) => sum + cat.items.length, 0);
  }, [filteredFaqs]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Search Input Box */}
      <div className="max-w-2xl mx-auto mb-16 relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Search FAQs (e.g. store limits, invoices, api...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-6 py-4 rounded-2xl border border-border/40 bg-card text-foreground text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-xs transition-all placeholder:text-muted-foreground/70"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Category Sidebar Navigation */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="border border-border/40 rounded-2xl p-6 bg-card">
            <h3 className="font-extrabold text-xs text-foreground uppercase tracking-wider mb-4">
              Categories
            </h3>
            <div className="space-y-1.5 flex flex-col">
              <button
                onClick={() => setActiveCategory("all")}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>All Questions</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  activeCategory === "all"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {categoryCounts.all}
                </span>
              </button>

              {faqData.map((category) => {
                const CategoryIcon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeCategory === category.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CategoryIcon className="w-4 h-4" />
                      <span>{category.label}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      activeCategory === category.id
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {categoryCounts[category.id]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border border-border/40 rounded-2xl p-6 bg-linear-to-b from-card to-secondary/10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Still need help?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Can't find the answer you are looking for? Reach out directly and our support managers will resolve it.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              Contact Support <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>

        {/* Content Accordion Panel */}
        <div className="lg:col-span-8 space-y-12">
          {totalResults === 0 ? (
            <div className="text-center py-20 bg-card border border-border/40 rounded-3xl space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">No matches found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                We couldn't find any FAQs matching your query "{searchQuery}". Try searching for other terms or contact our team directly.
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 transition-all inline-block"
                >
                  Ask a Question
                </Link>
              </div>
            </div>
          ) : (
            filteredFaqs.map((category) => (
              <div key={category.id} className="space-y-4">
                <h3 className="text-base font-extrabold text-muted-foreground uppercase tracking-widest pl-1">
                  {category.label}
                </h3>
                <div className="space-y-4">
                  {category.items.map((item, i) => {
                    const itemKey = `${category.id}-${i}`;
                    const isOpen = !!expandedFaqs[itemKey];
                    return (
                      <div
                        key={i}
                        className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-xs hover:border-primary/20 transition-all duration-300"
                      >
                        <button
                          onClick={() => toggleFaq(itemKey)}
                          className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-foreground hover:bg-muted/15 transition-colors cursor-pointer"
                        >
                          <span>{item.q}</span>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 shrink-0 ml-4 ${
                            isOpen ? "rotate-180 text-primary" : ""
                          }`} />
                        </button>
                        <div
                          className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            isOpen ? "max-h-[300px] border-t border-border/30" : "max-h-0"
                          }`}
                        >
                          <p className="p-5 text-muted-foreground text-xs leading-relaxed bg-muted/5">
                            {item.a}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
