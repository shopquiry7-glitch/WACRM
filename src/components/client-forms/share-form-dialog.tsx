"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Link as LinkIcon,
  Smartphone,
} from "lucide-react";

interface ShareFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareFormDialog({ open, onOpenChange }: ShareFormDialogProps) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [copied, setCopied] = useState(false);

  // Derive origin safely
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const basePath = `${origin}/onboarding`;

  // Build query string if any custom fields filled
  const params = new URLSearchParams();
  if (clientName.trim()) params.set("name", clientName.trim());
  if (clientPhone.trim()) params.set("phone", clientPhone.trim());
  if (businessName.trim()) params.set("biz", businessName.trim());

  const generatedUrl = params.toString() ? `${basePath}?${params.toString()}` : basePath;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    toast.success("Form link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendViaWhatsApp = () => {
    const greeting = clientName.trim() ? `Hello ${clientName.trim()}!` : "Hello!";
    const msg = encodeURIComponent(
      `${greeting} 👋\n\n` +
      `To help us design and launch your high-converting website, please fill out this quick 3-minute onboarding form:\n\n` +
      `🔗 ${generatedUrl}\n\n` +
      `Once submitted, our team will immediately start reviewing your requirements and preparing your concepts!`
    );

    const targetPhone = clientPhone.replace(/[^0-9]/g, "");
    const waUrl = targetPhone ? `https://wa.me/${targetPhone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(waUrl, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-5 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Share Onboarding Form
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Send this link to clients on WhatsApp or social media
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Main Link Input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Form URL</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={generatedUrl}
                className="font-mono text-xs text-foreground bg-muted/40"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="shrink-0 gap-1 rounded-xl text-xs"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Quick Prefill Options */}
          <div className="rounded-2xl border border-border/80 bg-muted/20 p-3.5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Optional: Pre-fill for Client
            </div>
            <p className="text-[11px] text-muted-foreground">
              Entering the client details here will automatically pre-fill them when the client opens the link!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Client Name</Label>
                <Input
                  placeholder="e.g., Habib Jan"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="h-8 text-xs bg-background"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">WhatsApp Number</Label>
                <Input
                  placeholder="e.g., +971545069473"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="h-8 text-xs font-mono bg-background"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Business Name</Label>
              <Input
                placeholder="e.g., Mahra Fashion"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleSendViaWhatsApp}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white py-2.5 px-4 font-bold text-xs sm:text-sm shadow-md shadow-[#25D366]/20 transition-all hover:scale-[1.01]"
            >
              <MessageCircle className="h-4 w-4 fill-current" />
              Send Link via WhatsApp
            </button>

            <a
              href={generatedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-muted py-2 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Preview Form in New Tab
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

