"use client";

import { useState, useEffect } from "react";
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
  CreditCard,
  Copy,
  Check,
  Send,
  ExternalLink,
  Settings,
  Sparkles,
} from "lucide-react";

interface PaymentLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactName?: string;
  contactPhone?: string;
  onSendMessage?: (text: string) => void;
}

const STORAGE_KEY = "wacrm_agency_payment_link";

export function PaymentLinkDialog({
  open,
  onOpenChange,
  contactName,
  contactPhone,
  onSendMessage,
}: PaymentLinkDialogProps) {
  const [paymentUrl, setPaymentUrl] = useState("https://jeosecrm.site/invoices");
  const [amount, setAmount] = useState("");
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPaymentUrl(stored);
      }
    }
  }, []);

  const handleSaveUrl = (newUrl: string) => {
    setPaymentUrl(newUrl);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newUrl);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    toast.success("Payment link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToChat = () => {
    const greeting = contactName ? `Hello ${contactName}! 👋` : "Hello! 👋";
    const amountText = amount ? ` for AED ${amount}` : "";
    const msg = `${greeting}\n\nPlease use the following secure payment link to complete your payment${amountText}:\n\n💳 ${paymentUrl}\n\nOnce paid, please share the screenshot/confirmation here. Thank you!`;
    if (onSendMessage) {
      onSendMessage(msg);
      toast.success("Payment link sent to chat!");
    } else {
      navigator.clipboard.writeText(msg);
      toast.success("Payment message copied to clipboard!");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-5 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Client Payment Link
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Send secure payment link to {contactName || "this client"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Payment Link URL Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground">Payment Gateway / URL</Label>
              <button
                type="button"
                onClick={() => setIsEditingUrl(!isEditingUrl)}
                className="text-[11px] text-primary hover:underline flex items-center gap-1"
              >
                <Settings className="h-3 w-3" /> {isEditingUrl ? "Done" : "Change URL"}
              </button>
            </div>
            {isEditingUrl ? (
              <Input
                value={paymentUrl}
                onChange={(e) => handleSaveUrl(e.target.value)}
                placeholder="https://your-payment-link.com or stripe..."
                className="font-mono text-xs bg-background"
              />
            ) : (
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={paymentUrl}
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
            )}
          </div>

          {/* Optional Amount */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Amount in AED <span className="text-[11px] font-normal text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 399 or 499"
              className="text-xs bg-background"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={handleSendToChat}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm gap-2 shadow-md shadow-emerald-600/20"
            >
              <Send className="h-4 w-4" /> Send Payment Link in WhatsApp Chat
            </Button>

            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-muted py-2 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open Payment Link
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
