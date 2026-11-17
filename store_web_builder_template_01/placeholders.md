# Standard Store Placeholders Guide (`placeholders.md`)

This document defines the canonical placeholder flags implemented across the **Easeinv Store Web Builder Starter Template** (`store_web_builder_template_01`).

Whenever this repository is cloned to spawn a new merchant storefront, developers and AI agents can rapidly personalize all brand identity, editorial copy, contact details, and SEO parameters by replacing these standardized flags.

---

## 1. Quick Replacement Overview

All hardcoded store text strings use the standardized bracketed format: `[STORE_*]` (e.g., `[STORE_NAME]`).

### Replacement Methods

1. **Central DTO Update (Recommended for Next.js SSR)**:
   Update the single source of truth in [`src/data/mock/mock-store.ts`](file:///home/sibsankar_de/web-projects/billing-platform/store_web_builder_template_01/src/data/mock/mock-store.ts). All storefront pages, metadata, headers, and footers consume this data through `getStoreConfig()`.

2. **Automated Search-and-Replace (Command Line)**:
   For automated clone scripts or agents, run a global text replacement across the `src/` directory.

```bash
# Example bash replacement command for store name
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/\[STORE_NAME\]/Nordic Living/g' {} +
```

---

## 2. Complete Placeholders Reference

### 2.1 Store Identity & Branding

| Placeholder Flag | Description | Sample Real-World Value | Primary File Locations |
|---|---|---|---|
| `[STORE_NAME]` | Primary merchant or brand name displayed across header, footer, page titles, and receipts. | `Aura Soundworks` | `mock-store.ts`, `store-header.tsx`, `store-footer.tsx`, `layout.tsx`, `checkout/page.tsx` |
| `[STORE_SLUG]` | URL-friendly unique store identifier used in slugs and API routes. | `aura-soundworks` | `mock-store.ts`, `mock-products.ts` |
| `[STORE_TAGLINE]` | Short, punchy brand tagline displayed in hero copy, footer, and meta tags. | `Acoustic Hardware for Discerning Creators` | `mock-store.ts`, `(public)/page.tsx`, `layout.tsx` |
| `[STORE_LOGO_URL]` | Image path or CDN URL for the store's primary logo. | `/store-logo.svg` | `mock-store.ts`, `store-header.tsx` |
| `[STORE_FAVICON_URL]` | Browser tab favicon path. | `/favicon.ico` | `mock-store.ts` |

### 2.2 Editorial & Marketing Copy

| Placeholder Flag | Description | Sample Real-World Value | Primary File Locations |
|---|---|---|---|
| `[STORE_ANNOUNCEMENT_TEXT]` | Top announcement banner text rendered above the header navigation. | `Complimentary Global Shipping on Orders Over $100` | `mock-store.ts`, `store-header.tsx` |
| `[STORE_HERO_TITLE]` | Primary bold headline rendered in the homepage editorial hero section. | `Acoustic Tools Crafted with Material Restraint` | `mock-store.ts`, `(public)/page.tsx` |
| `[STORE_HERO_SUBTITLE]` | Secondary descriptive copy appearing under the hero headline. | `Engineered with aerospace alloys and natural materials for a lifetime of performance.` | `mock-store.ts`, `(public)/page.tsx` |
| `[STORE_BRAND_MANIFESTO]` | Inspirational quote or core philosophy displayed in the full-width manifesto block. | `Perfection is attained not when there is nothing more to add, but when there is nothing left to take away.` | `mock-store.ts`, `(public)/page.tsx` |
| `[STORE_BRAND_MANIFESTO_AUTHOR]` | Attribution, author, or subtitle for the brand manifesto quote. | `Studio Philosophy • 2026 Collection` | `mock-store.ts`, `(public)/page.tsx` |

### 2.3 Contact & Customer Support

| Placeholder Flag | Description | Sample Real-World Value | Primary File Locations |
|---|---|---|---|
| `[STORE_CONTACT_EMAIL]` | Public customer support email address. | `support@aurasound.com` | `mock-store.ts`, `store-footer.tsx` |
| `[STORE_CONTACT_PHONE]` | Customer service telephone number. | `+1 (800) 555-0199` | `mock-store.ts`, `store-footer.tsx` |
| `[STORE_CONTACT_ADDRESS]` | Physical company headquarters or fulfillment warehouse address. | `100 Innovation Way, Suite 400, San Francisco, CA 94107` | `mock-store.ts` |
| `[STORE_SUPPORT_HOURS]` | Operating days and hours for customer care. | `Mon - Fri: 9:00 AM - 6:00 PM EST` | `mock-store.ts` |

### 2.4 Commerce & Localization

| Placeholder Flag | Description | Sample Real-World Value | Primary File Locations |
|---|---|---|---|
| `[STORE_CURRENCY]` | Standard 3-letter ISO 4217 currency code. | `USD`, `EUR`, `GBP` | `mock-store.ts`, `types/store.ts` |
| `[STORE_CURRENCY_SYMBOL]` | Visual currency symbol character. | `$`, `€`, `£` | `mock-store.ts`, `product-card.tsx` |
| `[STORE_LOCALE]` | BCP 47 language/region locale code. | `en-US`, `de-DE`, `ja-JP` | `mock-store.ts` |
| `[STORE_FREE_SHIPPING_THRESHOLD]` | Minimum cart amount required to qualify for free shipping. | `100` | `cart-context.tsx`, `cart/page.tsx` |
| `[STORE_RETURN_PERIOD_DAYS]` | Customer trial and return period window in days. | `30` | `store-footer.tsx`, `(public)/page.tsx` |

### 2.5 SEO & Social Metadata

| Placeholder Flag | Description | Sample Real-World Value | Primary File Locations |
|---|---|---|---|
| `[STORE_META_TITLE]` | Default HTML page title for search engine indexing. | `Aura Soundworks — Official Flagship Storefront` | `mock-store.ts`, `layout.tsx` |
| `[STORE_META_DESCRIPTION]` | Search snippet description explaining the store's catalog. | `Explore studio-grade headphones, ergonomic desks, and technical carry gear.` | `mock-store.ts`, `layout.tsx` |
| `[STORE_KEYWORD_1]` | Primary search keyword #1. | `audiophile` | `mock-store.ts` |
| `[STORE_KEYWORD_2]` | Primary search keyword #2. | `mechanical keyboard` | `mock-store.ts` |
| `[STORE_KEYWORD_3]` | Primary search keyword #3. | `minimalist workspace` | `mock-store.ts` |
| `[STORE_TWITTER_URL]` | Official Twitter / X profile URL. | `https://x.com/aurasound` | `mock-store.ts` |
| `[STORE_INSTAGRAM_URL]` | Official Instagram profile URL. | `https://instagram.com/aurasound` | `mock-store.ts` |
| `[STORE_LINKEDIN_URL]` | Official LinkedIn company profile URL. | `https://linkedin.com/company/aurasound` | `mock-store.ts` |
| `[STORE_GITHUB_URL]` | Official GitHub organization or open-source profile URL. | `https://github.com/aurasound` | `mock-store.ts` |

---

## 3. Automated Configuration Script for Agents

Future cloning scripts or agents can populate an entire store configuration using this Node.js script:

```typescript
// scripts/configure-store.ts
import fs from "fs";
import path from "path";

const REPLACEMENTS: Record<string, string> = {
  "[STORE_NAME]": "Horizon Goods Co.",
  "[STORE_SLUG]": "horizon-goods",
  "[STORE_TAGLINE]": "Thoughtfully crafted everyday essentials.",
  "[STORE_CONTACT_EMAIL]": "hello@horizongoods.com",
  "[STORE_CONTACT_PHONE]": "+1 (888) 420-9900",
  "[STORE_ANNOUNCEMENT_TEXT]": "Complimentary Worldwide Express Shipping on Orders Over $100",
  "[STORE_HERO_TITLE]": "Objects Designed for Thoughtful Living.",
  "[STORE_HERO_SUBTITLE]": "High-fidelity acoustics and technical carry engineered with material restraint.",
  "[STORE_BRAND_MANIFESTO]": "Perfection is attained not when there is nothing more to add, but when there is nothing left to take away.",
  "[STORE_BRAND_MANIFESTO_AUTHOR]": "Antoine de Saint-Exupéry • Aesthetic Foundation",
};

function replaceInDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      replaceInDir(fullPath);
    } else if (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".md")) {
      let content = fs.readFileSync(fullPath, "utf8");
      for (const [placeholder, val] of Object.entries(REPLACEMENTS)) {
        content = content.replaceAll(placeholder, val);
      }
      fs.writeFileSync(fullPath, content, "utf8");
    }
  }
}

replaceInDir(path.resolve(__dirname, "../src"));
console.log("Store configuration completed successfully.");
```
