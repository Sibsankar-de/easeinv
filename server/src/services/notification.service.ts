import { prisma } from "../lib/prisma";
import { paginate } from "../utils/paginate";
import { toNotificationDto, NotificationResponseDto } from "../dto/notification.dto";

/**
 * Fetch a paginated list of notifications for a user as DTOs.
 * Optionally filter by read status.
 * Also returns the total unread count for badge display.
 */
export const listNotifications = async (params: {
  userId: string;
  page: number;
  limit: number;
  isRead?: boolean;
}) => {
  const { userId, page, limit, isRead } = params;

  const where: Record<string, unknown> = { userId };
  if (isRead !== undefined) where.isRead = isRead;

  const [result, unreadCount] = await Promise.all([
    paginate(
      prisma.notification,
      where,
      { createdAt: "desc" },
      { page, limit },
    ),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  const docs: NotificationResponseDto[] = result.docs.map(toNotificationDto);

  return {
    ...result,
    docs,
    unreadCount,
  };
};

/**
 * Mark a single notification as read.
 * Scoped to userId to prevent unauthorized access.
 */
export const markAsRead = async (notificationId: string, userId: string) => {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
  return null;
};

/**
 * Mark all unread notifications for a user as read.
 */
export const markAllAsRead = async (userId: string) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return null;
};

/**
 * Delete a single notification.
 * Scoped to userId to prevent unauthorized access.
 */
export const deleteNotification = async (
  notificationId: string,
  userId: string,
) => {
  await prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  });
  return null;
};

/**
 * Get the count of unread notifications for a user (for badge/indicator).
 */
export const getUnreadCount = async (userId: string) => {
  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  return { unreadCount };
};
