import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import { verifyAccessToken, verifyRefreshToken } from "../utils/tokens.js";

/**
 * Verify access token (from cookie or Authorization header), attach user to req
 */
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null);
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const { userId } = verifyAccessToken(token);
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    if (user.isBlocked || user.isDeleted) {
      return res.status(403).json({ success: false, message: "Account is disabled" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

/** Alias for protect (verifyAccessToken) */
export const verifyAccessTokenMiddleware = protect;

/**
 * Verify refresh token (cookie or body), attach stored token and payload to req
 */
export const verifyRefreshTokenMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "Refresh token required" });
    }
    const stored = await RefreshToken.findOne({ token });
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await RefreshToken.deleteOne({ _id: stored._id });
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }
    const payload = verifyRefreshToken(token);
    req.refreshTokenStored = stored;
    req.refreshPayload = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
};
