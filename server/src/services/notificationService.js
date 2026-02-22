import Notification from "../models/Notification.js";

/**
 * Create in-app notification
 */
export const createNotification = async (userId, { type, title, body = "", link = "", metadata = {} }) => {
  const notif = await Notification.create({
    user: userId,
    type,
    title,
    body,
    link,
    metadata,
  });
  return notif;
};

/**
 * Get notifications for user (paginated)
 */
export const getNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false }) => {
  const skip = (page - 1) * limit;
  const filter = { user: userId };
  if (unreadOnly) filter.read = false;

  const [data, total] = await Promise.all([
    Notification.find(filter).sort("-createdAt").skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
  };
};

/**
 * Get unread count
 */
export const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ user: userId, read: false });
};

/**
 * Mark one as read
 */
export const markAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { read: true, readAt: new Date() },
    { new: true }
  );
};

/**
 * Mark all as read
 */
export const markAllAsRead = async (userId) => {
  await Notification.updateMany({ user: userId, read: false }, { read: true, readAt: new Date() });
  return { success: true };
};
