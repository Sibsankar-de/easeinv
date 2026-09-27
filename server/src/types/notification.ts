import { NotificationType } from "../enums/notification.enum";

export interface NotificationJob {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}
