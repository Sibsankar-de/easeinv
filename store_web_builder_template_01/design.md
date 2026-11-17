# Easeinv Store Web Builder — Design System & Tokens (`design.md`)

This document defines the visual design system, color token architecture, typography hierarchy, layout dimensions, and component styling conventions for the Easeinv Store Web Builder template.

All styling tokens are integrated directly with **Tailwind CSS v4** via the `@theme inline` block in `src/app/globals.css`, ensuring full type-safety and instant utility class generation.

---

## 1. Design System Philosophy & Pattern

### The Editorial Minimalist + Bento Grid Pattern
To ensure the storefront feels like a high-end, genuine commercial product rather than generic or AI-generated design, this template strictly applies an **Editorial Minimalist + Bento Grid** aesthetic across all views:

1. **Restraint Over Decoration**:
   - Zero gratuitous neon glows, cluttered floating blobs, or artificial pseudo-futuristic gradients.
   - Contrast is established through crisp black-and-white typography, structured whitespace, and subtle border lines (`border-border/70`).
2. **Editorial Typographic Hierarchy**:
   - Tight tracking (`tracking-tight`) on display titles.
   - Monospace uppercase kicker tags (`font-mono text-xs uppercase tracking-widest text-muted-foreground`) above section headings.
   - Clean body copy paired with high-contrast, uncluttered product imagery.
3. **Structured Bento Grids**:
   - Asymmetric multi-tile layouts used on the Home page to balance visual weight between flagship product highlights, category previews, and platform trust marks.
4. **Consistency Across All Pages**:
   - **Header & Navigation**: Sticky translucent backdrop blur, consistent brand mark, direct category links, and interactive live shopping bag counter.
   - **Product Cards**: Identical aspect ratio (4:3), badge overlays, category kicker, bold price typography, and instant client-side "Add to Bag" interaction across Home, Category, and Recommendation sections.
   - **Product Detail**: Unified 2-column layout (Left: gallery/carousel; Right: purchase metadata, variant selector, quantity stepper, action buttons) followed by tabbed HTML/Markdown prose, specs table, and related items.
   - **Cart & Checkout**: Structured 2-column flows with address form, shipping method toggles, and dedicated gateway authentication buttons (Easeinv 1-Click, Stripe, PayPal, Apple Pay) without cluttering forms.
   - **Authentication**: Minimalist centered card featuring email input and 6-slot OTP verification.

---

## 2. Color Palette & Semantic Tokens

All colors are defined in `src/app/globals.css` using modern **OKLCH** color spaces for predictable luminance and contrast.

### 2.1 Core Neutral & Surface Tokens

