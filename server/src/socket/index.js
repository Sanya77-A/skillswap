import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { setIO } from "../services/socketService.js";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access-secret-change-me";

/**
 * Socket.io: authenticate via access token, join user room, handle chat + typing
 */
export const setupSocket = (io) => {
  setIO(io);

  function getTokenFromCookie(cookieHeader) {
    if (!cookieHeader || typeof cookieHeader !== "string") return null;
    const match = cookieHeader.split(";").map((s) => s.trim()).find((s) => s.startsWith("accessToken="));
    return match ? decodeURIComponent(match.split("=")[1] || "").trim() : null;
  }

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "") ||
      getTokenFromCookie(socket.handshake.headers?.cookie);
    if (!token) return next(new Error("Authentication required"));
    try {
      const { userId } = jwt.verify(token, JWT_ACCESS_SECRET);
      socket.userId = userId;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    socket.join(`user:${socket.userId}`);
    const online = await getOnlineUserIds(io);
    io.emit("online_users", online);

    socket.on("join_conversation", (conversationId) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on("leave_conversation", (conversationId) => {
      socket.leave(`conv:${conversationId}`);
    });

    socket.on("typing", ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit("user_typing", { userId: socket.userId });
    });

    socket.on("typing_stop", ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit("user_typing_stop", { userId: socket.userId });
    });

    // WebRTC Signaling Events
    socket.on("call_user", ({ to, offer, isVideo, callerName }) => {
      io.to(`user:${to}`).emit("incoming_call", { from: socket.userId, offer, isVideo, callerName });
    });

    socket.on("answer_call", ({ to, answer }) => {
      io.to(`user:${to}`).emit("call_answered", { answer });
    });

    socket.on("ice_candidate", ({ to, candidate }) => {
      io.to(`user:${to}`).emit("ice_candidate", { candidate });
    });

    socket.on("end_call", ({ to }) => {
      io.to(`user:${to}`).emit("call_ended");
    });

    socket.on("disconnect", () => {
      getOnlineUserIds(io).then((online) => io.emit("online_users", online));
    });
  });
};

async function getOnlineUserIds(io) {
  const sockets = await io.fetchSockets();
  return [...new Set(sockets.map((s) => s.userId?.toString()).filter(Boolean))];
}
