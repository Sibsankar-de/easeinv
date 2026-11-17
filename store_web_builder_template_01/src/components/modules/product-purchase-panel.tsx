"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ProductDTO, ProductVariantDTO } from "@/types";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ArrowRight, Check, ShieldCheck, Truck, RotateCcw, Minus, Plus } from "lucide-react";

interface ProductPurchasePanelProps {
  product: ProductDTO;
  currencySymbol?: string;
}

export function ProductPurchasePanel({
  product,
  currencySymbol = "$",
}: ProductPurchasePanelProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariantDTO | undefined>(
    product.variants[0]
  );
  const [quantity, setQuantity] = React.useState(1);
  const [isAdding, setIsAdding] = React.useState(false);

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentCompareAtPrice = selectedVariant
    ? selectedVariant.compareAtPrice
    : product.compareAtPrice;

  const discountPercent =
    currentCompareAtPrice && currentCompareAtPrice > currentPrice
      ? Math.round(((currentCompareAtPrice - currentPrice) / currentCompareAtPrice) * 100)
      : null;

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariant);
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 1200);
  };

  const handleBuyNow = () => {
    addItem(product, quantity, selectedVariant);
    router.push("/checkout");
  };

  return (
    <div className="space-y-6">
      {/* Price Header */}
      <div className="flex flex-col gap-1 pb-4 border-b border-border/60">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
            {currencySymbol}
            {currentPrice.toFixed(2)}
          </span>
          {currentCompareAtPrice && (
            <span className="text-lg text-muted-foreground line-through font-mono">
              {currencySymbol}
              {currentCompareAtPrice.toFixed(2)}
            </span>
          )}
          {discountPercent && (
            <Badge variant="destructive" className="text-xs font-semibold">
              Save {discountPercent}%
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Taxes and shipping calculated at checkout • Secure Checkout
        </p>
      </div>

      {/* Variant Selector (if available) */}
      {product.variants.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs">
            <span className="font-semibold uppercase tracking-wider text-muted-foreground">
              Select Variant
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition-all ${
                    isSelected
                      ? "border-foreground bg-foreground text-background shadow-xs font-semibold"
                      : "border-border/80 bg-card hover:border-foreground/50 text-foreground"
                  }`}
                >
                  <span>{v.title}</span>
                  {v.price !== product.price && (
                    <span className="ml-1.5 opacity-80 font-mono">
                      ({currencySymbol}{v.price.toFixed(2)})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quantity
        </label>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-border/80 bg-card">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex size-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-10 text-center font-mono text-sm font-semibold">
              {quantity}
            </span>
            <button
              type="button"
              disabled={quantity >= product.stockQuantity}
              onClick={() => setQuantity((q) => q + 1)}
              className="flex size-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          size="lg"
          onClick={handleAddToCart}
          variant={isAdding ? "secondary" : "default"}
          className="flex-1 gap-2 font-semibold h-11"
        >
          {isAdding ? (
            <>
              <Check className="size-4 text-emerald-600" />
              <span>Added to Bag</span>
            </>
          ) : (
            <>
              <ShoppingBag className="size-4" />
              <span>Add to Bag</span>
            </>
          )}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={handleBuyNow}
          className="flex-1 gap-2 border-foreground/30 hover:border-foreground font-semibold h-11"
        >
          <span>Buy Now</span>
          <ArrowRight className="size-4" />
        </Button>
      </div>

      {/* Micro-Perks / Trust Strip */}
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 text-foreground">
          <Truck className="size-4 text-emerald-600" />
          <span className="font-medium">Free express delivery on orders over $100</span>
        </div>
        <div className="flex items-center gap-2 text-foreground">
          <ShieldCheck className="size-4 text-brand" />
          <span className="font-medium">Encrypted & secure checkout guarantee</span>
        </div>
        <div className="flex items-center gap-2 text-foreground">
          <RotateCcw className="size-4 text-amber-600" />
          <span className="font-medium">30-day hassle-free return policy</span>
        </div>
      </div>
    </div>
  );
}
