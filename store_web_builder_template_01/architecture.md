# Easeinv Store Web Builder — System Architecture (`architecture.md`)

This document outlines the architectural blueprints, design patterns, folder structure, security boundaries, and data flows of the **Easeinv Store Web Builder Starter Template** (`store_web_builder_template_01`).

---

## 1. Architectural Overview & System Purpose

The Easeinv Store Web Builder Template is a starter codebase designed to be cloned automatically whenever a merchant or user creates a storefront on the Easeinv billing and invoicing platform.

### Core Objectives
1. **High Clonability**: A fresh store instance can be initialized with minimal code modification, driven purely by configuration models and store settings DTOs.
2. **Seamless Backend DTO Parity**: Although the starter template currently utilizes structured mock data, every data structure, field, and relationship strictly mirrors the Easeinv backend API Data Transfer Objects (DTOs). When real API endpoints are wired, the consumer components require zero refactoring.
3. **Server-Side Security & BFF Pattern**: The template acts as a secure Backend-For-Frontend (BFF). Browser clients never directly access private microservice endpoints, API secrets, or billing tokens. All interactions route through Server Components and Server Services.
4. **Superior SEO & SSR Performance**: All public store pages (home, category catalog, product details, static informational pages) are pre-rendered or rendered on the server with automated metadata, JSON-LD schemas, and OpenGraph assets.
5. **Partial Prerendering (PPR) & Cache Components**: Configured with Next.js 16 cache components and PPR, delivering static shell instant loads while streaming dynamic search params and recommendations safely via `<Suspense>`.
6. **Pre-populated Component Ecosystem**: 55 base atomic UI primitives built on shadcn/ui and `@base-ui/react` are pre-installed in `src/components/ui/`, eliminating component installation overhead for future automated agents.

---

## 2. Modular Folder Roles & Route Groups

The codebase organizes its routes and functional domains into strict boundaries:

```
src/
├── app/
│   ├── (public)/          # Storefront public routes (Home, Category, Product, Cart, Checkout)
│   ├── (auth)/            # Authentication routes (OTP Sign-In / Sign-Up)
│   ├── favicon.ico
│   ├── globals.css        # CSS variables with Tailwind v4 @theme inline
│   └── layout.tsx         # Root layout with fonts, HTML/body shell, and AppProviders
├── components/
│   ├── common/            # Reusable store widgets (StoreHeader, StoreFooter, ProductCard)
│   ├── modules/           # Feature modules (ProductGallery, ProductPurchasePanel)
│   ├── providers/         # Client context providers (AppProviders, Toaster, TooltipProvider)
│   └── ui/                # 55 atomic base primitives from shadcn/ui
├── config/
│   └── placeholders.ts    # Standard store placeholder definitions ([STORE_*])
├── context/
│   └── cart-context.tsx   # Client-side cart state with localStorage persistence
├── data/
│   └── mock/              # Typed mock datasets with full backend DTO compliance
├── hooks/                 # Custom client React hooks (use-mobile, use-cart)
├── lib/                   # Low-level utilities (cn class merging, formatters)
├── services/              # Server-side data access layer (caching, BFF API orchestration)
└── types/                 # Canonical TypeScript interfaces and backend API DTOs
```

### Route Groups Breakdown

- **`(public)`**:
  - `(public)/layout.tsx`: Renders the universal storefront navigation (`StoreHeader`), main view container, and editorial footer (`StoreFooter`).
  - `(public)/page.tsx` (`/`): Home page featuring the Editorial Hero, Bento Grid category/marketing highlights, Featured Product Catalog, and Manifesto statement.
  - `(public)/category/[slug]/page.tsx` (`/category/[slug]`): Dynamic category catalog with breadcrumbs, category switcher, and Suspense-wrapped sorting.
  - `(public)/product/[slug]/page.tsx` (`/product/[slug]`): Complete product detail page with image gallery, interactive purchase panel (with variant selectors and quantity controls), unconstrained rich HTML/Markdown description block (supporting embedded tables and markdown formats), verified customer reviews linked directly from star ratings, and related recommendations.
  - `(public)/cart/page.tsx` (`/cart`): Interactive shopping bag with quantity steppers, item totals, free shipping progress bar, and order summary.
  - `(public)/checkout/page.tsx` (`/checkout`): Two-column checkout flow with contact details, shipping destination form, shipping method toggles, and direct order placement CTA.