| Token | Light Mode (OKLCH) | Dark Mode (OKLCH) | Usage |
|---|---|---|---|
| `--background` | `oklch(1 0 0)` (#ffffff) | `oklch(0.145 0 0)` (#171717) | Default page background |
| `--foreground` | `oklch(0.145 0 0)` (#171717) | `oklch(0.985 0 0)` (#ededed) | Default body text color |
| `--card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Product cards, surface containers |
| `--card-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Text inside card components |
| `--popover` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Tooltips, dropdown menus, popovers |
| `--popover-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Text inside popover panels |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Subtle borders, dividers, separators |
| `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | Form inputs, select fields borders |
| `--ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | Focus visible outline rings |

### 2.2 Brand & Interactive Tokens

| Token | Light Mode (OKLCH) | Dark Mode (OKLCH) | Usage |
|---|---|---|---|
| `--brand` | `oklch(0.55 0.22 260)` | `oklch(0.65 0.20 260)` | Primary Easeinv brand accent (indigo) |
| `--brand-foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` | Text on brand backgrounds |
| `--brand-muted` | `oklch(0.95 0.04 260)` | `oklch(0.25 0.05 260)` | Soft tinted brand surfaces & badges |
| `--primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` | Primary CTAs, checkout buttons |
| `--primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` | Text on primary buttons |
| `--secondary` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Secondary buttons, subtle highlights |
| `--secondary-foreground`| `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on secondary buttons |
| `--accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Hover states, tab indicators |
| `--accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Text on accent elements |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Muted panels, table header rows |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | Secondary captions, helper descriptions |

### 2.3 Status & Feedback Tokens

| Token | Light Mode (OKLCH) | Dark Mode (OKLCH) | Usage |
|---|---|---|---|
| `--success` | `oklch(0.62 0.19 145)` | `oklch(0.65 0.18 145)` | Payment confirmed, in-stock badges |
| `--success-foreground` | `oklch(0.985 0 0)` | `oklch(0.15 0 0)` | Text on success pill / banner |
| `--warning` | `oklch(0.75 0.16 75)` | `oklch(0.78 0.16 75)` | Low stock warnings, pending verification |
| `--warning-foreground` | `oklch(0.15 0 0)` | `oklch(0.15 0 0)` | Text on warning alerts |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Out-of-stock, errors, delete actions |
| `--info` | `oklch(0.60 0.18 230)` | `oklch(0.68 0.18 230)` | Informational banners, shipping updates |

---

## 3. Typography Hierarchy

Fonts are loaded with `next/font/google` and exposed via CSS variables:

- **Primary Sans (`--font-sans`)**: Geist Sans
- **Monospace (`--font-mono`)**: Geist Mono
- **Headings (`--font-heading`)**: Geist Sans

### Typographic Scale & Usage

| Element | Classnames | Size / Line-height | Weight |
|---|---|---|---|
| Hero Heading | `text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight` | 2.25rem - 3.75rem / 1.1 | Bold (700) |
| Page Heading (H1) | `text-3xl sm:text-4xl font-bold tracking-tight` | 1.875rem - 2.25rem / 1.2 | Bold (700) |
| Section Heading (H2)| `text-2xl sm:text-3xl font-bold tracking-tight` | 1.5rem - 1.875rem / 1.25 | Bold (700) |
| Subheading (H3) | `text-lg sm:text-xl font-bold` | 1.125rem - 1.25rem / 1.3 | Bold (700) |
| Category / Monospace Tag | `text-xs font-mono uppercase tracking-widest text-muted-foreground` | 0.75rem / 1.4 | Medium (500) |
| Card Title | `text-base font-semibold leading-snug` | 1.0rem / 1.375 | Semibold (600) |
| Body Text | `text-sm sm:text-base text-foreground leading-relaxed` | 0.875rem - 1.0rem / 1.625 | Regular (400) |
| Price Tag (Display) | `text-3xl font-extrabold tracking-tight font-mono` | 1.875rem | Extra Bold (800) |
| Price Tag (Card) | `text-lg font-bold tracking-tight font-mono` | 1.125rem | Bold (700) |

---

## 4. Spacing, Radius & Layout Dimensions

### 4.1 Border Radius Tokens
Base radius `--radius: 0.625rem` (10px):
- `--radius-sm`: `calc(var(--radius) * 0.6)` (6px) — Badges, small tags
- `--radius-md`: `calc(var(--radius) * 0.8)` (8px) — Buttons, inputs, tooltips
- `--radius-lg`: `var(--radius)` (10px) — Cards, product image frames
- `--radius-xl`: `calc(var(--radius) * 1.4)` (14px) — Bento tiles, sheet containers
- `--radius-2xl`: `calc(var(--radius) * 1.8)` (18px) — Hero image containers, modal cards
- `--radius-full`: `9999px` — Pill badges, counter tags

### 4.2 Standard Layout Metrics
- Header Height: `--header-height: 4rem` (64px)
- Max Container Width: `--container-max-width: 80rem` (1280px / `max-w-7xl`)
- Section Padding: `py-16 sm:py-24`
- Content Padding: `px-4 sm:px-6 lg:px-8`

### 4.3 Interactive Element Cursors
- All buttons, triggers, and `[role="button"]` elements explicitly declare `cursor: pointer` via base layer resets in `globals.css` and `cursor-pointer` in `buttonVariants`.
- Disabled button states apply `cursor: not-allowed` and `pointer-events-none`.

---

## 5. Page-by-Page Design Specifications

### 5.1 Storefront Home (`/`)
- **Editorial Hero**: Bold statement title, concise subhead, flagship feature card, and metric indicators.
- **Bento Grid**: Asymmetric layout combining category spotlights and Easeinv platform assurances.
- **Featured Catalog**: 3-column product cards featuring responsive image frames, star rating badges, and quick add-to-bag triggers.
- **Manifesto Banner**: Muted full-width typographic quote section.

### 5.2 Category Listing (`/category/[slug]`)
- **Header**: Breadcrumbs, category kicker, title, description, and quick category switch buttons.
- **Sort Bar**: Suspense-isolated sorting (Latest, Price Low-High, Price High-Low, Rating) supporting Partial Prerendering.
- **Grid & Empty State**: 3-column card grid with clean fallback state when a category has zero items.

### 5.3 Product Details (`/product/[slug]`)
- **Dual Column Showcase**:
  - Left: Interactive gallery with primary viewer, thumbnail selector, and screen-sized lightbox view (96vw × 94vh) with cinematic darkened backdrop.
  - Right: Category link, title, interactive rating anchor link (jumping to `#reviews`), price with discount tag, clean variant pill selectors, minimal quantity stepper, Add to Bag, and Buy Now buttons.
- **Tabbed In-Depth Information**: Line-variant tabbed interface (`<Tabs>`) dividing rich HTML/Markdown descriptions and technical specifications table, followed immediately by verified customer review cards.
- **Recommendations**: 3-column "Complementary Objects" related products grid.

### 5.4 Cart (`/cart`)
- Free shipping progress bar (`Add $X more to unlock Free Express Shipping`).
- Line items list with thumbnail, variant display, unit price, quantity stepper, and remove button.
- Sticky order summary card with breakdown and primary CTA leading to checkout.

### 5.5 Checkout (`/checkout`)
- Clean, unnumbered layout: Contact Information, Shipping Destination, and Shipping Method (Standard vs Priority).
- Order overview card showing item previews, cost breakdown, 256-bit SSL encryption indicator, and direct "Place Order" trigger.

### 5.6 Customer Sign-In (`/sign-in`)
- Minimalist centered card with zero password clutter.
- Step 1: Email entry form.
- Step 2: 6-slot OTP verification input (`InputOTP`) with demo code hint (`123456`).

### 5.7 Storefront Footer (`StoreFooter`)
- Value proposition strip: Express Tracked Delivery, Secure Payments, 30-Day Guarantee.
- Four-column directory: Store Profile & Contact, Collections, Customer Care, and About & Policies.
- Mandatory bottom attribution: `Built with Easeinv` linking to `https://easeinv.app` (permanently locked across all store instances).
