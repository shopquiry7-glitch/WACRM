"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bot,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  PhoneForwarded,
  ShieldCheck,
  Send,
  MessageSquare,
  RefreshCw,
  Sliders,
} from "lucide-react";
import type { VoiceAgent, VoiceCall, CallTranscriptTurn } from "@/types/voice-calling";
import { speakText, stopSpeaking, generateSimulatedAgentResponse, startMicRecognition } from "@/lib/voice-calling/voice-audio";
import { toast } from "sonner";

interface InboundReceptionistTabProps {
  receptionistAgent: VoiceAgent;
  onSaveAgent: (agent: VoiceAgent) => void;
  onCallCompleted: (call: VoiceCall) => void;
}

export function InboundReceptionistTab({
  receptionistAgent,
  onSaveAgent,
  onCallCompleted,
}: InboundReceptionistTabProps) {
  // Simulator State
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<CallTranscriptTurn[]>([]);
  const [userInput, setUserInput] = useState("");
  const [detectedIntent, setDetectedIntent] = useState<string>("Call Started");
  const [leadOutcome, setLeadOutcome] = useState<string>("In Progress");

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editedGreeting, setEditedGreeting] = useState(receptionistAgent.firstMessage);
  const [editedTransfer, setEditedTransfer] = useState(receptionistAgent.transferPhoneNumber || "+1 (555) 019-2831");
  const [isActive, setIsActive] = useState(receptionistAgent.status === "active");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const micControllerRef = useRef<{ stop: () => void } | null>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Duration timer
  useEffect(() => {
    if (isCalling) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCalling]);

  // Start Call Simulation
  const handleStartCall = () => {
    setIsCalling(true);
    setTranscript([]);
    setDetectedIntent("Greeting Caller");
    setLeadOutcome("Active Inbound Call");
    setIsAgentSpeaking(true);

    const firstTurn: CallTranscriptTurn = {
      role: "agent",
      text: receptionistAgent.firstMessage,
      timestamp: "00:01",
    };

    setTranscript([firstTurn]);

    if (!isMuted) {
      speakText(receptionistAgent.firstMessage, {
        onEnd: () => setIsAgentSpeaking(false),
      });
    } else {
      setTimeout(() => setIsAgentSpeaking(false), 2500);
    }

    toast.success("AI Receptionist picked up line 1");
  };

  // End Call Simulation
  const handleEndCall = () => {
    stopSpeaking();
    setIsCalling(false);
    setIsAgentSpeaking(false);

    if (transcript.length > 0) {
      const newCall: VoiceCall = {
        id: `call-sim-${Date.now()}`,
        agentId: receptionistAgent.id,
        agentName: receptionistAgent.name,
        direction: "inbound",
        fromNumber: "+1 (555) 234-5678",
        toNumber: "+1 (415) 890-3421",
        callerName: "Website Inbound Caller",
        status: "completed",
        durationSeconds: Math.max(callDuration, 24),
        sentiment: detectedIntent.includes("Appointment") || detectedIntent.includes("Price") ? "positive" : "neutral",
        qualificationStatus: detectedIntent.includes("Appointment") ? "booked_appointment" : "hot_lead",
        summary: `Caller simulated an inbound conversation with ${receptionistAgent.name}. Intent recognized: ${detectedIntent}. Action items auto-dispatched.`,
        transcript,
        actionItems: [
          `Call logged from Sandbox Session (${callDuration}s)`,
          `Detected Caller Intent: ${detectedIntent}`,
          "CRM Contact updated with call notes",
        ],
        costEstimate: Number(((callDuration / 60) * 0.04).toFixed(3)),
        startedAt: new Date(Date.now() - callDuration * 1000).toISOString(),
        endedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      onCallCompleted(newCall);
      toast.success("Call ended & logged to Call History with AI summary");
    }
  };

  // Send caller message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || userInput).trim();
    if (!text || !isCalling) return;

    setUserInput("");
    const userTimestamp = formatTime(callDuration);
    const userTurn: CallTranscriptTurn = {
      role: "caller",
      text,
      timestamp: userTimestamp,
    };

    setTranscript((prev) => [...prev, userTurn]);
    setIsAgentSpeaking(true);

    try {
      const response = await generateSimulatedAgentResponse(
        text,
        receptionistAgent.name,
        receptionistAgent.systemPrompt
      );

      const agentTimestamp = formatTime(callDuration + 2);
      const agentTurn: CallTranscriptTurn = {
        role: "agent",
        text: response.text,
        timestamp: agentTimestamp,
      };

      setTranscript((prev) => [...prev, agentTurn]);
      if (response.action) setDetectedIntent(response.action);
      if (response.qualification) {
        setLeadOutcome(
          response.qualification === "booked_appointment"
            ? "Appointment Slot Reserved"
            : response.qualification === "hot_lead"
            ? "Qualified Hot Lead"
            : "Inquiry Handled"
        );
      }

      if (!isMuted) {
        speakText(response.text, {
          onEnd: () => setIsAgentSpeaking(false),
        });
      } else {
        setTimeout(() => setIsAgentSpeaking(false), 2000);
      }
    } catch (err) {
      console.error("AI response failed:", err);
      setIsAgentSpeaking(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSaveSettings = () => {
    const updated: VoiceAgent = {
      ...receptionistAgent,
      status: isActive ? "active" : "inactive",
      firstMessage: editedGreeting,
      transferPhoneNumber: editedTransfer,
      updatedAt: new Date().toISOString(),
    };
    onSaveAgent(updated);
    setIsEditing(false);
    toast.success("AI Receptionist configuration updated successfully!");
  };

  const handleToggleMic = () => {
    if (!isCalling) {
      toast.info("Please start the call first to speak with the receptionist");
      return;
    }
    if (isListening) {
      micControllerRef.current?.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      toast.info("Listening to your voice... Speak now!");
      micControllerRef.current = startMicRecognition(
        (transcriptText) => {
          setIsListening(false);
          setUserInput(transcriptText);
          handleSendMessage(transcriptText);
        },
        () => setIsListening(false),
        () => {
          setIsListening(false);
          toast.error("Microphone permission or speech recognition error");
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* 24/7 Virtual Receptionist Banner & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">
                    {receptionistAgent.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
                      }`}
                    />
                    <span className="text-xs font-semibold text-muted-foreground">
                      {isActive ? "Online & Answering 24/7" : "Offline / Paused"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-semibold text-violet-400 hover:text-violet-300 underline cursor-pointer"
              >
                {isEditing ? "Cancel" : "Edit Config"}
              </button>
            </div>

            {/* Quick Status Chips */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-sky-400" /> Operating Schedule
                </span>
                <span className="font-semibold text-foreground">
                  24/7 / 365 Days
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <PhoneCall className="h-3.5 w-3.5 text-violet-400" /> Primary Line (DID)
                </span>
                <span className="font-mono font-semibold text-foreground">
                  +1 (415) 890-3421
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <PhoneForwarded className="h-3.5 w-3.5 text-amber-400" /> Human Transfer Line
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {receptionistAgent.transferPhoneNumber || "+1 (555) 019-2831"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" /> Voice Engine
                </span>
                <span className="font-semibold text-purple-400">
                  {receptionistAgent.voiceName}
                </span>
              </div>
            </div>

            {/* Editing Form */}
            {isEditing && (
              <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 space-y-3 pt-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Initial Voice Greeting:
                  </label>
                  <textarea
                    rows={3}
                    value={editedGreeting}
                    onChange={(e) => setEditedGreeting(e.target.value)}
                    className="w-full text-xs rounded-lg border border-border bg-card p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Human Fallback Forwarding Number:
                  </label>
                  <input
                    type="text"
                    value={editedTransfer}
                    onChange={(e) => setEditedTransfer(e.target.value)}
                    className="w-full text-xs rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Enable 24/7 Answering
                  </span>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 accent-violet-600 rounded cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="w-full mt-2 rounded-lg bg-violet-600 py-2 text-xs font-bold text-white hover:bg-violet-700 transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            )}

            {/* Active Greeting Box */}
            {!isEditing && (
              <div className="rounded-xl bg-muted/60 p-3.5 text-xs space-y-1.5 border border-border/60">
                <div className="flex items-center justify-between text-muted-foreground font-semibold">
                  <span>Current Audio Greeting</span>
                  <button
                    type="button"
                    onClick={() =>
                      speakText(receptionistAgent.firstMessage, { rate: 1.0 })
                    }
                    className="text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="h-3.5 w-3.5" /> Preview Voice
                  </button>
                </div>
                <p className="text-foreground italic leading-relaxed">
                  &ldquo;{receptionistAgent.firstMessage}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Interactive Call Sandbox (WebRTC / Mic Simulation) */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card shadow-sm flex flex-col h-[560px] overflow-hidden">
            {/* Sandbox Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Interactive Inbound Calling Sandbox
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Simulate a live phone call to test the AI Receptionist’s responses in real time
                  </p>
                </div>
              </div>

              {/* Call Controls & Status */}
              <div className="flex items-center gap-2">
                {isCalling && (
                  <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{formatTime(callDuration)}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? "Unmute voice audio" : "Mute voice audio"}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition"
                >
                  {isMuted ? <VolumeX className="h-4 w-4 text-amber-400" /> : <Volume2 className="h-4 w-4" />}
                </button>

                {!isCalling ? (
                  <button
                    type="button"
                    onClick={handleStartCall}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-sm cursor-pointer active:scale-95"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    Call AI Receptionist
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleEndCall}
                    className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-sm cursor-pointer active:scale-95"
                  >
                    <PhoneOff className="h-3.5 w-3.5" />
                    Hang Up
                  </button>
                )}
              </div>
            </div>

            {/* Live Audio Visualizer Bar when call is active */}
            {isCalling && (
              <div className="px-5 py-2 bg-violet-950/20 border-b border-violet-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-medium">AI Voice Status:</span>
                  {isAgentSpeaking ? (
                    <span className="inline-flex items-center gap-1.5 text-violet-400 font-semibold">
                      <span className="flex gap-0.5 items-center h-3">
                        <span className="h-3 w-1 bg-violet-400 animate-bounce rounded-full" />
                        <span className="h-2 w-1 bg-violet-400 animate-pulse rounded-full" />
                        <span className="h-3 w-1 bg-violet-400 animate-bounce rounded-full delay-100" />
                      </span>
                      Maya Speaking ({receptionistAgent.voiceName.split(" ")[0]})
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <Mic className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                      Listening to Caller...
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    Intent: <strong className="text-foreground">{detectedIntent}</strong>
                  </span>
                  <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-300">
                    {leadOutcome}
                  </span>
                </div>
              </div>
            )}

            {/* Live Transcript Dialogue Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 [scrollbar-width:thin]">
              {transcript.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                  <div className="h-14 w-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <PhoneCall className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-foreground text-sm">
                      Ready to Receive Inbound Calls
                    </h5>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Click &ldquo;Call AI Receptionist&rdquo; above to start a simulated voice conversation and test how it qualifies leads and books appointments.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartCall}
                    className="mt-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/25 hover:bg-violet-700 transition cursor-pointer"
                  >
                    Start Test Call Now
                  </button>
                </div>
              ) : (
                transcript.map((turn, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      turn.role === "caller" ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                      <span>{turn.role === "caller" ? "Caller (You)" : "AI Receptionist"}</span>
                      <span>•</span>
                      <span>{turn.timestamp}</span>
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                        turn.role === "caller"
                          ? "bg-violet-600 text-white rounded-br-none"
                          : "bg-muted text-foreground rounded-bl-none border border-border/80"
                      }`}
                    >
                      {turn.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={transcriptEndRef} />
            </div>

            {/* Quick Test Prompt Chips */}
            {isCalling && (
              <div className="px-4 py-2 border-t border-border/60 bg-muted/20 flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap [scrollbar-width:none]">
                <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                  Quick Inquiries:
                </span>
                <button
                  type="button"
                  onClick={() => handleSendMessage("Mujhe aapka AED 299 wala Complete Website aur Branding Package chahiye. Isme kya kya shamil hai?")}
                  className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
                >
                  🔥 AED 299 Website Package
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("Hi, I want to book an appointment tomorrow at 11 AM.")}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] hover:border-violet-500 hover:text-violet-400 transition cursor-pointer"
                >
                  📅 Book Appointment
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("What are your monthly pricing packages and plans?")}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] hover:border-violet-500 hover:text-violet-400 transition cursor-pointer"
                >
                  💰 Pricing Packages
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("Assalam-o-Alaikum! Jeose Services ke calling plans aur features kya hain?")}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] hover:border-violet-500 hover:text-violet-400 transition cursor-pointer"
                >
                  🇵🇰 Urdu + English Test
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("I need to speak to the doctor or manager immediately.")}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] hover:border-violet-500 hover:text-violet-400 transition cursor-pointer"
                >
                  ⚡ Connect to Human
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 border-t border-border bg-card">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  disabled={!isCalling}
                  onClick={handleToggleMic}
                  title={isListening ? "Listening... click to stop" : "Speak into microphone"}
                  className={`h-9 w-9 rounded-xl border flex items-center justify-center transition cursor-pointer shrink-0 ${
                    isListening
                      ? "bg-rose-600 text-white border-rose-600 animate-pulse shadow-md shadow-rose-600/30"
                      : "border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Mic className="h-4 w-4" />
                </button>

                <input
                  type="text"
                  disabled={!isCalling}
                  placeholder={
                    isCalling
                      ? isListening
                        ? "Listening to your voice... Speak now!"
                        : "Type or use mic to talk to Maya..."
                      : "Start the call above to speak with Maya"
                  }
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="flex-1 rounded-xl border border-border bg-muted/50 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={!isCalling || !userInput.trim()}
                  className="rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-40 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
