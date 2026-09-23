"use client";

import * as React from "react";
import {
  Room,
  RoomEvent,
  VideoPresets,
  Track,
  RemoteParticipant,
  Participant,
  DataPacket_Kind,
} from "livekit-client";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
}

export interface LiveTranscriptItem {
  id: string;
  speakerId: string;
  speakerName: string;
  speakerRole: "TEACHER" | "STUDENT";
  text: string;
  timestamp: string;
}

export interface UseLiveKitRoomProps {
  serverUrl?: string;
  token?: string;
  onDisconnected?: () => void;
}

export function useLiveKitRoom({
  serverUrl,
  token,
  onDisconnected,
}: UseLiveKitRoomProps) {
  const [room, setRoom] = React.useState<Room | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Tracks & Media State
  const [isMicEnabled, setIsMicEnabled] = React.useState(true);
  const [isCamEnabled, setIsCamEnabled] = React.useState(true);
  const [isScreenSharing, setIsScreenSharing] = React.useState(false);

  // Participants & Speakers
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [activeSpeakerId, setActiveSpeakerId] = React.useState<string | null>(null);

  // In-room data channels (Chat & Live Transcript)
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [transcripts, setTranscripts] = React.useState<LiveTranscriptItem[]>([]);
  const [sharedNotes, setSharedNotes] = React.useState<string>("");

  React.useEffect(() => {
    if (!serverUrl || !token) return;

    const newRoom = new Room({
      adaptiveStream: true,
      dynacast: true,
      videoCaptureDefaults: {
        resolution: VideoPresets.h720.resolution,
      },
    });

    let isMounted = true;

    async function connect() {
      try {
        setIsConnecting(true);
        setError(null);

        // Bind events before connecting
        newRoom
          .on(RoomEvent.Connected, () => {
            if (!isMounted) return;
            setIsConnected(true);
            setIsConnecting(false);
            updateParticipants(newRoom);
          })
          .on(RoomEvent.Disconnected, () => {
            if (!isMounted) return;
            setIsConnected(false);
            setIsConnecting(false);
            onDisconnected?.();
          })
          .on(RoomEvent.ParticipantConnected, () => updateParticipants(newRoom))
          .on(RoomEvent.ParticipantDisconnected, () => updateParticipants(newRoom))
          .on(RoomEvent.TrackSubscribed, () => updateParticipants(newRoom))
          .on(RoomEvent.TrackUnsubscribed, () => updateParticipants(newRoom))
          .on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
            if (!isMounted) return;
            setActiveSpeakerId(speakers[0]?.identity || null);
          })
          .on(RoomEvent.DataReceived, (payload, participant, kind) => {
            if (!isMounted) return;
            try {
              const decoded = new TextDecoder().decode(payload);
              const data = JSON.parse(decoded);

              if (data.type === "chat") {
                setMessages((prev) => [...prev, data.message]);
              } else if (data.type === "transcript") {
                setTranscripts((prev) => [...prev, data.transcript]);
              } else if (data.type === "notes") {
                setSharedNotes(data.notes);
              }
            } catch (err) {
              console.error("Failed to parse data message:", err);
            }
          });

        await newRoom.connect(serverUrl!, token!);

        // Enable default camera & microphone
        try {
          await newRoom.localParticipant.setMicrophoneEnabled(true);
          await newRoom.localParticipant.setCameraEnabled(true);
          setIsMicEnabled(true);
          setIsCamEnabled(true);
        } catch (mediaErr) {
          console.warn("Could not enable camera/mic automatically:", mediaErr);
        }

        if (isMounted) {
          setRoom(newRoom);
          updateParticipants(newRoom);
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error("LiveKit connection error:", err);
        setError(err.message || "Failed to connect to video classroom");
        setIsConnecting(false);
      }
    }

    connect();

    return () => {
      isMounted = false;
      newRoom.disconnect();
    };
  }, [serverUrl, token]);

  const updateParticipants = (r: Room) => {
    const list: Participant[] = [r.localParticipant];
    r.remoteParticipants.forEach((p) => list.push(p));
    setParticipants([...list]);
  };

  const toggleMicrophone = async () => {
    if (!room) return;
    try {
      const nextState = !isMicEnabled;
      await room.localParticipant.setMicrophoneEnabled(nextState);
      setIsMicEnabled(nextState);
    } catch (err) {
      console.error("Failed to toggle microphone:", err);
    }
  };

  const toggleCamera = async () => {
    if (!room) return;
    try {
      const nextState = !isCamEnabled;
      await room.localParticipant.setCameraEnabled(nextState);
      setIsCamEnabled(nextState);
    } catch (err) {
      console.error("Failed to toggle camera:", err);
    }
  };

  const toggleScreenShare = async () => {
    if (!room) return;
    try {
      const nextState = !isScreenSharing;
      await room.localParticipant.setScreenShareEnabled(nextState);
      setIsScreenSharing(nextState);
    } catch (err) {
      console.error("Failed to toggle screen share:", err);
      setIsScreenSharing(false);
    }
  };

  const sendChatMessage = async (text: string, senderName: string, senderRole: string) => {
    if (!room || !text.trim()) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderId: room.localParticipant.identity,
      senderName,
      senderRole,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const payload = new TextEncoder().encode(
      JSON.stringify({ type: "chat", message })
    );

    await room.localParticipant.publishData(payload, { reliable: true });
    setMessages((prev) => [...prev, message]);
  };

  const publishTranscriptSegment = async (
    text: string,
    speakerName: string,
    speakerRole: "TEACHER" | "STUDENT"
  ) => {
    if (!room || !text.trim()) return;

    const transcript: LiveTranscriptItem = {
      id: `seg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      speakerId: room.localParticipant.identity,
      speakerName,
      speakerRole,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };

    const payload = new TextEncoder().encode(
      JSON.stringify({ type: "transcript", transcript })
    );

    await room.localParticipant.publishData(payload, { reliable: true });
    setTranscripts((prev) => [...prev, transcript]);
  };

  const updateSharedNotes = async (notes: string) => {
    if (!room) return;
    setSharedNotes(notes);

    const payload = new TextEncoder().encode(
      JSON.stringify({ type: "notes", notes })
    );

    await room.localParticipant.publishData(payload, { reliable: false });
  };

  const leaveRoom = () => {
    if (room) {
      room.disconnect();
    }
  };

  return {
    room,
    isConnected,
    isConnecting,
    error,
    isMicEnabled,
    isCamEnabled,
    isScreenSharing,
    participants,
    activeSpeakerId,
    messages,
    transcripts,
    sharedNotes,
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare,
    sendChatMessage,
    publishTranscriptSegment,
    updateSharedNotes,
    leaveRoom,
  };
}
