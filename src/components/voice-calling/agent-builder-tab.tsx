"use client";

import { useState } from "react";
import {
  Bot,
  Sparkles,
  Volume2,
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  Languages,
  PhoneForwarded,
  Cpu,
  Layers,
  Wand2,
} from "lucide-react";
import type { VoiceAgent, AgentType, VoiceProvider } from "@/types/voice-calling";
import { VOICE_PERSONAS } from "@/lib/voice-calling/presets";
import { speakText } from "@/lib/voice-calling/voice-audio";
import { toast } from "sonner";

interface AgentBuilderTabProps {
  agents: VoiceAgent[];
  onSaveAgent: (agent: VoiceAgent) => void;
  onDeleteAgent: (agentId: string) => void;
}

const INDUSTRY_TEMPLATES = [
  {
    name: "Maya - AED 299 Complete Website & Branding Specialist",
    type: "receptionist" as AgentType,
    firstMessage: "Hello! Jeose Services se Maya baat kar rahi hoon. Hum UAE aur KSA businesses ke liye Complete Website & Branding Package provide kar rahe hain for ONLY AED 299! Free .COM domain, 1 year hosting aur company profile include hai. Main aapki kis tarah madad kar sakti hoon?",
    systemPrompt: `You are Maya, a courteous, warm, and highly persuasive Indian female AI Voice Agent for Jeose Services.
Offer the Complete Business Website & Branding Package for ONLY AED 299:
- Custom Business Website Design
- Free .COM Domain + 1-Year Premium Web Hosting
- Professional Business Email Accounts
- 10-Page Company Profile + Custom Logo Design + Business Cards + Letterhead
- Google Business Profile Setup & Optimization
- Price: JUST AED 299!`,
  },
  {
    name: "B2B SaaS Outbound Marketing SDR",
    type: "outbound_marketing" as AgentType,
    firstMessage: "Hi! This is Alex from Jeose CRM. I noticed your company's growth and wanted to ask if you currently automate your WhatsApp and missed customer calls?",
    systemPrompt: `You are Alex, a top-performing AI Sales Development Representative.
1. Hook the lead in under 10 seconds: explain how AI voice receptionists save 20 hours/week.
2. Inquire if they handle client inquiries manually.
3. Smoothly overcome objections (busy, pricing, already have a solution).
4. Offer a personalized 15-minute walkthrough demo session.`,
  },
  {
    name: "Real Estate VIP Property Broker",
    type: "receptionist" as AgentType,
    firstMessage: "Good afternoon, thank you for contacting Prime Properties Dubai. My name is Serena. Are you looking to buy, sell, or rent an investment property?",
    systemPrompt: `You are Serena, an executive real estate intake advisor.
1. Determine caller objective: Buying luxury villa, apartment investment, or off-plan projects.
2. Qualify their budget range ($500k to $5M+) and target location (Downtown, Palm, Dubai Marina).
3. Confirm preferred timeline for scheduling a private agent tour.`,
  },
  {
    name: "Urdu & Hindi Multilingual Customer Desk",
    type: "receptionist" as AgentType,
    firstMessage: "Assalam-o-Alaikum! Jeose CRM mein khushamdeed. Main aap ki AI assistant hoon. Main aap ki kya madad kar sakti hoon?",
    systemPrompt: `You are an AI assistant fluent in Urdu, Hindi, and English.
1. Assist callers with product inquiries, order tracking, and pricing in polite Urdu/Hindi.
2. Provide simple, courteous answers without complicated jargon.
3. For cancellations or technical errors, offer to connect with a senior officer.`,
  },
];

