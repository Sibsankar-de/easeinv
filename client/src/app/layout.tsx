import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/store/storeProvider";
import { ToastProvider } from "./toastProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { NavContextProvider } from "@/contexts/NavContext";
import { AppLoadingLayout } from "@/components/layout/AppLoadingLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://easeinv.com"),
  title: {
    default:
      "EaseInv | Billing, Inventory, and Invoicing for Modern Businesses",
    template: "%s | EaseInv",
  },
  description:
    "EaseInv helps businesses manage billing, invoices, customers, and inventory from one streamlined workspace.",
  applicationName: "EaseInv",
  keywords: [
    "billing software",
    "invoice management",
    "inventory management",
    "customer management",
    "business billing platform",
    "EaseInv",
  ],
  openGraph: {
    title: "EaseInv | Billing, Inventory, and Invoicing for Modern Businesses",
    description:
      "Manage invoices, customers, products, and store operations in one place with EaseInv.",
    siteName: "EaseInv",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EaseInv | Billing, Inventory, and Invoicing for Modern Businesses",
    description:
      "Manage invoices, customers, products, and store operations in one place with EaseInv.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <NavContextProvider>
            <StoreProvider>
              <AuthProvider>
                <AppLoadingLayout>{children}</AppLoadingLayout>
              </AuthProvider>
            </StoreProvider>
          </NavContextProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
