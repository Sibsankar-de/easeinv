import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://easeinv.app";

  const publicRoutes = [
    "",
    "/about",
    "/contact",
    "/faq",
    "/features",
    "/pricing",
    "/privacy-policy",
    "/terms-of-service",
    "/docs/introduction",
    "/docs/api",
    "/docs/customers",
    "/docs/inventory",
    "/docs/authentication",
    "/docs/billing",
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : route.startsWith("/docs") ? 0.6 : 0.8,
  }));
}
