"use client";

import {
  PhoneCall,
  Clock,
  CheckCircle2,
  TrendingUp,
  CalendarCheck,
  PhoneForwarded,
  Sparkles,
  Zap,
} from "lucide-react";
import type { VoiceStatsOverview } from "@/types/voice-calling";

interface VoiceStatsBannerProps {
  stats: VoiceStatsOverview;
  onOpenTestCall: () => void;
  onOpenNewCampaign: () => void;
  onOpenDialer?: () => void;
  onOpenUploadVoice?: () => void;
}

export function VoiceStatsBanner({
  stats,
  onOpenTestCall,
  onOpenNewCampaign,
  onOpenDialer,
  onOpenUploadVoice,
}: VoiceStatsBannerProps) {
  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-950/40 via-purple-900/20 to-card p-5 md:p-6 shadow-xl shadow-violet-950/10">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Multi-Tenant AI Voice SaaS
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-amber-400" /> Ultra Low-Latency (350ms)
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              AI Voice Receptionist &amp; Outbound Calling
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
              24/7 intelligent inbound call receptionist, automated appointment bookings, and high-converting AI outbound marketing calls for your leads.
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {onOpenUploadVoice && (
              <button
                type="button"
                onClick={onOpenUploadVoice}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 px-4 py-2.5 text-xs md:text-sm font-bold text-white shadow-lg shadow-rose-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Zap className="h-4 w-4 text-amber-300 animate-pulse" />
                🎙️ Upload Real Voice
              </button>
            )}
            {onOpenDialer && (
              <button
                type="button"
                onClick={onOpenDialer}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 px-4 py-2.5 text-xs md:text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:opacity-95 active:scale-95 cursor-pointer"
              >
                <PhoneCall className="h-4 w-4 animate-bounce" />
                Live Dialer (UAE / KSA)
              </button>
            )}
            <button
              type="button"
              onClick={onOpenTestCall}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-xs md:text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:opacity-95 active:scale-95 cursor-pointer"
            >
              <PhoneCall className="h-4 w-4" />
              Live AI Sandbox Call
            </button>
            <button
              type="button"
              onClick={onOpenNewCampaign}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-card px-4 py-2.5 text-xs md:text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted active:scale-95 cursor-pointer"
            >
              <Zap className="h-4 w-4 text-violet-400" />
              New Leads Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-border/80 bg-card/80 p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-xs font-medium">Total Calls</span>
            <PhoneCall className="h-4 w-4 text-violet-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-foreground">
            {stats.totalCalls}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Inbound &amp; Outbound
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/80 p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-xs font-medium">Talk Time</span>
            <Clock className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-foreground">
            {stats.totalMinutes} <span className="text-xs font-normal text-muted-foreground">min</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Spoken with AI
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/80 p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-xs font-medium">Inbound Picked</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-emerald-400">
            {stats.inboundAnswerRate}%
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            24/7 Zero Missed Calls
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/80 p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-xs font-medium">Outbound Connect</span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-amber-400">
            {stats.outboundConnectRate}%
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Marketing Connect Rate
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/80 p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-xs font-medium">Hot Leads</span>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-purple-400">
            {stats.qualifiedLeadsCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Pushed to CRM Deals
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/80 p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1.5">
            <span className="text-xs font-medium">Booked Visits</span>
            <CalendarCheck className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-indigo-400">
            {stats.appointmentsBookedCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Calendar Confirmed
          </div>
        </div>
      </div>
    </div>
  );
}
