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
  Trash2,
  Headphones,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  saveCustomVoice,
  getCustomVoice,
  clearCustomVoice,
} from "@/lib/voice-calling/custom-voice-db";

interface CustomVoiceTabProps {
  onNavigateToDialer: () => void;
}

export function CustomVoiceTab({ onNavigateToDialer }: CustomVoiceTabProps) {
  // Voice state
  const [customVoiceUrl, setCustomVoiceUrl] = useState<string | null>(null);
  const [customVoiceFileName, setCustomVoiceFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Mic recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio preview player state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Script copy state
  const [copiedScript, setCopiedScript] = useState(false);

  // Load custom voice status on mount
  useEffect(() => {
    getCustomVoice().then(({ url, name }) => {
      if (url) {
        setCustomVoiceUrl(url);
        setCustomVoiceFileName(name || "Real Human Voice");
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
    const toastId = toast.loading(`Saving and activating "${file.name}"...`);

    try {
      // 1. Immediately save locally into IndexedDB and Data URL
      const dataUrl = await saveCustomVoice(file, file.name);
      setCustomVoiceUrl(dataUrl);
      setCustomVoiceFileName(file.name);

      // 2. Also send to backend
      const formData = new FormData();
      formData.append("file", file);
      fetch("/api/voice/custom-audio", {
        method: "POST",
        body: formData,
      }).catch(() => {});

      toast.success(`Real Voice "${file.name}" activated! All Maya calls will speak in this voice.`, { id: toastId });
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload error. Please try again.", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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

        const toastId = toast.loading("Saving your recorded voice as Maya's voice...");
        try {
          // 1. Save locally in IndexedDB and Data URL
          const dataUrl = await saveCustomVoice(audioBlob, "Microphone Voice Recording");
          setCustomVoiceUrl(dataUrl);
          setCustomVoiceFileName("Microphone Voice Recording");

          // 2. Also backup to backend
          const formData = new FormData();
          formData.append("file", audioBlob, "mic-recorded-voice.webm");
          fetch("/api/voice/custom-audio", {
            method: "POST",
            body: formData,
          }).catch(() => {});

          toast.success("Your microphone recording is now saved and active as Maya's voice!", { id: toastId });
        } catch {
          toast.error("Error saving recording", { id: toastId });
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
      toast.info("Recording started! Speak your AED 299 package pitch into the microphone...");
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

  // Audio Test Playback
  const togglePlayAudio = () => {
    if (!customVoiceUrl) return;

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    } else {
      const audio = new Audio(customVoiceUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        toast.error("Could not play audio file.");
      };
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  // Reset to default Indian female voice
  const handleReset = async () => {
    await clearCustomVoice();
    setCustomVoiceUrl(null);
    setCustomVoiceFileName(null);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    toast.success("Reset to default voice settings.");
  };

  // Maya's Recommended Pitch Script
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
      <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-950/60 via-purple-900/30 to-card p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-300">
                <Mic className="h-3.5 w-3.5 animate-pulse" />
                Real Voice Audio Engine
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs text-amber-300 font-bold">
                Maya AED 299 Package Voice
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              🎙️ Upload or Record Real Voice for Maya
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
              Aap apni real aawaz ki file (<strong>.mp3</strong> ya <strong>.wav</strong>) yahan upload kar sakte hain, ya microphone se direct record kar sakte hain. Jab bhi Maya client ko call karegi, client ko aapki real recording sunai degi!
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToDialer}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 px-5 py-3 text-sm font-extrabold text-white shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Open Dialer &amp; Call Now</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Active Voice Status Card */}
      <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${customVoiceUrl ? "bg-emerald-500/15 text-emerald-400" : "bg-violet-500/15 text-violet-400"}`}>
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Current Active Voice for Calls
              </div>
              <div className="text-lg font-bold text-foreground flex items-center gap-2">
                <span>{customVoiceUrl ? customVoiceFileName || "Custom Real Voice Audio" : "Maya (Natural Indian Female Voice - Urdu + English)"}</span>
                {customVoiceUrl ? (
                  <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] px-2 py-0.5 font-semibold">
                    ✓ Real Voice Active
                  </span>
                ) : (
                  <span className="rounded-full bg-violet-500/20 text-violet-300 text-[11px] px-2 py-0.5 font-semibold">
                    Natural AI Voice
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {customVoiceUrl && (
              <>
                <button
                  type="button"
                  onClick={togglePlayAudio}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>{isPlaying ? "Stop Audio" : "Play & Listen Voice"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-semibold text-xs transition cursor-pointer"
                  title="Remove custom audio and use default natural voice"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset to Natural Voice</span>
                </button>
              </>
            )}
          </div>
        </div>

        {customVoiceUrl ? (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>
              <strong>Real Voice Enabled:</strong> UAE / KSA clients will hear this exact audio recording when Maya makes or receives calls.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 border border-border/80 rounded-xl p-3">
            <Info className="h-4 w-4 shrink-0 text-violet-400" />
            <span>
              Currently using Maya&apos;s smooth natural Indian female voice. Upload an <strong>.mp3/.wav</strong> file below or record with your microphone to use your real voice.
            </span>
          </div>
        )}
      </div>

      {/* Grid: Option 1 (Upload File) and Option 2 (Record Microphone) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OPTION 1: Upload Audio File */}
        <div className="rounded-3xl border-2 border-violet-500/40 bg-card p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-violet-500/15 text-violet-400">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-foreground text-base">
                  Option 1: Upload Audio File (.mp3, .wav)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Apne computer ya mobile se recorded voice file select karein
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
                  {isUploading ? "Uploading audio file..." : "Click to Browse Audio File"}
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
            💡 <strong>Tip:</strong> Clear audio file jisme koi background noise na ho upload karein taake client ko aawaz bilkul clear sunai de.
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
                  Apne browser microphone se direct apni aawaz record karein
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
                      Recording Active...
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
                    <span>Stop &amp; Save Recording</span>
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
                      Click start, read the script below into your microphone, and click stop when finished.
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
            🎙️ Recording finish hotay hi automatic server aur browser memory mein save ho jayegi.
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
            Aap apni marzi ke mutabiq Urdu ya English mein bhi script change kar ke record kar sakte hain.
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
