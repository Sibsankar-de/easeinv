import type { Metadata } from "next";
import { IntegrationsSettingsPage } from "@/components/modules/settings/IntegrationsSettingsPage";
import { StorePageContainer } from "@/components/ui/PageContainer";
import { Cable } from "lucide-react";
import React from "react";

export const metadata: Metadata = {
  title: "Integrations & API Keys",
  description:
    "Manage API keys and connect your store with external platforms and tools.",
};

export default function IntegrationsSettings() {
  return (
    <StorePageContainer>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Cable className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-gray-900 text-lg font-semibold">
            API Keys & Integrations
          </h2>
          <p className="text-sm text-gray-600">
            Manage your API keys and connect other platforms to access your
            store data.
          </p>
        </div>
      </div>

      <IntegrationsSettingsPage />
    </StorePageContainer>
  );
}
