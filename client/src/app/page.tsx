import type { Metadata } from "next";
import { LandingPage } from "@/components/modules/landing-page/LandingPage";

export const metadata: Metadata = {
  title: "Billing and Inventory Management Software",
  description:
    "Run billing, invoicing, customer management, and inventory workflows from one clean business store.",
  openGraph: {
    title: "EaseInv | Billing and Inventory Management Software",
    description:
      "Run billing, invoicing, customer management, and inventory workflows from one clean business store.",
    url: "https://easeinv.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EaseInv | Billing and Inventory Management Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EaseInv | Billing and Inventory Management Software",
    description:
      "Run billing, invoicing, customer management, and inventory workflows from one clean business store.",
    images: ["/og-image.png"],
  },
};

export default function Home() {
  return <LandingPage />;
}
