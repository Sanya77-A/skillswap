import Review from "../models/Review.js";
import SwapRequest from "../models/SwapRequest.js";
import User from "../models/User.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

/**
 * POST /api/reviews - after swap COMPLETED, rate the other user (1-5 + comment)
 */
export const createReview = asyncHandler(async (req, res) => {
  const { recipientId, swapRequestId, rating, comment } = req.body;
  const swap = await SwapRequest.findById(swapRequestId);
  if (!swap) {
    return res.status(404).json({ success: false, message: "Swap request not found" });
  }
  if (swap.status !== "COMPLETED") {
    return res.status(400).json({ success: false, message: "Can only review completed swaps" });
  }
  const isParticipant =
    swap.sender.toString() === req.user._id.toString() || swap.receiver.toString() === req.user._id.toString();
  if (!isParticipant) {
    return res.status(403).json({ success: false, message: "Not a participant" });
  }
  const otherId = swap.sender.toString() === req.user._id.toString() ? swap.receiver : swap.sender;
  if (otherId.toString() !== recipientId) {
    return res.status(400).json({ success: false, message: "Recipient must be the other party" });
  }
  const existing = await Review.findOne({ author: req.user._id, swapRequest: swapRequestId });
  if (existing) {
    return res.status(400).json({ success: false, message: "Already reviewed this swap" });
  }
  const review = await Review.create({
    author: req.user._id,
    recipient: otherId,
    swapRequest: swapRequestId,
    rating,
    comment: comment || "",
  });
  const populated = await Review.findById(review._id).populate("author", "name profileImage").lean();

  // Update recipient's ratingAvg and ratingCount via aggregation
  const agg = await Review.aggregate([
    { $match: { recipient: otherId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const avg = agg[0]?.avg ?? 0;
  const count = agg[0]?.count ?? 0;
  await User.findByIdAndUpdate(recipientId, {
    ratingAvg: Math.round(avg * 10) / 10,
    ratingCount: count,
  });

  res.status(201).json({ success: true, review: populated });
});

/**
 * GET /api/users/:id/reviews
 */
export const getReviewsByUser = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [data, total] = await Promise.all([
    Review.find({ recipient: req.params.id })
      .populate("author", "name profileImage")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({ recipient: req.params.id }),
  ]);
  res.json({ success: true, ...paginatedResponse(data, total, page, limit) });
});
