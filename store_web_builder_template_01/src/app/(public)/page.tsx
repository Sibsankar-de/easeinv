import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getStoreConfig, getProducts, getCategories } from "@/services";
import { ProductCard } from "@/components/common/product-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreConfig();
  return {
    title: `${store.name} — Modern Minimalist Storefront`,
    description: store.seo.metaDescription,
    keywords: store.seo.keywords,
    openGraph: {
      title: store.name,
      description: store.seo.metaDescription,
      type: "website",
    },
  };
}

export default async function HomePage() {
  const store = await getStoreConfig();
  const [{ items: featuredProducts }, categories] = await Promise.all([
    getProducts({ featuredOnly: true }),
    getCategories(),
  ]);

  const flagshipProduct = featuredProducts[0];

  return (
    <div className="flex flex-col">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-muted/20 via-background to-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Editorial Copy */}
            <div className="lg:col-span-7 flex flex-col items-start gap-6">
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs font-medium uppercase tracking-wider">
                <Sparkles className="size-3 text-brand" />
                Editorial Edition • 2026 Collection
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                {store.heroTitle ?? "[STORE_HERO_TITLE]"}
              </h1>

              <p className="max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                {store.tagline ?? "[STORE_TAGLINE]"}. {store.heroSubtitle ?? "[STORE_HERO_SUBTITLE]"}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#featured"
                  className={buttonVariants({ size: "lg", variant: "default" })}
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="size-4 ml-1.5" />
                </a>
                <Link
                  href="/category/electronics"
                  className={buttonVariants({ size: "lg", variant: "outline" })}
                >
                  View Electronics
                </Link>
              </div>

              {/* Minimalist Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border/60 w-full max-w-md text-xs">
                <div>
                  <p className="font-bold text-lg text-foreground font-mono">100%</p>
                  <p className="text-muted-foreground mt-0.5">Carbon Offset Shipping</p>
                </div>
                <div>
                  <p className="font-bold text-lg text-foreground font-mono">30-Day</p>
                  <p className="text-muted-foreground mt-0.5">At-Home Trial</p>
                </div>
                <div>
                  <p className="font-bold text-lg text-foreground font-mono">256-Bit</p>
                  <p className="text-muted-foreground mt-0.5">Encrypted Checkout</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Feature */}
            <div className="lg:col-span-5">
              {flagshipProduct && (
                <div className="group relative rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40">
                    <Image
                      src={flagshipProduct.images[0]?.url ?? "/file.svg"}
                      alt={flagshipProduct.title}
                      fill
                      priority
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-foreground text-background text-xs font-semibold uppercase tracking-wider">
                        Flagship
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                        {flagshipProduct.categories[0]?.name}
                      </p>
                      <h3 className="font-semibold text-base text-foreground mt-0.5">
                        {flagshipProduct.title}
                      </h3>
                      <p className="text-sm font-bold text-foreground mt-1">
                        {store.currencySymbol}{flagshipProduct.price.toFixed(2)}
                      </p>
                    </div>
                    <Link
                      href={`/product/${flagshipProduct.slug}`}
                      className={buttonVariants({ size: "sm", variant: "outline" })}
                    >
                      <span>Inspect</span>
                      <ArrowRight className="size-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. BENTO GRID MARKETING & CATEGORY HIGHLIGHTS */}
      <section className="py-16 sm:py-24 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Curated Index
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
              Engineered with Material Discipline
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              Explore our core categories crafted with surgical tolerances and honest materials.
            </p>
          </div>

          {/* Bento Grid Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-[280px]">
            {/* Bento Tile 1: Electronics (Large 2-col span) */}
            <Link
              href="/category/electronics"
              className="group relative md:col-span-2 rounded-xl border border-border/80 bg-card overflow-hidden p-6 sm:p-8 flex flex-col justify-between transition-all hover:border-foreground/40 hover:shadow-md"
            >
              <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-50 transition-opacity">
                <Image
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80"
                  alt="Electronics Category"
                  fill
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
              </div>

              <div className="relative z-10">
                <Badge variant="secondary" className="text-xs font-mono">01 / Category</Badge>
              </div>

              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  Acoustic Hardware & Electronics
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-md line-clamp-2">
                  Neutral studio sound signatures, low-noise amplifiers, and active frequency dampening.
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground mt-3 group-hover:translate-x-1 transition-transform">
                  Browse 4 Products <ArrowRight className="size-3" />
                </span>
              </div>
            </Link>

            {/* Bento Tile 2: Workspace (1-col span) */}
            <Link
              href="/category/workspace"
              className="group relative rounded-xl border border-border/80 bg-card overflow-hidden p-6 flex flex-col justify-between transition-all hover:border-foreground/40 hover:shadow-md"
            >
              <div className="absolute inset-0 z-0 opacity-30 group-hover:opacity-40 transition-opacity">
                <Image
                  src="https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&auto=format&fit=crop&q=80"
                  alt="Workspace Category"
                  fill
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              </div>

              <div className="relative z-10">
                <Badge variant="secondary" className="text-xs font-mono">02 / Workspace</Badge>
              </div>

              <div className="relative z-10">
                <h3 className="text-lg font-bold text-foreground">
                  Studio Desks & Ergonomics
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  100% bamboo and aerospace alloy construction.
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground mt-3 group-hover:translate-x-1 transition-transform">
                  View Series <ArrowRight className="size-3" />
                </span>
              </div>
            </Link>

            {/* Bento Tile 3: Apparel (1-col span) */}
            <Link
              href="/category/apparel-lifestyle"
              className="group relative rounded-xl border border-border/80 bg-card overflow-hidden p-6 flex flex-col justify-between transition-all hover:border-foreground/40 hover:shadow-md"
            >
              <div className="absolute inset-0 z-0 opacity-30 group-hover:opacity-40 transition-opacity">
                <Image
                  src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80"
                  alt="Apparel & Carry Category"
                  fill
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              </div>

              <div className="relative z-10">
                <Badge variant="secondary" className="text-xs font-mono">03 / Carry</Badge>
              </div>

              <div className="relative z-10">
                <h3 className="text-lg font-bold text-foreground">
                  Technical Carry & Packs
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Weatherproof sailcloth with modular dividers.
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground mt-3 group-hover:translate-x-1 transition-transform">
                  Explore Packs <ArrowRight className="size-3" />
                </span>
              </div>
            </Link>

            {/* Bento Tile 4: Store Quality & Service Assurance (Wide 4-col span on LG) */}
            <div className="md:col-span-3 lg:col-span-4 rounded-xl border border-border/70 bg-muted/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-center sm:text-left">
                <span className="text-xs font-mono uppercase tracking-widest text-brand font-semibold">
                  Customer Assurance
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  Frictionless Checkout & Fast Delivery
                </h3>
                <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                  Every order includes automated tracking updates, instant digital tax receipts,
                  and a dedicated 30-day return policy.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/category/electronics"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Shop Full Catalog
                </Link>
                <Link
                  href="/checkout"
                  className={buttonVariants({ variant: "default", size: "sm" })}
                >
                  Quick Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS CATALOG */}
      <section id="featured" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                In Stock & Shipping
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
                Featured Product Catalog
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Click any product to inspect specifications, variant options, and customer reviews.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="hidden md:inline-flex"
                >
                  <Button variant="ghost" size="sm" className="text-xs">
                    {cat.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currencySymbol={store.currencySymbol}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. EDITORIAL BRAND STATEMENT */}
      <section className="border-t border-border/60 bg-muted/30 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            The Design Manifesto
          </span>
          <blockquote className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-normal text-foreground leading-snug">
            &ldquo;{store.manifestoQuote ?? "[STORE_BRAND_MANIFESTO]"}&rdquo;
          </blockquote>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
            {store.manifestoAuthor ?? "[STORE_BRAND_MANIFESTO_AUTHOR]"}
          </p>
        </div>
      </section>
    </div>
  );
}
