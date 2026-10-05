"use client";

import { useState } from "react";
import type { Invoice, InvoiceItem, InvoiceType, InvoiceCurrency } from "@/types/invoices";
import { SALES_TEAM, SERVICE_PRESETS } from "@/lib/invoices/mock-data";
import { generateReferenceNumber } from "@/lib/invoices/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  Printer,
  Send,
  X,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface InvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialInvoice?: Invoice | null;
  defaultType?: InvoiceType;
  onSave: (invoice: Invoice) => void;
  onView?: (invoice: Invoice) => void;
  onSendWhatsApp?: (invoice: Invoice) => void;
}

function getInitialDates() {
  const today = new Date();
  const due = new Date();
  due.setDate(today.getDate() + 14);
  return {
    issue: today.toISOString().split("T")[0],
    due: due.toISOString().split("T")[0],
  };
}

export interface InvoiceFormProps {
  initialInvoice?: Invoice | null;
  defaultType: InvoiceType;
  onSave: (invoice: Invoice) => void;
  onClose: () => void;
  onView?: (invoice: Invoice) => void;
  onSendWhatsApp?: (invoice: Invoice) => void;
}

export function InvoiceForm({
  initialInvoice,
  defaultType,
  onSave,
  onClose,
  onView,
  onSendWhatsApp,
}: InvoiceFormProps) {
  const isEditing = Boolean(initialInvoice);
  const defaultDates = getInitialDates();

  const type = initialInvoice?.type || defaultType;
  const referenceNumber = initialInvoice?.referenceNumber || generateReferenceNumber(defaultType);

  // Section 1: Client Details
  const [clientName, setClientName] = useState(
    initialInvoice?.companyName || initialInvoice?.clientName || ""
  );
  const [clientPhone, setClientPhone] = useState(initialInvoice?.clientPhone || "+971501234567");
  const [clientEmail, setClientEmail] = useState(initialInvoice?.clientEmail || "client@email.com");
  const [clientAddress, setClientAddress] = useState(initialInvoice?.clientAddress || "");
  const [salesPersonId, setSalesPersonId] = useState<string>(
    initialInvoice?.salesPerson?.id || "sp-alina"
  );

  // Section 2: Services / Items
  const [items, setItems] = useState<InvoiceItem[]>(
    initialInvoice?.items && initialInvoice.items.length > 0
      ? initialInvoice.items
      : [
          {
            id: "it-1",
            description: "",
            quantity: 1,
            unitPrice: 0,
            total: 0,
            inclusions: "",
          },
        ]
  );

  // Track expanded inclusions rows
  const [expandedInclusions, setExpandedInclusions] = useState<Record<string, boolean>>({});

  // Section 3: Amounts
  const [currency, setCurrency] = useState<InvoiceCurrency>(initialInvoice?.currency || "AED");
  const [taxRate, setTaxRate] = useState<number>(initialInvoice?.taxRate ?? 0);
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">("fixed");
  const [discountValue, setDiscountValue] = useState<number>(initialInvoice?.discountAmount ?? 0);
  const [alreadyReceived, setAlreadyReceived] = useState<number>(initialInvoice?.paidAmount ?? 0);

  // Section 4: Details
  const [issueDate, setIssueDate] = useState(initialInvoice?.issueDate || defaultDates.issue);
  const [dueDate, setDueDate] = useState(initialInvoice?.dueDate || defaultDates.due);
  const [paymentTerms, setPaymentTerms] = useState(
    initialInvoice?.paymentTerms ||
      "Payment due within 14 days. 50% advance required before work begins."
  );
  const [notes, setNotes] = useState(
    initialInvoice?.notes || "Thank you for your business! Official WhatsApp CRM & Cloud Suite."
  );

  // Computed amounts
  const subtotal = items.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const discountAmount =
    discountType === "percentage"
      ? Number(((subtotal * discountValue) / 100).toFixed(2))
      : Number(discountValue) || 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number(((taxableAmount * taxRate) / 100).toFixed(2));
  const totalAmount = Math.max(0, Number((taxableAmount + taxAmount).toFixed(2)));
  const balanceDue = Math.max(0, Number((totalAmount - alreadyReceived).toFixed(2)));

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index], [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        const q = field === "quantity" ? Number(value) || 0 : item.quantity;
        const p = field === "unitPrice" ? Number(value) || 0 : item.unitPrice;
        item.total = Number((q * p).toFixed(2));
      }
      copy[index] = item;
      return copy;
    });
  };

  const toggleInclusions = (itemId: string) => {
    setExpandedInclusions((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleAddPresetService = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDesc = e.target.value;
    if (!selectedDesc) return;
    const found = SERVICE_PRESETS.find((p) => p.description === selectedDesc);
    if (found) {
      const newItemId = `it-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setItems((prev) => [
        ...prev,
        {
          id: newItemId,
          description: found.description,
          quantity: 1,
          unitPrice: found.unitPrice,
          total: found.unitPrice,
          inclusions: "",
        },
      ]);
    }
    e.target.value = "";
  };

  const handleAddItem = () => {
    const newItemId = `it-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setItems((prev) => [
      ...prev,
      {
        id: newItemId,
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
        inclusions: "",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error("At least one line item is required.");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      toast.error("Please enter Client Name or Company.");
      return;
    }

    const selectedRep = SALES_TEAM.find((m) => m.id === salesPersonId) || SALES_TEAM[0];
    const generatedId = initialInvoice ? initialInvoice.id : `${type}-${referenceNumber}`;

    // Auto-compute status based on payment if not manually set
    let computedStatus = initialInvoice?.status || "sent";
    if (alreadyReceived >= totalAmount && totalAmount > 0) {
      computedStatus = "paid";
    } else if (alreadyReceived > 0 && alreadyReceived < totalAmount) {
      computedStatus = "partial";
    }

    const invoicePayload: Invoice = {
      id: generatedId,
      referenceNumber: referenceNumber || generateReferenceNumber(type),
      type,
      title: items[0]?.description || "Business Services",
      clientName: clientName.trim(),
      companyName: clientName.trim(),
      clientEmail,
      clientPhone,
      clientAddress,
      currency,
      subtotal,
      taxRate,
      taxAmount,
      discountAmount,
      totalAmount,
      paidAmount: alreadyReceived,
      status: computedStatus,
      issueDate,
      dueDate,
      createdAt: initialInvoice?.createdAt || new Date().toISOString(),
      salesPerson: selectedRep,
      items,
      notes,
      paymentTerms,
    };

    onSave(invoicePayload);
    onClose();
  };

  const isQuotation = type === "quotation";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SECTION 1: CLIENT DETAILS matching screenshot */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Client Details
          </h4>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Sales Rep:</span>
            <select
              value={salesPersonId}
              onChange={(e) => setSalesPersonId(e.target.value)}
              className="text-xs font-semibold text-foreground bg-transparent border-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 rounded px-1"
            >
              {SALES_TEAM.map((m) => (
                <option key={m.id} value={m.id} className="text-foreground bg-card">
                  {m.displayName} ({m.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">
            Client Name *
          </label>
          <input
            type="text"
            required
            placeholder="Full name or company"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Phone
            </label>
            <input
              type="text"
              placeholder="+971501234567"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="client@email.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">
            Address
          </label>
          <input
            type="text"
            placeholder="Client address"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {/* SECTION 2: SERVICES / ITEMS matching screenshot */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Services / Items
          </h4>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                onChange={handleAddPresetService}
                defaultValue=""
                className="h-9 pl-3 pr-8 rounded-xl border border-input bg-card text-xs text-muted-foreground hover:text-foreground font-medium appearance-none cursor-pointer focus:outline-none focus:border-amber-500"
              >
                <option value="" disabled>
                  + Add from services
                </option>
                {SERVICE_PRESETS.map((p, idx) => (
                  <option key={idx} value={p.description}>
                    {p.description} ({currency} {p.unitPrice})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 active:scale-98"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Item Rows matching screenshot dark slate container */}
        <div className="space-y-2.5">
          {items.map((item, index) => {
            const isExpanded = Boolean(expandedInclusions[item.id]);

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-slate-600 dark:bg-slate-800 p-3 sm:p-3.5 text-white shadow-xs space-y-2.5 border border-slate-500/20"
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Service description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    className="flex-1 min-w-0 h-10 px-3.5 rounded-xl bg-white text-slate-900 text-sm placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="1"
                      title="Quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      className="w-14 sm:w-16 h-10 px-2 text-center rounded-xl bg-white text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 shrink-0"
                    />

                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="0"
                      title="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                      className="w-24 sm:w-28 h-10 px-2.5 text-right rounded-xl bg-white text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 shrink-0"
                    />

                    <div className="w-20 sm:w-24 text-right pr-1 font-mono font-bold text-white text-sm shrink-0">
                      {item.total.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-slate-300 hover:text-rose-400 transition-colors shrink-0"
                        title="Remove Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Add Inclusions toggle matching screenshot */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleInclusions(item.id)}
                    className="text-[11px] text-slate-300 font-medium pl-1 flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
                  >
                    <span>::: Add inclusions</span>
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-slate-500/40">
                      <input
                        type="text"
                        placeholder="Specific deliverables, inclusions, or notes for this item..."
                        value={item.inclusions || ""}
                        onChange={(e) => handleItemChange(index, "inclusions", e.target.value)}
                        className="w-full h-9 px-3 rounded-lg bg-slate-700/80 text-white text-xs placeholder:text-slate-400 border border-slate-500/50 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: AMOUNTS matching screenshot */}
      <div className="space-y-3.5 pt-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Amounts
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Currency
            </label>
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as InvoiceCurrency)}
                className="w-full h-11 px-3.5 rounded-xl border border-input bg-card text-foreground text-sm font-bold appearance-none cursor-pointer focus:outline-none focus:border-amber-500"
              >
                <option value="AED">AED</option>
                <option value="SAR">SAR</option>
                <option value="USD">USD</option>
                <option value="PKR">PKR</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Tax Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="0"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
              className="w-full h-11 px-3.5 rounded-xl border border-input bg-card text-foreground text-sm font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Discount Type
            </label>
            <div className="relative">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "fixed" | "percentage")}
                className="w-full h-11 px-3.5 rounded-xl border border-input bg-card text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:border-amber-500"
              >
                <option value="fixed">Fixed Amount</option>
                <option value="percentage">Percentage (%)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Discount Value
            </label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
              className="w-full h-11 px-3.5 rounded-xl border border-input bg-card text-foreground text-sm font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* ALREADY RECEIVED matching screenshot */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">
            Already Received ({currency})
          </label>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="0"
            value={alreadyReceived}
            onChange={(e) => setAlreadyReceived(Number(e.target.value) || 0)}
            className="w-full h-11 px-3.5 rounded-xl border border-input bg-card text-foreground text-sm font-mono focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Live Calculation Summary Breakdown Card */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-2 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal:</span>
            <span className="font-mono font-semibold text-foreground">
              {currency} {subtotal.toFixed(2)}
            </span>
          </div>

          {taxRate > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Tax ({taxRate}%):</span>
              <span className="font-mono font-semibold text-foreground">
                + {currency} {taxAmount.toFixed(2)}
              </span>
            </div>
          )}

          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Discount:</span>
              <span className="font-mono font-semibold">
                - {currency} {discountAmount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="border-t border-border/60 pt-2 flex justify-between text-sm font-bold text-foreground">
            <span>Total Amount:</span>
            <span className="font-mono text-base text-amber-600 dark:text-amber-400">
              {currency} {totalAmount.toFixed(2)}
            </span>
          </div>

          {alreadyReceived > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
              <span>Already Received:</span>
              <span className="font-mono font-semibold">
                - {currency} {alreadyReceived.toFixed(2)}
              </span>
            </div>
          )}

          <div className="border-t border-dashed border-border pt-2 flex justify-between items-center text-xs font-bold">
            <span className={balanceDue > 0 ? "text-rose-500" : "text-emerald-500"}>
              {balanceDue > 0 ? "Balance Due:" : "Status:"}
            </span>
            <span className="font-mono text-sm">
              {balanceDue > 0 ? (
                <span className="text-rose-500">{currency} {balanceDue.toFixed(2)}</span>
              ) : (
                <span className="text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Fully Paid
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 4: DETAILS & PAYMENT TERMS */}
      <div className="space-y-3.5 pt-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Details & Terms
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Issue Date
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              {isQuotation ? "Valid Until" : "Due Date"}
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">
            Payment Terms
          </label>
          <textarea
            rows={2}
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            placeholder="e.g. 50% advance required before work begins. Payment due within 14 days."
            className="w-full p-3 rounded-xl border border-input bg-card text-foreground text-xs leading-relaxed focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">
            Notes / Client Message
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes for the client..."
            className="w-full p-3 rounded-xl border border-input bg-card text-foreground text-xs leading-relaxed focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          {isEditing && initialInvoice && onView && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onView(initialInvoice);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>
          )}

          {isEditing && initialInvoice && onSendWhatsApp && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSendWhatsApp(initialInvoice);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 text-xs font-semibold border border-emerald-500/30 transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 ml-auto">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-98"
          >
            {isEditing
              ? "Save Changes"
              : isQuotation
              ? "+ Create Quotation"
              : "+ Create Invoice"}
          </button>
        </div>
      </div>
    </form>
  );
}

export function InvoiceModal({
  open,
  onOpenChange,
  initialInvoice,
  defaultType = "invoice",
  onSave,
  onView,
  onSendWhatsApp,
}: InvoiceModalProps) {
  const isEditing = Boolean(initialInvoice);
  const activeType = initialInvoice?.type || defaultType;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] sm:max-w-[780px] md:max-w-[840px] max-h-[92vh] overflow-y-auto overflow-x-hidden p-5 sm:p-7 rounded-2xl border border-border bg-card shadow-2xl"
      >
        <DialogHeader className="border-b border-border pb-3.5 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <DialogTitle className="text-lg font-bold text-foreground">
              {isEditing
                ? activeType === "quotation"
                  ? `Quotation #${initialInvoice?.referenceNumber}`
                  : `Invoice #${initialInvoice?.referenceNumber}`
                : activeType === "quotation"
                ? "New Quotation"
                : "New Invoice"}
            </DialogTitle>

            {isEditing && initialInvoice?.status && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase bg-muted text-muted-foreground">
                {initialInvoice.status}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        {open && (
          <InvoiceForm
            key={initialInvoice?.id || defaultType}
            initialInvoice={initialInvoice}
            defaultType={defaultType}
            onSave={onSave}
            onClose={() => onOpenChange(false)}
            onView={onView}
            onSendWhatsApp={onSendWhatsApp}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
