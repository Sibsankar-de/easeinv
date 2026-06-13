"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tabs, TabItem, TabContent } from "@/components/ui/Tabs";
import { Key, Cable, Construction } from "lucide-react";
import { ApiKeyTabContent } from "./ApiKeySettingsTabContent";

// Tab definitions
const tabsList: TabItem[] = [
  { id: "api_keys", label: "API Keys (Secrets)", icon: Key },
  { id: "integrations", label: "External Integrations", icon: Cable },
];

export const IntegrationsSettingsPage = () => {
  const [activeTab, setActiveTab] = useState<string>("api_keys");

  return (
    <div>
      <Tabs tabs={tabsList} activeTab={activeTab} onChange={setActiveTab}>
        <ApiKeyTabContent />
        <IntegrationsTabContent />
      </Tabs>
    </div>
  );
};

const IntegrationsTabContent = () => {
  return (
    <TabContent tabId="integrations" className="space-y-6">
      <EmptyState
        title="Integrations coming soon"
        description="We are currently building direct integrations with other platforms."
        icon={<Construction className="w-8 h-8 text-gray-400" />}
      />
    </TabContent>
  );
};
