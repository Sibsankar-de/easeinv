"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectNotificationState,
  fetchNotificationsThunk,
  markNotificationReadThunk,
  markAllNotificationsReadThunk,
  deleteNotificationThunk,
} from "@/store/features/notificationSlice";
import { NotificationItem } from "./NotificationItem";
import { NotificationDto } from "@/types/dto/notificationDto";
import { X, CheckCheck, RotateCw, BellOff } from "lucide-react";
import { cn } from "@/components/utils";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";

interface NotificationPaneProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "all" | "unread" | "read";

export function NotificationPane({ isOpen, onClose }: NotificationPaneProps) {
  const dispatch = useDispatch<any>();
  const { docs, unreadCount, hasNextPage, page, status } = useSelector(
    selectNotificationState,
  );

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [loadingMore, setLoadingMore] = useState(false);

  // Sync animation mounting
  const [mounted, setMounted] = useState(isOpen);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const timer = setTimeout(() => setActive(true), 10);
      // Fetch fresh list when opening
      dispatch(fetchNotificationsThunk({ page: 1 }));
      return () => clearTimeout(timer);
    } else {
      setActive(false);
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, dispatch]);

  // Handle ESC key press to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const handleMarkRead = (id: string) => {
    dispatch(markNotificationReadThunk(id));
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      dispatch(markAllNotificationsReadThunk());
    }
  };

  const handleDelete = (id: string) => {
    dispatch(deleteNotificationThunk(id));
  };

  const handleRefresh = () => {
    dispatch(fetchNotificationsThunk({ page: 1 }));
  };

  const handleLoadMore = async () => {
    if (!hasNextPage || loadingMore) return;
    setLoadingMore(true);
    await dispatch(fetchNotificationsThunk({ page: page + 1 }));
    setLoadingMore(false);
  };

  // Filter notifications based on tab
  const filteredDocs = docs.filter((doc: NotificationDto) => {
    if (activeTab === "unread") return !doc.isRead;
    if (activeTab === "read") return doc.isRead;
    return true;
  });

  return (
    <div className="relative z-50">
      {/* Backdrop Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out",
          active ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Slide-over Right Pane */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-gray-200",
          "transition-transform duration-300 ease-in-out transform",
          active ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="primary" className="bg-primary text-white border-transparent text-xs py-0.5 px-2 font-bold rounded-full normal-case">
                {unreadCount} new
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="none"
              onClick={handleRefresh}
              className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-200/60"
              tooltip="Refresh notifications"
              tooltipId="refresh-notifications-tooltip"
            >
              <RotateCw className={cn("w-4 h-4", status === "loading" && "animate-spin")} />
            </Button>

            {unreadCount > 0 && (
              <Button
                variant="none"
                onClick={handleMarkAllRead}
                className="p-1.5 text-xs font-semibold text-primary hover:bg-blue-50 rounded-lg gap-1"
                tooltip="Mark all notifications as read"
                tooltipId="mark-all-read-tooltip"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Mark all read</span>
              </Button>
            )}

            <Button
              variant="none"
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-200/60 ml-1"
              tooltip="Close notification pane"
              tooltipId="close-pane-tooltip"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Filter Tabs Header */}
        <div className="px-4 pt-3 pb-2 border-b border-gray-100 flex items-center gap-2 bg-white">
          <Button
            variant="none"
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg h-auto transition-all",
              activeTab === "all"
                ? "bg-gray-900 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100",
            )}
          >
            All ({docs.length})
          </Button>

          <Button
            variant="none"
            onClick={() => setActiveTab("unread")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg h-auto transition-all flex items-center gap-1.5",
              activeTab === "unread"
                ? "bg-primary text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100",
            )}
          >
            Unread
            {unreadCount > 0 && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                  activeTab === "unread"
                    ? "bg-white/20 text-white"
                    : "bg-blue-100 text-blue-700",
                )}
              >
                {unreadCount}
              </span>
            )}
          </Button>

          <Button
            variant="none"
            onClick={() => setActiveTab("read")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg h-auto transition-all",
              activeTab === "read"
                ? "bg-gray-900 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100",
            )}
          >
            Read
          </Button>
        </div>

        {/* Notification List Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {status === "loading" && docs.length === 0 ? (
            // Reusable Skeleton Component Usage
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 flex gap-3"
                >
                  <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-1/3" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3.5 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDocs.length === 0 ? (
            // Reusable EmptyState Component Usage
            <EmptyState
              icon={<BellOff className="w-8 h-8 text-gray-400" />}
              title={
                activeTab === "unread"
                  ? "No unread notifications"
                  : "No notifications yet"
              }
              description={
                activeTab === "unread"
                  ? "You're all caught up! Check back later for new activity."
                  : "When store, invoice, or stock updates happen, notifications will appear here."
              }
              className="h-64 justify-center"
            />
          ) : (
            // Notification List
            <>
              {filteredDocs.map((notification: NotificationDto) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                  onClosePane={onClose}
                />
              ))}

              {/* Load More Button */}
              {hasNextPage && activeTab === "all" && (
                <div className="pt-2 text-center">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    loading={loadingMore}
                    loadingMessage="Loading..."
                    className="w-full text-xs justify-center text-gray-600 border-dashed"
                  >
                    Load earlier notifications
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
