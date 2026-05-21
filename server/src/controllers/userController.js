import User from "../models/User.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { cloudinary, initCloudinary } from "../config/cloudinary.js";
import fs from "fs";

/**
 * GET /api/users/me
 */
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

/**
 * PUT /api/users/me - update profile, optional profile image upload
 */
export const updateMe = asyncHandler(async (req, res) => {
  const { name, bio, location, availability, experienceLevel } = req.body;
  // FormData sends arrays as either `skillsOffered[]` or `skillsOffered`
  const rawOffered = req.body["skillsOffered[]"] || req.body.skillsOffered;
  const rawWanted = req.body["skillsWanted[]"] || req.body.skillsWanted;
  const toArray = (val) => {
    if (!val) return [];
    const arr = Array.isArray(val) ? val : [val];
    return arr.map((s) => s.trim()).filter(Boolean);
  };
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (bio !== undefined) updates.bio = bio;
  if (location !== undefined) updates.location = location;
  if (availability !== undefined) updates.availability = Array.isArray(availability) ? availability : [];
  if (experienceLevel !== undefined) updates.experienceLevel = experienceLevel;
  if (rawOffered !== undefined) updates.skillsOffered = toArray(rawOffered);
  if (rawWanted !== undefined) updates.skillsWanted = toArray(rawWanted);

  if (req.file) {
    if (initCloudinary()) {
      if (req.user.profileImagePublicId) {
        await cloudinary.uploader.destroy(req.user.profileImagePublicId).catch(() => {});
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "skillswap",
        transformation: [{ width: 400, height: 400, crop: "fill" }],
      });
      updates.profileImage = result.secure_url;
      updates.profileImagePublicId = result.public_id;
      fs.unlinkSync(req.file.path);
    } else {
      updates.profileImage = `/uploads/${req.file.filename}`;
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
  res.json({ success: true, user });
});

/**
 * DELETE /api/users/me - soft delete
 */
export const deleteMe = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    isDeleted: true,
    email: `deleted_${req.user._id}_${req.user.email}`,
    profileImage: "",
    profileImagePublicId: "",
  });
  res.json({ success: true, message: "Account deleted" });
});

/**
 * GET /api/users - search/filter/pagination
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { q, experienceLevel, availability, ratingMin, ratingMax, sort = "ratingAvg", order = "desc" } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = { isDeleted: false, isBlocked: false, _id: { $ne: req.user._id } };
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { skillsOffered: { $regex: q, $options: "i" } },
      { skillsWanted: { $regex: q, $options: "i" } },
    ];
  }
  if (experienceLevel) filter.experienceLevel = experienceLevel;
  if (availability) filter.availability = availability;
  if (ratingMin != null) filter.ratingAvg = { ...filter.ratingAvg, $gte: Number(ratingMin) };
  if (ratingMax != null) filter.ratingAvg = { ...filter.ratingAvg, $lte: Number(ratingMax) };

  const sortOrder = order === "asc" ? 1 : -1;
  const sortObj = { [sort]: sortOrder };

  const [users, total] = await Promise.all([
    User.find(filter).select("-password").sort(sortObj).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, ...paginatedResponse(users, total, page, limit) });
});

/**
 * GET /api/users/:id
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user || user.isDeleted) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.json({ success: true, user });
});
