import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user) return;
    const token = document.cookie.split("; ").find((r) => r.startsWith("token="))?.split("=")[1];
    const s = io(window.location.origin, {
      auth: { token },
      path: "/socket.io",
    });
    s.on("connect", () => setSocket(s));
    s.on("online_users", setOnlineUsers);
    s.on("disconnect", () => setSocket(null));
    return () => s.disconnect();
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
