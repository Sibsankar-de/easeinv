import React, { Suspense } from "react";
import { VerifyEmailComponent } from "@/components/modules/auth/VerifyEmailComponent";
import { PrimaryBox } from "@/components/ui/PrimaryBox";
import { Loader } from "@/components/ui/loader";
import { AppLogoFull } from "@/components/ui/AppLogo";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token } = await searchParams;
  const tokenStr = typeof token === "string" ? token : undefined;

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
              <p className="text-gray-500">Preparing verification view...</p>
            </div>
          </PrimaryBox>
        }
      >
        <VerifyEmailComponent token={tokenStr} />
      </Suspense>
    </main>
  );
}
