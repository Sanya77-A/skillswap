import User from "../models/User.js";
import MatchCache from "../models/MatchCache.js";
import SwapRequest from "../models/SwapRequest.js";

const POINTS = {
  MUTUAL_SKILL: 50,
  RATING_PER_POINT: 10,
  AVAILABILITY_OVERLAP: 20,
  SAME_LOCATION: 5,
  RECENT_ACTIVITY: 10,
};

/**
 * Calculate match score between currentUser and targetUser.
 * Returns { matchScore, reasons }.
 */
export function calculateMatchScore(currentUser, targetUser) {
  const reasons = [];
  let matchScore = 0;

  const myOffered = (currentUser.skillsOffered || []).map((s) => s.toLowerCase().trim());
  const myWanted = (currentUser.skillsWanted || []).map((s) => s.toLowerCase().trim());
  const theirOffered = (targetUser.skillsOffered || []).map((s) => s.toLowerCase().trim());
  const theirWanted = (targetUser.skillsWanted || []).map((s) => s.toLowerCase().trim());

  const hasMutual =
    myWanted.some((w) => theirOffered.some((o) => o.includes(w) || w.includes(o))) &&
    myOffered.some((o) => theirWanted.some((w) => w.includes(o) || o.includes(w)));
  if (hasMutual) {
    matchScore += POINTS.MUTUAL_SKILL;
    reasons.push("Mutual skill match");
  }

  const ratingScore = (targetUser.ratingAvg || 0) * POINTS.RATING_PER_POINT;
  matchScore += ratingScore;
  if (targetUser.ratingAvg >= 4) reasons.push("High rating");

  const myAvail = new Set(currentUser.availability || []);
  const theirAvail = (targetUser.availability || []);
  const overlap = theirAvail.some((a) => myAvail.has(a));
  if (overlap) {
    matchScore += POINTS.AVAILABILITY_OVERLAP;
    reasons.push("Availability overlap");
  }

  const sameLocation =
    currentUser.location &&
    targetUser.location &&
    String(currentUser.location).toLowerCase().trim() === String(targetUser.location).toLowerCase().trim();
  if (sameLocation) {
    matchScore += POINTS.SAME_LOCATION;
    reasons.push("Same location");
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const targetUpdated = targetUser.updatedAt ? new Date(targetUser.updatedAt) : null;
  if (targetUpdated && targetUpdated >= sevenDaysAgo) {
    matchScore += POINTS.RECENT_ACTIVITY;
    reasons.push("Recent activity");
  }

  return { matchScore, reasons };
}

/**
 * Recompute and cache matches for a user (used by cron and on-demand).
 */
export async function recomputeMatchCacheForUser(userId) {
  const user = await User.findById(userId)
    .select("skillsOffered skillsWanted location availability updatedAt")
    .lean();
  if (!user) return;

  const myOffered = (user.skillsOffered || []).map((s) => s.toLowerCase());
  const myWanted = (user.skillsWanted || []).map((s) => s.toLowerCase());

  const filter = {
    _id: { $ne: userId },
    isDeleted: false,
    isBlocked: false,
    $or: [
      { skillsOffered: { $in: myWanted } },
      { skillsWanted: { $in: myOffered } },
    ],
  };

  const candidates = await User.find(filter)
    .select("name profileImage bio location availability experienceLevel skillsOffered skillsWanted ratingAvg ratingCount updatedAt")
    .lean();

  const ops = candidates.map((target) => {
    const { matchScore, reasons } = calculateMatchScore(user, target);
    return {
      updateOne: {
        filter: { userId, matchedUserId: target._id },
        update: { $set: { matchScore, reasons, updatedAt: new Date() } },
        upsert: true,
      },
    };
  });

  if (ops.length) await MatchCache.bulkWrite(ops);
}

/**
 * Recompute match cache for all active users (cron job).
 */
export async function recomputeAllMatchCaches() {
  const users = await User.find({ isDeleted: false, isBlocked: false }).select("_id").lean();
  for (const u of users) {
    await recomputeMatchCacheForUser(u._id);
  }
}

/**
 * Get matches for user: use cache when available, attach score and reasons.
 * Paginated.
 */
export async function getMatches(userId, options = {}) {
  const { page = 1, limit = 20, experienceLevel, availability } = options;
  const skip = (page - 1) * limit;

  const user = await User.findById(userId).select("skillsOffered skillsWanted");
  if (!user) return { data: [], pagination: { total: 0, page, limit, pages: 0 } };

  const cached = await MatchCache.find({ userId })
    .sort({ matchScore: -1 })
    .populate("matchedUserId")
    .lean();

  let userIds = (cached || []).map((c) => c.matchedUserId?._id || c.matchedUserId).filter(Boolean);
  const cacheMap = new Map();
  cached.forEach((c) => {
    const id = (c.matchedUserId?._id || c.matchedUserId)?.toString();
    if (id) cacheMap.set(id, { matchScore: c.matchScore, reasons: c.reasons || [] });
  });

  if (userIds.length === 0) {
    const myOffered = (user.skillsOffered || []).map((s) => s.toLowerCase());
    const myWanted = (user.skillsWanted || []).map((s) => s.toLowerCase());
    const filter = {
      _id: { $ne: userId },
      isDeleted: false,
      isBlocked: false,
      $or: [
        { skillsOffered: { $in: myWanted } },
        { skillsWanted: { $in: myOffered } },
      ],
    };
    const usersList = await User.find(filter)
      .select("name profileImage bio location availability experienceLevel skillsOffered skillsWanted ratingAvg ratingCount updatedAt")
      .lean();
    userIds = usersList.map((u) => u._id);
    const fullUser = await User.findById(userId).select("skillsOffered skillsWanted location availability updatedAt").lean();
    for (const u of usersList) {
      const { matchScore, reasons } = calculateMatchScore(fullUser, u);
      cacheMap.set(u._id.toString(), { matchScore, reasons });
    }
  }

  let usersFilter = { _id: { $in: userIds }, isDeleted: false, isBlocked: false };
  if (experienceLevel) usersFilter.experienceLevel = experienceLevel;
  if (availability && availability.length) usersFilter.availability = { $in: availability };

  const users = await User.find(usersFilter)
    .select("name profileImage bio location availability experienceLevel skillsOffered skillsWanted ratingAvg ratingCount createdAt")
    .lean();

  const withScore = users.map((u) => {
    const c = cacheMap.get(u._id.toString()) || { matchScore: 0, reasons: [] };
    const reasons = c.reasons && c.reasons.length ? c.reasons : [];
    return {
      user: u,
      matchScore: c.matchScore,
      reasons: reasons.length ? reasons : ["Skill overlap"],
    };
  });

  withScore.sort((a, b) => b.matchScore - a.matchScore);
  const total = withScore.length;
  const data = withScore.slice(skip, skip + limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}
