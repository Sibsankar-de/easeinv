import React, { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordComponent } from "@/components/modules/auth/ResetPasswordComponent";
import { PrimaryBox } from "@/components/ui/PrimaryBox";
import { Loader } from "@/components/ui/loader";
import { AppLogoFull } from "@/components/ui/AppLogo";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Request a password reset link or update your security credentials in EaseInv.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const token = typeof resolvedParams.token === "string" ? resolvedParams.token : undefined;
  const tab = typeof resolvedParams.tab === "string" ? resolvedParams.tab : undefined;

  return (
    <main className="flex flex-col items-center w-screen px-4 pt-10 md:pt-15 relative">
      <div className="mb-10">
        <AppLogoFull size={150} />
      </div>
      <Suspense
        fallback={
          <PrimaryBox className="max-w-md w-full mx-auto p-8 shadow-xl border-none text-center">
            <div className="flex flex-col items-center py-6">
              <Loader
                className="border-indigo-100 border-t-indigo-600 mb-6"
                size={64}
                stroke={4}
              />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading</h2>
              <p className="text-gray-500">Preparing view...</p>
            </div>
          </PrimaryBox>
        }
      >
        <ResetPasswordComponent initialToken={token} initialTab={tab} />
      </Suspense>
    </main>
  );
}
