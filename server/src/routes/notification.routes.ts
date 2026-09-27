import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware";
import {
  listNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification,
} from "../controllers/notification.controller";

const router = Router();

// All notification routes require authentication
router.use(verifyAuth);

// GET  /notifications                     -> paginated list (query: page, limit, isRead)
router.get("/", listNotifications);

// GET  /notifications/unread-count        -> badge/indicator count
router.get("/unread-count", getUnreadCount);

// PATCH /notifications/read-all           -> mark all notifications as read
router.patch("/read-all", markAllNotificationsRead);

// PATCH /notifications/:notificationId/read  -> mark a single notification as read
router.patch("/:notificationId/read", markNotificationRead);

// DELETE /notifications/:notificationId   -> delete a notification
router.delete("/:notificationId", deleteNotification);

export default router;
