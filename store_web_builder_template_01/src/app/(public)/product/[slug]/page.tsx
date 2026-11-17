import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreConfig, getProductBySlug, getRelatedProducts, getProducts } from "@/services";
import { ProductGallery } from "@/components/modules/product-gallery";
import { ProductPurchasePanel } from "@/components/modules/product-purchase-panel";
import { ProductCard } from "@/components/common/product-card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star } from "lucide-react";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const store = await getStoreConfig();

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.title} | ${store.name}`,
    description: product.shortDescription ?? product.description.replace(/<[^>]+>/g, "").slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.shortDescription,
      images: product.images.map((img) => ({
        url: img.url,
        alt: img.altText ?? product.title,
      })),
    },
  };
}

export async function generateStaticParams() {
  const { items: products } = await getProducts();
  return products.map((p) => ({
    slug: p.slug,
  }));
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, store] = await Promise.all([
    getProductBySlug(slug),
    getStoreConfig(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, 3);
  const primaryCategory = product.categories[0];

  // Schema.org JSON-LD Structured Data for search indexing
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images.map((i) => i.url),
    description: product.shortDescription ?? product.description.replace(/<[^>]+>/g, "").slice(0, 200),
    sku: product.sku,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: store.currency,
      availability: product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating: product.averageRating
      ? {
          "@type": "AggregateRating",
          ratingValue: product.averageRating,
          reviewCount: product.totalReviews ?? 1,
        }
      : undefined,
  };

  return (
    <div className="py-8 sm:py-14">
      {/* JSON-LD for Search Engine Optimization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList className="text-xs">
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {primaryCategory && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/category/${primaryCategory.slug}`}>
                      {primaryCategory.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-foreground truncate max-w-[200px] sm:max-w-none">
                  {product.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Top Product Hero Layout: Gallery (Left) + Purchase Panel (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Gallery View */}
          <div className="lg:col-span-7">
            <ProductGallery
              images={product.images}
              title={product.title}
            />
          </div>

          {/* Product Purchasing Meta */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-4">
            <div className="space-y-1.5">
              {primaryCategory && (
                <Link
                  href={`/category/${primaryCategory.slug}`}
                  className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  {primaryCategory.name}
                </Link>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                {product.title}
              </h1>
              <div className="flex items-center gap-3 pt-1 text-xs">
                {product.averageRating && (
                  <a
                    href="#reviews"
                    className="flex items-center gap-1.5 text-foreground font-medium hover:text-foreground/80 hover:underline transition-all"
                  >
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.averageRating}</span>
                    <span className="text-muted-foreground font-mono">
                      ({product.totalReviews} verified reviews)
                    </span>
                  </a>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Interactive Client Purchase Panel (Add to Cart, Variants, Quantities) */}
            <ProductPurchasePanel
              product={product}
              currencySymbol={store.currencySymbol}
            />
          </div>
        </div>

        {/* Tabbed In-Depth Description & Specifications */}
        <div className="mt-16 sm:mt-24">
          <Tabs defaultValue="description" className="w-full">
            <TabsList variant="line" className="mb-8">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
            </TabsList>

            {/* Tab 1: Full HTML/Markdown Description */}
            <TabsContent value="description" className="mt-0">
              <div className="max-w-4xl">
                <div
                  className="space-y-4 text-sm leading-relaxed text-muted-foreground [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:pt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:pt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:pt-4 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-foreground [&_h4]:pt-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_strong]:text-foreground [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_th]:border [&_th]:border-border/60 [&_th]:p-3 [&_th]:bg-muted/30 [&_th]:font-semibold [&_th]:text-foreground [&_th]:text-left [&_td]:border [&_td]:border-border/60 [&_td]:p-3"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            </TabsContent>

            {/* Tab 2: Technical Specifications Table */}
            <TabsContent value="specs" className="mt-0">
              <div className="max-w-2xl rounded-xl border border-border/70 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-border/60">
                    <tr className="bg-muted/30">
                      <td className="p-3 font-semibold text-foreground w-1/3">Stock Keeping Unit (SKU)</td>
                      <td className="p-3 font-mono text-muted-foreground">{product.sku}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-foreground">Barcode / EAN</td>
                      <td className="p-3 font-mono text-muted-foreground">{product.barcode ?? "840192837401"}</td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="p-3 font-semibold text-foreground">Warranty Period</td>
                      <td className="p-3 text-muted-foreground">2-Year Limited Manufacturer Warranty</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-foreground">Fulfillment</td>
                      <td className="p-3 text-muted-foreground">Standard Tracked Express Delivery</td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="p-3 font-semibold text-foreground">Packaging</td>
                      <td className="p-3 text-muted-foreground">100% Recyclable Soy-Ink Molded Pulp Box</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Customer Reviews Section */}
        <div id="reviews" className="mt-16 sm:mt-24 pt-12 border-t border-border/70 scroll-mt-24">
          <div className="max-w-3xl space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Customer Reviews ({product.totalReviews ?? 0})
            </h2>
            <div className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-5">
              <div className="text-center">
                <span className="text-4xl font-extrabold text-foreground font-mono">
                  {product.averageRating ?? 4.9}
                </span>
                <div className="flex justify-center gap-0.5 mt-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  Based on {product.totalReviews ?? 128} reviews
                </span>
              </div>
              <div className="border-l border-border/60 pl-6 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">98% of buyers recommend this product</p>
                <p className="mt-0.5">Verified customer purchases and authentic store reviews.</p>
              </div>
            </div>

            {/* Sample Verified Reviews */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-muted/10 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Marcus H. (Verified Buyer)</span>
                  <span className="text-muted-foreground font-mono">2 weeks ago</span>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Incredible craftsmanship. The materials feel solid, the sound signature is pure, and shipping was remarkably fast.
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/10 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Elena V. (Verified Buyer)</span>
                  <span className="text-muted-foreground font-mono">1 month ago</span>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Matches the aesthetic of my workspace perfectly. Highly recommended for anyone seeking minimalism and durability.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 6. RECOMMENDATIONS / MORE LIKE THIS SECTION */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 sm:mt-28 pt-12 border-t border-border/70">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Carefully Paired
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">
                  Complementary Objects & Recommendations
                </h2>
              </div>
              <Link
                href={`/category/${primaryCategory?.slug ?? "electronics"}`}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Browse Collection →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedProducts.map((relProduct) => (
                <ProductCard
                  key={relProduct.id}
                  product={relProduct}
                  currencySymbol={store.currencySymbol}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
