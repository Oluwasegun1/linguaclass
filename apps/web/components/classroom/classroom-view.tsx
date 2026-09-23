"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/form-elements";
import { ResourceList } from "@/components/resources/resource-list";
import { useLiveKitRoom, type ChatMessage, type LiveTranscriptItem } from "@/hooks/use-livekit-room";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  PhoneOff,
  MessageSquare,
  FileText,
  Sparkles,
  Paperclip,
  Clock,
  ShieldCheck,
  Send,
  X,
  Volume2,
  Users,
} from "lucide-react";
import type { Participant, TrackPublication, RemoteTrackPublication } from "livekit-client";
import { Track } from "livekit-client";

interface ClassroomViewProps {
  lessonId: string;
  lessonTitle: string;
  courseTitle: string;
  language: string;
  level: string;
  sessionId: string;
  user: {
    id: string;
    name: string;
    role: "TEACHER" | "STUDENT";
    timezone: string;
    avatarUrl?: string | null;
  };
  serverUrl: string;
  token: string;
  resources: Array<{
    id: string;
    fileName: string;
    fileType: string;
    url: string | null;
  }>;
}

export function ClassroomView({
  lessonId,
  lessonTitle,
  courseTitle,
  language,
  level,
  sessionId,
  user,
  serverUrl,
  token,
  resources,
}: ClassroomViewProps) {
  const [activeTab, setActiveTab] = React.useState<
    "transcript" | "chat" | "notes" | "ai" | "materials"
  >("transcript");
  const [chatInput, setChatInput] = React.useState("");
  const [speechSimInput, setSpeechSimInput] = React.useState("");
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [hasConsented, setHasConsented] = React.useState<boolean | null>(null);
  const [showConsentModal, setShowConsentModal] = React.useState(false);

  const {
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
  } = useLiveKitRoom({
    serverUrl,
    token,
    onDisconnected: () => {
      window.location.href = user.role === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard";
    },
  });

  // Elapsed timer
  React.useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch / Check recording consent
  React.useEffect(() => {
    async function checkConsent() {
      try {
        const res = await fetch(`/api/video/consent?sessionId=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setHasConsented(data.userConsent);
          if (!data.userConsent) {
            setShowConsentModal(true);
          }
        }
      } catch (err) {
        console.error("Failed to check recording consent:", err);
      }
    }
    checkConsent();
  }, [sessionId]);

  const handleGrantConsent = async (grant: boolean) => {
    try {
      await fetch("/api/video/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, consented: grant }),
      });
      setHasConsented(grant);
      setShowConsentModal(false);
    } catch (err) {
      console.error("Failed to submit consent:", err);
    }
  };

  const formatElapsed = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput, user.name, user.role);
    setChatInput("");
  };

  const handleSimulateSpeech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!speechSimInput.trim()) return;
    publishTranscriptSegment(speechSimInput, user.name, user.role);
    setSpeechSimInput("");
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0A121A] text-white">
      {/* 1. TOP HEADER BAR */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#0F1E2A]/90 px-4 sm:px-6 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={user.role === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard"}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal font-display text-sm font-bold text-white shadow-xs"
          >
            L
          </Link>

          <div className="min-w-0 truncate">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-display text-sm sm:text-base font-bold text-white">
                {lessonTitle}
              </h1>
              <span className="hidden sm:inline-flex rounded bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-teal-light">
                {language} • {level}
              </span>
            </div>
            <p className="text-[11px] text-[#9AABBA] truncate hidden sm:block">
              {courseTitle}
            </p>
          </div>
        </div>

        {/* Live Indicators & Timer */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-mono text-[#9AABBA]">
            <Clock className="w-3.5 h-3.5 text-teal" />
            <span>{formatElapsed(elapsedSeconds)}</span>
          </div>

          {/* Recording Status Pill */}
          <div className="flex items-center gap-1.5 rounded-full border border-coral/40 bg-coral-light/15 px-2.5 py-0.5 text-[11px] font-semibold text-coral">
            <span className="size-2 rounded-full bg-coral animate-pulse" />
            <span>REC</span>
          </div>

          {/* Live Badge */}
          <div className="flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-green-400">
            <span className="size-1.5 rounded-full bg-green-400 animate-ping" />
            <span>LIVE</span>
          </div>
        </div>
      </header>

      {/* 2. CLASSROOM BODY: Video Stage + Sidebar Panel */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Main Video Stage */}
        <main className="relative flex flex-1 flex-col overflow-hidden bg-[#0A121A] p-3 sm:p-4">
          {isConnecting ? (
            <div className="flex flex-1 flex-col items-center justify-center space-y-3">
              <div className="size-10 rounded-full border-2 border-teal border-t-transparent animate-spin" />
              <p className="text-sm font-medium text-white/80">Connecting to secure video classroom...</p>
            </div>
          ) : error ? (
            <div className="m-auto max-w-md rounded-2xl border border-coral bg-coral-light/20 p-6 text-center space-y-3">
              <p className="text-sm font-semibold text-coral">{error}</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Reconnect
              </Button>
            </div>
          ) : (
            <div className="grid flex-1 grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 min-h-0">
              {/* Local Participant Tile */}
              <ParticipantTile
                participant={room?.localParticipant}
                isLocal={true}
                activeSpeakerId={activeSpeakerId}
                fallbackName={user.name}
                fallbackRole={user.role}
                isCamEnabled={isCamEnabled}
                isMicEnabled={isMicEnabled}
              />

              {/* Remote Participants Tiles */}
              {participants
                .filter((p) => p.identity !== room?.localParticipant?.identity)
                .map((remote) => (
                  <ParticipantTile
                    key={remote.identity}
                    participant={remote}
                    isLocal={false}
                    activeSpeakerId={activeSpeakerId}
                    fallbackName={remote.name || "Student"}
                    fallbackRole="STUDENT"
                    isCamEnabled={true}
                    isMicEnabled={true}
                  />
                ))}

              {/* Waiting state if only 1 participant */}
              {participants.length <= 1 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#142332] p-6 text-center space-y-2">
                  <div className="size-12 rounded-full bg-teal/10 border border-teal/30 text-teal flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-sm font-semibold text-white">
                    Waiting for participants to join...
                  </h3>
                  <p className="text-xs text-[#9AABBA] max-w-xs leading-relaxed">
                    Students will appear on screen as soon as they enter the classroom.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>

        {/* 3. INTERACTIVE SIDEBAR (Tabs: Transcript, Chat, Notes, AI, Materials) */}
        <aside className="flex w-80 sm:w-96 shrink-0 flex-col border-l border-white/10 bg-[#0F1E2A]">
          {/* Tab Navigation */}
          <div className="flex items-center border-b border-white/10 bg-white/2 overflow-x-auto px-1">
            {[
              { id: "transcript", label: "Transcript", icon: Volume2 },
              { id: "chat", label: "Chat", icon: MessageSquare },
              { id: "notes", label: "Notes", icon: FileText },
              { id: "ai", label: "AI Guide", icon: Sparkles },
              { id: "materials", label: "Files", icon: Paperclip },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider transition-colors relative whitespace-nowrap",
                    isActive ? "text-teal-light font-bold" : "text-[#9AABBA] hover:text-white"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-teal" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panel */}
          <div className="flex flex-1 flex-col overflow-hidden p-3 sm:p-4 min-h-0">
            {/* Live Transcript Tab */}
            {activeTab === "transcript" && (
              <div className="flex flex-1 flex-col overflow-hidden space-y-3">
                <div className="flex items-center justify-between text-xs text-[#9AABBA] pb-2 border-b border-white/10">
                  <span>Real-time speech stream</span>
                  <Badge variant="live">Streaming</Badge>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 font-sans text-xs">
                  {transcripts.length === 0 ? (
                    <div className="p-6 rounded-xl border border-dashed border-white/10 text-center text-xs text-[#9AABBA] space-y-2">
                      <p>Speech will be transcribed live as participants speak.</p>
                      <p className="text-[11px] text-white/50">
                        (You can also type a practice utterance below to test the AI extractor)
                      </p>
                    </div>
                  ) : (
                    transcripts.map((t) => (
                      <div
                        key={t.id}
                        className={cn(
                          "p-2.5 rounded-xl border text-xs leading-relaxed",
                          t.speakerRole === "TEACHER"
                            ? "border-teal/30 bg-teal/10"
                            : "border-amber/30 bg-amber/10"
                        )}
                      >
                        <div className="flex items-center justify-between font-semibold text-[11px] mb-1">
                          <span
                            className={t.speakerRole === "TEACHER" ? "text-teal-light" : "text-amber"}
                          >
                            {t.speakerName} ({t.speakerRole}):
                          </span>
                          <span className="font-mono text-[10px] text-[#9AABBA]">{t.timestamp}</span>
                        </div>
                        <p className="text-white/90">{t.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Speech simulation / live speech submission */}
                <form onSubmit={handleSimulateSpeech} className="pt-2 border-t border-white/10 flex gap-2">
                  <Input
                    value={speechSimInput}
                    onChange={(e) => setSpeechSimInput(e.target.value)}
                    placeholder="Speak or type a French phrase..."
                    className="h-8 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                  <Button type="submit" size="sm" variant="primary" className="h-8 px-2.5 text-xs">
                    Send
                  </Button>
                </form>
              </div>
            )}

            {/* In-Room Chat Tab */}
            {activeTab === "chat" && (
              <div className="flex flex-1 flex-col overflow-hidden space-y-3">
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
                  {messages.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#9AABBA] italic">
                      No messages yet. Say bonjour to the class!
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.senderId === room?.localParticipant?.identity;
                      return (
                        <div
                          key={m.id}
                          className={cn(
                            "flex flex-col max-w-[85%] rounded-2xl p-2.5 text-xs",
                            isMe
                              ? "ml-auto bg-teal text-white rounded-br-xs"
                              : "mr-auto bg-white/10 text-white/90 rounded-bl-xs"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2 text-[10px] opacity-75 mb-0.5">
                            <span className="font-bold">{m.senderName}</span>
                            <span className="font-mono">{m.timestamp}</span>
                          </div>
                          <p className="leading-snug">{m.text}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleSendChat} className="pt-2 border-t border-white/10 flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message to the room..."
                    className="h-8 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                  <Button type="submit" size="sm" variant="primary" className="h-8 px-2.5 text-xs">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>
            )}

            {/* Shared Notes Tab */}
            {activeTab === "notes" && (
              <div className="flex flex-1 flex-col space-y-3">
                <div className="flex items-center justify-between text-xs text-[#9AABBA]">
                  <span>Shared Blackboard Notes</span>
                  <span className="text-[10px] font-mono text-teal">Synchronized</span>
                </div>
                <textarea
                  value={sharedNotes}
                  onChange={(e) => updateSharedNotes(e.target.value)}
                  placeholder="Write collaborative notes, vocabulary lists, grammar conjugation tables..."
                  className="flex-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder:text-white/40 font-mono focus:outline-hidden focus:border-teal resize-none"
                />
              </div>
            )}

            {/* AI Assistant Tab */}
            {activeTab === "ai" && (
              <div className="flex flex-1 flex-col space-y-4 overflow-y-auto pr-1 text-xs">
                <div className="p-3 rounded-xl border border-teal-mid/40 bg-teal/10 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-teal-light text-xs">
                    <Sparkles className="w-4 h-4 text-teal" />
                    <span>Vertex AI Pedagogical Assistant</span>
                  </div>
                  <p className="text-[#A8CBCE] text-[11px] leading-relaxed">
                    Live monitoring conversational fluency, subjonctif mood usage, and irregular verbs.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-2">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                    Lesson Target Objectives
                  </span>
                  <ul className="space-y-1 text-white/80 list-disc list-inside text-[11px]">
                    <li>Master subjunctive mood triggers (il faut que, bien que)</li>
                    <li>Pronunciation: liaisons and nasal vowels</li>
                    <li>15 target vocabulary items for CEFR {level}</li>
                  </ul>
                </div>

                {user.role === "TEACHER" && (
                  <div className="mt-auto pt-4 border-t border-white/10">
                    <Link href={`/teacher/lessons/${lessonId}/review`}>
                      <Button variant="secondary" size="sm" className="w-full text-xs">
                        Open AI Review Dashboard
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Materials Drawer Tab */}
            {activeTab === "materials" && (
              <div className="flex flex-1 flex-col space-y-3 overflow-y-auto pr-1">
                <div className="flex items-center justify-between text-xs text-[#9AABBA] pb-2 border-b border-white/10">
                  <span>Attached Lesson Materials</span>
                  <span>{resources.length} file(s)</span>
                </div>
                <ResourceList resources={resources} canDelete={false} />
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* 4. BOTTOM CONTROL BAR */}
      <footer className="flex h-18 shrink-0 items-center justify-center gap-3 sm:gap-4 border-t border-white/10 bg-[#0F1E2A]/90 px-4">
        {/* Mic Toggle */}
        <button
          type="button"
          onClick={toggleMicrophone}
          className={cn(
            "flex size-11 items-center justify-center rounded-full transition-all cursor-pointer",
            isMicEnabled
              ? "bg-teal text-white shadow-md hover:bg-teal-dark"
              : "bg-coral text-white shadow-md hover:bg-coral-dark"
          )}
          title={isMicEnabled ? "Mute Microphone" : "Unmute Microphone"}
        >
          {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Cam Toggle */}
        <button
          type="button"
          onClick={toggleCamera}
          className={cn(
            "flex size-11 items-center justify-center rounded-full transition-all cursor-pointer",
            isCamEnabled
              ? "bg-teal text-white shadow-md hover:bg-teal-dark"
              : "bg-coral text-white shadow-md hover:bg-coral-dark"
          )}
          title={isCamEnabled ? "Turn off Camera" : "Turn on Camera"}
        >
          {isCamEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Screen Share */}
        <button
          type="button"
          onClick={toggleScreenShare}
          className={cn(
            "flex size-11 items-center justify-center rounded-full transition-all cursor-pointer",
            isScreenSharing
              ? "bg-amber text-ink font-bold shadow-md hover:bg-amber-light"
              : "bg-white/10 text-white/80 hover:bg-white/20"
          )}
          title={isScreenSharing ? "Stop Screen Share" : "Share Screen"}
        >
          <ScreenShare className="w-5 h-5" />
        </button>

        {/* End / Leave Session */}
        <button
          type="button"
          onClick={leaveRoom}
          className="ml-3 flex size-12 items-center justify-center rounded-full bg-coral text-white shadow-lg transition-all hover:bg-coral-dark hover:scale-105 cursor-pointer"
          title="Leave Classroom"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </footer>

      {/* 5. RECORDING CONSENT MODAL */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#0F1E2A] border border-white/10 p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-teal-light">
              <ShieldCheck className="w-6 h-6 text-teal" />
              <h3 className="font-display text-lg font-bold text-white">
                Session Recording & Privacy Consent
              </h3>
            </div>
            <p className="text-xs text-[#9AABBA] leading-relaxed">
              This interactive classroom session may be recorded for AI transcription, grammar feedback, and pedagogical review. In accordance with GDPR and COPPA privacy standards, please confirm your consent.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleGrantConsent(false)}
                className="text-xs border-white/20 text-white hover:bg-white/10"
              >
                Decline Recording
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleGrantConsent(true)}
                className="text-xs bg-teal hover:bg-teal-dark text-white font-semibold"
              >
                I Consent
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Subcomponent to render an individual participant's video or avatar tile
 */
function ParticipantTile({
  participant,
  isLocal,
  activeSpeakerId,
  fallbackName,
  fallbackRole,
  isCamEnabled,
  isMicEnabled,
}: {
  participant?: Participant;
  isLocal: boolean;
  activeSpeakerId: string | null;
  fallbackName: string;
  fallbackRole: "TEACHER" | "STUDENT";
  isCamEnabled: boolean;
  isMicEnabled: boolean;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const isSpeaking = activeSpeakerId === participant?.identity;
  const isTeacher = fallbackRole === "TEACHER";

  React.useEffect(() => {
    if (!participant || !videoRef.current) return;

    // Attach video track if present
    const trackPub = Array.from(participant.videoTrackPublications.values())[0];
    if (trackPub && trackPub.track) {
      trackPub.track.attach(videoRef.current);
    }

    return () => {
      if (trackPub && trackPub.track && videoRef.current) {
        trackPub.track.detach(videoRef.current);
      }
    };
  }, [participant]);

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#142332] transition-all duration-150 border-[1.5px]",
        isSpeaking
          ? "border-teal shadow-[0_0_20px_rgba(26,107,114,0.4)]"
          : "border-white/10 hover:border-white/20"
      )}
    >
      {/* Attached Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={cn(
          "h-full w-full object-cover",
          !isCamEnabled && "hidden"
        )}
      />

      {/* Fallback Avatar when camera is off */}
      {!isCamEnabled && (
        <div
          className={cn(
            "flex size-24 items-center justify-center rounded-full border-2 font-display text-2xl font-bold",
            isTeacher
              ? "border-teal bg-teal/20 text-teal-light"
              : "border-amber bg-amber/20 text-amber"
          )}
        >
          {fallbackName.slice(0, 2).toUpperCase()}
        </div>
      )}

      {/* Overlay Bottom Ribbon */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-[#0A121A]/80 px-3 py-1.5 backdrop-blur-md text-xs border border-white/10">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white truncate">{fallbackName}</span>
          <span
            className={cn(
              "rounded px-1.5 py-0.2 text-[9px] font-bold uppercase",
              isTeacher ? "bg-teal text-white" : "bg-amber text-ink"
            )}
          >
            {fallbackRole}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isSpeaking && (
            <span className="text-[10px] font-mono text-teal-light font-bold">
              Speaking...
            </span>
          )}
          {!isMicEnabled && <MicOff className="w-3.5 h-3.5 text-coral" />}
        </div>
      </div>
    </div>
  );
}
