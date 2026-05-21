import { useEffect, useRef, useState } from "react";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";
import { Button } from "./ui/Button";

const STUN_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function VideoCall({ socket, isInitiator, remoteUserId, remoteUserName, isVideo, incomingOffer, onEnd }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  
  const [hasConnected, setHasConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(!isVideo);

  useEffect(() => {
    let isMounted = true;
    async function startCall() {
      try {
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true });
        } catch (mediaErr) {
          console.warn("Camera failed, trying audio only", mediaErr);
          stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          setIsVideoOff(true);
        }
        
        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const peer = new RTCPeerConnection(STUN_SERVERS);
        peerRef.current = peer;

        stream.getTracks().forEach((track) => peer.addTrack(track, stream));

        peer.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setHasConnected(true);
          }
        };

        peer.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice_candidate", { to: remoteUserId, candidate: event.candidate });
          }
        };

        if (isInitiator) {
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          socket.emit("call_user", { to: remoteUserId, offer, isVideo, callerName: "You" });
        } else {
          await peer.setRemoteDescription(new RTCSessionDescription(incomingOffer));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.emit("answer_call", { to: remoteUserId, answer });
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
        if (isMounted) handleEndCall();
      }
    }

    startCall();

    return () => {
      isMounted = false;
      // Note: we don't call handleEndCall here to prevent StrictMode double-mount from killing the call immediately.
      // If the component truly unmounts via user action, they should click the End Call button.
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleAnswer = async ({ answer }) => {
      if (peerRef.current && !peerRef.current.currentRemoteDescription) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      try {
        if (peerRef.current) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (e) {
        console.error("Error adding ice candidate", e);
      }
    };

    const handleCallEnded = () => {
      handleEndCall();
    };

    socket.on("call_answered", handleAnswer);
    socket.on("ice_candidate", handleIceCandidate);
    socket.on("call_ended", handleCallEnded);

    return () => {
      socket.off("call_answered", handleAnswer);
      socket.off("ice_candidate", handleIceCandidate);
      socket.off("call_ended", handleCallEnded);
    };
  }, [socket]);

  const handleEndCall = () => {
    socket.emit("end_call", { to: remoteUserId });
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    onEnd();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <div className="absolute inset-0 bg-surface z-50 flex flex-col rounded-xl overflow-hidden shadow-2xl">
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {/* Remote Video */}
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        {!hasConnected && (
          <div className="absolute inset-0 flex items-center justify-center text-white flex-col gap-4">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center animate-pulse">
              <Phone className="w-8 h-8 text-accent animate-bounce" />
            </div>
            <p className="text-lg font-medium">{isInitiator ? `Calling ${remoteUserName}...` : "Connecting..."}</p>
          </div>
        )}

        {/* Local Video PIP */}
        <div className="absolute bottom-4 right-4 w-32 h-48 bg-gray-800 rounded-lg overflow-hidden border-2 border-border shadow-lg">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`} 
          />
          {isVideoOff && (
            <div className="w-full h-full flex items-center justify-center bg-surface text-text-secondary">
              <VideoOff className="w-8 h-8" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="h-20 bg-surface border-t border-border flex items-center justify-center gap-6 px-6">
        <button 
          onClick={toggleMute}
          className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-danger/20 text-danger' : 'bg-surface-2 text-text-primary hover:bg-border'}`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        
        {isVideo && (
          <button 
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${isVideoOff ? 'bg-danger/20 text-danger' : 'bg-surface-2 text-text-primary hover:bg-border'}`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
        )}

        <button 
          onClick={handleEndCall}
          className="p-4 rounded-full bg-danger text-white hover:bg-danger/90 transition-colors"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
