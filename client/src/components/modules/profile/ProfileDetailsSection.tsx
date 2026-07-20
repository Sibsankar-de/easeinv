"use client";

import { Avatar } from "@/components/ui/Avatar";
import { selectUserSate } from "@/store/features/userSlice";
import { Mail } from "lucide-react";
import { useSelector } from "react-redux";
import { ProfileSkeleton } from "@/components/ui/Skeleton";
import { PrimaryBox } from "@/components/ui/PrimaryBox";

export const ProfileDetailsSection = () => {
  const { data: user, status } = useSelector(selectUserSate);

  if (status === "loading") {
    return <ProfileSkeleton />;
  }

  return (
    <PrimaryBox className="p-6 flex items-center gap-6">
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
          <span className="text-sm font-medium truncate">{user?.email}</span>
        </div>
      </div>
    </PrimaryBox>
  );
};
