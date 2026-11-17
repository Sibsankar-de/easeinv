"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, ArrowRight, Trash2, Minus, Plus, ArrowLeft, ShieldCheck, Truck } from "lucide-react";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
    subtotal,
    shipping,
    tax,
    total,
  } = useCart();

  const freeShippingThreshold = 100;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  if (items.length === 0) {
    return (
      <div className="py-20 sm:py-28">
        <div className="mx-auto max-w-md px-4 text-center space-y-6">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 text-muted-foreground">
            <ShoppingBag className="size-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Your Shopping Bag is Empty</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Explore our curated collections of acoustic hardware, ergonomic workspace furniture, and technical carry.
            </p>
          </div>

          <Link href="/" className={buttonVariants({ size: "lg", variant: "default" })}>
            <span>Explore Collection</span>
            <ArrowRight className="size-4 ml-1.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-baseline justify-between border-b border-border/70 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Shopping Bag
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {itemCount} {itemCount === 1 ? "Item" : "Items"} in your order
            </p>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear Bag
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {amountToFreeShipping > 0 ? (
          <div className="mb-8 rounded-xl border border-border/70 bg-muted/20 p-4 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground">
                Add <span className="font-mono font-bold">${amountToFreeShipping.toFixed(2)}</span> more to unlock Free Express Shipping
              </span>
              <Truck className="size-4 text-muted-foreground" />
            </div>
            <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-brand transition-all duration-300"
                style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-2">
            <Truck className="size-4" />
            <span>Congratulations! Your order qualifies for Free Express Shipping.</span>
          </div>
        )}

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-2xl border border-border/70 bg-card divide-y divide-border/60 overflow-hidden">
              {items.map((item) => {
                const itemPrice = item.variant ? item.variant.price : item.product.price;
                const itemTotal = itemPrice * item.quantity;

                return (
                  <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Image & Title */}
                    <div className="flex items-center gap-4">
                      <div className="relative size-20 sm:size-24 shrink-0 rounded-xl overflow-hidden border border-border/60 bg-muted/30">
                        <Image
                          src={item.product.images[0]?.url ?? "/file.svg"}
                          alt={item.product.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="font-semibold text-sm sm:text-base hover:underline line-clamp-1"
                        >
                          {item.product.title}
                        </Link>
                        {item.variant && (
                          <p className="text-xs text-muted-foreground font-mono">
                            Variant: {item.variant.title}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground font-mono">
                          Unit: ${itemPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Quantity & Item Subtotal */}
                    <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                      {/* Quantity Stepper */}
                      <div className="flex items-center rounded-lg border border-border/80 bg-background">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      {/* Total for this item */}
                      <span className="text-sm font-bold font-mono text-foreground w-20 text-right">
                        ${itemTotal.toFixed(2)}
                      </span>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                <ArrowLeft className="size-3.5" />
                <span>Continue Browsing Products</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4">
            <Card className="border-border/80 sticky top-24 shadow-xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-base font-bold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                  <span className="font-mono font-semibold text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Estimated Shipping</span>
                  <span className="font-mono font-semibold text-foreground">
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Estimated Tax (8%)</span>
                  <span className="font-mono font-semibold text-foreground">${tax.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between text-sm font-bold text-foreground pt-1">
                  <span>Grand Total</span>
                  <span className="text-lg font-mono">${total.toFixed(2)}</span>
                </div>
              </CardContent>

              <CardFooter className="flex-col gap-3 pt-2">
                <Link
                  href="/checkout"
                  className={buttonVariants({
                    size: "lg",
                    variant: "default",
                    className: "w-full gap-2 font-semibold h-11",
                  })}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="size-4" />
                </Link>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground text-center pt-2">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  <span>[STORE_NAME] Verified 256-bit Encrypted Checkout</span>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
