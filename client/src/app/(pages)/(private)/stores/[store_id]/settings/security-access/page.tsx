import type { Metadata } from "next";
import { SecurityAccessSettingsPage } from "@/components/modules/settings/SecurityAccessSettingsPage";
import { StorePageContainer } from "@/components/ui/PageContainer";
import { Lock } from "lucide-react";
import React from "react";

export const metadata: Metadata = {
  title: "Security & Access | Store Settings",
  description:
    "Manage user roles, permissions, and security settings for your store.",
};

export default function SecurityAccessSettings() {
  return (
    <StorePageContainer>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Lock className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-gray-900 text-lg font-semibold font-sans">
            Security & Access Settings
          </h2>
          <p className="text-sm text-gray-600 font-sans">
            Manage who can access and manage your store, and configure security options.
          </p>
        </div>
      </div>

      <SecurityAccessSettingsPage />
    </StorePageContainer>
  );
}
