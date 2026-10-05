"use client";

import type { Invoice } from "@/types/invoices";
import {
  Eye,
  Pencil,
  Send,
  MoreVertical,
  CheckCircle,
  Copy,
  Trash2,
  FileText,
  MessageCircle,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InvoiceListItemProps {
  invoice: Invoice;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onSendWhatsApp: (invoice: Invoice) => void;
  onMarkAsPaid: (invoice: Invoice) => void;
  onDuplicate: (invoice: Invoice) => void;
  onConvertToInvoice?: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
}

export function InvoiceListItem({
  invoice,
  onView,
  onEdit,
  onSendWhatsApp,
  onMarkAsPaid,
  onDuplicate,
  onConvertToInvoice,
  onDelete,
}: InvoiceListItemProps) {
  // Status badge styling
  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            PAID
          </span>
        );
      case "sent":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            SENT
          </span>
        );
      case "partial":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            PARTIAL
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            OVERDUE
          </span>
        );
      case "accepted":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            ACCEPTED
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase bg-muted text-muted-foreground border border-border">
            CANCELLED
          </span>
        );
      case "draft":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
            DRAFT
          </span>
        );
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const strTime = `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
      return `${month}/${day}/${year} ${strTime}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 sm:p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-sm">
      {/* Left Details */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center flex-wrap gap-2.5">
          <span
            onClick={() => onEdit(invoice)}
            className="cursor-pointer font-mono text-xs font-bold text-foreground hover:text-amber-500 transition-colors tracking-wide"
            title="Click to Edit / View Details"
          >
            {invoice.referenceNumber}
          </span>
          {getStatusBadge(invoice.status)}
          {invoice.type === "quotation" && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Quotation
            </span>
          )}
          {invoice.type === "receipt" && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Receipt
            </span>
          )}
        </div>

        <div>
          <h4
            onClick={() => onEdit(invoice)}
            className="cursor-pointer text-base font-bold text-foreground hover:text-amber-500 transition-colors truncate"
            title="Click to Edit / View Details"
          >
            {invoice.companyName || invoice.clientName}
          </h4>
          {invoice.companyName && invoice.clientName && invoice.companyName !== invoice.clientName && (
            <p className="text-xs text-muted-foreground">{invoice.clientName}</p>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {invoice.clientPhone && (
            <span className="inline-flex items-center gap-1.5 hover:text-foreground">
              <Phone className="h-3 w-3 text-emerald-500" />
              <span>{invoice.clientPhone}</span>
            </span>
          )}
          {invoice.clientEmail && (
            <span className="inline-flex items-center gap-1.5 hover:text-foreground truncate max-w-[200px]">
              <Mail className="h-3 w-3 text-sky-400" />
              <span className="truncate">{invoice.clientEmail}</span>
            </span>
          )}
          {invoice.items && invoice.items.length > 0 && (
            <span className="text-xs text-muted-foreground/80 italic hidden lg:inline">
              • {invoice.items[0].description}
              {invoice.items.length > 1 && ` (+${invoice.items.length - 1} more)`}
            </span>
          )}
        </div>
      </div>

      {/* Right Details: Amount, Date, Sales Rep, Actions */}
      <div className="flex items-center justify-between md:justify-end gap-5 border-t border-border/50 pt-3 md:border-0 md:pt-0">
        <div className="text-left md:text-right">
          <div className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            {invoice.currency}{" "}
            {invoice.totalAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-[11px] text-muted-foreground font-medium">
            {formatDate(invoice.createdAt || invoice.issueDate)}
          </div>
          <div className="text-xs font-medium text-purple-600 dark:text-purple-400 flex items-center md:justify-end gap-1 mt-0.5">
            <span className="text-muted-foreground/70">by</span>
            <span>{invoice.salesPerson?.displayName || invoice.salesPerson?.name || "Alina"}</span>
          </div>
        </div>

        {/* Action Buttons: View, Edit, Send, More */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="View Details & PDF"
            onClick={() => onView(invoice)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>

          <button
            type="button"
            title="Edit"
            onClick={() => onEdit(invoice)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            title="Send via WhatsApp"
            onClick={() => onSendWhatsApp(invoice)}
            className="p-2 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors focus:outline-none"
              aria-label="More actions"
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {invoice.status !== "paid" && (
                <DropdownMenuItem onClick={() => onMarkAsPaid(invoice)}>
                  <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                  Mark as Paid
                </DropdownMenuItem>
              )}

              {invoice.type === "quotation" && onConvertToInvoice && (
                <DropdownMenuItem onClick={() => onConvertToInvoice(invoice)}>
                  <ArrowRight className="h-4 w-4 mr-2 text-purple-500" />
                  Convert to Invoice
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={() => onSendWhatsApp(invoice)}>
                <MessageCircle className="h-4 w-4 mr-2 text-emerald-500" />
                WhatsApp Message
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onView(invoice)}>
                <FileText className="h-4 w-4 mr-2 text-primary" />
                Print / Save PDF
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onDuplicate(invoice)}>
                <Copy className="h-4 w-4 mr-2 text-blue-500" />
                Duplicate
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => onDelete(invoice)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
