"use client";

import { useState } from "react";
import type { Invoice } from "@/types/invoices";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MessageSquare, Send, Copy, Phone, Check } from "lucide-react";
import { toast } from "sonner";

interface WhatsAppShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}

function buildDefaultMessage(invoice: Invoice): string {
  const isQuotation = invoice.type === "quotation";
  const isReceipt = invoice.type === "receipt";
  const typeLabel = isReceipt ? "Receipt" : isQuotation ? "Quotation" : "Invoice";
  const repName = invoice.salesPerson?.displayName || invoice.salesPerson?.name || "Alina";

  const itemsList = (invoice.items || [])
    .slice(0, 3)
    .map((i) => `• ${i.description} (${invoice.currency} ${i.total.toFixed(2)})`)
    .join("\n");

  return `👋 *Hello ${invoice.clientName || "Valued Client"}!*

Here is your *${typeLabel} #${invoice.referenceNumber}* from *Jeose CRM Business Suite*.

📋 *${typeLabel} Details:*
🏢 Client: ${invoice.companyName || invoice.clientName}
💰 Total Amount: *${invoice.currency} ${invoice.totalAmount.toFixed(2)}*
📅 ${isQuotation ? "Valid Until" : "Due Date"}: ${invoice.dueDate}
👤 Account Manager: *${repName}*

🛠 *Services:*
${itemsList}

${
  isReceipt
    ? "✅ Payment has been confirmed. Thank you for your business!"
    : "Please let us know once reviewed or if you have any questions."
}

Best regards,
*Jeose CRM Sales & Support Team*`;
}

interface ShareFormProps {
  invoice: Invoice;
  onClose: () => void;
}

function ShareForm({ invoice, onClose }: ShareFormProps) {
  const [phoneNumber, setPhoneNumber] = useState(invoice.clientPhone || "");
  const [message, setMessage] = useState(() => buildDefaultMessage(invoice));
  const [copied, setCopied] = useState(false);

  const handleOpenWhatsApp = () => {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
    if (!cleanPhone) {
      toast.error("Please enter a valid phone number with country code.");
      return;
    }

    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(waUrl, "_blank");
    toast.success("Opening WhatsApp...");
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success("WhatsApp message copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="space-y-4 pt-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">
            Recipient WhatsApp Number (with Country Code)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+971 50 123 4567"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">
            Message Preview (Editable)
          </label>
          <textarea
            rows={9}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>
      </div>

      <DialogFooter className="border-t border-border pt-4 gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:bg-muted text-xs font-medium text-foreground transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy Message"}
        </button>

        <button
          type="button"
          onClick={handleOpenWhatsApp}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
          Open in WhatsApp
        </button>
      </DialogFooter>
    </>
  );
}

export function WhatsAppShareDialog({
  open,
  onOpenChange,
  invoice,
}: WhatsAppShareDialogProps) {
  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-lg p-6">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MessageSquare className="h-4 w-4" />
            </div>
            Send {invoice.type === "quotation" ? "Quotation" : "Invoice"} via WhatsApp
          </DialogTitle>
        </DialogHeader>

        {open && (
          <ShareForm
            key={invoice.id}
            invoice={invoice}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
