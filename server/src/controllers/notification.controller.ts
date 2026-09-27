import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponseHandler";
import { StatusCodes } from "http-status-codes";
import * as notificationService from "../services/notification.service";

/**
 * GET /notifications
 * Returns a paginated list of notification DTOs for the authenticated user.
 * Query params: page, limit, isRead (optional boolean filter)
 */
export const listNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt((req.query.page as string) || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt((req.query.limit as string) || "20")),
    );

    const isReadParam = req.query.isRead as string | undefined;
    const isRead =
      isReadParam === undefined ? undefined : isReadParam === "true";

    const result = await notificationService.listNotifications({
      userId,
      page,
      limit,
      isRead,
    });

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, result, "Notifications fetched."),
      );
  },
);

/**
 * GET /notifications/unread-count
 * Returns the total number of unread notifications for the authenticated user.
 */
export const getUnreadCount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await notificationService.getUnreadCount(userId);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, result, "Unread count fetched."),
      );
  },
);

/**
 * PATCH /notifications/read-all
 * Marks all unread notifications for the authenticated user as read.
 */
export const markAllNotificationsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await notificationService.markAllAsRead(userId);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, null, "All notifications marked as read."),
      );
  },
);

/**
 * PATCH /notifications/:notificationId/read
 * Marks a single notification as read. Scoped to the authenticated user.
 */
export const markNotificationRead = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { notificationId } = req.params as { notificationId: string };

    await notificationService.markAsRead(notificationId, userId);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, null, "Notification marked as read."),
      );
  },
);

/**
 * DELETE /notifications/:notificationId
 * Deletes a single notification. Scoped to the authenticated user.
 */
export const deleteNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { notificationId } = req.params as { notificationId: string };

    await notificationService.deleteNotification(notificationId, userId);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, null, "Notification deleted."));
  },
);
