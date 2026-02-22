import User from "../models/User.js";
import SwapRequest from "../models/SwapRequest.js";
import Review from "../models/Review.js";
import Report from "../models/Report.js";
import Message from "../models/Message.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

/**
 * GET /api/admin/users
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { q, blocked } = req.query;
  const filter = { isDeleted: false };
  if (blocked === "true") filter.isBlocked = true;
  if (blocked === "false") filter.isBlocked = false;
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }
  const [data, total] = await Promise.all([
    User.find(filter).select("-password").sort("-createdAt").skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, ...paginatedResponse(data, total, page, limit) });
});

/**
 * PATCH /api/admin/users/:id/block
 */
export const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: true },
    { new: true }
  ).select("-password");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user });
});

/**
 * PATCH /api/admin/users/:id/unblock
 */
export const unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: false },
    { new: true }
  ).select("-password");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user });
});

/**
 * DELETE /api/admin/users/:id - hard delete (admin only)
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true, email: `deleted_${req.params.id}_${Date.now()}` }
  );
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, message: "User deleted" });
});

/**
 * GET /api/admin/stats
 */
export const getStats = asyncHandler(async (req, res) => {
  const [userCount, swapCount, pendingSwaps, acceptedSwaps, completedSwaps, reviewCount] =
    await Promise.all([
      User.countDocuments({ isDeleted: false }),
      SwapRequest.countDocuments(),
      SwapRequest.countDocuments({ status: "PENDING" }),
      SwapRequest.countDocuments({ status: "ACCEPTED" }),
      SwapRequest.countDocuments({ status: "COMPLETED" }),
      Review.countDocuments(),
    ]);

  const swapsByMonth = await SwapRequest.aggregate([
    { $match: { status: "COMPLETED" } },
    { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const skillsOffered = await User.aggregate([
    { $match: { isDeleted: false } },
    { $unwind: "$skillsOffered" },
    { $group: { _id: "$skillsOffered", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 15 },
  ]);
  const skillsWanted = await User.aggregate([
    { $match: { isDeleted: false } },
    { $unwind: "$skillsWanted" },
    { $group: { _id: "$skillsWanted", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 15 },
  ]);

  res.json({
    success: true,
    stats: {
      userCount,
      swapCount,
      pendingSwaps,
      acceptedSwaps,
      completedSwaps,
      reviewCount,
    },
    swapsByMonth,
    skillsOffered,
    skillsWanted,
  });
});

/**
 * GET /api/admin/reports — list reported users (admin)
 */
export const getReports = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [data, total] = await Promise.all([
    Report.find()
      .populate("reportedUserId", "name email")
      .populate("reportedBy", "name email")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .lean(),
    Report.countDocuments(),
  ]);
  res.json({ success: true, ...paginatedResponse(data, total, page, limit) });
});
