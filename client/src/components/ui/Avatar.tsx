"use client";

import { useSelector } from "react-redux";
import { cn } from "../utils";
import { User } from "lucide-react";
import { selectUserSate } from "@/store/features/userSlice";

type AvatarProps = {
  src?: string;
  userName?: string;
  className?: string;
  fallbackClass?: string;
  size?: number;
};

function getAvatarFallback(name: string): string {
  if (!name) return "";

  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  // Single word case
  return words[0].slice(0, 2).toUpperCase();
}

export const Avatar = ({
  src,
  userName,
  className,
  size,
  fallbackClass,
}: AvatarProps) => {
  const user = useSelector(selectUserSate).data;
  userName = userName || user?.userName;
  src = src || user?.avatar;

  return (
    <div
      className={cn(
        "w-12 h-12 relative rounded-full overflow-hidden",
        className,
      )}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {src && (
        <img src={src} className="w-full h-full rounded-full" alt={userName} />
      )}

      {!src && userName && (
        <div className="w-full h-full bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white">
          <span className={cn("font-bold select-none", fallbackClass)}>
            {getAvatarFallback(userName || "")}
          </span>
        </div>
      )}

      {!src && !userName && (
        <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center">
          <User className="w-[55%] h-[55%] text-primary" />
        </div>
      )}
    </div>
  );
};
