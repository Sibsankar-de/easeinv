"use client";

import { Avatar } from "@/components/ui/Avatar";
import { selectUserSate } from "@/store/features/userSlice";
import { Mail } from "lucide-react";
import { useSelector } from "react-redux";
import { ProfileSkeleton } from "@/components/ui/Skeleton";

export const ProfileDetailsSection = () => {
  const { data: user, status } = useSelector(selectUserSate);

  if (status === "loading") {
    return <ProfileSkeleton />;
  }

  return (
    <div className="p-6">
      <div className="flex items-start gap-6">
        <Avatar
          src={user?.avatar}
          size={100}
          userName={user?.userName}
          fallbackClass="text-3xl"
        />

        <div className="flex-1">
          <div className="mb-4">
            <h2 className="text-gray-900 mb-1">{user?.userName}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
