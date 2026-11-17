"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingBag, User, Menu, ArrowRight } from "lucide-react";

interface StoreHeaderProps {
  storeName?: string;
  announcementText?: string;
}

export function StoreHeader({
  storeName = "[STORE_NAME]",
  announcementText = "[STORE_ANNOUNCEMENT_TEXT]",
}: StoreHeaderProps) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const brandInitial = storeName.startsWith("[") ? "S" : storeName.charAt(0).toUpperCase();

  const navLinks = [
    { label: "All Catalog", href: "/" },
    { label: "Electronics", href: "/category/electronics" },
    { label: "Workspace", href: "/category/workspace" },
    { label: "Apparel", href: "/category/apparel-lifestyle" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
      {/* Top Editorial Announcement Bar */}
      <div className="border-b border-border/40 bg-muted/30 px-4 py-1.5 text-center text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        <span>{announcementText}</span>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Nav & Brand Logo */}
        <div className="flex items-center gap-4 sm:gap-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className={buttonVariants({
                variant: "ghost",
                size: "icon",
                className: "md:hidden",
              })}
            >
              <Menu className="size-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[360px] p-6">
              <SheetHeader className="text-left mb-6">
                <SheetTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded bg-brand text-brand-foreground text-xs font-semibold">
                    {brandInitial}
                  </span>
                  {storeName}
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between py-2 text-sm font-medium transition-colors ${
                      pathname === link.href ? "text-foreground font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="size-4 opacity-50" />
                  </Link>
                ))}
                <div className="pt-4 mt-4 border-t border-border">
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground py-2"
                  >
                    <User className="size-4" />
                    <span>Customer Sign In</span>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-md bg-brand text-brand-foreground text-xs font-semibold tracking-wider">
              {brandInitial}
            </span>
            <span className="font-semibold text-foreground">{storeName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors hover:text-foreground ${
                    isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
          >
            <User className="size-3.5" />
            <span>Sign In</span>
          </Link>

          <Link href="/cart">
            <Button variant="outline" size="sm" className="relative gap-2 h-9 px-3">
              <ShoppingBag className="size-4" />
              <span className="text-xs font-medium">Bag</span>
              {itemCount > 0 && (
                <Badge className="size-5 p-0 flex items-center justify-center rounded-full bg-brand text-brand-foreground text-[10px] font-bold">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
