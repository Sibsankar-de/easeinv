import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/auth/",
        "/stores/",
        "/profile/",
        "/reset-password",
        "/verify-email",
      ],
    },
    sitemap: "https://easeinv.app/sitemap.xml",
  };
}
