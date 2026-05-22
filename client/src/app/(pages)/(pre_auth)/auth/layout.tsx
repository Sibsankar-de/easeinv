import type { Metadata } from "next";
import { AppLogo, AppLogoFull } from "@/components/ui/AppLogo";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Account Access",
    template: "%s | EaseInv",
  },
  description:
    "Securely sign in to your EaseInv account or create a new one to manage billing and inventory.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex w-full font-sans bg-gray-50 sm:bg-white">
      {/* Left side - Visual branding */}
      <div className="hidden lg:flex w-1/2 bg-linear-to-br from-indigo-900 via-[#1e1b4b] to-purple-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle background overlay overlays */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/80 p-2.5 rounded-xl backdrop-blur-md border border-white/20 shadow-xl">
            <div className="text-white drop-shadow-md">
              <AppLogoFull size={200} />
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-lg mb-12">
          <h1 className="text-5xl font-bold text-white mb-6 leading-[1.15] tracking-tight">
            Streamline your billing,
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-300 to-purple-300">
              scale your business.
            </span>
          </h1>
          <p className="text-lg text-indigo-100/80 font-medium leading-relaxed max-w-md">
            Join thousands of professionals who effortlessly manage their
            inventory, invoices, clients, and revenue entirely in one place.
          </p>
        </div>

        {/* Minimal Footer for branding side */}
        <div className="relative z-10 text-indigo-200/60 text-sm font-medium">
          &copy; {new Date().getFullYear()} EaseInv. All rights reserved.
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-[440px]">
          {/* Mobile Logo and Title (only visible on small screens) */}
          <div className="flex flex-col items-center mb-10 lg:hidden text-center">
            <div className="bg-indigo-50 p-3 rounded-2xl mb-4">
              <AppLogo size={52} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Welcome to Ease<span className="text-primary">Inv</span>
            </h1>
            <p className="text-gray-500">
              Manage your billing and invoices with ease
            </p>
          </div>

          <div className="hidden lg:block mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Get Started
            </h2>
            <p className="text-gray-500 text-base">
              Securely login or create a new account to continue.
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
