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
  CreditCard,
  Copy,
  Check,
  Send,
  ExternalLink,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { ZIINA_PAYMENT_LINKS, type PaymentLinkItem } from "@/lib/client-forms/payment-links";

interface PaymentLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactName?: string;
  contactPhone?: string;
  onSendMessage?: (text: string) => void;
}

export function PaymentLinkDialog({
  open,
  onOpenChange,
  contactName,
  contactPhone,
  onSendMessage,
}: PaymentLinkDialogProps) {
  const [selectedItem, setSelectedItem] = useState<PaymentLinkItem>(ZIINA_PAYMENT_LINKS[2]); // Default 299 AED
  const [copied, setCopied] = useState(false);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Ziina payment link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToChat = (item: PaymentLinkItem) => {
    const greeting = contactName ? `Hello ${contactName}! 👋` : "Hello! 👋";
    const msg =
      `${greeting}\n\n` +
      `Please use the following secure payment link to complete your payment of *${item.amount} AED*:\n\n` +
      `💳 ${item.url}\n\n` +
      `You can pay securely via Apple Pay, Google Pay, or Card.\n` +
      `Once paid, please share the screenshot/confirmation here. Thank you!`;

    if (onSendMessage) {
      onSendMessage(msg);
      toast.success(`${item.amount} AED payment link sent to WhatsApp chat!`);
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
                Ziina Payment Links
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Select an amount to send or copy secure payment link
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Quick Amount Selector Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {ZIINA_PAYMENT_LINKS.map((item) => {
              const isSelected = selectedItem.amount === item.amount;
              return (
                <div
                  key={item.amount}
                  onClick={() => setSelectedItem(item)}
                  className={`cursor-pointer rounded-2xl border p-3.5 transition-all text-left flex flex-col justify-between ${
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30 shadow-sm"
                      : "bg-background/60 border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-base text-foreground font-mono">
                      {item.amount} AED
                    </span>
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-muted-foreground"
                      }`}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium truncate">
                    {item.amount === 100
                      ? "Deposit / Addon"
                      : item.amount === 199
                      ? "Starter / Promo"
                      : item.amount === 299
                      ? "Landing Page"
                      : "Business Website"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Selected URL Preview */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Ziina Link ({selectedItem.amount} AED)</span>
              <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Apple Pay &amp; Card
              </span>
            </Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={selectedItem.url}
                className="font-mono text-xs text-foreground bg-muted/40"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(selectedItem.url)}
                className="shrink-0 gap-1 rounded-xl text-xs"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={() => handleSendToChat(selectedItem)}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm gap-2 shadow-md shadow-emerald-600/20"
            >
              <Send className="h-4 w-4" /> Send {selectedItem.amount} AED Link in Chat
            </Button>

            <a
              href={selectedItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-muted py-2 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Test Open Ziina Link
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
