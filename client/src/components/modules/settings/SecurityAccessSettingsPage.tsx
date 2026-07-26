"use client";

import { useState } from "react";
import { Tabs, TabItem, TabContent } from "@/components/ui/Tabs";
import { Users, Lock } from "lucide-react";
import { AccessControlSettingsComponent } from "./AccessControlSettingsComponent";
import { SecuritySettingsTabContent } from "./SecuritySettingsTabContent";

const tabsList: TabItem[] = [
  { id: "access-control", label: "Access control", icon: Users },
  { id: "security", label: "Security", icon: Lock },
];

export const SecurityAccessSettingsPage = () => {
  const [activeTab, setActiveTab] = useState<string>("access-control");

  return (
    <div>
      <Tabs tabs={tabsList} activeTab={activeTab} onChange={setActiveTab}>
        <AccessControlSettingsComponent />
        <SecuritySettingsTabContent />
      </Tabs>
    </div>
  );
};
