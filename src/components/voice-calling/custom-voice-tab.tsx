"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Mic,
  Square,
  Play,
  Pause,
  Volume2,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  FileAudio,
  Copy,
  Check,
  ArrowRight,
  Headphones,
  Info,
  Key,
  MessageSquare,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import {
  saveCustomVoice,
  getCustomVoice,
  clearCustomVoice,
  saveElevenLabsApiKey,
  DEFAULT_ELEVENLABS_KEY,
} from "@/lib/voice-calling/custom-voice-db";
import { speakText, stopSpeaking, playSampleRecording } from "@/lib/voice-calling/voice-audio";

interface CustomVoiceTabProps {
  onNavigateToDialer: () => void;
}

export function CustomVoiceTab({ onNavigateToDialer }: CustomVoiceTabProps) {
  // Cloned Voice State
  const [customVoiceUrl, setCustomVoiceUrl] = useState<string | null>(null);
  const [customVoiceFileName, setCustomVoiceFileName] = useState<string | null>(null);
  const [customVoiceId, setCustomVoiceId] = useState<string | null>(null);
  const [customVoiceProvider, setCustomVoiceProvider] = useState<"elevenlabs" | "neural" | null>("neural");
  const [isUploading, setIsUploading] = useState(false);
  const [isCloningElevenLabs, setIsCloningElevenLabs] = useState(false);

  // ElevenLabs API Key state
  const [elevenlabsKey, setElevenlabsKey] = useState(DEFAULT_ELEVENLABS_KEY);
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Mic recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Raw Sample preview player state
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const sampleControllerRef = useRef<{ stop: () => void } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dynamic Text-To-Speech Testing Studio State
  const [testText, setTestText] = useState(
    "Assalam-o-Alaikum! Jeose Services se Maya baat kar rahi hoon. Hamara Complete Business Website aur Branding Package sirf AED 299 ka hai! Kya main WhatsApp par demo link bhej doon?"
  );
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const ttsControllerRef = useRef<{ cancel: () => void } | null>(null);

  // Script copy state
  const [copiedScript, setCopiedScript] = useState(false);

  // Load custom voice status on mount
  useEffect(() => {
    getCustomVoice().then(({ url, name, voiceId, provider, apiKey }) => {
      if (url || voiceId) {
        setCustomVoiceUrl(url);
        setCustomVoiceFileName(name || "Real Human Voice");
        setCustomVoiceId(voiceId);
        setCustomVoiceProvider(provider);
        if (apiKey) setElevenlabsKey(apiKey);
      }
    });
  }, []);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error("File is too large. Please upload an audio file under 25MB.");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(`Cloning voice from "${file.name}"...`);

    try {
      const record = await saveCustomVoice(file, file.name, {
        apiKey: elevenlabsKey || DEFAULT_ELEVENLABS_KEY,
      });

      setCustomVoiceUrl(record.dataUrl);
      setCustomVoiceFileName(record.name);

      // Call backend clone endpoint
      const formData = new FormData();
      formData.append("file", file);
      const effectiveKey = elevenlabsKey || DEFAULT_ELEVENLABS_KEY;
      if (effectiveKey) formData.append("apiKey", effectiveKey);
      formData.append("voiceName", `Maya (${file.name})`);

      const res = await fetch("/api/voice/clone", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.voiceId && data.voiceId !== "neural_custom_clone") {
        setCustomVoiceId(data.voiceId);
        setCustomVoiceProvider("elevenlabs");
        saveElevenLabsApiKey(effectiveKey);
        localStorage.setItem("custom_maya_voice_id", data.voiceId);
        localStorage.setItem("custom_maya_voice_provider", "elevenlabs");
        toast.success(
          `🎉 Voice Successfully Cloned! Voice ID: ${data.voiceId}. Maya can now speak any dynamic text in this voice!`,
          { id: toastId, duration: 6000 }
        );
      } else if (data.error) {
        toast.error(data.error, { id: toastId, duration: 8000 });
      } else {
        toast.success(
          `Aawaz profile saved! Maya sirf yeh aawaz use karegi aur dynamic text bolegi.`,
          { id: toastId, duration: 4000 }
        );
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Voice processing error. Please try again.", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Clone from already saved/uploaded recording using ElevenLabs API
  const handleCloneWithElevenLabs = async () => {
    const keyToUse = elevenlabsKey || DEFAULT_ELEVENLABS_KEY;
    if (!keyToUse) {
      toast.error("Please enter your ElevenLabs API Key.");
      return;
    }

    setIsCloningElevenLabs(true);
    const toastId = toast.loading("Connecting to ElevenLabs to clone your voice sample...");

    try {
      const res = await fetch("/api/voice/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: keyToUse,
          voiceName: "Maya Urdu Real Cloned Voice",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.voiceId && data.voiceId !== "neural_custom_clone") {
        setCustomVoiceId(data.voiceId);
        setCustomVoiceProvider("elevenlabs");
        saveElevenLabsApiKey(keyToUse);
        localStorage.setItem("custom_maya_voice_id", data.voiceId);
        localStorage.setItem("custom_maya_voice_provider", "elevenlabs");
        toast.success(
          `🎉 Voice Cloned Successfully via ElevenLabs! Voice ID: ${data.voiceId}. Any call or text will now speak in this voice!`,
          { id: toastId, duration: 7000 }
        );
      } else {
        const errorMsg = data.error || "ElevenLabs cloning failed.";
        toast.error(errorMsg, {
          id: toastId,
          duration: 8000,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while connecting to ElevenLabs.", { id: toastId });
    } finally {
      setIsCloningElevenLabs(false);
    }
  };

  // Start Mic Recording
  const handleStartRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Microphone access is not supported in this browser.");
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

        const toastId = toast.loading("Analyzing and cloning your voice recording...");
        try {
          const effectiveKey = elevenlabsKey || DEFAULT_ELEVENLABS_KEY;
          const record = await saveCustomVoice(audioBlob, "Microphone Voice Recording", {
            apiKey: effectiveKey,
          });

          setCustomVoiceUrl(record.dataUrl);
          setCustomVoiceFileName("Microphone Voice Recording");

          // Backend clone call
          const formData = new FormData();
          formData.append("file", audioBlob, "mic-voice.webm");
          if (effectiveKey) formData.append("apiKey", effectiveKey);
          formData.append("voiceName", "Maya (Mic Recording)");

          const res = await fetch("/api/voice/clone", {
            method: "POST",
            body: formData,
          });

          const data = await res.json().catch(() => ({}));
          if (res.ok && data.success && data.voiceId && data.voiceId !== "neural_custom_clone") {
            setCustomVoiceId(data.voiceId);
            setCustomVoiceProvider("elevenlabs");
            saveElevenLabsApiKey(effectiveKey);
            localStorage.setItem("custom_maya_voice_id", data.voiceId);
            localStorage.setItem("custom_maya_voice_provider", "elevenlabs");
            toast.success(
              `🎉 Mic Voice Cloned with ElevenLabs! Voice ID: ${data.voiceId}. Maya will now speak any text in this voice!`,
              { id: toastId, duration: 6000 }
            );
          } else if (data.error) {
            toast.error(data.error, { id: toastId, duration: 8000 });
          } else {
            toast.success("Aawaz successfully clone ho gayi! Ab koi bhi text bol kar test karein.", {
              id: toastId,
              duration: 4000,
            });
          }
        } catch {
          toast.error("Error cloning voice recording", { id: toastId });
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
      toast.info("Recording started! Speak a few sentences to capture your voice timbre...");
    } catch (err) {
      console.error(err);
      toast.error("Microphone permission denied or device not found.");
    }
  };

  // Stop Mic Recording
  const handleStopRecording = () => {
    if (recTimerRef.current) {
      clearInterval(recTimerRef.current);
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Toggle Play Original Uploaded Reference Sample
  const togglePlaySample = () => {
    if (!customVoiceUrl) return;

    if (isPlayingSample) {
      sampleControllerRef.current?.stop();
      setIsPlayingSample(false);
    } else {
      stopSpeaking();
      ttsControllerRef.current?.cancel();
      setIsSynthesizing(false);

      sampleControllerRef.current = playSampleRecording(
        customVoiceUrl,
        () => setIsPlayingSample(true),
        () => setIsPlayingSample(false)
      );
    }
  };

  // DYNAMIC TEXT-TO-SPEECH TEST: Speak ANY text dynamically using the cloned voice!
  const handleSpeakDynamicText = () => {
    const trimmed = testText.trim();
    if (!trimmed) {
      toast.error("Please enter some text to speak.");
      return;
    }

    if (isSynthesizing) {
      ttsControllerRef.current?.cancel();
      stopSpeaking();
      setIsSynthesizing(false);
      return;
    }

    // Stop sample playback if active
    if (isPlayingSample) {
      sampleControllerRef.current?.stop();
      setIsPlayingSample(false);
    }

    setIsSynthesizing(true);
    const toastId = toast.loading("Synthesizing dynamic text in your cloned voice...");

    ttsControllerRef.current = speakText(trimmed, {
      voiceId: customVoiceId || undefined,
      apiKey: elevenlabsKey || undefined,
      onStart: () => {
        toast.dismiss(toastId);
      },
      onEnd: () => {
        setIsSynthesizing(false);
      },
      onError: (err) => {
        setIsSynthesizing(false);
        toast.error("Speech generation error. Please try again.", { id: toastId });
        console.warn(err);
      },
    });
  };

  // Save ElevenLabs API Key
  const handleSaveElevenLabsKey = () => {
    saveElevenLabsApiKey(elevenlabsKey);
    toast.success("ElevenLabs API Key saved for voice cloning!");
    setShowKeyInput(false);
  };

  // Reset to default Maya voice
  const handleReset = async () => {
    ttsControllerRef.current?.cancel();
    sampleControllerRef.current?.stop();
    stopSpeaking();
    await clearCustomVoice();
    setCustomVoiceUrl(null);
    setCustomVoiceFileName(null);
    setCustomVoiceId(null);
    setIsPlayingSample(false);
    setIsSynthesizing(false);
    toast.success("Reset to default Maya natural Indian voice.");
  };

  // Recommended Pitch Script for training/cloning
  const SCRIPT_TEXT = `Assalam-o-Alaikum! Jeose Services se Maya baat kar rahi hoon.

Hum aapke business ke liye Complete Business Website aur Branding Package offer kar rahe hain — sirf AED 299 me!

Is package mein include hai:
1. Custom Business Website Design
2. Free .COM Domain & 1-Year Hosting
3. Official Business Email Accounts
4. 10-Page Company Profile
5. Custom Logo Design & Business Cards
6. Google Business Profile Maps Setup & SEO

Kya main aapke WhatsApp number par complete proposal aur portfolio send kar doon?`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(SCRIPT_TEXT);
    setCopiedScript(true);
    toast.success("Recording script copied to clipboard!");
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-950/70 via-purple-900/35 to-card p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                AI Voice Cloning &amp; Dynamic TTS Engine
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs text-amber-300 font-bold">
                Maya AED 299 Package Specialist
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              🎙️ Voice Cloning Studio: Use Your Voice to Speak Any Text
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Apni real aawaz ka sample (<strong>.mp3 / .wav</strong>) yahan upload ya record karein. Maya <strong>sirf aapki aawaz ka lehja (voice clone)</strong> use karegi — poori recording play nahi hogi! Maya ko <strong>koi bhi naya text</strong> dein, wo usi aawaz mein bolega.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToDialer}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 px-5 py-3 text-sm font-extrabold text-white shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Open Phone Dialer</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Active Voice Status Card */}
      <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl ${
                customVoiceUrl || customVoiceId
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-violet-500/15 text-violet-400"
              }`}
            >
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Current Active Voice for Calls &amp; Speech
              </div>
              <div className="text-lg font-bold text-foreground flex items-center gap-2 flex-wrap">
                <span>
                  {customVoiceUrl || customVoiceId
                    ? customVoiceFileName || "Custom Real Cloned Voice"
                    : "Maya (Natural Indian Female Voice - Urdu + English)"}
                </span>
                {customVoiceUrl || customVoiceId ? (
                  <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] px-2.5 py-0.5 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Voice Clone Active (Speaks Dynamic Text)
                  </span>
                ) : (
                  <span className="rounded-full bg-violet-500/20 text-violet-300 text-[11px] px-2 py-0.5 font-semibold">
                    Natural AI Voice
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {customVoiceUrl && (
              <button
                type="button"
                onClick={togglePlaySample}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground font-semibold text-xs transition cursor-pointer"
                title="Listen to the raw uploaded sample audio file only"
              >
                {isPlayingSample ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5" />}
                <span>{isPlayingSample ? "Pause Sample" : "Listen Original Sample"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-violet-500/30 text-violet-300 hover:bg-violet-500/10 font-semibold text-xs transition cursor-pointer"
            >
              <Key className="h-3.5 w-3.5" />
              <span>{elevenlabsKey ? "ElevenLabs Connected" : "Connect ElevenLabs API"}</span>
            </button>

            {(customVoiceUrl || customVoiceId) && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-semibold text-xs transition cursor-pointer"
                title="Reset to default voice settings"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Voice</span>
              </button>
            )}
          </div>
        </div>

        {/* ElevenLabs API Key Config Drawer */}
        {showKeyInput && (
          <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-950/20 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                ElevenLabs Instant Voice Cloning API Key (Optional)
              </span>
              <span className="text-[11px] text-muted-foreground">
                Get your key at <a href="https://elevenlabs.io" target="_blank" rel="noreferrer" className="text-violet-400 underline">elevenlabs.io</a>
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="xi_••••••••••••••••••••••••"
                value={elevenlabsKey}
                onChange={(e) => setElevenlabsKey(e.target.value)}
                className="flex-1 text-xs rounded-xl border border-border bg-card p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <button
                type="button"
                onClick={handleSaveElevenLabsKey}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Save Key
              </button>
              <button
                type="button"
                disabled={isCloningElevenLabs}
                onClick={handleCloneWithElevenLabs}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isCloningElevenLabs ? "Cloning Voice..." : "⚡ Clone Voice Now"}</span>
              </button>
            </div>
            <div className="text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/70 space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-1">
                <span>⚠️ Important ElevenLabs Permissions:</span>
              </div>
              <p>
                API Key generate karte waqt <strong>&quot;Full Access&quot;</strong> select karein ya <strong>Voices (Write)</strong> aur <strong>Text-to-Speech</strong> permissions zaroor enable karein. Agar permissions missing hongi toh ElevenLabs error dega.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>
            <strong>Professional Voice Synthesis:</strong> Maya aapki uploaded recording ko direct nahi chalati. Maya <strong>sirf aapki aawaz clone</strong> karti hai aur client se baat karte waqt ya niche text box me koi bhi text dene par <strong>wahi exact jumla usi aawaz mein</strong> bolti hai!
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🗣️ LIVE TEXT-TO-SPEECH STUDIO: SPEAK ANY TEXT DYNAMICALLY */}
      {/* ======================================================== */}
      <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-card via-card to-emerald-950/15 p-6 md:p-8 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-extrabold text-foreground">
                🗣️ Live Dynamic Speech Tester: Koi Bhi Text Bol Kar Suno
              </h3>
              <p className="text-xs text-muted-foreground">
                Yahan koi bhi text likhein aur dekhein Maya kis tarah aapki aawaz mein wahi naya text bolti hai.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Real-time Speech Synthesis
            </span>
          </div>
        </div>

        {/* Text Area to type ANY dynamic text */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-foreground">
              Dynamic Text to Speak in Cloned Voice (Roman Urdu, Urdu, or English):
            </label>
            <span className="text-muted-foreground text-[11px]">
              {testText.length} characters
            </span>
          </div>

          <textarea
            rows={4}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Type any message here, and Maya will speak it in your cloned voice..."
            className="w-full text-sm rounded-2xl border border-emerald-500/30 bg-muted/30 p-4 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans leading-relaxed shadow-inner"
          />
        </div>

        {/* Quick Preset Test Buttons */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground">
            Quick Test Prompts (Click to test):
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              {
                label: "🚀 AED 299 Website Offer",
                text: "Ji bilkul! Hamara Complete Business Website aur Branding Package sirf AED 299 ka hai. Isme custom website, free domain, 1 year hosting aur company profile sab shamil hai!",
              },
              {
                label: "📩 WhatsApp Proposal",
                text: "Done! Maine complete AED 299 Website & Branding Package brochure aapke WhatsApp number par send kar di hai. Please check karein!",
              },
              {
                label: "📅 Appointment Booking",
                text: "Maya aapki design consultation confirm kar sakti hai. Hamare paas kal subah 11:00 AM ka slot available hai. Kya yeh waqt aapke liye theek hai?",
              },
              {
                label: "🤝 Professional Greeting",
                text: "Assalam-o-Alaikum! Jeose Services se Maya baat kar rahi hoon. Main aapki kis tarah madad kar sakti hoon?",
              },
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTestText(preset.text)}
                className="text-xs px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-muted-foreground hover:text-emerald-300 transition cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Speak Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-border/80">
          <div className="flex items-center gap-3">
            {isSynthesizing && (
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-emerald-400 animate-pulse">
                  Speaking text in cloned voice...
                </span>
                {/* Visualizer bars */}
                <div className="h-5 flex items-center gap-1 ml-2">
                  {[12, 22, 16, 28, 14, 24, 18, 8, 20].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}px` }}
                      className="w-1 bg-emerald-400 rounded-full animate-pulse"
                    />
                  ))}
                </div>
              </div>
            )}
            {!isSynthesizing && (
              <span className="text-xs text-muted-foreground">
                Click button to synthesize and listen to this exact sentence.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isSynthesizing ? (
              <button
                type="button"
                onClick={handleSpeakDynamicText}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 transition-all cursor-pointer animate-pulse"
              >
                <Square className="h-4 w-4" />
                <span>Stop Speaking</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSpeakDynamicText}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Volume2 className="h-5 w-5" />
                <span>🔊 Speak In Cloned Voice (Yeh Text Bolo)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Option 1 (Upload Voice File) and Option 2 (Record Microphone) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OPTION 1: Upload Audio Sample File */}
        <div className="rounded-3xl border-2 border-violet-500/40 bg-card p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-violet-500/15 text-violet-400">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-foreground text-base">
                  Option 1: Upload Voice Sample (.mp3, .wav)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Apne computer ya mobile se apni recording select karein
                </p>
              </div>
            </div>

            {/* Drop Zone Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-violet-500/50 hover:border-violet-400 bg-violet-950/15 hover:bg-violet-950/30 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 group"
            >
              <div className="h-14 w-14 rounded-2xl bg-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition">
                <FileAudio className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-foreground">
                  {isUploading ? "Cloning voice timbre..." : "Click to Select Voice Sample"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Supported: MP3, WAV, M4A, AAC, WEBM, OGG (Max 25MB)
                </div>
              </div>

              <span className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 group-hover:bg-violet-500 text-white font-bold text-xs px-4 py-2 shadow-md transition">
                <Upload className="h-3.5 w-3.5" />
                Select Audio File
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="text-[11px] text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/80">
            💡 <strong>Tip:</strong> 15 se 45 second ki clear voice file upload karein taake AI aapki aawaz ke tamaam sur aur pitch ko accurately capture kar sake.
          </div>
        </div>

        {/* OPTION 2: Live Microphone Recording */}
        <div className="rounded-3xl border-2 border-rose-500/40 bg-card p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400">
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-foreground text-base">
                  Option 2: Direct Mic Recording
                </h3>
                <p className="text-xs text-muted-foreground">
                  Apne microphone se direct 20-30 seconds bol kar aawaz record karein
                </p>
              </div>
            </div>

            {/* Recording Studio Box */}
            <div className="border border-border bg-gradient-to-b from-card to-muted/20 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-4">
              {isRecording ? (
                <div className="space-y-3">
                  <div className="relative inline-flex items-center justify-center">
                    <span className="animate-ping absolute h-16 w-16 rounded-full bg-rose-500 opacity-75" />
                    <div className="h-16 w-16 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-600/50">
                      <Mic className="h-8 w-8 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-rose-400 font-extrabold text-sm uppercase tracking-wider animate-pulse">
                      Recording Voice Sample...
                    </div>
                    <div className="font-mono text-2xl font-bold text-foreground">
                      {Math.floor(recordingSeconds / 60)
                        .toString()
                        .padStart(2, "0")}
                      :{(recordingSeconds % 60).toString().padStart(2, "0")}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm px-6 py-2.5 shadow-lg shadow-rose-600/30 transition cursor-pointer"
                  >
                    <Square className="h-4 w-4" />
                    <span>Stop &amp; Clone Voice</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mx-auto">
                    <Mic className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-foreground">
                      Ready to Record Voice
                    </div>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Start daba kar niche di gayi script ko clear aawaz mein read karein.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm px-6 py-2.5 shadow-lg shadow-rose-600/30 transition hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Mic className="h-4 w-4" />
                    <span>Start Recording Now</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/80">
            🎙️ Recording stop hotay hi system aapki aawaz clone kar ke Maya ke liye set kar dega.
          </div>
        </div>
      </div>

      {/* Script Guide for Recording (AED 299 Complete Package) */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <div>
              <h3 className="font-extrabold text-foreground text-sm">
                Recommended Recording Pitch Script (AED 299 Website &amp; Branding)
              </h3>
              <p className="text-xs text-muted-foreground">
                Aap record karte waqt yeh script bol sakte hain:
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyScript}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs px-3.5 py-2 transition cursor-pointer"
          >
            {copiedScript ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedScript ? "Script Copied!" : "Copy Script Text"}</span>
          </button>
        </div>

        <div className="bg-card/80 border border-border/80 rounded-xl p-4 font-mono text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {SCRIPT_TEXT}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            Aap apni marzi ke mutabiq koi bhi script bol kar apni aawaz record kar sakte hain.
          </span>
          <button
            type="button"
            onClick={onNavigateToDialer}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
          >
            <span>Proceed to Live Phone Dialer</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
