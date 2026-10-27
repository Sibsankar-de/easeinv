import React from "react";

export default function Testimonials() {
  const reviews = [
    {
      quote:
        "EaseInv reduced our monthly invoice generation cycles by 80%. Setting up store inventories and tracking customer dues has never been this smooth.",
      author: "Sarah Jenkins",
      role: "Operations Director, Globex Co.",
      avatar: "SJ",
    },
    {
      quote:
        "The low stock threshold alerts are incredibly reliable. We avoided stock depletion during high-volume sales runs. An essential warehouse asset.",
      author: "Marcus Vance",
      role: "Warehouse Manager, TechDepot",
      avatar: "MV",
    },
    {
      quote:
        "We use the API Key endpoints to query our store invoicing ledger directly. The documentation and explorer sandbox are exceptionally robust.",
      author: "Elena Rostova",
      role: "Lead Software Architect, SwiftFlow",
      avatar: "ER",
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-12 bg-background border-t border-border/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Customer Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-3">
            Loved by Growing Store Managers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((t, idx) => (
            <div
              key={idx}
              className="bg-card border border-border/45 p-8 rounded-2xl flex flex-col justify-between shadow-sm relative"
            >
              <span className="absolute top-6 right-8 text-5xl text-primary/10 font-serif">
                “
              </span>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8 italic relative z-10">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3.5 border-t border-border/40 pt-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    {t.author}
                  </h4>
                  <p className="text-muted-foreground text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
