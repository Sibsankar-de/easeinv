import type { Metadata } from "next";
import { ProfileDetailsSection } from "@/components/modules/profile/ProfileDetailsSection";
import { StoreListSection } from "@/components/modules/profile/StoreListSection";
import { PageContainer } from "@/components/ui/PageContainer";
import { cn } from "@/components/utils";

export const metadata: Metadata = {
  title: "Profile and Stores",
  description:
    "Manage your account details, review your connected stores, and organize business workspaces in EaseInv.",
};

export default function ProfilePage() {
  return (
    <PageContainer>
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
          Profile & Stores
        </h1>
        <p className="text-sm text-gray-500">
          Manage your personal account details, review connected workspaces, and
          build new business storefronts.
        </p>
      </div>

      <div className="space-y-8">
        {/* User Profile Section */}
        <ProfileDetailsSection />

        {/* Store list Section */}
        <StoreListSection />
      </div>
    </PageContainer>
  );
}
