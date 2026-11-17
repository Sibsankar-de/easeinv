import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";

interface StoreFooterProps {
  storeName?: string;
  contactEmail?: string;
  supportPhone?: string;
}

export function StoreFooter({
  storeName = "[STORE_NAME]",
  contactEmail = "[STORE_CONTACT_EMAIL]",
  supportPhone = "[STORE_CONTACT_PHONE]",
}: StoreFooterProps) {
  const brandInitial = storeName.startsWith("[") ? "S" : storeName.charAt(0).toUpperCase();

  return (
    <footer className="mt-auto border-t border-border/70 bg-card/40 text-foreground">
      {/* Editorial Value Strip */}
      <div className="border-b border-border/50 py-10 bg-muted/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-foreground">
                <Truck className="size-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Express Tracked Delivery</h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Fast fulfillment with automated tracking updates and instant digital receipts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-foreground">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Secure Payments</h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  End-to-end encrypted transactions with industry-standard payment protection.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-foreground">
                <RotateCcw className="size-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">30-Day Guarantee</h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Frictionless self-service returns with zero restocking fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 font-bold text-base tracking-tight">
              <span className="flex size-6 items-center justify-center rounded bg-brand text-brand-foreground text-xs font-semibold">
                {brandInitial}
              </span>
              <span>{storeName}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Curated modern goods, accessories, and essentials engineered for everyday living.
            </p>
            <div className="pt-2 text-xs text-muted-foreground space-y-1">
              <div>
                <span>Direct Support: </span>
                <a href={`mailto:${contactEmail}`} className="font-medium text-foreground hover:underline">
                  {contactEmail}
                </a>
              </div>
              <div>
                <span>Phone: </span>
                <span className="font-medium text-foreground">{supportPhone}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">
              Collections
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/category/electronics" className="text-muted-foreground hover:text-foreground transition-colors">
                  Electronics & Audio
                </Link>
              </li>
              <li>
                <Link href="/category/workspace" className="text-muted-foreground hover:text-foreground transition-colors">
                  Workspace & Ergonomics
                </Link>
              </li>
              <li>
                <Link href="/category/apparel-lifestyle" className="text-muted-foreground hover:text-foreground transition-colors">
                  Apparel & Carry
                </Link>
              </li>
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  All Featured Products
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/cart" className="text-muted-foreground hover:text-foreground transition-colors">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="text-muted-foreground hover:text-foreground transition-colors">
                  Fast Checkout
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="text-muted-foreground hover:text-foreground transition-colors">
                  Order Status & OTP Sign In
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground">Shipping Terms</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">
              About & Policies
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-muted-foreground">Privacy Policy</span>
              </li>
              <li>
                <span className="text-muted-foreground">Terms of Service</span>
              </li>
              <li>
                <span className="text-muted-foreground">Shipping Policy</span>
              </li>
              <li>
                <span className="text-muted-foreground">Refund Policy</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 {storeName}. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">
            Built with{" "}
            <a
              href="https://easeinv.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline underline-offset-4"
            >
              Easeinv
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
