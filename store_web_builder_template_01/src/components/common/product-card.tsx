"use client";

import Link from "next/link";
import Image from "next/image";
import type { ProductDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/context/cart-context";
import * as React from "react";

interface ProductCardProps {
  product: ProductDTO;
  currencySymbol?: string;
}

export function ProductCard({ product, currencySymbol = "$" }: ProductCardProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = React.useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, product.variants[0]);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <Card className="group flex flex-col overflow-hidden border-border/70 bg-card transition-all duration-200 hover:border-foreground/30 hover:shadow-md">
      {/* Product Image Frame */}
      <Link href={`/product/${product.slug}`} className="relative aspect-[4/3] w-full overflow-hidden bg-muted/30">
        <Image
          src={product.images[0]?.url ?? "/file.svg"}
          alt={product.images[0]?.altText ?? product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isFeatured && (
            <Badge className="bg-foreground text-background text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5">
              Featured
            </Badge>
          )}
          {discountPercent && (
            <Badge variant="destructive" className="text-[11px] font-semibold px-2 py-0.5">
              Save {discountPercent}%
            </Badge>
          )}
        </div>
      </Link>

      {/* Details Header */}
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <Link
            href={`/category/${product.categories[0]?.slug}`}
            className="hover:text-foreground transition-colors uppercase tracking-wider text-[10px] font-medium"
          >
            {product.categories[0]?.name}
          </Link>
          {product.averageRating && (
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span>{product.averageRating}</span>
              <span className="text-muted-foreground text-[10px]">({product.totalReviews})</span>
            </span>
          )}
        </div>

        <CardTitle className="mt-1 text-base font-semibold leading-snug line-clamp-1">
          <Link href={`/product/${product.slug}`} className="hover:underline underline-offset-2">
            {product.title}
          </Link>
        </CardTitle>

        <p className="line-clamp-2 text-xs text-muted-foreground mt-1 leading-relaxed">
          {product.shortDescription ?? product.description.replace(/<[^>]+>/g, "").slice(0, 100)}
        </p>
      </CardHeader>

      <CardContent className="p-4 pt-0" />

      {/* Pricing & Add to Bag Footer */}
      <CardFooter className="mt-auto flex items-center justify-between p-4 pt-3 border-t border-border/50">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold tracking-tight text-foreground">
              {currencySymbol}
              {product.price.toFixed(2)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {currencySymbol}
                {product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            In stock ({product.stockQuantity} available)
          </span>
        </div>

        <Button
          size="sm"
          onClick={handleAddToCart}
          variant={justAdded ? "secondary" : "default"}
          className="gap-1.5 text-xs font-medium h-8"
        >
          {justAdded ? (
            <>
              <Check className="size-3.5 text-emerald-600" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingBag className="size-3.5" />
              <span>Add to Bag</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
