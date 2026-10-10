"use client";

import { useState } from "react";
import {
  Key,
  Phone,
  Shield,
  Copy,
  Check,
  Plus,
  Radio,
  Sliders,
  ExternalLink,
  Zap,
  Bot,
  Sparkles,
} from "lucide-react";
import type {
  VoicePhoneNumber,
  VoiceTelephonySettings,
  VoiceAgent,
  TelephonyProvider,
} from "@/types/voice-calling";
import { toast } from "sonner";

interface TelephonySettingsTabProps {
  phoneNumbers: VoicePhoneNumber[];
  agents: VoiceAgent[];
  settings: VoiceTelephonySettings;
  onSavePhoneNumbers: (nums: VoicePhoneNumber[]) => void;
  onSaveSettings: (settings: VoiceTelephonySettings) => void;
}

export function TelephonySettingsTab({
  phoneNumbers,
  agents,
  settings,
  onSavePhoneNumbers,
  onSaveSettings,
}: TelephonySettingsTabProps) {
  const [formData, setFormData] = useState<VoiceTelephonySettings>(settings);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New Number Modal
  const [isAddNumberOpen, setIsAddNumberOpen] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState("+1 (555) 789-0123");
  const [newFriendlyName, setNewFriendlyName] = useState("Sales Growth Line");
  const [newAssignedAgentId, setNewAssignedAgentId] = useState(agents[0]?.id || "");

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    toast.success("Webhook URL copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveSettings = () => {
    onSaveSettings(formData);
    toast.success("Telephony provider credentials & automations saved!");
  };

  const handleAddNumber = () => {
    if (!newPhoneNumber.trim()) {
      toast.error("Phone number is required");
      return;
    }

    const assignedAgent = agents.find((a) => a.id === newAssignedAgentId);

    const newNum: VoicePhoneNumber = {
      id: `num-${Date.now()}`,
      phoneNumber: newPhoneNumber.trim(),
      friendlyName: newFriendlyName.trim() || "Virtual DID Line",
      provider: "twilio",
      assignedAgentId: newAssignedAgentId,
      assignedAgentName: assignedAgent?.name,
      status: "active",
      capabilities: { voice: true, sms: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...phoneNumbers, newNum];
    onSavePhoneNumbers(updated);
    setIsAddNumberOpen(false);
    toast.success(`Number ${newPhoneNumber} connected and routed to ${assignedAgent?.name || "AI Agent"}`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Phone Numbers Management Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h4 className="font-bold text-foreground text-base">
              Connected Virtual Phone Numbers (DIDs)
            </h4>
            <p className="text-xs text-muted-foreground">
              Assign dedicated telephone numbers to specific AI Voice Receptionists or Outbound Campaigns
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddNumberOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-violet-600/25 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Connect Phone Number
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {phoneNumbers.map((num) => (
            <div
              key={num.id}
              className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 hover:border-violet-500/30 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-foreground">
                  {num.phoneNumber}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>
              <div className="text-xs font-semibold text-muted-foreground">
                {num.friendlyName}
              </div>
              <div className="pt-2 border-t border-border/60 text-xs flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Routing:</span>
                <span className="font-semibold text-violet-400 truncate max-w-[150px]">
                  {num.assignedAgentName || "Maya Receptionist"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Telephony & AI Providers Config */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Provider Credentials */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Key className="h-4 w-4 text-violet-400" />
              Telephony &amp; AI Provider API Keys
            </h4>
            <p className="text-xs text-muted-foreground">
              Connect your Twilio, Vapi, Retell, or ElevenLabs accounts
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Primary Telephony Provider</label>
              <select
                value={formData.telephonyProvider}
                onChange={(e) =>
                  setFormData({ ...formData, telephonyProvider: e.target.value as TelephonyProvider })
                }
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="twilio">Twilio Programmable Voice + SIP</option>
                <option value="vapi">Vapi AI (Ultra-low Latency Voice Pipeline)</option>
                <option value="retell">Retell AI Telephony</option>
                <option value="bland">Bland AI Enterprise Engine</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Twilio Account SID</label>
              <input
                type="text"
                value={formData.twilioAccountSid || ""}
                onChange={(e) => setFormData({ ...formData, twilioAccountSid: e.target.value })}
                className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Twilio Auth Token</label>
              <input
                type="password"
                value={formData.twilioAuthToken || ""}
                onChange={(e) => setFormData({ ...formData, twilioAuthToken: e.target.value })}
                className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">ElevenLabs API Key (Voices)</label>
              <input
                type="password"
                value={formData.elevenlabsApiKey || ""}
                onChange={(e) => setFormData({ ...formData, elevenlabsApiKey: e.target.value })}
                className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Vapi / Retell Live Key (Optional)</label>
              <input
                type="password"
                value={formData.vapiApiKey || ""}
                onChange={(e) => setFormData({ ...formData, vapiApiKey: e.target.value })}
                className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Right: Webhooks & Automated CRM Sync */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Radio className="h-4 w-4 text-violet-400" />
              Inbound Webhooks &amp; CRM Sync
            </h4>
            <p className="text-xs text-muted-foreground">
              Configure webhook URLs in Twilio / Telnyx to route incoming calls to AI
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Inbound Voice Webhook */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Twilio / SIP Voice URL Webhook</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="https://api.crmverse.app/api/voice/webhook"
                  className="flex-1 rounded-xl border border-border bg-muted/50 px-3 py-2 font-mono text-[11px] text-foreground select-all"
                />
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard("https://api.crmverse.app/api/voice/webhook", "webhook")
                  }
                  className="h-9 px-3 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === "webhook" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Automation Toggles */}
            <div className="space-y-2.5 pt-2">
              <span className="font-bold text-foreground">Multi-Tenant CRM Automations:</span>

              <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3 cursor-pointer">
                <div>
                  <div className="font-semibold text-foreground">Auto-Push Leads to CRM Contacts</div>
                  <div className="text-[11px] text-muted-foreground">Creates contact on answered calls</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoPushLeadsToCrm}
                  onChange={(e) => setFormData({ ...formData, autoPushLeadsToCrm: e.target.checked })}
                  className="h-4 w-4 accent-violet-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3 cursor-pointer">
                <div>
                  <div className="font-semibold text-foreground">Auto-Create Sales Deals</div>
                  <div className="text-[11px] text-muted-foreground">Adds Hot Leads straight into Pipelines</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoCreateDeals}
                  onChange={(e) => setFormData({ ...formData, autoCreateDeals: e.target.checked })}
                  className="h-4 w-4 accent-violet-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3 cursor-pointer">
                <div>
                  <div className="font-semibold text-foreground">Auto-Send WhatsApp Follow-up</div>
                  <div className="text-[11px] text-muted-foreground">Dispatches WhatsApp confirmation message after call</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoSendWhatsappSummary}
                  onChange={(e) => setFormData({ ...formData, autoSendWhatsappSummary: e.target.checked })}
                  className="h-4 w-4 accent-violet-600 rounded"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveSettings}
          className="rounded-xl bg-violet-600 hover:bg-violet-700 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/25 transition cursor-pointer"
        >
          Save All Telephony &amp; CRM Settings
        </button>
      </div>

      {/* Connect Number Modal */}
      {isAddNumberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Phone className="h-4 w-4 text-violet-400" />
                Connect Virtual Phone Number
              </h4>
              <button
                type="button"
                onClick={() => setIsAddNumberOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Phone Number (E.164 format)</label>
                <input
                  type="text"
                  placeholder="+1 (555) 789-0123 or +971 4 819 2200"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Friendly Label</label>
                <input
                  type="text"
                  placeholder="e.g. Dubai Clinic Inbound or Outbound Line"
                  value={newFriendlyName}
                  onChange={(e) => setNewFriendlyName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Assign Inbound AI Agent</label>
                <select
                  value={newAssignedAgentId}
                  onChange={(e) => setNewAssignedAgentId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsAddNumberOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNumber}
                className="rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-600/25 transition cursor-pointer"
              >
                Connect Number
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
