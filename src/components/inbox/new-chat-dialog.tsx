"use client";

import { useEffect, useState } from "react";
import type { Conversation } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquarePlus,
  Phone,
  User,
  Send,
  Loader2,
  Sparkles,
  Building,
  Check,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { isFictionalPhone } from "@/lib/whatsapp/phone-utils";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversation: Conversation) => void;
}

export function NewChatDialog({
  open,
  onOpenChange,
  onConversationCreated,
}: NewChatDialogProps) {
  const { profile, account } = useAuth();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [useTemplate, setUseTemplate] = useState(true);
  const [senderName, setSenderName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSenderName(profile?.full_name || "Zain Malik");
      setCompanyName(account?.name || "Jeose CRM");
    }
  }, [open, profile, account]);

  const clientDisplayName = name.trim() || "[Client Name]";
  const senderDisplayName = senderName.trim() || "[Your Name]";
  const companyDisplayName = companyName.trim() || "[Company Name]";

  const previewTemplateText = `Hello ${clientDisplayName},

I hope you’re doing well. We received your inquiry about our website services. Please let us know when you’re available for a quick chat, and we’ll be happy to discuss your requirements.

Best regards,
${senderDisplayName}
${companyDisplayName}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let clean = phone.trim().replace(/[\s().-]/g, "");
    if (!clean) {
      toast.error("Please enter a client phone number");
      return;
    }

    if (!clean.startsWith("+")) {
      clean = "+" + clean;
    }

    const digits = clean.slice(1);
    if (!/^\d{8,15}$/.test(digits)) {
      toast.error(
        "Please enter a valid phone number with country code (e.g. +971501234567 or +923001234567)"
      );
      return;
    }

    if (isFictionalPhone(clean)) {
      toast.error(
        "Fictional test numbers (such as 555 prefix) do not have WhatsApp accounts. Please enter a real phone number."
      );
      return;
    }

    setLoading(true);

    try {
      const finalMessage = useTemplate ? previewTemplateText : customMessage.trim();

      const res = await fetch("/api/whatsapp/start-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: clean,
          name: name.trim() || undefined,
          sendWebsiteInquiry: useTemplate,
          templateName: useTemplate ? "website_service_inquiry" : undefined,
          senderName: senderDisplayName,
          companyName: companyDisplayName,
          message: finalMessage || undefined,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to start chat");
      }

      if (resData.conversation) {
        onConversationCreated(resData.conversation);
      }
      toast.success(
        useTemplate
          ? `Inquiry template sent to ${name.trim() || clean}!`
          : `Chat opened with ${name.trim() || clean}`
      );

      // Reset and close
      setPhone("");
      setName("");
      setCustomMessage("");
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Failed to start new chat:", err);
      toast.error(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] border-border bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00a884]/15 text-[#00a884]">
              <MessageSquarePlus className="h-4 w-4" />
            </span>
            Start New Client Chat
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs pt-1">
            Send the website services inquiry template or start a new WhatsApp conversation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[#00a884]" />
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +923001234567 or +971501234567"
              className="border-border bg-muted/60 text-sm font-mono"
              required
              autoFocus
            />
            {isFictionalPhone(phone) && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-500 dark:text-amber-400 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                <div className="leading-snug">
                  <strong className="font-semibold">Placeholder number detected:</strong> Fictional numbers (e.g. +1...555...) do not have WhatsApp accounts and messages will fail. Please enter a real phone number.
                </div>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground">
              Always include country code. For Meta Sandbox / Test numbers, make sure recipient is added in your Meta Developer portal.
            </p>
          </div>

          {/* Client Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Client Name <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ahmed Khan"
              className="border-border bg-muted/60 text-sm"
            />
          </div>

          {/* Mode Switcher */}
          <div className="pt-1">
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-[#00a884]/30 bg-[#00a884]/5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00a884]/20 text-[#00a884]">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <div>
                  <div className="text-xs font-bold text-foreground">Website Inquiry Template</div>
                  <div className="text-[10px] text-muted-foreground">Official template for new numbers (24/7 Delivery)</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUseTemplate(!useTemplate)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  useTemplate ? "bg-[#00a884]" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    useTemplate ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* If Template Mode Active */}
          {useTemplate ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground">Your Name</Label>
                  <Input
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Zain Malik"
                    className="h-8 text-xs bg-muted/60 border-border"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground">Company Name</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Jeose CRM"
                    className="h-8 text-xs bg-muted/60 border-border"
                  />
                </div>
              </div>

              {/* Message Live Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Template Message Preview</span>
                  <span className="text-[#00a884] font-medium lowercase">meta template format</span>
                </div>
                <div className="relative rounded-2xl border border-[#00a884]/20 bg-[#00a884]/5 p-3.5 text-xs text-foreground font-sans leading-relaxed shadow-inner">
                  <p className="whitespace-pre-line">{previewTemplateText}</p>
                  <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                    <span>Preview</span>
                    <span className="text-[#00a884]">✓✓</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Custom Message Mode */
            <div className="space-y-1.5">
              <Label htmlFor="customMessage" className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5 text-muted-foreground" />
                Custom Message <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="customMessage"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Type your custom message..."
                rows={3}
                className="border-border bg-muted/60 text-sm resize-none"
              />
              <p className="text-[11px] text-muted-foreground">
                Note: Messages to new numbers outside the 24h window are sent via approved Meta templates.
              </p>
            </div>
          )}

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !phone.trim()}
              className="bg-[#00a884] hover:bg-[#00a884]/90 text-white gap-1.5 font-medium shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Sending...
                </>
              ) : useTemplate ? (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Send Inquiry Template
                </>
              ) : (
                <>
                  <MessageSquarePlus className="h-4 w-4" />
                  Start Chat
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
