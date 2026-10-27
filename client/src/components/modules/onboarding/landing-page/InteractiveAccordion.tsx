"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

interface InteractiveAccordionProps {
  faqItems: FaqItem[];
}

export default function InteractiveAccordion({ faqItems }: InteractiveAccordionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {faqItems.map((faq, idx) => (
        <div
          key={idx}
          className="bg-card border border-border/40 rounded-xl overflow-hidden transition-all duration-300"
        >
          <button
            onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-foreground hover:bg-muted/15 transition-colors cursor-pointer"
          >
            <span>{faq.q}</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
              openFaq === idx ? "rotate-180 text-primary" : ""
            }`} />
          </button>
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              openFaq === idx ? "max-h-[200px] border-t border-border/30" : "max-h-0"
            }`}
          >
            <p className="p-5 text-muted-foreground text-xs leading-relaxed bg-muted/5">
              {faq.a}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
