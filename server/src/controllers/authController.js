import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateRandomToken,
} from "../utils/tokens.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import crypto from "crypto";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
};
const ACCESS_MAX_AGE = 15 * 60;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie("accessToken", accessToken, { ...COOKIE_OPTIONS, maxAge: ACCESS_MAX_AGE * 1000 });
  res.cookie("refreshToken", refreshToken, { ...COOKIE_OPTIONS, maxAge: REFRESH_MAX_AGE * 1000 });
}

/**
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, location, availability, experienceLevel } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: "Email already registered" });
  }
  const user = await User.create({
    name,
    email,
    password,
    location: location || "",
    availability: availability || [],
    experienceLevel: experienceLevel || "intermediate",
  });
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_MAX_AGE * 1000),
  });
  setAuthCookies(res, accessToken, refreshToken);
  res.status(201).json({
    success: true,
    user: user.toJSON(),
    accessToken,
    expiresIn: ACCESS_MAX_AGE,
  });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, isDeleted: false }).select("+password");
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }
  if (user.isBlocked) {
    return res.status(403).json({ success: false, message: "Account is blocked" });
  }
  const valid = await user.comparePassword(password);
  if (!valid) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_MAX_AGE * 1000),
  });
  setAuthCookies(res, accessToken, refreshToken);
  res.json({
    success: true,
    user: user.toJSON(),
    accessToken,
    expiresIn: ACCESS_MAX_AGE,
  });
});

/**
 * POST /api/auth/refresh — refresh token rotation (middleware already verified)
 */
export const refresh = asyncHandler(async (req, res) => {
  const { refreshTokenStored, refreshPayload } = req;
  await RefreshToken.deleteOne({ _id: refreshTokenStored._id });
  const newAccessToken = generateAccessToken(refreshPayload.userId);
  const newRefreshToken = generateRefreshToken(refreshPayload.userId);
  await RefreshToken.create({
    user: refreshPayload.userId,
    token: newRefreshToken,
    expiresAt: new Date(Date.now() + REFRESH_MAX_AGE * 1000),
  });
  setAuthCookies(res, newAccessToken, newRefreshToken);
  res.json({
    success: true,
    accessToken: newAccessToken,
    expiresIn: ACCESS_MAX_AGE,
  });
});

/**
 * POST /api/auth/logout — invalidate refresh token (from cookie or body)
 */
export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }
  res.cookie("accessToken", "", { ...COOKIE_OPTIONS, maxAge: 0 });
  res.cookie("refreshToken", "", { ...COOKIE_OPTIONS, maxAge: 0 });
  res.json({ success: true, message: "Logged out" });
});

/**
 * POST /api/auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email, isDeleted: false });
  if (!user) {
    return res.json({ success: true, message: "If email exists, reset link will be sent" });
  }
  const token = generateRandomToken();
  user.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${token}`;
  await sendPasswordResetEmail(email, resetUrl);
  res.json({ success: true, message: "If email exists, reset link will be sent" });
});

/**
 * POST /api/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  });
  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid or expired token" });
  }
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json({ success: true, message: "Password reset successful" });
});
