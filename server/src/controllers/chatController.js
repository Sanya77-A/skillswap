import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import SwapRequest from "../models/SwapRequest.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createNotification } from "../services/notificationService.js";
import { emitToUser } from "../services/socketService.js";
import { cloudinary, initCloudinary } from "../config/cloudinary.js";

/**
 * Get or create conversation between two users.
 * Allowed if: they have an ACCEPTED or COMPLETED swap request.
 */
const getOrCreateConversation = async (user1Id, user2Id) => {
  // Always sort participants for consistent ordering
  const sorted = [user1Id.toString(), user2Id.toString()].sort();

  // If conversation already exists, return it directly (no swap check needed)
  const existing = await Conversation.findOne({ participants: { $all: sorted, $size: 2 } });
  if (existing) return existing;

  // No existing conversation — check they have an accepted/completed swap
  const allowed = await SwapRequest.findOne({
    status: { $in: ["ACCEPTED", "COMPLETED"] },
    $or: [
      { sender: user1Id, receiver: user2Id },
      { sender: user2Id, receiver: user1Id },
    ],
  });
  if (!allowed) return null;

  // Create new conversation
  try {
    const conv = await Conversation.create({ participants: sorted });
    return conv;
  } catch (err) {
    if (err.code === 11000) {
      return Conversation.findOne({ participants: { $all: sorted, $size: 2 } });
    }
    throw err;
  }
};

/**
 * GET /api/chats - list conversations for current user
 */
export const getConversations = asyncHandler(async (req, res) => {
  const convos = await Conversation.find({ participants: req.user._id })
    .populate("participants", "name profileImage")
    .sort("-lastMessageAt")
    .lean();
  const withOther = convos.map((c) => {
    const other = c.participants.find((p) => p._id.toString() !== req.user._id.toString());
    const unreadCount = (c.unreadCount && c.unreadCount[req.user._id.toString()]) || 0;
    return { ...c, other, unreadCount };
  });
  res.json({ success: true, data: withOther });
});

/**
 * GET /api/chats/:conversationId/messages - paginated messages
 */
export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const conv = await Conversation.findById(conversationId);
  if (!conv || !conv.participants.some((p) => p.toString() === req.user._id.toString())) {
    return res.status(404).json({ success: false, message: "Conversation not found" });
  }
  const { page, limit, skip } = getPagination(req.query);
  const [data, total] = await Promise.all([
    Message.find({ conversation: conversationId })
      .populate("sender", "name profileImage")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .lean(),
    Message.countDocuments({ conversation: conversationId }),
  ]);
  res.json({ success: true, ...paginatedResponse(data.reverse(), total, page, limit) });
});

/**
 * POST /api/chats/:conversationId/messages - send message with optional attachments
 */
export const postMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const content = (req.body && req.body.content) || "";
  const files = req.files || [];
  let conv = await Conversation.findById(conversationId);
  if (!conv) {
    return res.status(404).json({ success: false, message: "Conversation not found" });
  }
  if (!conv.participants.some((p) => p.toString() === req.user._id.toString())) {
    return res.status(403).json({ success: false, message: "Not a participant" });
  }
  const attachments = [];
  if (initCloudinary() && files.length) {
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, { folder: "skillswap/chat" });
      const type = file.mimetype && file.mimetype.startsWith("image/") ? "image" : "pdf";
      attachments.push({ url: result.secure_url, type });
    }
  }
  const msg = await Message.create({
    conversation: conv._id,
    sender: req.user._id,
    content,
    attachments: attachments.length ? attachments : undefined,
  });
  const otherId = conv.participants.find((p) => p.toString() !== req.user._id.toString());
  const lastMessageText = content || (attachments.length ? "[Attachment]" : "");
  const unreadObj = conv.unreadCount && typeof conv.unreadCount === "object" ? { ...conv.unreadCount } : {};
  const otherIdStr = otherId.toString();
  unreadObj[otherIdStr] = (unreadObj[otherIdStr] || 0) + 1;
  await Conversation.findByIdAndUpdate(conv._id, {
    lastMessage: lastMessageText.slice(0, 200),
    lastMessageAt: new Date(),
    unreadCount: unreadObj,
  });
  const populated = await Message.findById(msg._id).populate("sender", "name profileImage").lean();
  await createNotification(otherId, {
    type: "NEW_MESSAGE",
    title: "New message",
    body: `${req.user.name}: ${lastMessageText.slice(0, 50)}...`,
    link: `/chat?conversation=${conv._id}`,
    metadata: { conversationId: conv._id, messageId: msg._id },
  });
  emitToUser(otherId.toString(), "message", populated);
  res.status(201).json({ success: true, message: populated });
});

/**
 * PATCH /api/chats/:conversationId/read - mark conversation as read (reset unread for current user)
 */
export const markConversationRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const conv = await Conversation.findById(conversationId);
  if (!conv || !conv.participants.some((p) => p.toString() === req.user._id.toString())) {
    return res.status(404).json({ success: false, message: "Conversation not found" });
  }
  const unreadObj = conv.unreadCount && typeof conv.unreadCount === "object" ? { ...conv.unreadCount } : {};
  delete unreadObj[req.user._id.toString()];
  await Conversation.findByIdAndUpdate(conversationId, { unreadCount: unreadObj });
  res.json({ success: true });
});

/**
 * POST /api/chats/conversation - get or create conversation with otherUserId (body)
 */
export const getOrCreateChat = asyncHandler(async (req, res) => {
  const { otherUserId } = req.body;
  if (!otherUserId || otherUserId === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: "Invalid user" });
  }
  const conv = await getOrCreateConversation(req.user._id, otherUserId);
  if (!conv) {
    return res.status(403).json({ success: false, message: "No accepted swap with this user" });
  }
  const populated = await Conversation.findById(conv._id)
    .populate("participants", "name profileImage")
    .lean();
  res.json({ success: true, conversation: populated });
});
