import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreConfig, getCategoryBySlug, getProducts, getCategories } from "@/services";
import { ProductCard } from "@/components/common/product-card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: "price-asc" | "price-desc" | "rating" | "latest" }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  const store = await getStoreConfig();

  if (!category) {
    return { title: "Category Not Found" };
  }

  return {
    title: `${category.name} | ${store.name}`,
    description: category.description ?? `Explore ${category.name} at ${store.name}`,
    openGraph: {
      title: `${category.name} | ${store.name}`,
      description: category.description,
    },
  };
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({
    slug: cat.slug,
  }));
}

async function CategoryProductsList({
  slug,
  searchParams,
  currencySymbol,
}: {
  slug: string;
  searchParams: Promise<{ sort?: "price-asc" | "price-desc" | "rating" | "latest" }>;
  currencySymbol: string;
}) {
  const { sort } = await searchParams;
  const { items: products } = await getProducts({
    categorySlug: slug,
    sort,
  });

  return (
    <>
      {/* Sorting & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-border/40 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-3.5" />
          <span>Sort By:</span>
          <div className="flex items-center gap-1.5 font-medium">
            <Link
              href={`/category/${slug}?sort=latest`}
              className={`px-2 py-1 rounded transition-colors ${
                sort === "latest" || !sort
                  ? "bg-foreground/10 text-foreground font-semibold"
                  : "hover:text-foreground"
              }`}
            >
              Latest
            </Link>
            <Link
              href={`/category/${slug}?sort=price-asc`}
              className={`px-2 py-1 rounded transition-colors ${
                sort === "price-asc"
                  ? "bg-foreground/10 text-foreground font-semibold"
                  : "hover:text-foreground"
              }`}
            >
              Price: Low to High
            </Link>
            <Link
              href={`/category/${slug}?sort=price-desc`}
              className={`px-2 py-1 rounded transition-colors ${
                sort === "price-desc"
                  ? "bg-foreground/10 text-foreground font-semibold"
                  : "hover:text-foreground"
              }`}
            >
              Price: High to Low
            </Link>
            <Link
              href={`/category/${slug}?sort=rating`}
              className={`px-2 py-1 rounded transition-colors ${
                sort === "rating"
                  ? "bg-foreground/10 text-foreground font-semibold"
                  : "hover:text-foreground"
              }`}
            >
              Top Rated
            </Link>
          </div>
        </div>

        <div className="text-right">
          <span>Showing {products.length} items</span>
        </div>
      </div>

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currencySymbol={currencySymbol}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center max-w-md mx-auto space-y-4">
          <p className="text-sm font-medium text-foreground">No products available in this category.</p>
          <p className="text-xs text-muted-foreground">Check back soon or explore our other collections.</p>
          <Link href="/" className="inline-flex">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <ArrowLeft className="size-3.5" />
              <span>Return to Catalog</span>
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3 rounded-xl border border-border/60 p-4">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const [category, store, allCategories] = await Promise.all([
    getCategoryBySlug(slug),
    getStoreConfig(),
    getCategories(),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList className="text-xs">
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/#featured">Categories</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{category.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Category Header Banner */}
        <div className="border-b border-border/70 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono uppercase tracking-widest">
                Category
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {category.name}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {category.description}
            </p>
          </div>

          {/* Quick Category Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {allCategories.map((c) => {
              const isActive = c.slug === slug;
              return (
                <Link key={c.id} href={`/category/${c.slug}`}>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-8"
                  >
                    {c.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Suspense Wrapped Products List (handles dynamic searchParams safely with Partial Prefetching) */}
        <Suspense fallback={<ProductGridSkeleton />}>
          <CategoryProductsList
            slug={slug}
            searchParams={searchParams}
            currencySymbol={store.currencySymbol}
          />
        </Suspense>
      </div>
    </div>
  );
}
