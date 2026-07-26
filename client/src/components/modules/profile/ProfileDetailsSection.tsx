"use client";

import { Avatar } from "@/components/ui/Avatar";
import { selectUserSate } from "@/store/features/userSlice";
import { Mail, Settings } from "lucide-react";
import { useSelector } from "react-redux";
import { ProfileSkeleton } from "@/components/ui/Skeleton";
import { PrimaryBox } from "@/components/ui/PrimaryBox";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { Banner } from "@/components/ui/Banner";
import { EmailVerificationModal } from "./EmailVerificationModal";
import { cn } from "@/components/utils";
import { UserDto } from "@/types/dto/userDto";

export const ProfileDetailsSection = () => {
  const { data: user, status } = useSelector(selectUserSate);

  if (status === "loading") {
    return <ProfileSkeleton />;
  }

  return (
    <div className="space-y-6">
      <EmailVerificationBanner user={user} />

      <PrimaryBox className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Avatar
            src={user?.avatar}
            size={80}
            userName={user?.userName}
            fallbackClass="text-2xl"
            className="ring-4 ring-indigo-50/50"
          />
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 mb-1.5 leading-none">
              {user?.userName}
            </h2>
            <div className="flex items-center gap-2 text-gray-500">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm font-medium truncate">
                {user?.email}
              </span>
            </div>
          </div>
        </div>
        <div>
          <Link href="/profile/settings">
            <Button
              variant="outline"
              className="w-full md:w-auto justify-center gap-2"
            >
              <Settings className="w-4 h-4 text-gray-500" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </PrimaryBox>
    </div>
  );
};

const EmailVerificationBanner = ({ user }: { user: UserDto | null }) => {
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  if (!user || user.isEmailVerified) return null;

  return (
    <>
      <Banner variant="warning" title="Email Verification Required">
        <div>
          <p className="leading-relaxed">
            Your email address is not verified. Please verify your email to
            unlock store creation and get access to all features.
          </p>
          <div className="mt-3">
            <Button
              variant="secondary"
              className={cn("text-xs text-white")}
              onClick={() => setIsVerifyModalOpen(true)}
            >
              Verify Now
            </Button>
          </div>
        </div>
      </Banner>

      <EmailVerificationModal
        openState={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
      />
    </>
  );
};
