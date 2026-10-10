"use client";

import { useState, useEffect, useMemo } from "react";
import {
  PhoneCall,
  Bot,
  Zap,
  History,
  Sliders,
  Settings,
  Sparkles,
  PhoneForwarded,
} from "lucide-react";
import { VoiceStatsBanner } from "@/components/voice-calling/voice-stats-banner";
import { InboundReceptionistTab } from "@/components/voice-calling/inbound-receptionist-tab";
import { MarketingCampaignsTab } from "@/components/voice-calling/marketing-campaigns-tab";
import { CallHistoryTab } from "@/components/voice-calling/call-history-tab";
import { AgentBuilderTab } from "@/components/voice-calling/agent-builder-tab";
import { TelephonySettingsTab } from "@/components/voice-calling/telephony-settings-tab";

import {
  getVoiceAgents,
  saveVoiceAgent,
  deleteVoiceAgent,
  getVoicePhoneNumbers,
  saveVoicePhoneNumber,
  getVoiceCalls,
  saveVoiceCall,
  getVoiceCampaigns,
  saveVoiceCampaign,
  getVoiceTelephonySettings,
  saveVoiceTelephonySettings,
  getVoiceStats,
} from "@/lib/voice-calling/storage";
import type {
  VoiceAgent,
  VoicePhoneNumber,
  VoiceCall,
  VoiceCampaign,
  VoiceTelephonySettings,
} from "@/types/voice-calling";
import { useAuth } from "@/hooks/use-auth";

type TabId = "receptionist" | "marketing" | "history" | "agents" | "telephony";

export default function VoiceCallingPage() {
  const [activeTab, setActiveTab] = useState<TabId>("receptionist");
  const [agents, setAgents] = useState<VoiceAgent[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<VoicePhoneNumber[]>([]);
  const [calls, setCalls] = useState<VoiceCall[]>([]);
  const [campaigns, setCampaigns] = useState<VoiceCampaign[]>([]);
  const [settings, setSettings] = useState<VoiceTelephonySettings | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Load state on mount
  useEffect(() => {
    setIsClient(true);
    setAgents(getVoiceAgents());
    setPhoneNumbers(getVoicePhoneNumbers());
    setCalls(getVoiceCalls());
    setCampaigns(getVoiceCampaigns());
    setSettings(getVoiceTelephonySettings());
  }, []);

  // Compute live stats
  const stats = useMemo(() => {
    return getVoiceStats();
  }, [calls, phoneNumbers, agents]);

  // Primary receptionist agent
  const primaryReceptionist = useMemo(() => {
    return (
      agents.find((a) => a.type === "receptionist") ||
      agents[0] || {
        id: "agent-default",
        name: "Priya - 24/7 Frontdesk AI Receptionist (Real Indian Female Voice)",
        type: "receptionist",
        status: "active",
        voiceProvider: "elevenlabs",
        voiceId: "priya-indian-natural",
        voiceName: "Priya (Real Indian Female - Clear & Smooth)",
        language: "en-IN",
        llmModel: "gpt-4o-mini",
        firstMessage: "Hello! Jeose Services mein aapka welcome hai. Main Priya baat kar rahi hoon. Main aapki kis tarah madad kar sakti hoon? How may I assist you today?",
        systemPrompt: "You are Priya, a polite, cultured, and warm Indian female receptionist for Jeose Services. You speak fluent Urdu and English.",
        temperature: 0.65,
        silenceTimeoutSeconds: 15,
        interruptionHandling: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
  }, [agents]);

  // Handler callbacks
  const handleSaveAgent = (agent: VoiceAgent) => {
    const updated = saveVoiceAgent(agent);
    setAgents(updated);
  };

  const handleDeleteAgent = (agentId: string) => {
    const updated = deleteVoiceAgent(agentId);
    setAgents(updated);
  };

  const handleCallCompleted = (call: VoiceCall) => {
    const updated = saveVoiceCall(call);
    setCalls(updated);
  };

  const handleSaveCampaign = (campaign: VoiceCampaign) => {
    const updated = saveVoiceCampaign(campaign);
    setCampaigns(updated);
  };

  const handleSavePhoneNumbers = (nums: VoicePhoneNumber[]) => {
    nums.forEach((n) => saveVoicePhoneNumber(n));
    setPhoneNumbers(getVoicePhoneNumbers());
  };

  const handleSaveSettings = (st: VoiceTelephonySettings) => {
    const updated = saveVoiceTelephonySettings(st);
    setSettings(updated);
  };

  if (!isClient || !settings) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Initializing AI Telephony &amp; Voice Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
      {/* 1. Header & Live Stats Banner */}
      <VoiceStatsBanner
        stats={stats}
        onOpenTestCall={() => setActiveTab("receptionist")}
        onOpenNewCampaign={() => setActiveTab("marketing")}
      />

      {/* 2. Main Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/60 [scrollbar-width:none]">
        <button
          type="button"
          onClick={() => setActiveTab("receptionist")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "receptionist"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Bot className="h-4 w-4" />
          AI Receptionist (Inbound Desk)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("marketing")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "marketing"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Zap className="h-4 w-4" />
          Marketing Leads Calling (Outbound)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "history"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <History className="h-4 w-4" />
          Call Logs &amp; Transcripts ({calls.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("agents")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "agents"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Voice Agent Builder ({agents.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("telephony")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "telephony"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Settings className="h-4 w-4" />
          Telephony &amp; SaaS Settings
        </button>
      </div>

      {/* 3. Tab Contents */}
      <div className="pt-1">
        {activeTab === "receptionist" && (
          <InboundReceptionistTab
            receptionistAgent={primaryReceptionist}
            onSaveAgent={handleSaveAgent}
            onCallCompleted={handleCallCompleted}
          />
        )}

        {activeTab === "marketing" && (
          <MarketingCampaignsTab
            campaigns={campaigns}
            agents={agents}
            onSaveCampaign={handleSaveCampaign}
            onCallInitiated={handleCallCompleted}
          />
        )}

        {activeTab === "history" && <CallHistoryTab calls={calls} />}

        {activeTab === "agents" && (
          <AgentBuilderTab
            agents={agents}
            onSaveAgent={handleSaveAgent}
            onDeleteAgent={handleDeleteAgent}
          />
        )}

        {activeTab === "telephony" && (
          <TelephonySettingsTab
            phoneNumbers={phoneNumbers}
            agents={agents}
            settings={settings}
            onSavePhoneNumbers={handleSavePhoneNumbers}
            onSaveSettings={handleSaveSettings}
          />
        )}
      </div>
    </div>
  );
}
