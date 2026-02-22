import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../services/notificationService.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

/**
 * GET /api/notifications
 */
export const list = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const result = await getNotifications(req.user._id, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    unreadOnly: unreadOnly === "true",
  });
  res.json({ success: true, ...result });
});

/**
 * GET /api/notifications/unread-count
 */
export const unreadCount = asyncHandler(async (req, res) => {
  const count = await getUnreadCount(req.user._id);
  res.json({ success: true, count });
});

/**
 * PATCH /api/notifications/:id/read
 */
export const markRead = asyncHandler(async (req, res) => {
  const notif = await markAsRead(req.params.id, req.user._id);
  if (!notif) {
    return res.status(404).json({ success: false, message: "Notification not found" });
  }
  res.json({ success: true, notification: notif });
});

/**
 * PATCH /api/notifications/read-all
 */
export const markAllRead = asyncHandler(async (req, res) => {
  await markAllAsRead(req.user._id);
  res.json({ success: true });
});
