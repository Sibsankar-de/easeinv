import type { Metadata } from "next";
import { PageNotFoundComponent } from "@/components/sections/PageNotFoundComponent";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you requested could not be found on EaseInv.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return <PageNotFoundComponent />;
}
