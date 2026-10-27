import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaBanner() {
  return (
    <section className="py-24 px-6 lg:px-12 relative overflow-hidden text-center bg-linear-to-b from-card/30 to-secondary/15 border-t border-border/40">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[110px] -z-10" />

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Ready to Streamline Your Commerce Operations?
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Join store managers and operations developers who run billing,
          multi-store stock audits, and sales snapshots with EaseInv.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="group flex items-center justify-center gap-2 bg-primary text-primary-foreground px-10 py-4.5 rounded-lg text-base font-extrabold hover:bg-primary/95 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 duration-200"
          >
            Create Free Store
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center justify-center px-10 py-4.5 rounded-lg text-base font-semibold border border-border/60 hover:bg-secondary/40 transition-colors"
          >
            Sign In to Store
          </Link>
        </div>
        <p className="text-xs text-muted-foreground pt-2">
          No credit card required. Fast 60-second setup.
        </p>
      </div>
    </section>
  );
}
