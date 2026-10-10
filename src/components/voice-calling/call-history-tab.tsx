"use client";

import { useState } from "react";
import {
  PhoneIncoming,
  PhoneOutgoing,
  Search,
  Play,
  Pause,
  Sparkles,
  FileText,
  CalendarCheck,
  UserPlus,
  Send,
  GitBranch,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Flame,
  Volume2,
  X,
} from "lucide-react";
import type { VoiceCall, CallQualification } from "@/types/voice-calling";
import { toast } from "sonner";

interface CallHistoryTabProps {
  calls: VoiceCall[];
}

export function CallHistoryTab({ calls }: CallHistoryTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [directionFilter, setDirectionFilter] = useState<"all" | "inbound" | "outbound">("all");
  const [qualificationFilter, setQualificationFilter] = useState<string>("all");
  const [selectedCall, setSelectedCall] = useState<VoiceCall | null>(null);
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);

  // Filtered calls
  const filteredCalls = calls.filter((call) => {
    const matchesSearch =
      (call.callerName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      call.fromNumber.includes(searchQuery) ||
      call.toNumber.includes(searchQuery) ||
      (call.summary?.toLowerCase().includes(searchQuery.toLowerCase()) || false);

    const matchesDirection = directionFilter === "all" || call.direction === directionFilter;
    const matchesQual = qualificationFilter === "all" || call.qualificationStatus === qualificationFilter;

    return matchesSearch && matchesDirection && matchesQual;
  });

  const togglePlayAudio = (callId: string) => {
    if (playingCallId === callId) {
      setPlayingCallId(null);
    } else {
      setPlayingCallId(callId);
      // Automatically stop after 6 seconds simulation
      setTimeout(() => {
        setPlayingCallId((prev) => (prev === callId ? null : prev));
      }, 6000);
    }
  };

  const handlePushToPipeline = (call: VoiceCall) => {
    toast.success(`Deal created in Sales Pipeline: "${call.callerName || 'Lead'} - Voice Qualified" ($1,200)`);
  };

  const handlePushToContacts = (call: VoiceCall) => {
    toast.success(`Contact saved to CRM Contacts: ${call.callerName || call.fromNumber}`);
  };

  const handleSendWhatsApp = (call: VoiceCall) => {
    toast.success(`Automated WhatsApp confirmation sent to ${call.fromNumber || call.toNumber}`);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const getQualBadge = (qual: CallQualification) => {
    switch (qual) {
      case "hot_lead":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[11px] font-bold text-rose-400">
            <Flame className="h-3 w-3" /> Hot Lead
          </span>
        );
      case "booked_appointment":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
            <CalendarCheck className="h-3 w-3" /> Booked Visit
          </span>
        );
      case "callback_requested":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold text-amber-400">
            <Clock className="h-3 w-3" /> Callback Req.
          </span>
        );
      case "not_interested":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-500/15 border border-zinc-500/30 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
            Not Interested
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            Inquiry Handled
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by caller, phone, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Direction Filter */}
          <div className="flex rounded-xl border border-border bg-card p-1 text-xs">
            <button
              type="button"
              onClick={() => setDirectionFilter("all")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${
                directionFilter === "all" ? "bg-violet-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Calls
            </button>
            <button
              type="button"
              onClick={() => setDirectionFilter("inbound")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${
                directionFilter === "inbound" ? "bg-violet-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Inbound
            </button>
            <button
              type="button"
              onClick={() => setDirectionFilter("outbound")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${
                directionFilter === "outbound" ? "bg-violet-600 text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Outbound
            </button>
          </div>

          {/* Qualification Filter */}
          <select
            value={qualificationFilter}
            onChange={(e) => setQualificationFilter(e.target.value)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="all">All Outcomes</option>
            <option value="hot_lead">🔥 Hot Leads</option>
            <option value="booked_appointment">📅 Booked Visits</option>
            <option value="callback_requested">⏳ Callback Requested</option>
            <option value="not_interested">Not Interested</option>
          </select>
        </div>
      </div>

      {/* Calls Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">Direction &amp; Type</th>
                <th className="py-3 px-4">Contact / Phone</th>
                <th className="py-3 px-4">AI Agent</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">AI Outcome</th>
                <th className="py-3 px-4">Audio Recording</th>
                <th className="py-3 px-4 text-right">Transcript</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No voice calls match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-muted/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {call.direction === "inbound" ? (
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                            <PhoneIncoming className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
                            <PhoneOutgoing className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <div>
                          <span className="font-semibold text-foreground capitalize">
                            {call.direction}
                          </span>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(call.startedAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">
                        {call.callerName || "Direct Caller"}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {call.direction === "inbound" ? call.fromNumber : call.toNumber}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-foreground font-medium">
                      {call.agentName?.split("-")[0]?.trim() || "Maya Receptionist"}
                    </td>

                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {formatDuration(call.durationSeconds)}
                    </td>

                    <td className="py-3 px-4">
                      {getQualBadge(call.qualificationStatus)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => togglePlayAudio(call.id)}
                          className={`flex h-7 w-7 items-center justify-center rounded-full transition cursor-pointer ${
                            playingCallId === call.id
                              ? "bg-violet-600 text-white shadow-sm"
                              : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          {playingCallId === call.id ? (
                            <Pause className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3 fill-current ml-0.5" />
                          )}
                        </button>
                        {playingCallId === call.id ? (
                          <div className="flex items-center gap-0.5 h-3">
                            <span className="h-3 w-1 bg-violet-400 animate-pulse rounded-full" />
                            <span className="h-2 w-1 bg-violet-400 animate-bounce rounded-full" />
                            <span className="h-4 w-1 bg-violet-400 animate-pulse rounded-full" />
                            <span className="h-1.5 w-1 bg-violet-400 animate-bounce rounded-full" />
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {formatDuration(call.durationSeconds)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedCall(call)}
                        className="inline-flex items-center gap-1 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-300 hover:bg-violet-500/20 transition cursor-pointer"
                      >
                        <FileText className="h-3 w-3" />
                        Transcript
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transcript & AI Summary Modal */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">
                    Call Intelligence &amp; Transcript
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{selectedCall.callerName || "Direct Call"}</span>
                    <span>•</span>
                    <span className="font-mono">
                      {selectedCall.direction === "inbound"
                        ? selectedCall.fromNumber
                        : selectedCall.toNumber}
                    </span>
                    <span>•</span>
                    <span>{formatDuration(selectedCall.durationSeconds)}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCall(null)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* AI Summary Card */}
              <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-violet-400" /> AI Executive Summary
                  </span>
                  {getQualBadge(selectedCall.qualificationStatus)}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedCall.summary || "Conversation handled by AI agent. Details recorded in call log."}
                </p>
              </div>

              {/* Action items */}
              {selectedCall.actionItems && selectedCall.actionItems.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-foreground">Action Items Generated:</span>
                  <div className="space-y-1.5">
                    {selectedCall.actionItems.map((act, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-lg bg-muted/40 p-2 text-muted-foreground"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Conversation Dialogue */}
              <div className="space-y-3">
                <span className="font-bold text-foreground">Full Audio Transcript:</span>
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3 max-h-64 overflow-y-auto [scrollbar-width:thin]">
                  {selectedCall.transcript.map((turn, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${
                        turn.role === "caller" ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                        <span className="font-semibold">
                          {turn.role === "caller" ? selectedCall.callerName || "Caller" : "AI Agent"}
                        </span>
                        <span>•</span>
                        <span>{turn.timestamp}</span>
                      </div>
                      <div
                        className={`max-w-[85%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                          turn.role === "caller"
                            ? "bg-violet-600 text-white rounded-br-none"
                            : "bg-card text-foreground rounded-bl-none border border-border"
                        }`}
                      >
                        {turn.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CRM One-Click Actions */}
              <div className="space-y-2 pt-2 border-t border-border">
                <span className="font-bold text-foreground">One-Click CRM Automation:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePushToPipeline(selectedCall)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 py-2 font-bold text-violet-300 hover:bg-violet-500/20 transition cursor-pointer"
                  >
                    <GitBranch className="h-3.5 w-3.5" />
                    Push to Pipeline
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePushToContacts(selectedCall)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2 font-bold text-foreground hover:bg-muted transition cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Add to Contacts
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp(selectedCall)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 font-bold text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
