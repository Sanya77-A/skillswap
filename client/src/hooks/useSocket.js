import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setOnlineUsers } from "../features/chat/chatSlice";
import { addNotification } from "../features/notifications/notificationsSlice";

/**
 * Connect to Socket.io; auth via HTTP-only cookie (withCredentials).
 */
export function useSocket() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnline] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const s = io(window.location.origin, {
      path: "/socket.io",
      withCredentials: true,
    });
    s.on("connect", () => setSocket(s));
    s.on("online_users", (ids) => {
      setOnline(ids || []);
      dispatch(setOnlineUsers(ids || []));
    });
    s.on("notification", (payload) => {
      dispatch(addNotification(payload));
    });
    s.on("disconnect", () => setSocket(null));
    return () => s.disconnect();
  }, [isAuthenticated, dispatch]);

  return { socket, onlineUsers };
}
