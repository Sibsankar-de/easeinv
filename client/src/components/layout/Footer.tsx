"use client";

import Link from "next/link";
import { AppLogoFull } from "@/components/ui/AppLogo";
import { Twitter, Linkedin, Github, Mail, SendHorizontal } from "lucide-react";
import React, { useState } from "react";
import { FooterLink } from "@/components/ui/FooterLink";
import { FooterSocialLink } from "@/components/ui/FooterSocialLink";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-card/75 backdrop-blur-md border-t border-border/40 py-16 px-6 lg:px-12 w-full transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-4 space-y-6">
            <Link href="/" className="inline-block group">
              <AppLogoFull
                size={130}
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              The all-in-one billing, inventory, and customer management
              workspace built to scale your business. Unified workflows for
              modern enterprises.
            </p>
            <div className="flex gap-4">
              <FooterSocialLink
                href="https://twitter.com"
                icon={Twitter}
                ariaLabel="Twitter"
              />
              <FooterSocialLink
                href="https://linkedin.com"
                icon={Linkedin}
                ariaLabel="LinkedIn"
              />
              <FooterSocialLink
                href="https://github.com"
                icon={Github}
                ariaLabel="GitHub"
              />
            </div>
          </div>

          {/* Links Sections */}
          <div className="col-span-1 md:col-span-5 grid grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-semibold mb-6 text-foreground uppercase tracking-wider">
                Product
              </h4>
              <ul className="space-y-4">
                <li>
                  <FooterLink href="/features">Features</FooterLink>
                </li>
                <li>
                  <FooterLink href="/pricing">Pricing</FooterLink>
                </li>
                <li>
                  <FooterLink href="/docs">Docs</FooterLink>
                </li>
                <li>
                  <FooterLink href="/docs/api">API Explorer</FooterLink>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-6 text-foreground uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-4">
                <li>
                  <FooterLink href="/about">About</FooterLink>
                </li>
                <li>
                  <FooterLink href="#">Blog</FooterLink>
                </li>
                <li>
                  <FooterLink href="#">Careers</FooterLink>
                </li>
                <li>
                  <FooterLink href="/contact">Contact</FooterLink>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-6 text-foreground uppercase tracking-wider">
                Legal
              </h4>
              <ul className="space-y-4">
                <li>
                  <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
                </li>
                <li>
                  <FooterLink href="/terms-of-service">Terms of Service</FooterLink>
                </li>
                <li>
                  <FooterLink href="#">Security</FooterLink>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter subscription */}
          <div className="col-span-1 md:col-span-3 space-y-6">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Stay Updated
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Subscribe to our newsletter for major feature announcements,
              updates, and templates.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <div className="relative flex items-center">
                <Input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e)}
                  icon={<Mail className="w-4 h-4 text-muted-foreground" />}
                />
                <Button
                  type="submit"
                  className="absolute right-1.5 p-2"
                  aria-label="Subscribe"
                >
                  <SendHorizontal className="w-3.5 h-3.5" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between text-muted-foreground text-sm gap-4">
          <p>&copy; {new Date().getFullYear()} EaseInv. All rights reserved.</p>
          <div className="flex gap-6">
            <FooterLink href="/docs/introduction">Help Center</FooterLink>
            <FooterLink href="#">Status Page</FooterLink>
            <FooterLink href="#">Trust & Safety</FooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
};
