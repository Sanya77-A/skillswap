import Report from "../models/Report.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

/**
 * POST /api/reports — report a user
 */
export const createReport = asyncHandler(async (req, res) => {
  const { reportedUserId, reason } = req.body;
  if (reportedUserId === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: "Cannot report yourself" });
  }
  await Report.create({
    reportedUserId,
    reportedBy: req.user._id,
    reason: reason || "No reason provided",
  });
  res.status(201).json({ success: true, message: "Report submitted" });
});