- **`(auth)`**:
  - `(auth)/layout.tsx`: Distraction-free, centered authentication layout.
  - `(auth)/sign-in/page.tsx` (`/sign-in`): Passwordless email entry and 6-slot OTP verification flow (`InputOTP`).

---

## 3. Current Project File Structure

```
store_web_builder_template_01/
├── AGENTS.md
├── architecture.md
├── changelog.md
├── components.json
├── design.md
├── eslint.config.mjs
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── placeholders.md
├── README.md
├── tsconfig.json
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
└── src/
    ├── app/
    │   ├── (auth)/
    │   │   ├── layout.tsx
    │   │   └── sign-in/
    │   │       └── page.tsx
    │   ├── (public)/
    │   │   ├── cart/
    │   │   │   └── page.tsx
    │   │   ├── category/
    │   │   │   └── [slug]/
    │   │   │       └── page.tsx
    │   │   ├── checkout/
    │   │   │   └── page.tsx
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   └── product/
    │   │       └── [slug]/
    │   │           └── page.tsx
    │   ├── favicon.ico
    │   ├── globals.css
    │   └── layout.tsx
    ├── components/
    │   ├── common/
    │   │   ├── product-card.tsx
    │   │   ├── store-footer.tsx
    │   │   └── store-header.tsx
    │   ├── modules/
    │   │   ├── product-gallery.tsx
    │   │   └── product-purchase-panel.tsx
    │   ├── providers/
    │   │   └── app-providers.tsx
    │   └── ui/
    │       ├── accordion.tsx
    │       ├── alert.tsx
    │       ├── alert-dialog.tsx
    │       ├── aspect-ratio.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── breadcrumb.tsx
    │       ├── button.tsx
    │       ├── button-group.tsx
    │       ├── calendar.tsx
    │       ├── card.tsx
    │       ├── carousel.tsx
    │       ├── chart.tsx
    │       ├── checkbox.tsx
    │       ├── collapsible.tsx
    │       ├── combobox.tsx
    │       ├── command.tsx
    │       ├── context-menu.tsx
    │       ├── dialog.tsx
    │       ├── drawer.tsx
    │       ├── dropdown-menu.tsx
    │       ├── empty.tsx
    │       ├── field.tsx
    │       ├── hover-card.tsx
    │       ├── input.tsx
    │       ├── input-group.tsx
    │       ├── input-otp.tsx
    │       ├── item.tsx
    │       ├── kbd.tsx
    │       ├── label.tsx
    │       ├── menubar.tsx
    │       ├── native-select.tsx
    │       ├── navigation-menu.tsx
    │       ├── pagination.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── radio-group.tsx
    │       ├── resizable.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── sidebar.tsx
    │       ├── skeleton.tsx
    │       ├── slider.tsx
    │       ├── sonner.tsx
    │       ├── spinner.tsx
    │       ├── switch.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       ├── toast.tsx
    │       ├── toggle.tsx
    │       ├── toggle-group.tsx
    │       └── tooltip.tsx
    ├── config/
    │   └── placeholders.ts
    ├── context/
    │   └── cart-context.tsx
    ├── data/
    │   └── mock/
    │       ├── mock-products.ts
    │       └── mock-store.ts
    ├── hooks/
    │   └── use-mobile.ts
    ├── lib/
    │   └── utils.ts
    ├── services/
    │   ├── index.ts
    │   ├── product-service.ts
    │   └── store-service.ts
    └── types/
        ├── index.ts
        ├── order.ts
        ├── product.ts
        └── store.ts
```

---

## 4. Key Architectural Patterns

