export interface StoreSEODTO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage?: string;
  twitterHandle?: string;
  canonicalUrl?: string;
}

export interface StoreSocialLinksDTO {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  github?: string;
}

export interface StoreContactDTO {
  email: string;
  phone?: string;
  address?: string;
  supportHours?: string;
}

export interface StoreThemeDTO {
  primaryColor?: string;
  brandColor?: string;
  borderRadius?: string;
  fontFamily?: string;
  darkModeDefault?: boolean;
}

export interface StoreConfigDTO {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  announcementText?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  manifestoQuote?: string;
  manifestoAuthor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  currency: string;
  currencySymbol: string;
  locale: string;
  contact: StoreContactDTO;
  socialLinks: StoreSocialLinksDTO;
  seo: StoreSEODTO;
  theme: StoreThemeDTO;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
