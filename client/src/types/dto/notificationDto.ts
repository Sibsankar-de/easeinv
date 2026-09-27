export type NotificationType =
  | "INVOICE_CREATED"
  | "INVOICE_PAID"
  | "INVOICE_OVERDUE"
  | "STOCK_LOW"
  | "STOCK_OUT"
  | "STORE_USER_INVITED"
  | "STORE_USER_JOINED"
  | "STORE_USER_ROLE_CHANGED"
  | "EMAIL_VERIFIED"
  | "PASSWORD_CHANGED"
  | "GENERAL";

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface NotificationListResponse {
  docs: NotificationDto[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  unreadCount: number;
}
