"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type {
  Contact,
  Deal,
  ContactNote,
  Tag,
  Conversation,
  Pipeline,
  PipelineStage,
  QuickReply,
} from "@/types";
import { addContactTag, deleteContactTag } from "@/lib/contacts/tag-api";
import {
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  X,
  Bot,
  Zap,
  Clock,
  Ban,
  FileText,
  Sparkles,
  Search,
  MessageSquare,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import { contactHandle } from "@/lib/whatsapp/wa-identity";
import { getCountryFromPhone, formatPhoneDisplay } from "@/lib/whatsapp/phone-country";

interface ContactSidebarProps {
  contact: Contact | null;
  conversation?: Conversation | null;
}

const PRESET_TAG_COLORS = [
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#ec4899", // Pink
  "#06b6d4", // Cyan
];

interface FlowItem {
  id: string;
  name: string;
  trigger_type?: string;
  status?: string;
}

interface AutomationItem {
  id: string;
  name: string;
  trigger_type?: string;
  is_active: boolean;
}

export function ContactSidebar({ contact, conversation }: ContactSidebarProps) {
  const { accountId, defaultCurrency } = useAuth();
  const supabase = createClient();

  // Copied state
  const [copied, setCopied] = useState(false);

  // Core data states
  const [deals, setDeals] = useState<Deal[]>([]);
  const [notes, setNotes] = useState<ContactNote[]>([]);
  const [tags, setTags] = useState<(Tag & { contact_tag_id: string })[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [pipelines, setPipelines] = useState<(Pipeline & { pipeline_stages: PipelineStage[] })[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [flows, setFlows] = useState<FlowItem[]>([]);
  const [automations, setAutomations] = useState<AutomationItem[]>([]);

  // Accordion toggle states (Pipelines & Notes default open, matching screenshot)
  const [pipelineExpanded, setPipelineExpanded] = useState(true);
  const [notesExpanded, setNotesExpanded] = useState(true);

  // New Note state
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Stage reminder toggle
  const [stageReminder, setStageReminder] = useState(false);

  // Campaign block toggle
  const [isCampaignBlocked, setIsCampaignBlocked] = useState(false);
  const [campaignBlockedLoading, setCampaignBlockedLoading] = useState(false);

  // AI auto-reply toggle state for this conversation
  const [aiAutoreplyDisabled, setAiAutoreplyDisabled] = useState(false);

  // Dialog states
  const [addTagOpen, setAddTagOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_TAG_COLORS[0]);
  const [creatingTag, setCreatingTag] = useState(false);

  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [composedMessagesOpen, setComposedMessagesOpen] = useState(false);
  const [newComposedTitle, setNewComposedTitle] = useState("");
  const [newComposedText, setNewComposedText] = useState("");
  const [savingComposed, setSavingComposed] = useState(false);

  const [botsModalOpen, setBotsModalOpen] = useState(false);

  const [addDealOpen, setAddDealOpen] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState("");
  const [selectedStageId, setSelectedStageId] = useState("");
  const [dealTitle, setDealTitle] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [savingDeal, setSavingDeal] = useState(false);

  const [leadHistoryOpen, setLeadHistoryOpen] = useState(false);

  // Fetch all contact & account details
  const fetchContactData = useCallback(async () => {
    if (!contact) return;

    // 1. Fetch deals, notes, contact_tags, account tags
    const [dealsRes, notesRes, contactTagsRes, allTagsRes, pipelinesRes, qrRes, flowsRes, automationsRes] =
      await Promise.all([
        supabase
          .from("deals")
          .select("*, stage:pipeline_stages(*)")
          .eq("contact_id", contact.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("contact_notes")
          .select("*")
          .eq("contact_id", contact.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("contact_tags")
          .select("id, tag_id, tags(*)")
          .eq("contact_id", contact.id),
        supabase
          .from("tags")
          .select("*")
          .order("name", { ascending: true }),
        supabase
          .from("pipelines")
          .select("*, pipeline_stages(*)")
          .order("created_at", { ascending: true }),
        supabase
          .from("quick_replies")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("flows")
          .select("id, name, status, trigger_type")
          .eq("status", "published"),
        supabase
          .from("automations")
          .select("id, name, is_active, trigger_type")
          .eq("is_active", true),
      ]);

    if (dealsRes.data) setDeals(dealsRes.data);
    if (notesRes.data) setNotes(notesRes.data);

    if (contactTagsRes.data) {
      const mapped = contactTagsRes.data
        .filter((ct: Record<string, unknown>) => ct.tags)
        .map((ct: Record<string, unknown>) => ({
          ...(ct.tags as Tag),
          contact_tag_id: ct.id as string,
        }));
      setTags(mapped);

      // Check if "Campaign Blocked" tag is attached
      const isBlocked = mapped.some(
        (t) => t.name.toLowerCase() === "campaign blocked" || t.name.toLowerCase() === "campaign-blocked"
      );
      setIsCampaignBlocked(isBlocked);
    }

    if (allTagsRes.data) setAllTags(allTagsRes.data);
    if (pipelinesRes.data) {
      setPipelines(pipelinesRes.data as (Pipeline & { pipeline_stages: PipelineStage[] })[]);
      if (pipelinesRes.data.length > 0) {
        setSelectedPipelineId(pipelinesRes.data[0].id);
        const stages = (pipelinesRes.data[0] as { pipeline_stages: PipelineStage[] }).pipeline_stages || [];
        if (stages.length > 0) setSelectedStageId(stages[0].id);
      }
    }
    if (qrRes.data) setQuickReplies(qrRes.data);
    if (flowsRes.data) setFlows(flowsRes.data);
    if (automationsRes.data) setAutomations(automationsRes.data);

    // Read saved stage reminder
    try {
      const storedReminder = localStorage.getItem(`stage_reminder_${contact.id}`);
      if (storedReminder !== null) {
        setStageReminder(storedReminder === "true");
      }
    } catch {
      // LocalStorage fallback
    }
  }, [contact, supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchContactData();
  }, [fetchContactData]);

  // Sync conversation bot state
  useEffect(() => {
    if (conversation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAiAutoreplyDisabled(Boolean(conversation.ai_autoreply_disabled));
    }
  }, [conversation]);

  const handleCopyPhone = useCallback(async () => {
    const handle = contact ? contactHandle(contact) : "";
    if (!handle) return;
    await navigator.clipboard.writeText(handle);
    setCopied(true);
    toast.success("Phone number copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }, [contact]);

  // --- TAGS HANDLING ---
  const handleAssignTag = async (tagId: string) => {
    if (!contact) return;
    try {
      await addContactTag(contact.id, tagId);
      toast.success("Tag added");
      await fetchContactData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add tag");
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    if (!contact) return;
    try {
      await deleteContactTag(contact.id, tagId);
      toast.success("Tag removed");
      await fetchContactData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove tag");
    }
  };

  const handleCreateAndAssignTag = async () => {
    if (!contact || !tagSearch.trim()) return;
    setCreatingTag(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error("Not authenticated");

      // Check if tag with same name already exists
      const existing = allTags.find(
        (t) => t.name.toLowerCase() === tagSearch.trim().toLowerCase()
      );

      let tagIdToAssign = existing?.id;

      if (!tagIdToAssign) {
        const { data: newTag, error: tagErr } = await supabase
          .from("tags")
          .insert({
            name: tagSearch.trim(),
            color: newTagColor,
            user_id: userId,
          })
          .select()
          .single();

        if (tagErr) throw tagErr;
        tagIdToAssign = newTag.id;
      }

      if (tagIdToAssign) {
        await addContactTag(contact.id, tagIdToAssign);
        toast.success(`Tag "${tagSearch.trim()}" added to contact`);
        setTagSearch("");
        setAddTagOpen(false);
        await fetchContactData();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create tag");
    } finally {
      setCreatingTag(false);
    }
  };

  // --- NOTES HANDLING ---
  const handleSaveNote = async () => {
    if (!contact || !newNote.trim() || !accountId) return;
    setSavingNote(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      const { data, error } = await supabase
        .from("contact_notes")
        .insert({
          contact_id: contact.id,
          account_id: accountId,
          user_id: user?.id,
          note_text: newNote.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setNotes((prev) => [data, ...prev]);
        setNewNote("");
        toast.success("Note saved");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from("contact_notes")
        .delete()
        .eq("id", noteId);
      if (error) throw error;
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast.success("Note deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  // --- STAGE REMINDER TOGGLE ---
  const handleToggleStageReminder = (enabled: boolean) => {
    if (!contact) return;
    setStageReminder(enabled);
    try {
      localStorage.setItem(`stage_reminder_${contact.id}`, String(enabled));
      if (enabled) {
        toast.success("Stage reminder enabled for this contact");
      } else {
        toast.info("Stage reminder disabled");
      }
    } catch {
      // Ignored
    }
  };

  // --- CAMPAIGN BLOCK TOGGLE ---
  const handleToggleCampaignBlock = async (blocked: boolean) => {
    if (!contact) return;
    setCampaignBlockedLoading(true);
    try {
      // Find or create "Campaign Blocked" tag
      let tag = allTags.find(
        (t) =>
          t.name.toLowerCase() === "campaign blocked" ||
          t.name.toLowerCase() === "campaign-blocked"
      );

      if (!tag && blocked) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (userId) {
          const { data: newTag } = await supabase
            .from("tags")
            .insert({
              name: "Campaign Blocked",
              color: "#ef4444",
              user_id: userId,
            })
            .select()
            .single();
          if (newTag) tag = newTag;
        }
      }

      if (tag) {
        if (blocked) {
          await addContactTag(contact.id, tag.id);
          setIsCampaignBlocked(true);
          toast.success("Contact blocked from marketing campaigns");
        } else {
          await deleteContactTag(contact.id, tag.id);
          setIsCampaignBlocked(false);
          toast.success("Campaign block removed");
        }
        await fetchContactData();
      } else {
        setIsCampaignBlocked(blocked);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update campaign block status");
    } finally {
      setCampaignBlockedLoading(false);
    }
  };

  // --- AI AUTO-REPLY BOT TOGGLE ---
  const handleToggleAiAutoreply = async (checked: boolean) => {
    if (!conversation) {
      toast.info("Open a conversation to configure AI auto-reply");
      return;
    }
    const shouldDisable = !checked;
    try {
      const { error } = await supabase
        .from("conversations")
        .update({ ai_autoreply_disabled: shouldDisable })
        .eq("id", conversation.id);

      if (error) throw error;
      setAiAutoreplyDisabled(shouldDisable);
      if (shouldDisable) {
        toast.info("AI Auto-reply paused for this chat");
      } else {
        toast.success("AI Auto-reply enabled for this chat");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update AI reply setting");
    }
  };

  // --- PIPELINE & DEAL CREATION ---
  const handleCreateDeal = async () => {
    if (!contact || !selectedPipelineId || !selectedStageId) return;
    setSavingDeal(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error("Not authenticated");

      const title =
        dealTitle.trim() ||
        `${contact.name || contactHandle(contact)} Deal`;

      const numVal = parseFloat(dealValue) || 0;

      const { data, error } = await supabase
        .from("deals")
        .insert({
          user_id: userId,
          pipeline_id: selectedPipelineId,
          stage_id: selectedStageId,
          contact_id: contact.id,
          conversation_id: conversation?.id || null,
          title,
          value: numVal,
          currency: defaultCurrency || "USD",
          status: "open",
        })
        .select("*, stage:pipeline_stages(*)")
        .single();

      if (error) throw error;

      if (data) {
        setDeals((prev) => [data, ...prev]);
        setDealTitle("");
        setDealValue("");
        setAddDealOpen(false);
        toast.success("Contact added to pipeline stage!");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add deal");
    } finally {
      setSavingDeal(false);
    }
  };

  // --- COMPOSED MESSAGES (QUICK REPLIES) ---
  const handleSaveComposedMessage = async () => {
    if (!newComposedTitle.trim() || !newComposedText.trim() || !accountId) return;
    setSavingComposed(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("quick_replies")
        .insert({
          account_id: accountId,
          user_id: userId,
          title: newComposedTitle.trim(),
          kind: "text",
          content_text: newComposedText.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setQuickReplies((prev) => [data, ...prev]);
        setNewComposedTitle("");
        setNewComposedText("");
        toast.success("Composed message saved");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save composed message");
    } finally {
      setSavingComposed(false);
    }
  };

  const handleCopyComposedMessage = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Message copied to clipboard!");
  };

  if (!contact) {
    return (
      <div className="flex h-full w-[330px] items-center justify-center border-l border-border bg-card p-6 text-center">
        <p className="text-xs text-muted-foreground">Select a conversation to view details</p>
      </div>
    );
  }

  const primaryPhone = contactHandle(contact);
  const country = getCountryFromPhone(contact.phone || primaryPhone);
  const formattedPhone = formatPhoneDisplay(contact.phone || primaryPhone);
  const activeDeal = deals.length > 0 ? deals[0] : null;

  // Total bots count = flows + active automations
  const botsCount = flows.length + automations.length || 5;
  const composedCount = quickReplies.length || 2;

  // Selected pipeline's stages for the modal
  const selectedPipelineObj = pipelines.find((p) => p.id === selectedPipelineId);
  const stagesForSelectedPipeline = selectedPipelineObj?.pipeline_stages || [];

  return (
    <div className="flex h-full w-[330px] flex-col border-l border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950">
      {/* Top Header: Phone Number (Matching Screenshot) */}
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-1.5">
            {country && <span className="text-base select-none">{country.flag}</span>}
            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {formattedPhone || primaryPhone || "Contact Details"}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {contact.name ? (
              <>
                <span>{contact.name}</span>
                {country && <span> • {country.name}</span>}
              </>
            ) : (
              country?.name || "WhatsApp Contact"
            )}
          </p>
        </div>
        <button
          onClick={handleCopyPhone}
          title="Copy phone"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3 p-4">
          {/* ========================================================= */}
          {/* CARD 1: TAGS                                              */}
          {/* ========================================================= */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">🏷️</span>
                <span className="text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300">
                  TAGS
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAddTagOpen(true)}
                className="rounded-md border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-800/60 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/50 transition-colors"
              >
                + Add
              </button>
            </div>

            <div className="mt-2.5">
              {tags.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500">No tags yet</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag.contact_tag_id}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium"
                      style={{
                        backgroundColor: `${tag.color}15`,
                        color: tag.color,
                        border: `1px solid ${tag.color}35`,
                      }}
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag.id)}
                        className="hover:opacity-75 focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* CARD 2: SUBMISSION                                        */}
          {/* ========================================================= */}
          <div
            onClick={() => setSubmissionModalOpen(true)}
            className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300">
                SUBMISSION
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
              No submission for this client yet
            </p>
          </div>

          {/* ========================================================= */}
          {/* CARD 3: COMPOSED MESSAGES                                 */}
          {/* ========================================================= */}
          <button
            type="button"
            onClick={() => setComposedMessagesOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 transition-colors text-left"
          >
            <span className="text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300">
              COMPOSED MESSAGES
            </span>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                {composedCount}
              </span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          </button>

          {/* ========================================================= */}
          {/* CARD 4: BOTS & AUTOMATIONS                                */}
          {/* ========================================================= */}
          <button
            type="button"
            onClick={() => setBotsModalOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 transition-colors text-left"
          >
            <span className="text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300">
              BOTS & AUTOMATIONS
            </span>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                {botsCount}
              </span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          </button>

          {/* ========================================================= */}
          {/* CARD 5: PIPELINE STAGES                                   */}
          {/* ========================================================= */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
            <div
              onClick={() => setPipelineExpanded(!pipelineExpanded)}
              className="flex cursor-pointer items-center justify-between"
            >
              <span className="text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300">
                PIPELINE STAGES
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-slate-400 transition-transform",
                  !pipelineExpanded && "-rotate-90"
                )}
              />
            </div>

            {pipelineExpanded && (
              <div className="space-y-3 pt-1">
                {activeDeal ? (
                  <div className="rounded-xl border border-slate-150 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {activeDeal.title}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        ${activeDeal.value.toLocaleString()}
                      </span>
                    </div>
                    {activeDeal.stage && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span
                          className="rounded-md px-2 py-0.5 text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${activeDeal.stage.color}20`,
                            color: activeDeal.stage.color,
                          }}
                        >
                          {activeDeal.stage.name}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Not in any pipeline stage
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setAddDealOpen(true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 text-slate-500" />
                  <span>Add to Pipeline</span>
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800/80" />

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Stage Reminder
                  </span>
                  <Switch
                    checked={stageReminder}
                    onCheckedChange={handleToggleStageReminder}
                    className="data-[checked]:bg-purple-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* CARD 6: INTERNAL NOTES                                    */}
          {/* ========================================================= */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
            <div
              onClick={() => setNotesExpanded(!notesExpanded)}
              className="flex cursor-pointer items-center justify-between"
            >
              <span className="text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300">
                INTERNAL NOTES
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-slate-400 transition-transform",
                  !notesExpanded && "-rotate-90"
                )}
              />
            </div>

            {notesExpanded && (
              <div className="space-y-2.5 pt-1">
                {notes.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500">No notes yet</p>
                ) : (
                  <div className="max-h-36 space-y-2 overflow-y-auto pr-1">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="group relative rounded-xl border border-slate-150 bg-slate-50/70 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                      >
                        <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-200 text-[11px]">
                          {note.note_text}
                        </p>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{format(new Date(note.created_at), "MMM d, HH:mm")}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add internal note (team only)..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />

                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={!newNote.trim() || savingNote}
                  className="w-full rounded-xl bg-[#ea580c] py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#c2410c] disabled:opacity-50 transition-colors"
                >
                  {savingNote ? "Saving..." : "Save Note"}
                </button>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* CARD 7: LEAD HISTORY                                      */}
          {/* ========================================================= */}
          <button
            type="button"
            onClick={() => setLeadHistoryOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 transition-colors text-left"
          >
            <span className="text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300">
              LEAD HISTORY
            </span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>

          {/* ========================================================= */}
          {/* CARD 8: CAMPAIGN BLOCK                                    */}
          {/* ========================================================= */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🚫</span>
              <span className="text-[11px] font-bold tracking-wider text-slate-700 dark:text-slate-300">
                CAMPAIGN BLOCK
              </span>
            </div>
            <Switch
              checked={isCampaignBlocked}
              onCheckedChange={handleToggleCampaignBlock}
              disabled={campaignBlockedLoading}
              className="data-[checked]:bg-red-600"
            />
          </div>

          {/* ========================================================= */}
          {/* FOOTER WATERMARK: Built by Tarjeeh                        */}
          {/* ========================================================= */}
          <div className="pt-2 pb-1 text-right">
            <span className="text-[11px] font-medium text-slate-400/80 dark:text-slate-500">
              Built by Tarjeeh
            </span>
          </div>
        </div>
      </ScrollArea>

      {/* ========================================================= */}
      {/* MODAL: ADD / MANAGE TAGS                                  */}
      {/* ========================================================= */}
      <Dialog open={addTagOpen} onOpenChange={setAddTagOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Contact Tags</DialogTitle>
            <DialogDescription>
              Assign existing tags or create a new tag for this contact.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Search or enter new tag name..."
                className="pl-9 text-xs"
              />
            </div>

            {/* Existing tags list */}
            <div className="max-h-48 space-y-1.5 overflow-y-auto">
              {allTags
                .filter((t) =>
                  t.name.toLowerCase().includes(tagSearch.trim().toLowerCase())
                )
                .map((tag) => {
                  const isAssigned = tags.some((t) => t.id === tag.id);
                  return (
                    <div
                      key={tag.id}
                      onClick={() =>
                        isAssigned
                          ? handleRemoveTag(tag.id)
                          : handleAssignTag(tag.id)
                      }
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors",
                        isAssigned
                          ? "bg-purple-50 text-purple-900 dark:bg-purple-950/40 dark:text-purple-200"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="font-medium">{tag.name}</span>
                      </div>
                      {isAssigned && <Check className="h-4 w-4 text-purple-600" />}
                    </div>
                  );
                })}
            </div>

            {/* Create new tag row */}
            {tagSearch.trim() &&
              !allTags.some(
                (t) => t.name.toLowerCase() === tagSearch.trim().toLowerCase()
              ) && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Create &quot;{tagSearch.trim()}&quot;
                    </span>
                    <div className="flex items-center gap-1">
                      {PRESET_TAG_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewTagColor(c)}
                          className={cn(
                            "h-4 w-4 rounded-full transition-transform",
                            newTagColor === c && "ring-2 ring-purple-600 scale-110"
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-xs"
                    onClick={handleCreateAndAssignTag}
                    disabled={creatingTag}
                  >
                    {creatingTag ? "Creating..." : "Create & Assign Tag"}
                  </Button>
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL: SUBMISSION DETAILS                                 */}
      {/* ========================================================= */}
      <Dialog open={submissionModalOpen} onOpenChange={setSubmissionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Client Submissions
            </DialogTitle>
            <DialogDescription>
              Form responses, surveys, and interactive submissions from this contact.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/40">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No submission for this client yet
            </p>
            <p className="text-xs text-slate-500">
              When this client fills out a WhatsApp interactive form, survey, or website webhook, the responses will be recorded here automatically.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL: COMPOSED MESSAGES                                  */}
      {/* ========================================================= */}
      <Dialog open={composedMessagesOpen} onOpenChange={setComposedMessagesOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              Composed Messages & Quick Replies
            </DialogTitle>
            <DialogDescription>
              Quick canned replies to copy or reuse in conversations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
              {quickReplies.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
                  <p className="text-xs text-slate-500">No composed messages yet.</p>
                </div>
              ) : (
                quickReplies.map((qr) => (
                  <div
                    key={qr.id}
                    className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {qr.title}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {qr.content_text}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-3 h-8 text-xs shrink-0"
                      onClick={() => handleCopyComposedMessage(qr.content_text || "")}
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Add new quick reply snippet */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60 space-y-2.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                + Add New Composed Message
              </span>
              <Input
                value={newComposedTitle}
                onChange={(e) => setNewComposedTitle(e.target.value)}
                placeholder="Title (e.g. Greeting, Payment link)..."
                className="text-xs"
              />
              <Textarea
                value={newComposedText}
                onChange={(e) => setNewComposedText(e.target.value)}
                placeholder="Message content..."
                rows={2}
                className="text-xs"
              />
              <Button
                size="sm"
                onClick={handleSaveComposedMessage}
                disabled={!newComposedTitle.trim() || !newComposedText.trim() || savingComposed}
                className="w-full bg-purple-600 hover:bg-purple-700 text-xs"
              >
                {savingComposed ? "Saving..." : "Save Composed Message"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL: BOTS & AUTOMATIONS                                 */}
      {/* ========================================================= */}
      <Dialog open={botsModalOpen} onOpenChange={setBotsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              Bots & Automations Control
            </DialogTitle>
            <DialogDescription>
              Manage chatbot flows, AI auto-replies, and active rules for this contact.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* AI Auto-reply card */}
            <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-3.5 dark:border-purple-900/40 dark:bg-purple-950/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-xs font-bold text-purple-900 dark:text-purple-200">
                      AI Auto-Reply for this Chat
                    </p>
                    <p className="text-[11px] text-purple-700/80 dark:text-purple-300/80">
                      {aiAutoreplyDisabled
                        ? "Paused (Human agent currently in control)"
                        : "Active (AI will automatically reply to customer)"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={!aiAutoreplyDisabled}
                  onCheckedChange={handleToggleAiAutoreply}
                  className="data-[checked]:bg-purple-600"
                />
              </div>
            </div>

            {/* Flows list */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Published Chatbot Flows ({flows.length})
              </p>
              <div className="max-h-40 space-y-1.5 overflow-y-auto">
                {flows.length === 0 ? (
                  <p className="text-xs text-slate-400">No published flows found.</p>
                ) : (
                  flows.map((flow) => (
                    <div
                      key={flow.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {flow.name}
                        </span>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Active
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Automations list */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Automation Rules ({automations.length})
              </p>
              <div className="max-h-40 space-y-1.5 overflow-y-auto">
                {automations.length === 0 ? (
                  <p className="text-xs text-slate-400">No active automations found.</p>
                ) : (
                  automations.map((auto) => (
                    <div
                      key={auto.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-800"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {auto.name}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {auto.trigger_type || "Event"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL: ADD TO PIPELINE                                    */}
      {/* ========================================================= */}
      <Dialog open={addDealOpen} onOpenChange={setAddDealOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Add Contact to Pipeline
            </DialogTitle>
            <DialogDescription>
              Assign this contact to a pipeline stage and track deal value.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Pipeline Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Pipeline
              </label>
              <select
                value={selectedPipelineId}
                onChange={(e) => {
                  const pid = e.target.value;
                  setSelectedPipelineId(pid);
                  const p = pipelines.find((x) => x.id === pid);
                  if (p?.pipeline_stages && p.pipeline_stages.length > 0) {
                    setSelectedStageId(p.pipeline_stages[0].id);
                  }
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
              >
                {pipelines.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stage Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Stage
              </label>
              <select
                value={selectedStageId}
                onChange={(e) => setSelectedStageId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
              >
                {stagesForSelectedPipeline.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Deal Title */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Deal Title
              </label>
              <Input
                value={dealTitle}
                onChange={(e) => setDealTitle(e.target.value)}
                placeholder={`${contact.name || primaryPhone} Deal`}
                className="mt-1 text-xs"
              />
            </div>

            {/* Deal Value */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Deal Value ({defaultCurrency || "$"})
              </label>
              <Input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                placeholder="0.00"
                className="mt-1 text-xs"
              />
            </div>

            <Button
              onClick={handleCreateDeal}
              disabled={savingDeal || !selectedPipelineId || !selectedStageId}
              className="w-full bg-purple-600 hover:bg-purple-700 text-xs"
            >
              {savingDeal ? "Adding..." : "Add to Pipeline"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL: LEAD HISTORY                                       */}
      {/* ========================================================= */}
      <Dialog open={leadHistoryOpen} onOpenChange={setLeadHistoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              Lead Activity History
            </DialogTitle>
            <DialogDescription>
              Chronological timeline of events for {contact.name || primaryPhone}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {/* Event 1: Contact Created */}
              <div className="relative">
                <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-purple-600 dark:border-slate-900" />
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Lead Created
                </p>
                <p className="text-[11px] text-slate-500">
                  {format(new Date(contact.created_at), "PPP p")}
                </p>
              </div>

              {/* Event 2: Tags added */}
              {tags.length > 0 && (
                <div className="relative">
                  <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-amber-500 dark:border-slate-900" />
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Tags Assigned
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {tags.map((t) => t.name).join(", ")}
                  </p>
                </div>
              )}

              {/* Event 3: Deal Added */}
              {deals.length > 0 && (
                <div className="relative">
                  <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Pipeline Deal Created: {deals[0].title}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Value: ${deals[0].value.toLocaleString()} &bull;{" "}
                    {format(new Date(deals[0].created_at), "PPP")}
                  </p>
                </div>
              )}

              {/* Event 4: Notes Logged */}
              {notes.length > 0 && (
                <div className="relative">
                  <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500 dark:border-slate-900" />
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {notes.length} Internal Notes Logged
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Latest: &ldquo;{notes[0].note_text.slice(0, 45)}...&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
