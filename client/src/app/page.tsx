import type { Metadata } from "next";
import { LandingPage } from "@/components/modules/landing-page/LandingPage";

export const metadata: Metadata = {
  title: "Billing and Inventory Management Software",
  description:
    "Run billing, invoicing, customer management, and inventory workflows from one clean business workspace.",
};

export default function Home() {
  return <LandingPage />;
}
