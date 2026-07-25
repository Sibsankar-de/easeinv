import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { ProfileSettingsSection } from "@/components/modules/profile/ProfileSettingsSection";
import { TextLink } from "@/components/ui/TextLink";

export const metadata: Metadata = {
  title: "Profile Settings",
  description:
    "Manage your personal account details, update username, and reset your password in EaseInv.",
};

export default function ProfileSettingsPage() {
  return (
    <PageContainer>
      <div className="mb-6">
        <TextLink
          href="/profile"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </TextLink>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
          Profile Settings
        </h1>
        <p className="text-sm text-gray-500">
          Manage your account information, public profile identity, and security
          credentials.
        </p>
      </div>

      <ProfileSettingsSection />
    </PageContainer>
  );
}
