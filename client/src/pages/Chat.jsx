import { useEffect, useState } from "react";
import styled from "styled-components";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const Container = styled.div`
  display: flex;
  gap: 1rem;
  height: 70vh;
`;

const Sidebar = styled.div`
  width: 250px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  overflow-y: auto;
`;

const ChatArea = styled.div`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const Msg = styled.div`
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 12px;
  max-width: 70%;
  ${(p) => (p.own ? "margin-left: auto; background: #e94560;" : "background: #0f3460;")}
`;

const Input = styled.form`
  display: flex;
  padding: 1rem;
  gap: 0.5rem;
  input {
    flex: 1;
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid #333;
    background: #1a1a2e;
    color: #eee;
  }
  button {
    padding: 0.75rem 1.5rem;
    background: #e94560;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
`;

const UserItem = styled.div`
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &:hover { background: rgba(255,255,255,0.1); }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${(p) => (p.online ? "#27ae60" : "#666")};
  }
`;

export default function Chat() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    api.get("/users/search").then(({ data }) => setUsers(data)).catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.get(`/chat/${selected._id}`).then(({ data }) => setMessages(data)).catch(() => setMessages([]));
  }, [selected]);

  useEffect(() => {
    if (!socket) return;
    socket.on("new_message", (msg) => {
      if (selected && (msg.senderId._id === selected._id || msg.receiverId === selected._id)) {
        setMessages((m) => [...m, msg]);
      }
    });
    socket.on("message_sent", (msg) => setMessages((m) => [...m, msg]));
    return () => {
      socket.off("new_message");
      socket.off("message_sent");
    };
  }, [socket, selected]);

  const send = (e) => {
    e.preventDefault();
    if (!input.trim() || !selected || !socket) return;
    socket.emit("send_message", { receiverId: selected._id, message: input.trim() });
    setInput("");
  };

  return (
    <div>
      <h1>Chat</h1>
      <Container>
        <Sidebar>
          <h3>Users</h3>
          {users.map((u) => (
            <UserItem
              key={u._id}
              online={onlineUsers?.includes(u._id)}
              onClick={() => setSelected(u)}
              style={{ background: selected?._id === u._id ? "rgba(233,69,96,0.2)" : undefined }}
            >
              <span className="dot" />
              {u.name}
            </UserItem>
          ))}
        </Sidebar>
        <ChatArea>
          {selected ? (
            <>
              <div style={{ padding: "1rem", borderBottom: "1px solid #333" }}>
                <strong>{selected.name}</strong>
                {onlineUsers?.includes(selected._id) && <span style={{ color: "#27ae60", marginLeft: "0.5rem" }}>● Online</span>}
              </div>
              <Messages>
                {messages.map((m) => (
                  <Msg key={m._id} own={m.senderId?._id === user?._id}>
                    <strong>{m.senderId?.name}</strong>: {m.message}
                  </Msg>
                ))}
              </Messages>
              <Input onSubmit={send}>
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." />
                <button type="submit">Send</button>
              </Input>
            </>
          ) : (
            <div style={{ padding: "2rem", textAlign: "center", color: "#aaa" }}>Select a user to chat</div>
          )}
        </ChatArea>
      </Container>
    </div>
  );
}
