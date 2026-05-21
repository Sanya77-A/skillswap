import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations, fetchMessages, sendMessage, setActiveConversation, addMessage } from "../features/chat/chatSlice";
import { useSocket } from "../hooks/useSocket";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { Paperclip, Phone, Video as VideoIcon } from "lucide-react";
import { VideoCall } from "../components/VideoCall";
import { IncomingCallModal } from "../components/IncomingCallModal";

export default function ChatPage() {
  const dispatch = useDispatch();
  const { socket, onlineUsers } = useSocket();
  const { conversations, messages, activeConversationId } = useSelector((s) => s.chat);
  const { user } = useSelector((s) => s.auth);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [callState, setCallState] = useState({ status: "idle", iceCandidates: [] });
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConversationId]);


  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (activeConversationId) dispatch(fetchMessages({ conversationId: activeConversationId }));
  }, [activeConversationId, dispatch]);

  useEffect(() => {
    if (!socket) return;
    
    const handleMessage = (msg) => dispatch(addMessage(msg));
    const handleIncomingCall = ({ from, offer, isVideo, callerName }) => {
      setCallState({ status: "incoming", remoteId: from, offer, isVideo, callerName, iceCandidates: [] });
    };
    const handleCallEnded = () => {
      setCallState(prev => prev.status === "incoming" ? { status: "idle" } : prev);
    };
    const handleIceCandidate = ({ candidate }) => {
      setCallState(prev => {
        if (prev.status === "idle") return prev;
        return { ...prev, iceCandidates: [...(prev.iceCandidates || []), candidate] };
      });
    };

    socket.on("message", handleMessage);
    socket.on("incoming_call", handleIncomingCall);
    socket.on("call_ended", handleCallEnded);
    socket.on("ice_candidate", handleIceCandidate);
    
    return () => {
      socket.off("message", handleMessage);
      socket.off("incoming_call", handleIncomingCall);
      socket.off("call_ended", handleCallEnded);
      socket.off("ice_candidate", handleIceCandidate);
    };
  }, [socket, dispatch]);

  const startCall = (isVideoCall) => {
    if (!other) return;
    setCallState({ 
      status: "calling", 
      remoteId: other._id, 
      remoteUserName: other.name, 
      isVideo: isVideoCall,
      iceCandidates: []
    });
  };

  const activeConv = conversations.find((c) => c._id === activeConversationId);
  const other = activeConv?.other || activeConv?.participants?.find((p) => p._id !== user?._id);
  const msgs = activeConversationId ? (messages[activeConversationId] || []) : [];

  const handleSend = (e) => {
    e.preventDefault();
    if ((!input.trim() && (!attachments || attachments.length === 0)) || !activeConversationId) return;
    dispatch(sendMessage({ conversationId: activeConversationId, content: input.trim(), files: attachments }));
    setInput("");
    setAttachments([]);
  };

  const onFileChange = (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
    const list = [];
    for (let i = 0; i < Math.min(files.length, 5); i++) {
      if (allowed.includes(files[i].type)) list.push(files[i]);
    }
    setAttachments((prev) => [...prev, ...list].slice(0, 5));
    e.target.value = "";
  };

  return (
    <div className="flex h-[70vh] gap-4">
      <Card className="w-72 flex-shrink-0 overflow-y-auto p-3">
        <h2 className="font-heading font-semibold text-text-primary mb-3">Conversations</h2>
        {conversations.map((c) => {
          const o = c.other || c.participants?.find((p) => p._id !== user?._id);
          const online = onlineUsers?.includes(o?._id);
          return (
            <button
              key={c._id}
              onClick={() => dispatch(setActiveConversation(c._id))}
              className={`w-full text-left p-3 rounded-xl mb-1 flex items-center gap-3 transition-colors ${activeConversationId === c._id ? "bg-accent/15 text-accent" : "hover:bg-surface-2 text-text-primary"}`}
            >
              <Avatar src={o?.profileImage} name={o?.name} size="sm" />
              <span className="font-medium truncate">{o?.name}</span>
              {c.unreadCount > 0 && <span className="ml-auto w-2 h-2 rounded-full bg-accent" />}
              {online && <span className="text-accent-2 text-xs">●</span>}
            </button>
          );
        })}
        {(!conversations || conversations.length === 0) && <p className="text-sm text-text-secondary p-2">No conversations. Accept a swap to chat.</p>}
      </Card>
      <Card className="flex-1 flex flex-col min-h-0">
        {activeConv ? (
          <>
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Avatar src={other?.profileImage} name={other?.name} size="sm" />
              <strong className="text-text-primary">{other?.name}</strong>
              {onlineUsers?.includes(other?._id) && <span className="text-accent-2 text-sm">Online</span>}
              <div className="ml-auto flex gap-2">
                <button onClick={() => startCall(false)} className="p-2 text-text-secondary hover:text-accent hover:bg-accent/10 rounded-lg transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button onClick={() => startCall(true)} className="p-2 text-text-secondary hover:text-accent hover:bg-accent/10 rounded-lg transition-colors">
                  <VideoIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgs.map((m) => (
                <div key={m._id} className={m.sender?._id === user?._id ? "text-right" : "text-left"}>
                  <span className={`inline-block px-4 py-2 rounded-2xl max-w-[85%] ${m.sender?._id === user?._id ? "bg-accent text-white" : "bg-surface-2 text-text-primary"}`}>
                    {m.content && <span className="block">{m.content}</span>}
                    {m.attachments?.length > 0 && (
                      <span className="block mt-1 space-y-1">
                        {m.attachments.map((a, i) =>
                          a.type === "image" ? (
                            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="block">
                              <img src={a.url} alt="" className="max-h-40 rounded object-cover" />
                            </a>
                          ) : (
                            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="block text-sm underline text-accent">
                              PDF attachment
                            </a>
                          )
                        )}
                      </span>
                    )}
                  </span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} className="p-4 flex flex-col gap-2 border-t border-border">
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((f, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-xl bg-surface-2 text-text-secondary flex items-center gap-1">
                      {f.name}
                      <button type="button" onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))} className="text-danger hover:opacity-80">×</button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input type="file" accept="image/*,.pdf" multiple onChange={onFileChange} className="hidden" id="chat-file" />
                <label htmlFor="chat-file" className="px-3 py-2 rounded-xl bg-surface-2 border border-border cursor-pointer text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1" aria-label="Attach file">
                  <Paperclip className="w-4 h-4" />
                </label>
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent" />
                <Button type="submit">Send</Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-secondary">Select a conversation</div>
        )}
      </Card>
      <IncomingCallModal 
        open={callState.status === "incoming"}
        callerName={callState.callerName}
        isVideo={callState.isVideo}
        onAccept={() => setCallState({ ...callState, status: "active" })}
        onDecline={() => {
          socket?.emit("end_call", { to: callState.remoteId });
          setCallState({ status: "idle" });
        }}
      />
      
      {(callState.status === "calling" || callState.status === "active") && (
        <VideoCall 
          socket={socket}
          isInitiator={callState.status === "calling"}
          remoteUserId={callState.remoteId}
          remoteUserName={callState.remoteUserName || callState.callerName}
          isVideo={callState.isVideo}
          incomingOffer={callState.offer}
          bufferedCandidates={callState.iceCandidates}
          localUserName={user?.name}
          onEnd={() => setCallState({ status: "idle" })}
        />
      )}
    </div>
  );
}
