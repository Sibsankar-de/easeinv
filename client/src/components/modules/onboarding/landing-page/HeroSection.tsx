import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import InteractiveMockup from "./InteractiveMockup";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 lg:px-12 py-24 md:py-32 flex flex-col items-center text-center">
      {/* Animated decorative shapes */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[350px] h-[350px] bg-primary/15 rounded-full blur-[90px] -z-10 animate-pulse duration-8000" />
      <div className="absolute top-1/4 right-1/4 translate-x-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -z-10 animate-pulse duration-10000" />

      <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 leading-[1.15] animate-in fade-in slide-in-from-bottom-6 duration-700">
        Billing & Inventory,{" "}
        <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-indigo-500 to-indigo-600">
          Beautifully Unified
        </span>
      </h1>

      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
        Automate invoicing, monitor multi-store inventory counts, track customer
        ledger accounts, and audit sales figures from one high-fidelity
        interface.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-20 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
        <Link
          href="/auth/signup"
          className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg text-base font-bold hover:bg-primary/95 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 duration-200"
        >
          Start Billing Free
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/features"
          className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-lg text-base font-semibold bg-secondary/35 hover:bg-secondary/60 border border-border/60 hover:border-border transition-all duration-200"
        >
          Explore Features
        </Link>
      </div>

      {/* Renders client-interactive component leaf */}
      <InteractiveMockup />
    </section>
  );
}
