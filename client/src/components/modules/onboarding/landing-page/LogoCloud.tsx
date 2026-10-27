import React from "react";

export default function LogoCloud() {
  return (
    <section className="py-12 border-y border-border/40 bg-card/25 text-center">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">
        Optimized commerce infrastructure for teams worldwide
      </p>
      <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-55">
        {["Acme Corp", "Globex", "Initech", "Umbrella", "Wayne Ent"].map(
          (logo) => (
            <span
              key={logo}
              className="text-sm font-black tracking-wider text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              {logo.toUpperCase()}
            </span>
          ),
        )}
      </div>
    </section>
  );
}