### 4.1 Server-Side Rendering (SSR), PPR & Search Engine Optimization (SEO)
- All public store pages run as React Server Components (RSC) on the server.
- The `generateMetadata()` function dynamically reads store configuration and product DTOs to generate page titles, meta descriptions, OpenGraph images, and canonical URLs.
- In `src/app/(public)/product/[slug]/page.tsx`, schema.org JSON-LD structured data is injected into the HTML stream for direct indexing of product name, image URLs, SKU, availability, price currency, and star ratings.
- Search queries and sorting parameters in `src/app/(public)/category/[slug]/page.tsx` are wrapped inside `<Suspense>` boundaries, enabling static shell pre-rendering alongside dynamic streaming for search/filter operations.

### 4.2 Client State & Cart Isolation
- Cart state (`src/context/cart-context.tsx`) is isolated to a clean React context provider that synchronizes with `localStorage` safely without causing SSR hydration mismatches.
- Interactive actions (Add to Bag, Quantity Increment/Decrement, Gateway Selection) execute client-side with instant UI feedback via Sonner toast notifications.

### 4.3 Clean Order Settlement Architecture
- The `/checkout` view provides a clean, unified order placement flow without requiring raw credit card handling or extraneous payment gateway selection cards.
- Order settlement occurs through server-side redirects or webhook verification.

### 4.4 Standard Store Placeholder System ([STORE_*])
- To guarantee zero modification friction when cloning new merchant stores, all hardcoded texts across layouts, metadata, mock data, and components are standardized as uppercase bracketed flags: `[STORE_NAME]`, `[STORE_SLUG]`, `[STORE_TAGLINE]`, `[STORE_CONTACT_EMAIL]`, `[STORE_ANNOUNCEMENT_TEXT]`, `[STORE_HERO_TITLE]`, etc.
- A centralized typed catalog is defined in `src/config/placeholders.ts`.
- Complete replacement procedures and automated script examples are maintained in `placeholders.md`.

---

## 5. Architectural Change Log

*(Maintained sequentially without timestamps)*

### Version / Milestone 1.0.0 — Starter Foundation & shadcn/ui Integration
- Initialized Next.js 16 (App Router with Turbopack) and Tailwind CSS v4 integration.
- Established strict TypeScript configuration with `@/*` path mapping to `./src/*`.
- Configured `components.json` targeting `src/components/ui`, `src/lib/utils`, and `src/hooks`.
- Installed and verified 55 foundational shadcn/ui base components based on `@base-ui/react`.
- Configured CSS variables in `src/app/globals.css` incorporating OKLCH color spaces, brand tokens, status tokens, radius scales, and dark mode variants.
- Established standard DTO schemas in `src/types/` (`store.ts`, `product.ts`, `order.ts`).
- Created server-side service layer (`src/services/store-service.ts`, `src/services/product-service.ts`) with request memoization and backend DTO alignment.
- Added high-fidelity mock data datasets in `src/data/mock/`.

### Version / Milestone 1.1.0 — E-Commerce Core Pages & Route Groups
- Structured application into Route Groups: `(public)` for storefront shopping experience and `(auth)` for customer sign-in.
- Implemented **Editorial Minimalist + Bento Grid** design pattern across all storefront views.
- Created `(public)/page.tsx`: Editorial Hero, Bento Grid marketing/category showcase, Featured Catalog, and Manifesto statement.
- Created `(public)/category/[slug]/page.tsx`: SSR category catalog with Suspense-isolated sorting, breadcrumbs, and empty states.
- Created `(public)/product/[slug]/page.tsx`: Product detail view with interactive image gallery, purchase panel, safe HTML/Markdown prose description, technical specs table, verified customer reviews, and related recommendations.
- Created `(public)/cart/page.tsx`: Shopping bag with quantity steppers, item totals, free shipping progress bar, and order summary.
- Created `(public)/checkout/page.tsx`: Two-column checkout with address destination form, shipping options, and payment gateway selection buttons (Easeinv, Stripe, PayPal, Apple Pay).
- Created `(auth)/sign-in/page.tsx`: Minimalist passwordless email sign-in with 6-digit OTP slot verification (`InputOTP`).
- Established `src/context/cart-context.tsx` with local storage persistence and cart drawer/badge hooks.
- Added reusable common widgets in `src/components/common/` (`StoreHeader`, `StoreFooter`, `ProductCard`) and feature modules in `src/components/modules/` (`ProductGallery`, `ProductPurchasePanel`).
- Updated `design.md` with comprehensive documentation of the Editorial Minimalist + Bento Grid design system.
- Updated `AGENTS.md` and `architecture.md` with file tree and pattern specifications.

