"use client";

import { useState } from "react";
import {
  Zap,
  PhoneCall,
  Play,
  Pause,
  Plus,
  Users,
  Target,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  MapPin,
  Flame,
  Phone,
} from "lucide-react";
import type { VoiceCampaign, VoiceAgent, VoiceCall, CampaignLead } from "@/types/voice-calling";
import { toast } from "sonner";

interface MarketingCampaignsTabProps {
  campaigns: VoiceCampaign[];
  agents: VoiceAgent[];
  onSaveCampaign: (campaign: VoiceCampaign) => void;
  onCallInitiated: (call: VoiceCall) => void;
}

export function MarketingCampaignsTab({
  campaigns,
  agents,
  onSaveCampaign,
  onCallInitiated,
}: MarketingCampaignsTabProps) {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isQuickDialOpen, setIsQuickDialOpen] = useState(false);

  // New Campaign Form State
  const [campaignName, setCampaignName] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState(
    agents.find((a) => a.type === "outbound_marketing")?.id || agents[0]?.id || ""
  );
  const [maxConcurrency, setMaxConcurrency] = useState(2);
  const [callingWindow, setCallingWindow] = useState("09:00 - 18:00");
  const [leadSourceType, setLeadSourceType] = useState<"crm" | "extractor" | "manual">("extractor");
  const [manualLeadsText, setManualLeadsText] = useState(
    "Apex Dental Care, +971505053639, Dentist\nPrime Smiles Ortho, +971552348891, Dentist\nElite Derma Clinic, +971529014455, Healthcare"
  );

  // Quick Dial Form State
  const [quickPhone, setQuickPhone] = useState("+971 50 505 3639");
  const [quickName, setQuickName] = useState("Dr. Tariq (Apex Dental)");
  const [isDialing, setIsDialing] = useState(false);

  // Toggle Campaign status
  const toggleCampaignStatus = (campaign: VoiceCampaign) => {
    const updatedStatus = campaign.status === "running" ? "paused" : "running";
    const updated: VoiceCampaign = {
      ...campaign,
      status: updatedStatus,
      updatedAt: new Date().toISOString(),
    };
    onSaveCampaign(updated);
    toast.success(
      `Campaign ${campaign.name} is now ${updatedStatus === "running" ? "Running & Dialing" : "Paused"}`
    );
  };

  // Create Campaign
  const handleCreateCampaign = () => {
    if (!campaignName.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }

    const targetAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

    // Parse leads based on source
    let parsedLeads: CampaignLead[] = [];
    if (leadSourceType === "extractor") {
      parsedLeads = [
        { id: `lead-ex-${Date.now()}-1`, name: "Apex Dental Care", phone: "+971505053639", category: "Dentist", status: "pending" },
        { id: `lead-ex-${Date.now()}-2`, name: "Prime Smiles Ortho", phone: "+971552348891", category: "Dentist", status: "pending" },
        { id: `lead-ex-${Date.now()}-3`, name: "Elite Derma Clinic", phone: "+971529014455", category: "Healthcare", status: "pending" },
        { id: `lead-ex-${Date.now()}-4`, name: "Bright Smile Studio", phone: "+15553049122", category: "Dentist", status: "pending" },
        { id: `lead-ex-${Date.now()}-5`, name: "Skyline Medical Group", phone: "+15558832009", category: "Healthcare", status: "pending" },
      ];
    } else if (leadSourceType === "crm") {
      parsedLeads = [
        { id: `lead-crm-${Date.now()}-1`, name: "TechScale Solutions", phone: "+15557329011", category: "B2B SaaS", status: "pending" },
        { id: `lead-crm-${Date.now()}-2`, name: "Sophia Lorenza (Glamour)", phone: "+15554891120", category: "Salon & Spa", status: "pending" },
        { id: `lead-crm-${Date.now()}-3`, name: "Harbor Real Estate", phone: "+97143329911", category: "Real Estate", status: "pending" },
      ];
    } else {
      const lines = manualLeadsText.split("\n").filter((l) => l.trim().length > 0);
      parsedLeads = lines.map((line, idx) => {
        const parts = line.split(",").map((p) => p.trim());
        return {
          id: `lead-man-${Date.now()}-${idx}`,
          name: parts[0] || `Lead #${idx + 1}`,
          phone: parts[1] || "+15550000000",
          category: parts[2] || "Prospect",
          status: "pending",
        };
      });
    }

    const newCampaign: VoiceCampaign = {
      id: `camp-${Date.now()}`,
      name: campaignName.trim(),
      agentId: targetAgent?.id,
      agentName: targetAgent?.name,
      status: "running",
      callingWindowStart: "09:00",
      callingWindowEnd: "18:00",
      maxConcurrentCalls: maxConcurrency,
      retryAttempts: 1,
      totalLeads: parsedLeads.length,
      completedCalls: 0,
      answeredCalls: 0,
      qualifiedLeads: 0,
      leads: parsedLeads,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveCampaign(newCampaign);
    setIsNewModalOpen(false);
    setCampaignName("");
    toast.success(`Outbound campaign created with ${parsedLeads.length} leads! AI Dialer started.`);
  };

  // Instant Quick Dial
  const handleQuickDial = async () => {
    if (!quickPhone) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsDialing(true);
    const targetAgent = agents.find((a) => a.type === "outbound_marketing") || agents[0];

    try {
      const res = await fetch("/api/voice/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toNumber: quickPhone,
          callerName: quickName,
          agentId: targetAgent.id,
          agentName: targetAgent.name,
          direction: "outbound",
        }),
      });

      const data = await res.json();
      if (data.call) {
        onCallInitiated(data.call);
      }
      toast.success(`AI Call placed to ${quickPhone}! Call completed and logged.`);
      setIsQuickDialOpen(false);
    } catch (err) {
      console.error("Dial failed:", err);
      toast.error("Failed to connect call");
    } finally {
      setIsDialing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Outbound Marketing AI Caller Campaigns
          </h3>
          <p className="text-xs text-muted-foreground">
            Auto-dial verified marketing leads, qualify business interest, and push hot prospects directly to CRM pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsQuickDialOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
          >
            <Phone className="h-3.5 w-3.5 text-violet-400" />
            Quick-Dial Single Lead
          </button>
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-violet-600/25 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map((camp) => {
          const completionPct =
            camp.totalLeads > 0
              ? Math.round((camp.completedCalls / camp.totalLeads) * 100)
              : 0;

          return (
            <div
              key={camp.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 hover:border-violet-500/30 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-foreground text-sm">
                      {camp.name}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        camp.status === "running"
                          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                          : camp.status === "paused"
                          ? "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {camp.status === "running" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      )}
                      {camp.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                    Agent: <strong className="text-foreground">{camp.agentName}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleCampaignStatus(camp)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border cursor-pointer transition ${
                    camp.status === "running"
                      ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                      : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  }`}
                  title={camp.status === "running" ? "Pause Campaign" : "Resume Campaign"}
                >
                  {camp.status === "running" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Dialing Progress:</span>
                  <span className="font-semibold text-foreground">
                    {camp.completedCalls} / {camp.totalLeads} leads ({completionPct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all duration-500"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>

              {/* Campaign Stats Strip */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-center">
                <div className="rounded-xl bg-muted/40 p-2">
                  <div className="text-[10px] text-muted-foreground">Answered</div>
                  <div className="text-sm font-bold text-foreground">
                    {camp.answeredCalls}
                  </div>
                </div>
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2">
                  <div className="text-[10px] text-emerald-400 font-semibold">Hot Leads</div>
                  <div className="text-sm font-bold text-emerald-400">
                    {camp.qualifiedLeads}
                  </div>
                </div>
                <div className="rounded-xl bg-muted/40 p-2">
                  <div className="text-[10px] text-muted-foreground">Lines Concurrency</div>
                  <div className="text-sm font-bold text-foreground">
                    {camp.maxConcurrentCalls} lines
                  </div>
                </div>
              </div>

              {/* Leads sample preview */}
              {camp.leads && camp.leads.length > 0 && (
                <div className="space-y-1 text-xs">
                  <div className="text-[11px] font-semibold text-muted-foreground">
                    Target Leads Queue:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {camp.leads.slice(0, 4).map((l, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-foreground border border-border"
                      >
                        {l.status === "completed" ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Clock className="h-3 w-3 text-muted-foreground" />
                        )}
                        {l.name}
                      </span>
                    ))}
                    {camp.leads.length > 4 && (
                      <span className="text-[10px] text-muted-foreground self-center">
                        +{camp.leads.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick-Dial Single Lead Modal */}
      {isQuickDialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <h4 className="font-bold text-foreground text-sm">
                  Instant AI Quick-Dial Lead
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickDialOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Lead / Company Name</label>
                <input
                  type="text"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Destination Phone Number</label>
                <input
                  type="text"
                  value={quickPhone}
                  onChange={(e) => setQuickPhone(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-3 text-[11px] text-violet-300">
                AI Agent <strong>Alex (Outbound SDR)</strong> will call this lead, introduce your value proposition, gauge interest, and automatically tag them in CRM.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsQuickDialOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDialing}
                onClick={handleQuickDial}
                className="rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-600/25 transition cursor-pointer flex items-center gap-1.5"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                {isDialing ? "Calling Lead..." : "Dial AI Agent Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center">
                  <Zap className="h-4 w-4" />
                </div>
                <h4 className="font-bold text-foreground text-sm">
                  Create Outbound Leads Calling Campaign
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Campaign Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dubai Clinics Q4 Warm Follow-up"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Assigned AI Calling Agent</label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.voiceName.split(" ")[0]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Lead Source Selector */}
              <div className="space-y-2">
                <label className="font-semibold text-foreground">Import Leads Target List</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLeadSourceType("extractor")}
                    className={`flex flex-col items-center gap-1 rounded-xl p-2.5 border text-center cursor-pointer transition ${
                      leadSourceType === "extractor"
                        ? "border-violet-600 bg-violet-600/10 text-violet-400 font-bold"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <MapPin className="h-4 w-4 text-violet-400" />
                    <span>Lead Extractor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeadSourceType("crm")}
                    className={`flex flex-col items-center gap-1 rounded-xl p-2.5 border text-center cursor-pointer transition ${
                      leadSourceType === "crm"
                        ? "border-violet-600 bg-violet-600/10 text-violet-400 font-bold"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Users className="h-4 w-4 text-violet-400" />
                    <span>CRM Contacts</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeadSourceType("manual")}
                    className={`flex flex-col items-center gap-1 rounded-xl p-2.5 border text-center cursor-pointer transition ${
                      leadSourceType === "manual"
                        ? "border-violet-600 bg-violet-600/10 text-violet-400 font-bold"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <FileSpreadsheet className="h-4 w-4 text-violet-400" />
                    <span>Paste / CSV</span>
                  </button>
                </div>

                {leadSourceType === "extractor" && (
                  <div className="rounded-xl border border-violet-500/20 bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
                    Will import the <strong>5 verified leads</strong> extracted from Google Maps &amp; Clinic directories in the Lead Extractor section.
                  </div>
                )}

                {leadSourceType === "crm" && (
                  <div className="rounded-xl border border-violet-500/20 bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
                    Will pull warm prospects from your active CRM Contacts table.
                  </div>
                )}

                {leadSourceType === "manual" && (
                  <div className="space-y-1">
                    <span className="text-[11px] text-muted-foreground">Format: Name, Phone, Category (one per line)</span>
                    <textarea
                      rows={3}
                      value={manualLeadsText}
                      onChange={(e) => setManualLeadsText(e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted/40 p-2 font-mono text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                )}
              </div>

              {/* Speed & Concurrency */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Concurrent Calling Lines</label>
                  <select
                    value={maxConcurrency}
                    onChange={(e) => setMaxConcurrency(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground"
                  >
                    <option value={1}>1 Line (Gentle Dialing)</option>
                    <option value={2}>2 Lines (Standard)</option>
                    <option value={5}>5 Lines (High Velocity)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Calling Window</label>
                  <input
                    type="text"
                    value={callingWindow}
                    onChange={(e) => setCallingWindow(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCampaign}
                className="rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-600/25 transition cursor-pointer"
              >
                Launch Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