export function AgentBuilderTab({
  agents,
  onSaveAgent,
  onDeleteAgent,
}: AgentBuilderTabProps) {
  const [selectedAgent, setSelectedAgent] = useState<VoiceAgent>(agents[0]);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [name, setName] = useState(selectedAgent?.name || "");
  const [type, setType] = useState<AgentType>(selectedAgent?.type || "receptionist");
  const [voiceId, setVoiceId] = useState(selectedAgent?.voiceId || VOICE_PERSONAS[0].id);
  const [language, setLanguage] = useState(selectedAgent?.language || "en-US");
  const [llmModel, setLlmModel] = useState(selectedAgent?.llmModel || "gpt-4o-mini");
  const [firstMessage, setFirstMessage] = useState(selectedAgent?.firstMessage || "");
  const [systemPrompt, setSystemPrompt] = useState(selectedAgent?.systemPrompt || "");
  const [temperature, setTemperature] = useState(selectedAgent?.temperature || 0.7);
  const [transferPhone, setTransferPhone] = useState(selectedAgent?.transferPhoneNumber || "+1 (555) 019-2831");

  const handleSelectAgent = (ag: VoiceAgent) => {
    setSelectedAgent(ag);
    setName(ag.name);
    setType(ag.type);
    setVoiceId(ag.voiceId);
    setLanguage(ag.language);
    setLlmModel(ag.llmModel);
    setFirstMessage(ag.firstMessage);
    setSystemPrompt(ag.systemPrompt);
    setTemperature(ag.temperature);
    setTransferPhone(ag.transferPhoneNumber || "+1 (555) 019-2831");
    setIsEditing(false);
  };

  const handlePreviewVoice = (personaId: string) => {
    const persona = VOICE_PERSONAS.find((p) => p.id === personaId) || VOICE_PERSONAS[0];
    speakText(persona.sampleAudioText, { rate: 1.0 });
    toast.info(`Playing preview for ${persona.name}`);
  };

  const handleApplyTemplate = (tmpl: (typeof INDUSTRY_TEMPLATES)[0]) => {
    setName(`AI Agent - ${tmpl.name}`);
    setType(tmpl.type);
    setFirstMessage(tmpl.firstMessage);
    setSystemPrompt(tmpl.systemPrompt);
    toast.success(`Applied template: "${tmpl.name}"`);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Please provide an agent name");
      return;
    }

    const persona = VOICE_PERSONAS.find((p) => p.id === voiceId) || VOICE_PERSONAS[0];

    const updated: VoiceAgent = {
      ...selectedAgent,
      id: selectedAgent?.id || `agent-${Date.now()}`,
      name: name.trim(),
      type,
      voiceProvider: persona.provider,
      voiceId: persona.id,
      voiceName: persona.name,
      language,
      llmModel,
      firstMessage: firstMessage.trim(),
      systemPrompt: systemPrompt.trim(),
      temperature,
      transferPhoneNumber: transferPhone.trim(),
      updatedAt: new Date().toISOString(),
    };

    onSaveAgent(updated);
    setSelectedAgent(updated);
    setIsEditing(false);
    toast.success(`Agent "${name}" saved successfully!`);
  };

  const handleCreateNew = () => {
    const newId = `agent-${Date.now()}`;
    const newAgent: VoiceAgent = {
      id: newId,
      name: "New Indian AI Voice Agent",
      type: "receptionist",
      status: "active",
      voiceProvider: "elevenlabs",
      voiceId: VOICE_PERSONAS[0].id,
      voiceName: VOICE_PERSONAS[0].name,
      language: "en-IN",
      llmModel: "gpt-4o-mini",
      firstMessage: "Hello! Jeose Services se Maya baat kar rahi hoon. Hum UAE aur KSA businesses ke liye Complete Website & Branding Package provide kar rahe hain for ONLY AED 299! Free .COM domain, 1 year hosting aur company profile include hai. Main aapki kis tarah madad kar sakti hoon?",
      systemPrompt: "You are Maya, an energetic and polite Indian female AI voice agent for Jeose Services pitching the AED 299 Complete Website & Branding Package.",
      temperature: 0.65,
      silenceTimeoutSeconds: 15,
      interruptionHandling: true,
      transferPhoneNumber: "+971 50 505 3639",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSaveAgent(newAgent);
    handleSelectAgent(newAgent);
    setIsEditing(true);
    toast.success("Created new agent draft with Indian female voice.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Agent List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-foreground text-sm">
            AI Voice Agents ({agents.length})
          </h4>
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-1 rounded-xl bg-violet-600 hover:bg-violet-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> New Agent
          </button>
        </div>

        <div className="space-y-2.5">
          {agents.map((ag) => (
            <div
              key={ag.id}
              onClick={() => handleSelectAgent(ag)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedAgent?.id === ag.id
                  ? "border-violet-600 bg-violet-500/10 shadow-sm"
                  : "border-border bg-card hover:border-violet-500/30"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center shrink-0">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-foreground text-xs leading-snug">
                      {ag.name}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <span className="capitalize font-semibold text-violet-400">
                        {ag.type.replace("_", " ")}
                      </span>
                      <span>•</span>
                      <span>{ag.voiceName.split(" ")[0]}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`h-2 w-2 rounded-full mt-1.5 ${
                    ag.status === "active" ? "bg-emerald-400" : "bg-zinc-500"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Agent Configurator Form */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h4 className="font-bold text-foreground text-base">
                {name || selectedAgent?.name}
              </h4>
              <p className="text-xs text-muted-foreground">
                Configure voice persona, intelligence instructions, and greeting
              </p>
            </div>

            <div className="flex items-center gap-2">
              {agents.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteAgent(selectedAgent.id);
                    toast.success("Agent removed");
                  }}
                  className="h-8 w-8 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 flex items-center justify-center cursor-pointer transition"
                  title="Delete Agent"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                className="rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-600/25 transition cursor-pointer"
              >
                Save Agent Settings
              </button>
            </div>
          </div>

          {/* Preset Templates Selector */}
          <div className="rounded-xl border border-violet-500/20 bg-muted/30 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Wand2 className="h-3.5 w-3.5 text-violet-400" /> One-Click Industry Templates:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {INDUSTRY_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="rounded-lg border border-border bg-card hover:border-violet-500 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Agent Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Agent Specialty / Role</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AgentType)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="receptionist">24/7 Frontdesk AI Receptionist</option>
                <option value="outbound_marketing">Outbound Marketing Leads Caller</option>
                <option value="lead_qualifier">Lead Qualifier &amp; SDR</option>
                <option value="support">Customer Support &amp; Triage</option>
              </select>
            </div>

            {/* Voice Persona Selector with Preview */}
            <div className="space-y-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-foreground">Voice Persona &amp; Tone</label>
                <button
                  type="button"
                  onClick={() => handlePreviewVoice(voiceId)}
                  className="text-violet-400 hover:text-violet-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="h-3.5 w-3.5" /> Listen to Voice Sample
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {VOICE_PERSONAS.map((vp) => (
                  <div
                    key={vp.id}
                    onClick={() => setVoiceId(vp.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      voiceId === vp.id
                        ? "border-violet-600 bg-violet-600/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{vp.name.split(" ")[0]}</span>
                      <span className="text-[10px] font-mono uppercase text-violet-400">
                        {vp.provider}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                      {vp.accent} • {vp.gender}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Language Support</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="en-US">English (US &amp; International)</option>
                <option value="ur-PK">Urdu / Hindi (Bilingual Support)</option>
                <option value="ar-SA">Arabic (Gulf &amp; Middle East)</option>
                <option value="es-ES">Spanish</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">LLM Reasoning Engine</label>
              <select
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="gpt-4o-mini">GPT-4o Mini (Ultra Fast 350ms, Recommended)</option>
                <option value="gpt-4o">GPT-4o (Advanced Reasoning &amp; Negotiation)</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="font-semibold text-foreground">First Greeting Message</label>
              <input
                type="text"
                value={firstMessage}
                onChange={(e) => setFirstMessage(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="font-semibold text-foreground">System Prompt &amp; AI Directives</label>
              <textarea
                rows={5}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 p-3 font-sans text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Human Escalation Forward Number</label>
              <input
                type="text"
                value={transferPhone}
                onChange={(e) => setTransferPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">
                Creativity &amp; Temperature: <span className="font-mono text-violet-400">{temperature}</span>
              </label>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-violet-600 mt-2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
