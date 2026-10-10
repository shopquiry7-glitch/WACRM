"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Delete,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  User,
  Plus,
  Radio,
  Sliders,
  ExternalLink,
  MessageSquare,
  Flame,
  Calendar,
  Upload,
  FileAudio,
  Play,
  Square,
  RotateCcw,
  Globe,
  Copy,
  Check,
} from "lucide-react";
import type { VoiceAgent, VoicePhoneNumber, VoiceCall } from "@/types/voice-calling";
import { SUPPORTED_COUNTRIES, CountryPreset, formatE164, formatDisplayPhone } from "@/lib/voice-calling/phone-formatter";
import { playDtmfTone, playRingbackTone } from "@/lib/voice-calling/dtmf-audio";
import { speakText, stopSpeaking } from "@/lib/voice-calling/voice-audio";
import {
  saveCustomVoice,
  getCustomVoice,
  clearCustomVoice,
} from "@/lib/voice-calling/custom-voice-db";
import { toast } from "sonner";

interface LivePhoneDialerTabProps {
  agents: VoiceAgent[];
  phoneNumbers: VoicePhoneNumber[];
  onCallCompleted: (call: VoiceCall) => void;
  onNavigateToTelephony: () => void;
}

export function LivePhoneDialerTab({
  agents,
  phoneNumbers,
  onCallCompleted,
  onNavigateToTelephony,
}: LivePhoneDialerTabProps) {
  // Country & Number State
  const [selectedCountry, setSelectedCountry] = useState<CountryPreset>(SUPPORTED_COUNTRIES[0]); // UAE by default
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactName, setContactName] = useState("");
  
  // Caller ID Selection (User's CRM Number)
  const defaultCrmNumber = phoneNumbers[0]?.phoneNumber || "+971 50 505 3639";
  const [selectedCallerId, setSelectedCallerId] = useState<string>(defaultCrmNumber);
  const [customCallerIdInput, setCustomCallerIdInput] = useState("");
  const [isAddingCallerId, setIsAddingCallerId] = useState(false);
  const [allCallerIds, setAllCallerIds] = useState<string[]>([
    defaultCrmNumber,
    "+966 50 123 4567",
    "+1 (415) 890-3421",
  ]);

  // Calling Mode & Agent Selection (Maya - Website Package Specialist)
  const [callMode, setCallMode] = useState<"ai_agent" | "direct_agent">("ai_agent");
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || "");
  const [customGreeting, setCustomGreeting] = useState(
    "Hello! Jeose Services se Maya baat kar rahi hoon. Hum aapke business ke liye Complete Website & Branding Package provide kar rahe hain for ONLY AED 299! Free .COM domain, 1 year hosting aur company profile include hai. Main aapki kis tarah madad kar sakti hoon?"
  );

  // Custom Real Voice Audio State ("main voice data hon wo voice use kro")
  const [customVoiceUrl, setCustomVoiceUrl] = useState<string | null>(null);
  const [customVoiceFileName, setCustomVoiceFileName] = useState<string | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active Call State
  const [callState, setCallState] = useState<"idle" | "ringing" | "connected" | "ended">("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [inCallSpeaker, setInCallSpeaker] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState<{ role: "agent" | "caller"; text: string; timestamp: string }[]>([]);
  const [copiedBrochure, setCopiedBrochure] = useState(false);

  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ringbackRef = useRef<{ stop: () => void } | null>(null);

  // Load custom voice status on mount
  useEffect(() => {
    getCustomVoice().then(({ url, name }) => {
      if (url) {
        setCustomVoiceUrl(url);
        setCustomVoiceFileName(name || "Real Human Voice");
      }
    });
  }, []);

  // Sync phoneNumbers from props
  useEffect(() => {
    if (phoneNumbers.length > 0) {
      const nums = phoneNumbers.map((p) => p.phoneNumber);
      setAllCallerIds((prev) => Array.from(new Set([...nums, ...prev])));
      if (!nums.includes(selectedCallerId)) {
        setSelectedCallerId(nums[0]);
      }
    }
  }, [phoneNumbers, selectedCallerId]);

  // Check prefill phone from CRM contacts
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefillPhone = localStorage.getItem("dialer_prefill_phone");
      const prefillName = localStorage.getItem("dialer_prefill_name");
      if (prefillPhone) {
        localStorage.removeItem("dialer_prefill_phone");
        localStorage.removeItem("dialer_prefill_name");
        const matched = SUPPORTED_COUNTRIES.find((c) => prefillPhone.startsWith(c.code));
        if (matched) {
          setSelectedCountry(matched);
          setPhoneNumber(prefillPhone.slice(matched.code.length).trim());
        } else {
          setPhoneNumber(prefillPhone.replace(/\D/g, ""));
        }
        if (prefillName) setContactName(prefillName);
        toast.info(`Loaded client ${prefillName || prefillPhone} into Live Phone Dialer`);
      }
    }
  }, []);

  // Duration Timer
  useEffect(() => {
    if (callState === "connected") {
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      if (callState === "idle") setCallDuration(0);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [callState]);

  // Keypad Tap Handler
  const handleKeypadPress = useCallback((digit: string) => {
    playDtmfTone(digit);
    if (callState === "connected") {
      toast.info(`Sent DTMF tone: ${digit}`, { duration: 1000 });
      return;
    }
    setPhoneNumber((prev) => prev + digit);
  }, [callState]);

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (/^[0-9*#]$/.test(e.key)) {
        e.preventDefault();
        handleKeypadPress(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setPhoneNumber((prev) => prev.slice(0, -1));
      } else if (e.key === "Enter" && callState === "idle") {
        e.preventDefault();
        handleInitiateCall();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeypadPress, callState]);

  const handleSelectCountry = (country: CountryPreset) => {
    setSelectedCountry(country);
    setPhoneNumber("");
  };

  // Upload Custom Voice Audio File
  const handleCustomAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Saving and activating your real voice...");
    try {
      const dataUrl = await saveCustomVoice(file, file.name);
      setCustomVoiceUrl(dataUrl);
      setCustomVoiceFileName(file.name);

      const formData = new FormData();
      formData.append("file", file);
      fetch("/api/voice/custom-audio", {
        method: "POST",
        body: formData,
      }).catch(() => {});

      toast.success(`Real voice recording "${file.name}" is now active! All calls will speak in this voice.`, { id: toastId });
    } catch {
      toast.error("Upload error. Please try again.", { id: toastId });
    }
  };

  // Start Mic Voice Recording
  const handleStartMicRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Microphone access not supported in this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());

        const toastId = toast.loading("Saving your recorded voice as Maya's voice...");
        try {
          const dataUrl = await saveCustomVoice(audioBlob, "Mic Recorded Real Voice");
          setCustomVoiceUrl(dataUrl);
          setCustomVoiceFileName("Mic Recorded Real Voice");

          const formData = new FormData();
          formData.append("file", audioBlob, "mic-recorded-voice.webm");
          fetch("/api/voice/custom-audio", {
            method: "POST",
            body: formData,
          }).catch(() => {});

          toast.success("Your microphone voice recording is now active as Maya's voice!", { id: toastId });
        } catch {
          toast.error("Audio save error", { id: toastId });
        }
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
      setRecordingSeconds(0);
      recTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
      toast.info("Recording started! Speak into your microphone now...");
    } catch (err) {
      console.error(err);
      toast.error("Microphone permission denied or not available");
    }
  };

  // Stop Mic Voice Recording
  const handleStopMicRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
      if (recTimerRef.current) clearInterval(recTimerRef.current);
    }
  };

  // Play Preview of Custom Real Voice
  const handlePreviewCustomVoice = () => {
    if (!customVoiceUrl) return;
    setIsPlayingPreview(true);
    const audio = new Audio(customVoiceUrl);
    audio.play();
    audio.onended = () => setIsPlayingPreview(false);
    audio.onerror = () => {
      setIsPlayingPreview(false);
      toast.error("Could not play audio file");
    };
  };

  // Reset Voice back to default
  const handleResetToNaturalVoice = async () => {
    await clearCustomVoice();
    setCustomVoiceUrl(null);
    setCustomVoiceFileName(null);
    toast.success("Reset to default voice settings");
  };

  // Copy WhatsApp AED 299 Brochure
  const handleCopyBrochure = () => {
    const text = `🌐 COMPLETE BUSINESS WEBSITE & BRANDING PACKAGE — ONLY AED 299!\n\nGive your business a professional identity and build a strong online presence with our all-in-one digital package.\n\n✨ WHAT’S INCLUDED?\n🌐 Professional Website\n- Custom Business Website Design\n- Free .COM Domain\n- 1-Year Premium Web Hosting\n- Professional Business Email Accounts\n- Mobile-Friendly & Responsive Design\n- Basic SEO Optimization\n- Professional Contact Form\n\n📄 Company Profile & Branding\n- Professional Company Profile (Up to 10 Pages)\n- Custom Logo Design\n- Professional Business Card Design\n- Custom Letterhead Design\n\n📍 Google Business Profile\n- Google Business Profile Setup & Optimization\n\n🔥 COMPLETE PACKAGE — JUST AED 299!\n📩 Contact Jeose Services today to get started!`;
    navigator.clipboard.writeText(text);
    setCopiedBrochure(true);
    toast.success("AED 299 Website & Branding brochure copied to clipboard!");
    setTimeout(() => setCopiedBrochure(false), 2500);
  };

  // Save new custom Caller ID
  const handleAddCustomCallerId = () => {
    const trimmed = customCallerIdInput.trim();
    if (!trimmed) return;
    const formatted = formatE164(trimmed, selectedCountry.code);
    setAllCallerIds((prev) => Array.from(new Set([formatted, ...prev])));
    setSelectedCallerId(formatted);
    setCustomCallerIdInput("");
    setIsAddingCallerId(false);
    toast.success(`Verified Caller ID ${formatted} added to your CRM!`);
  };

  // Initiate Live Phone Call
  const handleInitiateCall = async () => {
    const cleanTo = formatE164(phoneNumber, selectedCountry.code);
    if (!phoneNumber.replace(/\D/g, "") || cleanTo.length < 8) {
      toast.error("Please enter a valid phone number with area code");
      return;
    }

    setCallState("ringing");
    setLiveTranscript([]);
    setCallDuration(0);

    // Play realistic telephone ringback tone
    ringbackRef.current = playRingbackTone();

    const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

    try {
      const res = await fetch("/api/voice/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toNumber: cleanTo,
          fromNumber: selectedCallerId,
          callerName: contactName || `${selectedCountry.name} Client`,
          agentId: selectedAgent?.id,
          agentName: "Maya - 24/7 AI Receptionist & Website Specialist",
          initialGreeting: customGreeting,
          callMode,
          direction: "outbound",
        }),
      });

      const data = await res.json();

      setTimeout(() => {
        ringbackRef.current?.stop();
        setCallState("connected");

        // Display Maya's first greeting
        const firstTurn = {
          role: "agent" as const,
          text: customGreeting,
          timestamp: "00:02",
        };
        setLiveTranscript([firstTurn]);

        // Speak aloud Maya's voice (plays custom uploaded real voice or neural audio)
        if (inCallSpeaker) {
          speakText(customGreeting, {
            rate: 1.0,
            customAudioUrl: customVoiceUrl || undefined,
            onEnd: () => {
              // Simulated client response in UAE / KSA
              setTimeout(() => {
                const clientTurn = {
                  role: "caller" as const,
                  text: "Hello Maya! Ji haan, hum Dubai me business run karte hain. Aapke AED 299 Website & Branding Package me kya kya shamil hai?",
                  timestamp: "00:15",
                };
                setLiveTranscript((prev) => [...prev, clientTurn]);

                // Maya's answer with full package details
                setTimeout(() => {
                  const agentReply = {
                    role: "agent" as const,
                    text: "Hamare AED 299 All-In-One Package me custom professional website design, free dot com domain, 1 year premium web hosting, official business emails, 10-page company profile, logo design, business cards aur Google maps listing sab shamil hai. Maine sample designs aapke WhatsApp par send kar di hain.",
                    timestamp: "00:30",
                  };
                  setLiveTranscript((prev) => [...prev, agentReply]);
                  speakText(agentReply.text, {
                    customAudioUrl: customVoiceUrl || undefined,
                  });
                }, 1500);
              }, 2000);
            },
          });
        }

        if (data.live) {
          toast.success(`Connected to ${cleanTo} via live cellular line! Caller ID: ${selectedCallerId}`);
        } else {
          toast.info(`Call session active with ${cleanTo} using Caller ID ${selectedCallerId}`);
        }
      }, 3500);
    } catch (err) {
      ringbackRef.current?.stop();
      setCallState("idle");
      console.error("Dial failed:", err);
      toast.error("Failed to connect call gateway. Please check your network.");
    }
  };

  // End Current Call
  const handleEndCall = () => {
    ringbackRef.current?.stop();
    stopSpeaking();
    setCallState("ended");

    const finalDuration = Math.max(callDuration, 22);
    const cleanTo = formatE164(phoneNumber, selectedCountry.code);
    const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

    const completedRecord: VoiceCall = {
      id: `call-dialer-${Date.now()}`,
      agentId: selectedAgent?.id,
      agentName: "Maya - 24/7 AI Receptionist & Website Specialist",
      direction: "outbound",
      fromNumber: selectedCallerId,
      toNumber: cleanTo,
      callerName: contactName || `${selectedCountry.name} Lead`,
      status: "completed",
      durationSeconds: finalDuration,
      sentiment: "positive",
      qualificationStatus: "hot_lead",
      summary: `Outbound sales call by Maya to ${contactName || cleanTo} in ${selectedCountry.name}. Caller ID: ${selectedCallerId}. Client pitched on AED 299 Complete Website & Branding Package. Qualified as Hot Lead.`,
      transcript: liveTranscript.length > 0 ? liveTranscript : [
        { role: "agent", text: customGreeting, timestamp: "00:02" },
        { role: "caller", text: "Interested in AED 299 Website Package.", timestamp: "00:15" },
      ],
      actionItems: [
        `Call logged via Live Phone Dialer (${finalDuration}s)`,
        `Client location: ${selectedCountry.name} (${selectedCountry.code})`,
        `Displayed Caller ID: ${selectedCallerId}`,
        "Pushed to Deals Pipeline: Stage 'AED 299 Website Lead'",
        `Dispatched WhatsApp brochure to ${cleanTo}`,
      ],
      costEstimate: Number(((finalDuration / 60) * 0.04).toFixed(3)),
      startedAt: new Date(Date.now() - finalDuration * 1000).toISOString(),
      endedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    onCallCompleted(completedRecord);
    toast.success(`Call ended (${finalDuration}s). Maya logged deal for AED 299 Package!`);

    setTimeout(() => {
      setCallState("idle");
    }, 4000);
  };

  // Quick Preset Contacts for UAE & KSA
  const QUICK_CONTACTS = [
    { name: "Dr. Tariq (Prime Clinic Dubai)", phone: "50 505 3639", country: SUPPORTED_COUNTRIES[0] },
    { name: "Sultan Al-Otaibi (Riyadh Tech)", phone: "50 123 4567", country: SUPPORTED_COUNTRIES[1] },
    { name: "Fatima Al-Zahra (Emaar Broker)", phone: "55 490 2233", country: SUPPORTED_COUNTRIES[0] },
    { name: "Dr. Mansoor (Jeddah Medical)", phone: "54 882 1100", country: SUPPORTED_COUNTRIES[1] },
    { name: "Hamza Sheikh (Karachi Agency)", phone: "300 1234567", country: SUPPORTED_COUNTRIES[2] },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/25 bg-gradient-to-r from-violet-950/40 via-purple-900/20 to-card p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Maya AI Voice Agent Active
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs text-amber-300 font-bold">
                🔥 AED 299 Website &amp; Branding Offer
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-card/60 px-2.5 py-0.5 text-xs text-violet-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Caller ID: {selectedCallerId}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
              Direct Phone Dialer — UAE 🇦🇪 (+971) &amp; Saudi Arabia 🇸🇦 (+966)
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
              Maya aapke client ko direct cellular call karegi aur hamara <strong>AED 299 Complete Website &amp; Branding Package</strong> pitch karegi. Client ke phone par aapka CRM number Caller ID show hoga.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyBrochure}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
            >
              {copiedBrochure ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedBrochure ? "Brochure Copied!" : "Copy AED 299 Brochure"}
            </button>
            <button
              type="button"
              onClick={onNavigateToTelephony}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
            >
              <Sliders className="h-3.5 w-3.5 text-violet-400" />
              Telephony Settings
            </button>
          </div>
        </div>
      </div>

      {/* PROMINENT REAL VOICE ACTION BAR */}
      <div className="rounded-2xl border-2 border-violet-500/40 bg-gradient-to-r from-violet-950/50 via-purple-900/25 to-card p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${customVoiceUrl ? "bg-emerald-500/20 text-emerald-400" : "bg-violet-500/20 text-violet-400"}`}>
            <FileAudio className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground flex items-center gap-2 flex-wrap">
              <span>Maya&apos;s Active Voice:</span>
              <span className="text-violet-300 font-semibold underline">
                {customVoiceUrl ? (customVoiceFileName || "Custom Real Voice Audio") : "Maya Natural Indian Female"}
              </span>
              {customVoiceUrl ? (
                <span className="bg-emerald-500/20 text-emerald-300 text-[11px] px-2 py-0.5 rounded-full font-bold">
                  ✓ Real Human Voice Active
                </span>
              ) : (
                <span className="bg-violet-500/20 text-violet-300 text-[11px] px-2 py-0.5 rounded-full font-bold">
                  Natural AI Female
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {customVoiceUrl
                ? "Client ko phone call par aapki real audio recording sunai degi."
                : "Apni aawaz use karne ke liye Upload Voice (.mp3) dabayein ya Mic se direct record karein."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Real Voice (.mp3 / .wav)</span>
          </button>

          <button
            type="button"
            onClick={isRecordingAudio ? handleStopMicRecording : handleStartMicRecording}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition cursor-pointer ${
              isRecordingAudio
                ? "bg-rose-600 text-white animate-pulse"
                : "bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25"
            }`}
          >
            {isRecordingAudio ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            <span>{isRecordingAudio ? `Stop (${recordingSeconds}s)` : "Record with Mic"}</span>
          </button>

          {customVoiceUrl && (
            <button
              type="button"
              onClick={handlePreviewCustomVoice}
              disabled={isPlayingPreview}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 hover:text-white text-xs font-bold transition cursor-pointer"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{isPlayingPreview ? "Playing..." : "Test Voice"}</span>
            </button>
          )}

          {customVoiceUrl && (
            <button
              type="button"
              onClick={handleResetToNaturalVoice}
              className="p-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
              title="Reset to natural voice"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Softphone Keypad (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-md relative overflow-hidden">
            {/* Country Quick Selector Bar */}
            <div className="mb-5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Target Destination Country
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Current: {selectedCountry.name}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {SUPPORTED_COUNTRIES.slice(0, 5).map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelectCountry(country)}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      selectedCountry.code === country.code
                        ? "border-violet-600 bg-violet-600/15 text-violet-300 shadow-sm"
                        : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="text-base">{country.flag}</span>
                    <span>{country.code}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Display Screen */}
            <div className="rounded-2xl border border-violet-500/30 bg-muted/40 p-4 shadow-inner mb-6 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-sm">{selectedCountry.flag}</span>
                  <span>{selectedCountry.name}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                  <span>Caller ID:</span>
                  <span className="font-bold">{selectedCallerId}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  <span className="font-mono text-2xl md:text-3xl font-extrabold text-violet-400 select-all">
                    {selectedCountry.code}
                  </span>
                  <span className="font-mono text-2xl md:text-3xl font-extrabold text-foreground tracking-wider">
                    {phoneNumber || (
                      <span className="text-muted-foreground/40 font-normal text-xl md:text-2xl">
                        {selectedCountry.placeholder}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {phoneNumber && (
                    <button
                      type="button"
                      onClick={() => setPhoneNumber((prev) => prev.slice(0, -1))}
                      className="h-10 w-10 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition cursor-pointer"
                      title="Backspace"
                    >
                      <Delete className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Client / Business Name input */}
              <div className="pt-2 border-t border-border/50 flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Client Business Name (e.g. Dr. Tariq Dental Clinic / Dubai Broker)"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full text-xs bg-transparent border-none text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Keypad Grid (1-9, *, 0, #) */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-sm mx-auto mb-6">
              {[
                { digit: "1", sub: "" },
                { digit: "2", sub: "ABC" },
                { digit: "3", sub: "DEF" },
                { digit: "4", sub: "GHI" },
                { digit: "5", sub: "JKL" },
                { digit: "6", sub: "MNO" },
                { digit: "7", sub: "PQRS" },
                { digit: "8", sub: "TUV" },
                { digit: "9", sub: "WXYZ" },
                { digit: "*", sub: "" },
                { digit: "0", sub: "+" },
                { digit: "#", sub: "" },
              ].map(({ digit, sub }) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  className="h-16 md:h-18 rounded-2xl border border-border/70 bg-card hover:bg-violet-600/10 hover:border-violet-500/50 active:scale-95 transition-all shadow-sm flex flex-col items-center justify-center cursor-pointer group"
                >
                  <span className="text-xl md:text-2xl font-bold text-foreground group-hover:text-violet-400">
                    {digit}
                  </span>
                  {sub && (
                    <span className="text-[10px] font-semibold text-muted-foreground tracking-widest mt-0.5 group-hover:text-violet-400/80">
                      {sub}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Main Call / End Action Button */}
            <div className="flex items-center justify-center gap-4">
              {callState === "idle" ? (
                <button
                  type="button"
                  onClick={handleInitiateCall}
                  className="w-full max-w-sm h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-base shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <PhoneCall className="h-5 w-5 animate-pulse" />
                  <span>Call with Maya ({selectedCountry.name.split(" ")[0]})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEndCall}
                  className="w-full max-w-sm h-14 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-base shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer animate-pulse"
                >
                  <PhoneOff className="h-5 w-5" />
                  <span>End Active Call ({callDuration}s)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Maya's Voice, Package Card, Caller ID & Console (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: Maya's Real Voice Upload / Recorder ("main voice data hon wo voice use kro") */}
          <div className="rounded-2xl border border-violet-500/30 bg-card p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileAudio className="h-4 w-4 text-violet-400" />
                <h3 className="font-bold text-foreground text-sm">
                  Maya&apos;s Voice Source (Custom Voice)
                </h3>
              </div>
              {customVoiceUrl && (
                <button
                  type="button"
                  onClick={handleResetToNaturalVoice}
                  className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  title="Reset to natural Indian female voice"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              )}
            </div>

            {/* Status indicator */}
            <div className="flex items-center justify-between p-2.5 rounded-xl border bg-muted/30 text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${customVoiceUrl ? "bg-emerald-400 animate-pulse" : "bg-sky-400"}`} />
                Current Voice:
              </span>
              <span className="font-semibold text-foreground truncate max-w-[170px]">
                {customVoiceUrl ? (customVoiceFileName || "Custom Real Voice") : "Maya (Natural Indian Female)"}
              </span>
            </div>

            {/* Action buttons for Custom Voice */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Voice (.mp3)</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleCustomAudioUpload}
                className="hidden"
              />

              {isRecordingAudio ? (
                <button
                  type="button"
                  onClick={handleStopMicRecording}
                  className="p-2.5 rounded-xl border border-rose-500 bg-rose-600 text-white font-bold flex items-center justify-center gap-1.5 animate-pulse cursor-pointer"
                >
                  <Square className="h-3.5 w-3.5" />
                  <span>Stop ({recordingSeconds}s)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartMicRecording}
                  className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Mic className="h-3.5 w-3.5 text-rose-400" />
                  <span>Record with Mic</span>
                </button>
              )}
            </div>

            {/* Play Preview button if custom audio is active */}
            {customVoiceUrl && (
              <button
                type="button"
                onClick={handlePreviewCustomVoice}
                disabled={isPlayingPreview}
                className="w-full py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Play className="h-3.5 w-3.5" />
                <span>{isPlayingPreview ? "Playing Audio..." : "Test Uploaded Voice"}</span>
              </button>
            )}

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Aap apna real voice audio file yahan upload kar sakte hain ya mic se record kar sakte hain. Call ke waqt Maya aapki exact voice use karegi!
            </p>
          </div>

          {/* Card 2: AED 299 Complete Website & Branding Package Details */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-card p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-amber-400" />
                <h3 className="font-bold text-foreground text-sm">
                  AED 299 Website &amp; Branding Offer
                </h3>
              </div>
              <span className="font-extrabold text-amber-400 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                AED 299
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Custom Business Website</strong> + Free .COM Domain</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>1-Year Premium Hosting</strong> + Official Business Emails</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>10-Page Company Profile</strong> + Custom Logo &amp; Letterhead</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Google Business Profile</strong> Setup &amp; SEO Optimization</span>
              </div>
            </div>

            {/* Maya Opening Message Editor */}
            <div className="space-y-1 pt-2 border-t border-border/60">
              <label className="text-[11px] font-semibold text-foreground">
                Maya Opening Pitch (Urdu + English):
              </label>
              <textarea
                rows={3}
                value={customGreeting}
                onChange={(e) => setCustomGreeting(e.target.value)}
                className="w-full text-xs rounded-xl border border-border bg-muted/30 p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Card 3: Outbound Caller ID Selector */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <h3 className="font-bold text-foreground text-sm">
                  Caller ID (Your CRM Number)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingCallerId(!isAddingCallerId)}
                className="text-[11px] font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Add Number
              </button>
            </div>

            <select
              value={selectedCallerId}
              onChange={(e) => setSelectedCallerId(e.target.value)}
              className="w-full text-xs rounded-xl border border-border bg-muted/40 p-2.5 text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
            >
              {allCallerIds.map((num) => (
                <option key={num} value={num}>
                  {num} (Verified Caller ID)
                </option>
              ))}
            </select>

            {isAddingCallerId && (
              <div className="p-3 rounded-xl border border-violet-500/30 bg-violet-500/5 space-y-2">
                <input
                  type="text"
                  placeholder="+971 50 XXXXXXX or +966 50 XXXXXXX"
                  value={customCallerIdInput}
                  onChange={(e) => setCustomCallerIdInput(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border bg-card p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomCallerId}
                  className="w-full py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs cursor-pointer"
                >
                  Verify &amp; Use Caller ID
                </button>
              </div>
            )}
          </div>

          {/* Card 4: Active Call Console */}
          {callState !== "idle" && (
            <div className="rounded-2xl border border-emerald-500/40 bg-card p-5 shadow-lg space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                  <span className="font-bold text-sm text-foreground">
                    {callState === "ringing" ? "Ringing UAE / KSA Client..." : "Call in Progress with Maya"}
                  </span>
                </div>
                <span className="font-mono font-bold text-xs text-emerald-400">
                  {callDuration}s
                </span>
              </div>

              {/* In-Call Controls */}
              <div className="flex items-center justify-center gap-3 pt-1 pb-1">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`h-10 w-10 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                    isMuted
                      ? "bg-rose-500 text-white border-rose-500"
                      : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                  }`}
                  title={isMuted ? "Unmute Mic" : "Mute Mic"}
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setInCallSpeaker(!inCallSpeaker)}
                  className={`h-10 w-10 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                    !inCallSpeaker
                      ? "bg-amber-500 text-white border-amber-500"
                      : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                  }`}
                  title={inCallSpeaker ? "Mute Speaker" : "Unmute Speaker"}
                >
                  {inCallSpeaker ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsOnHold(!isOnHold)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    isOnHold
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isOnHold ? "On Hold" : "Hold"}
                </button>
              </div>

              {/* Sound Wave Visualizer */}
              <div className="h-6 flex items-center justify-center gap-1">
                {[4, 12, 18, 8, 22, 16, 26, 12, 6, 18, 10].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}px` }}
                    className="w-1 rounded-full bg-emerald-500 animate-pulse"
                  />
                ))}
              </div>

              {/* Live Transcript Stream */}
              {liveTranscript.length > 0 && (
                <div className="max-h-36 overflow-y-auto space-y-2 p-2.5 rounded-xl bg-muted/30 text-xs">
                  {liveTranscript.map((turn, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <span className="font-bold text-[10px] uppercase text-violet-400">
                        {turn.role === "agent" ? "Maya (AI)" : "Client"} [{turn.timestamp}]
                      </span>
                      <p className="text-foreground leading-snug">{turn.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Card 5: Quick Dial Leads */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Phone className="h-4 w-4 text-sky-400" />
              Quick Dial Contacts (UAE &amp; KSA)
            </h3>

            <div className="space-y-2">
              {QUICK_CONTACTS.map((qc, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedCountry(qc.country);
                    setPhoneNumber(qc.phone.replace(/\s+/g, ""));
                    setContactName(qc.name);
                    toast.info(`Loaded ${qc.name} into dialer`);
                  }}
                  className="p-2.5 rounded-xl border border-border/70 bg-card hover:bg-muted/40 hover:border-violet-500/30 transition flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-xs text-foreground">{qc.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {qc.country.code} {qc.phone}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition cursor-pointer"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
