/**
 * Standard Store Web Builder Placeholders
 *
 * These flags represent the primary customizable text and brand assets
 * across any storefront cloned from this template.
 *
 * Future agents and automated cloning scripts can perform a global search-and-replace
 * on any of the placeholder keys (e.g., "[STORE_NAME]") to personalize the store.
 */

export interface PlaceholderDefinition {
  key: string;
  label: string;
  description: string;
  defaultFallback: string;
  category: "identity" | "contact" | "editorial" | "commerce" | "seo" | "social";
}

export const STORE_PLACEHOLDERS: Record<string, PlaceholderDefinition> = {
  // 1. Identity & Branding
  STORE_NAME: {
    key: "[STORE_NAME]",
    label: "Store Brand Name",
    description: "The primary merchant or brand name displayed in the header, footer, page titles, and receipts.",
    defaultFallback: "[STORE_NAME]",
    category: "identity",
  },
  STORE_SLUG: {
    key: "[STORE_SLUG]",
    label: "Store URL Slug",
    description: "URL-friendly store identifier used in routing and internal store references.",
    defaultFallback: "[STORE_SLUG]",
    category: "identity",
  },
  STORE_TAGLINE: {
    key: "[STORE_TAGLINE]",
    label: "Store Tagline / Slogan",
    description: "Short, punchy store tagline displayed under titles and in marketing summaries.",
    defaultFallback: "[STORE_TAGLINE]",
    category: "identity",
  },
  STORE_LOGO_URL: {
    key: "[STORE_LOGO_URL]",
    label: "Store Logo URL",
    description: "Relative or absolute image path to the store's primary brand logo.",
    defaultFallback: "/store-logo.svg",
    category: "identity",
  },
  STORE_FAVICON_URL: {
    key: "[STORE_FAVICON_URL]",
    label: "Store Favicon URL",
    description: "Path to the browser tab icon file.",
    defaultFallback: "/favicon.ico",
    category: "identity",
  },

  // 2. Editorial & Marketing Copy
  STORE_ANNOUNCEMENT_TEXT: {
    key: "[STORE_ANNOUNCEMENT_TEXT]",
    label: "Header Announcement Bar",
    description: "Message banner displayed across the top of all public storefront pages.",
    defaultFallback: "[STORE_ANNOUNCEMENT_TEXT]",
    category: "editorial",
  },
  STORE_HERO_TITLE: {
    key: "[STORE_HERO_TITLE]",
    label: "Homepage Hero Headline",
    description: "Main bold title displayed prominently in the hero section.",
    defaultFallback: "[STORE_HERO_TITLE]",
    category: "editorial",
  },
  STORE_HERO_SUBTITLE: {
    key: "[STORE_HERO_SUBTITLE]",
    label: "Homepage Hero Subtitle",
    description: "Explanatory copy appearing beneath the hero headline.",
    defaultFallback: "[STORE_HERO_SUBTITLE]",
    category: "editorial",
  },
  STORE_BRAND_MANIFESTO: {
    key: "[STORE_BRAND_MANIFESTO]",
    label: "Brand Manifesto / Quote",
    description: "An inspiring quote or core philosophy displayed in the full-width manifesto block.",
    defaultFallback: "[STORE_BRAND_MANIFESTO]",
    category: "editorial",
  },
  STORE_BRAND_MANIFESTO_AUTHOR: {
    key: "[STORE_BRAND_MANIFESTO_AUTHOR]",
    label: "Manifesto Attribution / Author",
    description: "Author or credit line for the brand manifesto statement.",
    defaultFallback: "[STORE_BRAND_MANIFESTO_AUTHOR]",
    category: "editorial",
  },

  // 3. Contact & Support
  STORE_CONTACT_EMAIL: {
    key: "[STORE_CONTACT_EMAIL]",
    label: "Customer Support Email",
    description: "Public contact email displayed in the footer and order notifications.",
    defaultFallback: "[STORE_CONTACT_EMAIL]",
    category: "contact",
  },
  STORE_CONTACT_PHONE: {
    key: "[STORE_CONTACT_PHONE]",
    label: "Customer Support Phone",
    description: "Customer service telephone number shown in the footer and contact sections.",
    defaultFallback: "[STORE_CONTACT_PHONE]",
    category: "contact",
  },
  STORE_CONTACT_ADDRESS: {
    key: "[STORE_CONTACT_ADDRESS]",
    label: "Physical Address",
    description: "Official business registration or warehouse fulfillment address.",
    defaultFallback: "[STORE_CONTACT_ADDRESS]",
    category: "contact",
  },
  STORE_SUPPORT_HOURS: {
    key: "[STORE_SUPPORT_HOURS]",
    label: "Customer Support Hours",
    description: "Operating hours for customer care (e.g. Mon - Fri: 9:00 AM - 6:00 PM EST).",
    defaultFallback: "[STORE_SUPPORT_HOURS]",
    category: "contact",
  },

  // 4. Commerce & Localization
  STORE_CURRENCY: {
    key: "[STORE_CURRENCY]",
    label: "Currency ISO Code",
    description: "Standard 3-letter currency code (e.g. USD, EUR, GBP).",
    defaultFallback: "USD",
    category: "commerce",
  },
  STORE_CURRENCY_SYMBOL: {
    key: "[STORE_CURRENCY_SYMBOL]",
    label: "Currency Symbol",
    description: "Visual currency symbol character (e.g. $, €, £).",
    defaultFallback: "$",
    category: "commerce",
  },
  STORE_LOCALE: {
    key: "[STORE_LOCALE]",
    label: "Store Locale",
    description: "Language and region locale string (e.g. en-US, en-GB, fr-FR).",
    defaultFallback: "en-US",
    category: "commerce",
  },
  STORE_FREE_SHIPPING_THRESHOLD: {
    key: "[STORE_FREE_SHIPPING_THRESHOLD]",
    label: "Free Shipping Threshold",
    description: "Minimum cart subtotal to unlock complimentary shipping.",
    defaultFallback: "100",
    category: "commerce",
  },
  STORE_RETURN_PERIOD_DAYS: {
    key: "[STORE_RETURN_PERIOD_DAYS]",
    label: "Return Policy Window",
    description: "Number of days for customer returns (e.g. 30).",
    defaultFallback: "30",
    category: "commerce",
  },

  // 5. SEO & Social
  STORE_META_TITLE: {
    key: "[STORE_META_TITLE]",
    label: "SEO Meta Title",
    description: "Default HTML document title for search engine result previews.",
    defaultFallback: "[STORE_META_TITLE]",
    category: "seo",
  },
  STORE_META_DESCRIPTION: {
    key: "[STORE_META_DESCRIPTION]",
    label: "SEO Meta Description",
    description: "Search snippet description explaining the store's offerings.",
    defaultFallback: "[STORE_META_DESCRIPTION]",
    category: "seo",
  },
  STORE_TWITTER_URL: {
    key: "[STORE_TWITTER_URL]",
    label: "Twitter / X URL",
    description: "URL to the store's official Twitter/X profile.",
    defaultFallback: "https://twitter.com/[STORE_SLUG]",
    category: "social",
  },
  STORE_INSTAGRAM_URL: {
    key: "[STORE_INSTAGRAM_URL]",
    label: "Instagram URL",
    description: "URL to the store's official Instagram profile.",
    defaultFallback: "https://instagram.com/[STORE_SLUG]",
    category: "social",
  },
  STORE_LINKEDIN_URL: {
    key: "[STORE_LINKEDIN_URL]",
    label: "LinkedIn URL",
    description: "URL to the store's official LinkedIn page.",
    defaultFallback: "https://linkedin.com/company/[STORE_SLUG]",
    category: "social",
  },
  STORE_GITHUB_URL: {
    key: "[STORE_GITHUB_URL]",
    label: "GitHub URL",
    description: "URL to the store's GitHub organization or open-source repository.",
    defaultFallback: "https://github.com/[STORE_SLUG]",
    category: "social",
  },
};