### Version / Milestone 1.2.0 — Standardized Store Placeholder System
- Standardized all merchant-specific strings into searchable flags (`[STORE_NAME]`, `[STORE_SLUG]`, `[STORE_TAGLINE]`, `[STORE_CONTACT_EMAIL]`, `[STORE_ANNOUNCEMENT_TEXT]`, `[STORE_HERO_TITLE]`, etc.).
- Created `src/config/placeholders.ts` providing typed placeholder dictionaries, fallbacks, and category definitions.
- Created `placeholders.md` guide detailing replacement methods, master placeholder catalog, and automated Node.js / Bash replacement scripts.
- Extended `StoreConfigDTO` in `src/types/store.ts` with optional marketing fields (`announcementText`, `heroTitle`, `heroSubtitle`, `manifestoQuote`, `manifestoAuthor`).
- Updated `AGENTS.md` and `architecture.md` with placeholder standards.

### Version / Milestone 1.3.0 — Product Image Modal & Tag Cleanup
- Removed the top-left tag/badge overlay from the product detail page hero image in `src/components/modules/product-gallery.tsx`.
- Implemented an interactive full-size Image View Modal using shadcn/ui Dialog in `src/components/modules/product-gallery.tsx` with thumbnail navigation, counter (`X / Y`), previous/next arrows, and keyboard arrow navigation.

### Version / Milestone 1.4.0 — Product Page Architecture Streamlining & Direct Prose Layout
- Replaced the tabbed interface (`<Tabs>`) on the product detail page (`src/app/(public)/product/[slug]/page.tsx`) with a direct, title-free HTML/Markdown description container capable of rendering custom tables, headings, and rich media blocks without artificial content constraints.
- Positioned the Customer Reviews block immediately below the description with an anchor target (`#reviews`).
- Replaced the static star rating display with an interactive anchor jump link (`#reviews`) allowing buyers to navigate directly to the reviews section.
- Removed SKU text and bullet separator from the product detail header for a cleaner editorial appearance.
- Simplified `src/components/modules/product-purchase-panel.tsx` by removing the right-aligned active variant preview text from the "Select Variant" header and removing the units available count from the quantity stepper.

### Version / Milestone 1.5.0 — Screen-Sized Lightbox Image Preview Modal
- Enhanced `src/components/ui/dialog.tsx` to replace the restrictive `sm:max-w-sm` breakpoint constraint with `sm:max-w-lg`, added `overlayClassName` for customized backdrop blur and tinting, and added `closeButtonClassName`.
- Expanded the Product Image Modal in `src/components/modules/product-gallery.tsx` into a screen-sized lightbox (`w-[96vw]` by `h-[94vh]`), utilizing a flex column layout where the main image viewport expands dynamically (`flex-1 min-h-0`) to display full-resolution product imagery spanning the entire viewport without aspect distortion.
- Styled the lightbox overlay with a cinematic darkened backdrop (`bg-black/80 backdrop-blur-sm`), enlarged navigation controls (`ChevronLeft` / `ChevronRight`), and smooth thumbnail row navigation.

