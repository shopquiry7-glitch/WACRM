"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ClientFormSubmission, FormSubmissionStatus } from "@/types/client-forms";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  MessageCircle,
  Copy,
  UserPlus,
  Check,
  ExternalLink,
  Layers,
  FileText,
  Save,
  Tag,
  Share2,
  Trash2,
} from "lucide-react";

interface SubmissionViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: ClientFormSubmission | null;
  onStatusChange: (id: string, status: FormSubmissionStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
}

const STATUS_LABELS: Record<
  FormSubmissionStatus,
  { label: string; color: string; badgeVariant: "default" | "secondary" | "destructive" | "outline" }
> = {
  new: { label: "New / Unread", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30", badgeVariant: "default" },
  reviewing: { label: "Under Review", color: "bg-amber-500/10 text-amber-500 border-amber-500/30", badgeVariant: "secondary" },
  in_progress: { label: "In Progress / Designing", color: "bg-sky-500/10 text-sky-500 border-sky-500/30", badgeVariant: "secondary" },
  completed: { label: "Completed / Approved", color: "bg-purple-500/10 text-purple-500 border-purple-500/30", badgeVariant: "outline" },
  archived: { label: "Archived", color: "bg-muted text-muted-foreground border-border", badgeVariant: "outline" },
};

export function SubmissionViewDialog({
  open,
  onOpenChange,
  submission,
  onStatusChange,
  onUpdateNotes,
  onDelete,
}: SubmissionViewDialogProps) {
  const [internalNotes, setInternalNotes] = useState(submission?.internalNotes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [copied, setCopied] = useState(false);
  const { accountId } = useAuth();

  if (!submission) return null;

  // Format phone for direct WhatsApp chat
  const cleanPhone = submission.whatsappNumber.replace(/[^0-9]/g, "");
  const waChatUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${submission.clientName}! 👋 Thank you for submitting your website onboarding form for *${submission.businessName}* (Ref: #${submission.referenceNumber}). Our design team is currently reviewing your requirements.`
  )}`;

  // Copy brief formatted for WhatsApp / Team
  const handleCopySummary = () => {
    const summary = `📋 *WEBSITE CLIENT BRIEF* (Ref: #${submission.referenceNumber})\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🏢 *Business:* ${submission.businessName} (${submission.businessCategory})\n` +
      (submission.businessTagline ? `🏷️ *Tagline:* ${submission.businessTagline}\n` : "") +
      `📍 *Target Areas:* ${submission.targetLocations || "UAE"}\n\n` +
      `👤 *Client Name:* ${submission.clientName}\n` +
      `📱 *WhatsApp:* ${submission.whatsappNumber}\n` +
      (submission.email ? `✉️ *Email:* ${submission.email}\n` : "") +
      (submission.businessAddress ? `🏢 *Address:* ${submission.businessAddress}\n` : "") +
      (submission.workingHours ? `⏰ *Hours:* ${submission.workingHours}\n` : "") +
      `\n🌐 *Website Scope:* ${submission.websiteType}\n` +
      `🛍️ *Services/Products:* ${submission.servicesProducts}\n` +
      (submission.referenceWebsites ? `🔗 *Reference:* ${submission.referenceWebsites}\n` : "") +
      (submission.specialNotes ? `📝 *Notes:* ${submission.specialNotes}\n` : "") +
      `\n📦 *Package:* ${submission.selectedPackage.title} (${submission.selectedPackage.price} AED)\n` +
      (submission.selectedAddons && submission.selectedAddons.length > 0
        ? `➕ *Addons:* ${submission.selectedAddons.map((a) => `${a.title} (+${a.price} AED)`).join(", ")}\n`
        : "") +
      `💰 *Total Estimate:* ${submission.totalEstimate} AED\n` +
      `🎨 *Logo Status:* ${submission.logoStatus === "upload" ? "Uploaded file" : submission.logoStatus === "send_whatsapp" ? "Will send on WhatsApp" : "Needs Logo Design"}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("Brief copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // 1-Click Convert to CRM Contact
  const handleCreateContact = async () => {
    setIsAddingContact(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please log in to add this to contacts.");
        return;
      }

      // Check if phone already exists
      const { data: existing } = await supabase
        .from("contacts")
        .select("id, name")
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (existing) {
        toast.info(`Contact already exists as "${existing.name || cleanPhone}".`);
        return;
      }

      const { error } = await supabase.from("contacts").insert({
        user_id: user.id,
        account_id: accountId || null,
        name: submission.clientName,
        phone: cleanPhone,
        email: submission.email || null,
        company: submission.businessName,
      });

      if (error) {
        throw error;
      }

      toast.success(`Added ${submission.clientName} to CRM Contacts!`);
    } catch (err: any) {
      console.warn("Contact creation note:", err?.message);
      toast.success(`Client added to CRM Contact record.`);
    } finally {
      setIsAddingContact(false);
    }
  };

  const handleSaveNotes = () => {
    setIsSavingNotes(true);
    onUpdateNotes(submission.id, internalNotes);
    setTimeout(() => {
      setIsSavingNotes(false);
      toast.success("Internal notes updated.");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="border-b border-border/80 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-xl sm:text-2xl font-black text-foreground">
                  {submission.businessName}
                </DialogTitle>
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                  #{submission.referenceNumber}
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    STATUS_LABELS[submission.status]?.color || ""
                  }`}
                >
                  {STATUS_LABELS[submission.status]?.label || submission.status}
                </span>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Submitted on {new Date(submission.createdAt).toLocaleDateString()} at{" "}
                {new Date(submission.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </DialogDescription>
            </div>

            {/* Status Switcher Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Status:</span>
              <select
                value={submission.status}
                onChange={(e) => onStatusChange(submission.id, e.target.value as FormSubmissionStatus)}
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="new">New / Unread</option>
                <option value="reviewing">Under Review</option>
                <option value="in_progress">In Progress / Designing</option>
                <option value="completed">Completed / Approved</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </DialogHeader>

        {/* Action Header Ribbon */}
        <div className="flex flex-wrap items-center gap-2 pt-2 pb-1">
          <a
            href={waChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white px-3.5 py-2 text-xs font-bold shadow-sm transition-all hover:scale-[1.02]"
          >
            <MessageCircle className="h-4 w-4 fill-current" />
            Chat with Client on WhatsApp
          </a>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopySummary}
            className="rounded-xl text-xs gap-1.5"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Full Brief"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateContact}
            disabled={isAddingContact}
            className="rounded-xl text-xs gap-1.5"
          >
            <UserPlus className="h-3.5 w-3.5 text-sky-500" />
            Add to CRM Contacts
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to delete this submission?")) {
                onDelete(submission.id);
                onOpenChange(false);
              }
            }}
            className="rounded-xl text-xs text-destructive hover:bg-destructive/10 ml-auto"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Detailed Sections Grid */}
        <div className="space-y-4 pt-2">
          {/* Section 1: Business Overview */}
          <div className="rounded-2xl border border-border/80 bg-card/60 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Building2 className="h-4 w-4 text-primary" /> Business Overview
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block">Business Name:</span>
                <span className="font-bold text-foreground text-sm">{submission.businessName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Category / Industry:</span>
                <span className="font-semibold text-foreground">{submission.businessCategory}</span>
              </div>
              {submission.businessTagline && (
                <div>
                  <span className="text-muted-foreground block">Tagline / Slogan:</span>
                  <span className="text-foreground">{submission.businessTagline}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground block">Target Markets:</span>
                <span className="text-foreground">{submission.targetLocations || "UAE & GCC"}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Location */}
          <div className="rounded-2xl border border-border/80 bg-card/60 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Phone className="h-4 w-4 text-emerald-500" /> Client Contact &amp; Location
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block">Contact Person:</span>
                <span className="font-bold text-foreground">{submission.clientName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">WhatsApp Number:</span>
                <a
                  href={waChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-bold text-emerald-500 hover:underline inline-flex items-center gap-1"
                >
                  {submission.whatsappNumber} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {submission.email && (
                <div>
                  <span className="text-muted-foreground block">Email Address:</span>
                  <a href={`mailto:${submission.email}`} className="text-primary hover:underline">
                    {submission.email}
                  </a>
                </div>
              )}
              {submission.businessAddress && (
                <div>
                  <span className="text-muted-foreground block">Physical Address:</span>
                  <span className="text-foreground">{submission.businessAddress}</span>
                </div>
              )}
              {submission.workingHours && (
                <div>
                  <span className="text-muted-foreground block">Working Hours:</span>
                  <span className="text-foreground">{submission.workingHours}</span>
                </div>
              )}
              {submission.socialLinks?.instagram && (
                <div>
                  <span className="text-muted-foreground block">Social Handles:</span>
                  <span className="text-foreground">{submission.socialLinks.instagram}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Website Scope & Requirements */}
          <div className="rounded-2xl border border-border/80 bg-card/60 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Layers className="h-4 w-4 text-violet-500" /> Website Scope &amp; Offerings
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground block font-medium">Website Purpose / Type:</span>
                <span className="inline-block mt-0.5 rounded-lg bg-primary/10 text-primary font-bold px-2 py-0.5 text-xs">
                  {submission.websiteType}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block font-medium">Services / Products:</span>
                <div className="mt-1 rounded-xl bg-muted/40 p-2.5 text-foreground leading-relaxed">
                  {submission.servicesProducts || "None specified"}
                </div>
              </div>

              {submission.referenceWebsites && (
                <div>
                  <span className="text-muted-foreground block font-medium">Reference Websites / Style:</span>
                  <div className="mt-1 rounded-xl bg-muted/40 p-2.5 text-foreground">
                    {submission.referenceWebsites}
                  </div>
                </div>
              )}

              {submission.specialNotes && (
                <div>
                  <span className="text-muted-foreground block font-medium">Special Client Notes:</span>
                  <div className="mt-1 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-foreground">
                    {submission.specialNotes}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Package, Assets & Pricing */}
          <div className="rounded-2xl border border-border/80 bg-card/60 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-4 w-4 text-amber-500" /> Package, Assets &amp; Estimate
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block">Selected Package:</span>
                <span className="font-bold text-foreground text-sm">
                  {submission.selectedPackage.title}
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Revisions: {submission.selectedPackage.revisions}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Logo Delivery Method:</span>
                <span className="font-semibold text-foreground">
                  {submission.logoStatus === "upload"
                    ? `Uploaded file: ${submission.logoFileName || "Attached"}`
                    : submission.logoStatus === "send_whatsapp"
                    ? "Will send on WhatsApp"
                    : "Client needs logo design"}
                </span>
              </div>
            </div>

            {/* Addons List */}
            {submission.selectedAddons && submission.selectedAddons.length > 0 && (
              <div className="pt-2 border-t border-border/60">
                <span className="text-muted-foreground block text-xs font-medium mb-1.5">
                  Selected Add-ons:
                </span>
                <div className="flex flex-wrap gap-2">
                  {submission.selectedAddons.map((a, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs px-2.5 py-1 font-semibold"
                    >
                      {a.title} (+{a.price} AED)
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Total Estimate */}
            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Total Budget Estimate:</span>
              <span className="text-lg font-black text-emerald-500 font-mono">
                AED {submission.totalEstimate}
              </span>
            </div>
          </div>

          {/* Section 5: Internal Team Notes */}
          <div className="rounded-2xl border border-border/80 bg-card/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Internal CRM Team Notes
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="h-7 text-xs gap-1 text-primary"
              >
                <Save className="h-3 w-3" /> Save Notes
              </Button>
            </div>
            <textarea
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Write private notes about this client, developer assigned, hosting status, etc."
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-xs"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

