"use client";

import React from "react";
import { NotificationDto } from "@/types/dto/notificationDto";
import {
  formatRelativeTime,
  getNotificationMeta,
  getNotificationNavigation,
} from "@/utils/notificationHelpers";
import { Check, Trash2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/components/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface NotificationItemProps {
  notification: NotificationDto;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClosePane?: () => void;
}

export function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onClosePane,
}: NotificationItemProps) {
  const router = useRouter();
  const meta = getNotificationMeta(notification.type);
  const IconComponent = meta.icon;
  const navPath = getNotificationNavigation(
    notification.type,
    notification.metadata,
  );

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
    if (navPath) {
      router.push(navPath);
      if (onClosePane) onClosePane();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative flex items-start gap-3.5 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none",
        notification.isRead
          ? "bg-white border-gray-100 hover:bg-gray-50/80 hover:border-gray-200"
          : "bg-blue-50/30 border-blue-100 hover:bg-blue-50/70 hover:border-blue-200/80 shadow-2xs",
      )}
    >
      {/* Unread indicator dot */}
      {!notification.isRead && (
        <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-primary" />
      )}

      {/* Icon Avatar Container */}
      <div className="relative shrink-0 mt-0.5">
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 group-hover:scale-105 shadow-2xs",
            meta.iconBg,
            meta.iconColor,
            meta.borderColor,
          )}
        >
          <IconComponent className="w-5 h-5 stroke-2" />
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 min-w-0 pr-3">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant={meta.badgeVariant} className="text-[10px] py-0.5 px-2 rounded-md">
            {meta.badgeLabel}
          </Badge>
          <span className="text-[11px] text-gray-400 font-normal">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>

        <h4
          className={cn(
            "text-sm font-semibold truncate leading-snug flex items-center gap-1.5",
            notification.isRead ? "text-gray-800" : "text-gray-900 font-bold",
          )}
        >
          <span>{notification.title}</span>
          {navPath && (
            <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          )}
        </h4>

        <p className="text-xs text-gray-600 line-clamp-2 mt-0.5 leading-relaxed">
          {notification.message}
        </p>

        {/* Quick Action buttons */}
        <div className="flex items-center gap-2 mt-2.5 pt-1.5 border-t border-gray-100/60 opacity-90 group-hover:opacity-100 transition-opacity">
          {!notification.isRead && (
            <Button
              variant="none"
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead(notification.id);
              }}
              className="text-[11px] font-medium text-primary hover:text-blue-700 hover:bg-blue-100/60 px-2 py-0.5 rounded-md h-auto gap-1"
              tooltip="Mark as read"
              tooltipId={`read-tooltip-${notification.id}`}
            >
              <Check className="w-3 h-3" />
              <span>Mark read</span>
            </Button>
          )}

          <Button
            variant="none"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="text-[11px] font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 px-2 py-0.5 rounded-md h-auto gap-1 ml-auto"
            tooltip="Delete notification"
            tooltipId={`delete-tooltip-${notification.id}`}
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