### Version / Milestone 1.6.0 — Checkout Streamlining, Zero Fluff & Mandatory Footer Attribution
- Removed the payment gateway selection options grid and the compliance badge ("Easeinv Billing Engine • PCI DSS Level 1 Certified") from `src/app/(public)/checkout/page.tsx`.
- Removed numerical section headers ("1. 2. 3.") from the checkout form, establishing clean semantic headings ("Contact Information", "Shipping Destination", "Shipping Method").
- Streamlined the checkout action to a single, direct "Place Order" button in the Order Overview summary card.
- Purged all unnecessary platform marketing mentions, fake guarantees, and technical bluff from customer-facing storefront pages (hero metrics, bento platform assurances, review verification copy, purchase panel guarantee labels, and sign-in badges).
- Redesigned `src/components/common/store-footer.tsx`: removed "Built with Next.js 16 & shadcn/ui", removed "BFF Security Boundary • Server-Side Rendered", replaced the platform card with standard store policies, and hardcoded the mandatory, inviolable attribution line `Built with <a href="https://easeinv.app">Easeinv</a>`.
- Documented in `AGENTS.md` and `architecture.md` that the `Built with Easeinv` footer attribution is strictly permanent and cannot be modified or removed by any future prompt.

### Version / Milestone 1.7.0 — Global Interactive Button Pointer Cursor
- Configured global base styles in `src/app/globals.css` ensuring all `button` and `[role="button"]` elements render with `cursor: pointer` across the entire application (including variant pills, dialog triggers, steppers, and navigation triggers), with `cursor: not-allowed` on disabled states.
- Explicitly added `cursor-pointer` to `buttonVariants` in `src/components/ui/button.tsx`.
- Documented cursor styling standards in `design.md`.

### Version / Milestone 1.8.0 — Mandatory shadcn/ui Component Integration & Product Gallery Carousel
- Refactored `src/components/modules/product-gallery.tsx` to strictly use the official pre-built shadcn/ui `<Carousel />` primitives (`Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`, and `CarouselApi`) powered by `embla-carousel-react` for both the primary product image hero and the screen-sized lightbox preview modal.
- Fixed carousel slide item dimensions by placing `aspect-square w-full` directly on each `<CarouselItem>` slide container, preventing zero-height collapse for Next.js `<Image fill />` elements across Embla carousel wrappers.
- Enhanced `src/components/ui/carousel.tsx` with `containerClassName` support on `CarouselContent` for flexible viewport height constraints.
- Integrated two-way synchronization between the main hero carousel and the thumbnail row with touch swipe, keyboard navigation, and smooth slide snapping.
- Enforced and documented the mandatory UI library policy in `AGENTS.md`: agents must strictly utilize shadcn/ui primitives (`src/components/ui/`) for any matching component requirement, reserving custom implementations only as an absolute fallback for capabilities not present in the library.

### Version / Milestone 1.9.0 — Product Page Tabbed Architecture & Tabs UI Modernization
- Reintroduced the shadcn/ui `<Tabs>` component in `src/app/(public)/product/[slug]/page.tsx` dividing the rich HTML/Markdown description and the technical specifications table.
- Upgraded `src/components/ui/tabs.tsx` with dedicated `line` and `default` variants across `TabsList` and `TabsTrigger` via context propagation, eliminating layout stretching (`flex-1`), fixing height clamping (`h-8`), adding interactive pointer cursors, and perfectly aligning the active bottom border with `-mb-px` onto the list divider.
- Preserved the dedicated customer reviews section directly after the tabbed layout with target `id="reviews"`, maintaining smooth hash jump functionality from the star rating summary in the product header.
- Removed the dividing line (`border-t border-border/70`) between the product hero and the tabs section in `src/app/(public)/product/[slug]/page.tsx`, eliminating double-border clutter above the tabs bar.
- Updated `AGENTS.md` and `design.md` with the tabbed layout structure.

### Version / Milestone 1.10.0 — Changelog Integration & Policy Definition
- Added `changelog.md` with operational guidelines: strict update-on-prompt policy and mandatory chronological timestamps.
- Codified `changelog.md` maintenance rules in `AGENTS.md` (no entries permitted unless explicitly prompted).
