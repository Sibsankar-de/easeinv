import type { Metadata } from "next";
import { StorePageContainer } from "@/components/ui/PageContainer";
import React from "react";
import { DashboardOverview } from "@/components/modules/dashboard/DashboardOverview";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Review your store overview, recent billing activity, and key business metrics in the EaseInv dashboard.",
};

export default function DashboardPage() {
  return (
    <StorePageContainer>
      <DashboardOverview />
    </StorePageContainer>
  );
}
