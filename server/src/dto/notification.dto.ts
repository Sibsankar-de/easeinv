import { Notification } from "@prisma/client";

export interface NotificationResponseDto {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export const toNotificationDto = (n: Notification): NotificationResponseDto => ({
  id: n.id,
  type: n.type,
  title: n.title,
  message: n.message,
  isRead: n.isRead,
  metadata: (n.metadata ?? {}) as Record<string, unknown>,
  createdAt: n.createdAt,
});
