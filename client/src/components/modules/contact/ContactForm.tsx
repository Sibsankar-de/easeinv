"use client";

import React, { useState } from "react";
import { Mail, HelpCircle, MessageSquare, CheckCircle, Send } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import Link from "next/link";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }, 1500);
  };

  return (
    <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Direct info panels */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Get in Touch
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Have questions about pricing, setup, or multi-store inventory rules? Drop us a message, and our team will get back to you within 24 hours.
            </p>
          </div>

          <div className="space-y-4">
            {/* Direct Email Card */}
            <div className="p-5 border border-border/40 bg-card rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Email Support</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Reach out directly at <a href="mailto:support@easeinv.com" className="text-primary hover:underline font-semibold">support@easeinv.com</a>.
                </p>
              </div>
            </div>

            {/* Help Docs Card */}
            <div className="p-5 border border-border/40 bg-card rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Help Center</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Prefer self-service? Check our detailed{" "}
                  <Link href="/docs" className="text-primary hover:underline font-semibold">
                    technical guides & FAQs
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* SLA Response time Card */}
            <div className="p-5 border border-border/40 bg-card rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Average Response Time</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Under 2 hours for Enterprise partners; under 24 hours for Pro and Starter workspaces.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Message Form */}
        <div className="lg:col-span-7 bg-card border border-border/40 rounded-3xl p-8 shadow-xs relative">
          {isSubmitted ? (
            <div className="py-16 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Message Sent Successfully!</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Thank you for contacting EaseInv. A support specialist has been assigned to your ticket and will follow up with you via email shortly.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-xs font-semibold text-primary hover:underline pt-4"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-foreground">Send Us a Message</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Fill out the form below, and we will automatically route your message to the appropriate queue.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="contact-name" required className="text-xs font-semibold text-foreground">
                    Name
                  </Label>
                  <Input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={setName}
                    className="bg-background text-sm border-border/40 focus:ring-primary/50 text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="contact-email" required className="text-xs font-semibold text-foreground">
                    Business Email
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="jane@company.com"
                    value={email}
                    onChange={setEmail}
                    className="bg-background text-sm border-border/40 focus:ring-primary/50 text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="contact-message" required className="text-xs font-semibold text-foreground">
                    Message
                  </Label>
                  <Textarea
                    id="contact-message"
                    required
                    placeholder="Tell us about your store requirements..."
                    value={message}
                    onChange={setMessage}
                    className="bg-background text-sm border-border/40 focus:ring-primary/50 min-h-36 text-foreground"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  loadingMessage="Sending message..."
                  className="w-full flex items-center justify-center gap-2 font-bold py-3 text-sm rounded-xl cursor-pointer"
                >
                  Submit Inquiry
                  {!isSubmitting && <Send className="w-4 h-4" />}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
