"use client";

import { useRef } from "react";
import type { Invoice } from "@/types/invoices";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Printer,
  CheckCircle2,
  Copy,
  Pencil,
  Mail,
  Phone,
  Send,
  X,
  FileSpreadsheet,
  FileText,
  Receipt,
  Building2,
  Calendar,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

interface InvoiceViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onEdit: (invoice: Invoice) => void;
  onSendWhatsApp: (invoice: Invoice) => void;
  onMarkAsPaid: (invoice: Invoice) => void;
}

export function InvoiceViewDialog({
  open,
  onOpenChange,
  invoice,
  onEdit,
  onSendWhatsApp,
  onMarkAsPaid,
}: InvoiceViewDialogProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const isQuotation = invoice.type === "quotation";
  const isReceipt = invoice.type === "receipt";

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summary = `${invoice.type.toUpperCase()}: ${invoice.referenceNumber}
Client: ${invoice.companyName || invoice.clientName}
Total: ${invoice.currency} ${invoice.totalAmount.toFixed(2)}
Received: ${invoice.currency} ${(invoice.paidAmount || 0).toFixed(2)}
Balance Due: ${invoice.currency} ${Math.max(0, invoice.totalAmount - (invoice.paidAmount || 0)).toFixed(2)}
Status: ${invoice.status.toUpperCase()}
${isQuotation ? "Valid Until" : "Due Date"}: ${invoice.dueDate}
Account Manager: ${invoice.salesPerson?.displayName || invoice.salesPerson?.name || "Alina Khan"}`;

    navigator.clipboard.writeText(summary);
    toast.success("Invoice summary copied to clipboard!");
  };

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "sent":
        return "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
      case "partial":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "overdue":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "accepted":
        return "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30";
      default:
        return "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30";
    }
  };

  const balanceDue = Math.max(0, invoice.totalAmount - (invoice.paidAmount || 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] sm:max-w-4xl max-h-[94vh] overflow-y-auto overflow-x-hidden p-4 sm:p-7 rounded-2xl border border-border bg-card shadow-2xl print:border-none print:shadow-none print:p-0 print:max-h-none"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>
            {isReceipt ? "Receipt" : isQuotation ? "Quotation" : "Invoice"} {invoice.referenceNumber}
          </DialogTitle>
        </DialogHeader>

        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-bold text-foreground">
              {invoice.referenceNumber}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border uppercase ${getStatusColor(
                invoice.status
              )}`}
            >
              {invoice.status}
            </span>
            {isQuotation && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase">
                Estimate
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {invoice.status !== "paid" && (
              <button
                type="button"
                onClick={() => onMarkAsPaid(invoice)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-2xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mark Paid</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onSendWhatsApp(invoice)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 text-xs font-semibold border border-emerald-500/30 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors"
              title="Copy Summary"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onEdit(invoice);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-all shadow-2xs"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-1"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Business Invoice / Quotation Sheet */}
        <div
          ref={printAreaRef}
          className="bg-card text-foreground rounded-2xl border border-border/70 p-6 sm:p-10 shadow-xs print:border-none print:shadow-none print:p-2"
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-border">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-white font-black text-xl shadow-xs">
                  J
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-foreground">
                    Jeose <span className="text-amber-500">Creative Solutions</span>
                  </h2>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    SMART BUSINESS & WHATSAPP SUITE • UAE REGISTERED
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm mt-2 leading-relaxed">
                WhatsApp Cloud Automation, Custom Web Portals & Enterprise Digital Solutions
              </p>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5">
                <span>support@jeose.com</span>
                <span>•</span>
                <span>www.jeose.com</span>
                <span>•</span>
                <span>Dubai, United Arab Emirates</span>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="flex items-center sm:justify-end gap-2">
                {isReceipt ? (
                  <Receipt className="h-6 w-6 text-emerald-500" />
                ) : isQuotation ? (
                  <FileSpreadsheet className="h-6 w-6 text-purple-500" />
                ) : (
                  <FileText className="h-6 w-6 text-amber-500" />
                )}
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
                  {isReceipt ? "RECEIPT" : isQuotation ? "QUOTATION" : "INVOICE"}
                </h1>
              </div>

              <div className="font-mono text-sm font-bold text-muted-foreground mt-1">
                #{invoice.referenceNumber}
              </div>

              <div className="mt-2.5 inline-block">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${getStatusColor(
                    invoice.status
                  )}`}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Billing & Details Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-7 border-b border-border text-sm">
            {/* Client Info */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Billed To:
              </span>
              <h3 className="text-base font-bold text-foreground">
                {invoice.companyName || invoice.clientName}
              </h3>
              {invoice.clientName && invoice.companyName && invoice.clientName !== invoice.companyName && (
                <p className="text-xs text-foreground/80 font-medium">Attn: {invoice.clientName}</p>
              )}
              {invoice.clientAddress && (
                <p className="text-xs text-muted-foreground leading-relaxed">{invoice.clientAddress}</p>
              )}
              {invoice.clientPhone && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                  <Phone className="h-3 w-3 text-emerald-500" />
                  <span className="font-mono">{invoice.clientPhone}</span>
                </p>
              )}
              {invoice.clientEmail && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-sky-500" />
                  <span>{invoice.clientEmail}</span>
                </p>
              )}
            </div>

            {/* Invoice Meta */}
            <div className="space-y-2 sm:text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Document Overview:
              </span>
              <div className="flex sm:justify-end gap-3 text-xs">
                <span className="text-muted-foreground">Issue Date:</span>
                <span className="font-semibold text-foreground font-mono">{invoice.issueDate}</span>
              </div>
              <div className="flex sm:justify-end gap-3 text-xs">
                <span className="text-muted-foreground">
                  {isQuotation ? "Valid Until:" : "Due Date:"}
                </span>
                <span className="font-semibold text-foreground font-mono">{invoice.dueDate}</span>
              </div>
              <div className="flex sm:justify-end gap-3 text-xs">
                <span className="text-muted-foreground">Sales Rep:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {invoice.salesPerson?.displayName || invoice.salesPerson?.name || "Alina Khan"}
                </span>
              </div>
              {invoice.paymentTerms && (
                <div className="flex sm:justify-end gap-3 text-xs pt-1">
                  <span className="text-muted-foreground">Terms:</span>
                  <span className="font-medium text-foreground max-w-xs">{invoice.paymentTerms}</span>
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase font-bold text-muted-foreground">
                  <th className="py-3 px-2">Description / Services</th>
                  <th className="py-3 px-2 text-center w-20">Qty</th>
                  <th className="py-3 px-2 text-right w-36">Rate ({invoice.currency})</th>
                  <th className="py-3 px-2 text-right w-36">Amount ({invoice.currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-muted/30">
                    <td className="py-3.5 px-2">
                      <div className="font-semibold text-foreground">{item.description}</div>
                      {item.inclusions && (
                        <div className="text-xs text-muted-foreground mt-0.5 pl-2 border-l-2 border-amber-500/50">
                          {item.inclusions}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-2 text-center font-mono text-muted-foreground font-semibold">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-2 text-right font-mono text-muted-foreground">
                      {item.unitPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3.5 px-2 text-right font-mono font-bold text-foreground">
                      {item.total.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown & Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border">
            {/* Terms & Notes Card */}
            <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2.5 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-muted-foreground">
                Terms & Conditions
              </h4>
              <p className="text-muted-foreground">
                Payment Terms:{" "}
                <span className="font-semibold text-foreground">
                  {invoice.paymentTerms || "Due upon receipt. 50% advance required before delivery."}
                </span>
              </p>
              <p className="text-muted-foreground">
                Account Manager:{" "}
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {invoice.salesPerson?.displayName || invoice.salesPerson?.name || "Alina Khan"}
                </span>
              </p>
              <p className="text-muted-foreground">
                Reference ID:{" "}
                <span className="font-semibold text-foreground font-mono">{invoice.referenceNumber}</span>
              </p>
              {invoice.notes && (
                <div className="pt-2 text-[11px] text-muted-foreground border-t border-border/50">
                  <span className="font-semibold text-foreground">Notes: </span>
                  {invoice.notes}
                </div>
              )}
            </div>

            {/* Calculations Box */}
            <div className="space-y-2.5 text-sm sm:pl-8">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono font-medium text-foreground">
                  {invoice.currency} {invoice.subtotal.toFixed(2)}
                </span>
              </div>

              {invoice.taxRate > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT / Tax ({invoice.taxRate}%):</span>
                  <span className="font-mono font-medium text-foreground">
                    + {invoice.currency} {invoice.taxAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount:</span>
                  <span className="font-mono font-medium">
                    - {invoice.currency} {invoice.discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="border-t border-border pt-3 flex justify-between items-baseline">
                <span className="text-base font-bold text-foreground">Total Amount:</span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  {invoice.currency} {invoice.totalAmount.toFixed(2)}
                </span>
              </div>

              {(invoice.paidAmount || 0) > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Already Received / Paid:</span>
                  <span className="font-mono font-semibold">
                    - {invoice.currency} {(invoice.paidAmount || 0).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="border-t border-dashed border-border pt-2 flex justify-between items-center text-xs font-bold">
                <span className={balanceDue > 0 ? "text-rose-500" : "text-emerald-500"}>
                  {balanceDue > 0 ? "Balance Due:" : "Payment Status:"}
                </span>
                <span className="font-mono text-sm">
                  {balanceDue > 0 ? (
                    <span className="text-rose-500">{invoice.currency} {balanceDue.toFixed(2)}</span>
                  ) : (
                    <span className="text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Settled in Full
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground gap-4">
            <div>
              Authorized by:{" "}
              <span className="font-bold text-foreground">
                {invoice.salesPerson?.name || "Malik Abbas — Jeose Creative Solutions"}
              </span>
            </div>
            <div className="text-[11px] text-center sm:text-right">
              Official computer-generated {isQuotation ? "quotation" : "invoice"}. Verified by Jeose CRM Suite.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
