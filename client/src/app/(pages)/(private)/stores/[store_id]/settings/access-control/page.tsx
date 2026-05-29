import { AccessControlSettingsComponent } from "@/components/modules/settings/AccessControlSettingsComponent";
import { StorePageContainer } from "@/components/ui/PageContainer";
import { Users } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Control | Store Settings",
  description: "Manage user roles and permissions for your store.",
};

export default function AccessControlPage() {
  return (
    <StorePageContainer>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-gray-900">Store Access Settings</h2>
          <p className="text-sm text-gray-600">
            Manage who can access and manage your store.
          </p>
        </div>
      </div>

      <AccessControlSettingsComponent />
    </StorePageContainer>
  );
}
