"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Lock,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export default function CheckoutPage() {
  const { items, itemCount, subtotal, shipping, tax, total, clearCart } = useCart();

  const [shippingMethod, setShippingMethod] = React.useState<"standard" | "express">("standard");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [orderComplete, setOrderComplete] = React.useState(false);

  // Address Form State
  const [formData, setFormData] = React.useState({
    email: "customer@example.com",
    firstName: "Alex",
    lastName: "Morgan",
    street: "742 Evergreen Terrace",
    apartment: "Suite 4B",
    city: "Springfield",
    state: "OR",
    postalCode: "97477",
    country: "United States",
    phone: "+1 (555) 019-2834",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = () => {
    setIsProcessing(true);

    // Simulate order placement and confirmation
    setTimeout(() => {
      setIsProcessing(false);
      setOrderComplete(true);
      clearCart();
      toast.success("Order Placed Successfully", {
        description: "Your order has been confirmed. Confirmation details sent to your email.",
      });
    }, 1200);
  };

  if (orderComplete) {
    return (
      <div className="py-20 sm:py-28">
        <div className="mx-auto max-w-lg px-4 text-center space-y-6">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="size-8" />
          </div>

          <div className="space-y-2">
            <Badge variant="outline" className="text-xs font-mono">
              Order #ORD-94821
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Thank You for Your Order!
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your payment has been successfully processed for [STORE_NAME].
              A detailed confirmation and tracking details have been dispatched to{" "}
              <strong className="text-foreground">{formData.email}</strong>.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-5 text-left text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Status:</span>
              <span className="font-semibold text-emerald-600 uppercase">Confirmed & Paid</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery To:</span>
              <span className="text-foreground">{formData.city}, {formData.state} {formData.postalCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount Settled:</span>
              <span className="font-bold text-foreground">${total > 0 ? total.toFixed(2) : "314.99"}</span>
            </div>
          </div>

          <Link href="/">
            <Button size="lg" className="w-full">
              Return to Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation back */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to Bag</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Lock className="size-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Address & Shipping */}
          <div className="lg:col-span-7 space-y-8">
            {/* Customer Contact */}
            <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-6">
              <h2 className="text-base font-bold text-foreground">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@domain.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-6">
              <h2 className="text-base font-bold text-foreground">Shipping Destination</h2>
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="apartment">Apartment / Suite</Label>
                    <Input
                      id="apartment"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-6">
              <h2 className="text-base font-bold text-foreground">Shipping Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setShippingMethod("standard")}
                  className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                    shippingMethod === "standard"
                      ? "border-foreground bg-muted/40 ring-1 ring-foreground"
                      : "border-border/70 hover:border-foreground/40"
                  }`}
                >
                  <div className="flex items-center justify-between w-full font-semibold">
                    <span>Standard Express Tracked</span>
                    <span className="font-mono">{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">3–5 business days via courier</p>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingMethod("express")}
                  className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                    shippingMethod === "express"
                      ? "border-foreground bg-muted/40 ring-1 ring-foreground"
                      : "border-border/70 hover:border-foreground/40"
                  }`}
                >
                  <div className="flex items-center justify-between w-full font-semibold">
                    <span>Next-Day Priority Air</span>
                    <span className="font-mono">$25.00</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Guaranteed next morning delivery</p>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review */}
          <div className="lg:col-span-5">
            <Card className="border-border/80 sticky top-24 shadow-xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span>Order Overview</span>
                  <span className="text-xs text-muted-foreground font-mono font-normal">
                    {itemCount} Items
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 pt-4 text-xs">
                {/* Item List Preview */}
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                  {items.map((item) => {
                    const price = item.variant ? item.variant.price : item.product.price;
                    return (
                      <div key={item.id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="relative size-12 shrink-0 rounded-lg overflow-hidden border border-border/60 bg-muted/30">
                            <Image
                              src={item.product.images[0]?.url ?? "/file.svg"}
                              alt={item.product.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold line-clamp-1">{item.product.title}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              Qty: {item.quantity} {item.variant ? `• ${item.variant.title}` : ""}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono font-semibold">
                          ${(price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="font-mono text-foreground">
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Tax</span>
                    <span className="font-mono text-foreground">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-sm font-bold text-foreground pt-1">
                  <span>Total Due</span>
                  <span className="text-xl font-mono">${total.toFixed(2)}</span>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <Button
                  size="lg"
                  disabled={isProcessing}
                  onClick={handlePlaceOrder}
                  className="w-full h-11 font-semibold"
                >
                  {isProcessing ? (
                    <span>Processing Order...</span>
                  ) : (
                    <span>Place Order • ${total.toFixed(2)}</span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
