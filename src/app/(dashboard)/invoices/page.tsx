"use client";

import { useState, useMemo } from "react";
import type { Invoice, InvoiceType } from "@/types/invoices";
import {
  getStoredInvoices,
  saveAllInvoices,
  calculateInvoiceStats,
  convertQuotationToInvoice,
  createReceiptFromPaidInvoice,
  generateReferenceNumber,
  clearAllInvoices,
  resetToRandomInvoices,
} from "@/lib/invoices/storage";
import { InvoiceStatsBar } from "@/components/invoices/invoice-stats";
import { InvoiceListItem } from "@/components/invoices/invoice-list-item";
import { InvoiceFilterBar } from "@/components/invoices/invoice-filter-bar";
import { InvoiceModal } from "@/components/invoices/invoice-modal";
import { InvoiceViewDialog } from "@/components/invoices/invoice-view-dialog";
import { WhatsAppShareDialog } from "@/components/invoices/whatsapp-share-dialog";
import {
  FileText,
  FileSpreadsheet,
  Receipt,
  Plus,
  Inbox,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStoredInvoices());
  const [activeTab, setActiveTab] = useState<"quotations" | "invoices" | "receipts">("invoices");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [salesPersonId, setSalesPersonId] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<InvoiceType>("invoice");
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const [waDialogOpen, setWaDialogOpen] = useState(false);
  const [waInvoice, setWaInvoice] = useState<Invoice | null>(null);

  // Update storage whenever invoices change
  const updateInvoicesState = (newList: Invoice[]) => {
    setInvoices(newList);
    saveAllInvoices(newList);
  };

  // Compute live stats
  const stats = useMemo(() => calculateInvoiceStats(invoices), [invoices]);

  // Tab counts
  const quotationsCount = useMemo(
    () => invoices.filter((i) => i.type === "quotation").length,
    [invoices]
  );
  const invoicesCount = useMemo(
    () => invoices.filter((i) => i.type === "invoice").length,
    [invoices]
  );
  const receiptsCount = useMemo(
    () => invoices.filter((i) => i.type === "receipt").length,
    [invoices]
  );

  // Filtered and sorted items for active tab
  const filteredItems = useMemo(() => {
    const result = invoices.filter((item) => {
      // Filter by type corresponding to active tab
      if (activeTab === "invoices" && item.type !== "invoice") return false;
      if (activeTab === "quotations" && item.type !== "quotation") return false;
      if (activeTab === "receipts" && item.type !== "receipt") return false;

      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) return false;

      // Salesperson filter
      if (salesPersonId !== "all") {
        if (item.salesPerson?.id !== salesPersonId) return false;
      }

      // Currency filter
      if (currencyFilter !== "all" && item.currency !== currencyFilter) return false;

      // Search term
      if (search.trim()) {
        const q = search.toLowerCase();
        const refMatch = item.referenceNumber.toLowerCase().includes(q);
        const nameMatch = (item.clientName || "").toLowerCase().includes(q);
        const companyMatch = (item.companyName || "").toLowerCase().includes(q);
        const emailMatch = (item.clientEmail || "").toLowerCase().includes(q);
        const phoneMatch = (item.clientPhone || "").toLowerCase().includes(q);
        const repMatch = (item.salesPerson?.displayName || item.salesPerson?.name || "").toLowerCase().includes(q);
        const itemDescMatch = (item.items || []).some((i) => (i.description || "").toLowerCase().includes(q));

        if (!refMatch && !nameMatch && !companyMatch && !emailMatch && !phoneMatch && !repMatch && !itemDescMatch) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.createdAt || b.issueDate).getTime() - new Date(a.createdAt || a.issueDate).getTime();
      }
      if (sortBy === "date-asc") {
        return new Date(a.createdAt || a.issueDate).getTime() - new Date(b.createdAt || b.issueDate).getTime();
      }
      if (sortBy === "amount-desc") {
        return b.totalAmount - a.totalAmount;
      }
      if (sortBy === "amount-asc") {
        return a.totalAmount - b.totalAmount;
      }
      return 0;
    });

    return result;
  }, [invoices, activeTab, statusFilter, salesPersonId, currencyFilter, search, sortBy]);

  // Handlers
  const handleOpenCreateModal = (type: InvoiceType = "invoice") => {
    setModalDefaultType(type);
    setEditingInvoice(null);
    setModalOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setModalOpen(true);
  };

  const handleSaveInvoice = (savedInvoice: Invoice) => {
    const exists = invoices.some((i) => i.id === savedInvoice.id);
    let updated: Invoice[];
    if (exists) {
      updated = invoices.map((i) => (i.id === savedInvoice.id ? savedInvoice : i));
      toast.success(`${savedInvoice.type === "quotation" ? "Quotation" : "Invoice"} updated successfully!`);
    } else {
      updated = [savedInvoice, ...invoices];
      toast.success(`+ New ${savedInvoice.type === "quotation" ? "Quotation" : "Invoice"} created!`);
    }

    updateInvoicesState(updated);

    // If viewing the same invoice, update view
    if (viewingInvoice && viewingInvoice.id === savedInvoice.id) {
      setViewingInvoice(savedInvoice);
    }
  };

  const handleView = (invoice: Invoice) => {
    setViewingInvoice(invoice);
    setViewDialogOpen(true);
  };

  const handleSendWhatsApp = (invoice: Invoice) => {
    setWaInvoice(invoice);
    setWaDialogOpen(true);
  };

  const handleMarkAsPaid = (invoice: Invoice) => {
    const { newReceipt, updatedList } = createReceiptFromPaidInvoice(invoice, invoices, "bank_transfer");
    updateInvoicesState(updatedList);
    toast.success(`Marked as Paid! Official Receipt ${newReceipt.referenceNumber} generated.`);

    if (viewingInvoice && viewingInvoice.id === invoice.id) {
      const updatedInv = updatedList.find((i) => i.id === invoice.id);
      if (updatedInv) setViewingInvoice(updatedInv);
    }
  };

  const handleConvertToInvoice = (quotation: Invoice) => {
    const { newInvoice, updatedList } = convertQuotationToInvoice(quotation, invoices);
    updateInvoicesState(updatedList);
    toast.success(`Quotation converted to Invoice ${newInvoice.referenceNumber}!`);
    setActiveTab("invoices");
  };

  const handleDuplicate = (invoice: Invoice) => {
    const newRef = generateReferenceNumber(invoice.type);
    const duplicated: Invoice = {
      ...invoice,
      id: `${invoice.type}-${Date.now()}`,
      referenceNumber: newRef,
      status: "draft",
      createdAt: new Date().toISOString(),
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    };
    updateInvoicesState([duplicated, ...invoices]);
    toast.success(`Duplicated as Draft ${newRef}!`);
  };

  const handleDelete = (invoice: Invoice) => {
    if (window.confirm(`Are you sure you want to delete ${invoice.referenceNumber}?`)) {
      const filtered = invoices.filter((i) => i.id !== invoice.id);
      updateInvoicesState(filtered);
      toast.success(`${invoice.referenceNumber} deleted.`);
      if (viewingInvoice?.id === invoice.id) {
        setViewDialogOpen(false);
      }
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSalesPersonId("all");
    setCurrencyFilter("all");
    setSortBy("date-desc");
  };

  const handleResetToZero = () => {
    if (window.confirm("Are you sure you want to reset all records and prices to ZERO? This will clear all invoices.")) {
      clearAllInvoices();
      updateInvoicesState([]);
      toast.success("All invoices and stats have been reset to ZERO!");
    }
  };

  const handleGenerateRandomData = () => {
    const fresh = resetToRandomInvoices();
    updateInvoicesState(fresh);
    toast.success("Loaded randomized business clients & records!");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Top Header Bar matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Invoices/Quotations
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
            Quotations, Invoices & Receipts
          </p>
        </div>

        {/* Primary Action Button (Golden/Amber button matching screenshot) */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleGenerateRandomData}
            title="Load fresh randomized business clients"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/30 text-xs sm:text-sm font-semibold text-foreground transition-all shadow-2xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="hidden sm:inline">Random Data</span>
          </button>

          {invoices.length > 0 && (
            <button
              type="button"
              onClick={handleResetToZero}
              title="Reset all prices and records to ZERO"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 text-xs sm:text-sm font-semibold text-muted-foreground transition-all shadow-2xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to 0</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleOpenCreateModal("quotation")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-border bg-card hover:bg-muted text-xs sm:text-sm font-semibold text-foreground transition-all shadow-2xs"
          >
            <Plus className="h-4 w-4 text-purple-500" />
            + New Quotation
          </button>

          <button
            type="button"
            onClick={() => handleOpenCreateModal("invoice")}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-98"
          >
            <Plus className="h-4 w-4" />
            + New Invoice
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <InvoiceStatsBar stats={stats} activeCurrency="AED" />

      {/* Navigation Tabs matching screenshot */}
      <div className="flex items-center gap-1.5 border-b border-border pb-3 overflow-x-auto">
        {/* Quotations Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("quotations")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "quotations"
              ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-2xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Quotations</span>
          <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-muted font-mono font-medium text-foreground">
            {quotationsCount}
          </span>
        </button>

        {/* Invoices Tab (Selected) */}
        <button
          type="button"
          onClick={() => setActiveTab("invoices")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "invoices"
              ? "bg-primary/15 text-primary border border-primary/30 shadow-2xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Invoices</span>
          <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-muted font-mono font-medium text-foreground">
            {invoicesCount}
          </span>
        </button>

        {/* Receipts Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("receipts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "receipts"
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-2xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Receipts</span>
          <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-muted font-mono font-medium text-foreground">
            {receiptsCount}
          </span>
        </button>
      </div>

      {/* Search & Filters */}
      <InvoiceFilterBar
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        salesPersonId={salesPersonId}
        onSalesPersonChange={setSalesPersonId}
        currency={currencyFilter}
        onCurrencyChange={setCurrencyFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        activeTab={activeTab}
        onClearFilters={handleClearFilters}
      />

      {/* Cards List matching screenshot */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card/50">
            <div className="p-3 rounded-2xl bg-muted text-muted-foreground mb-3">
              <Inbox className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-foreground">No records found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              No {activeTab} match your current filter criteria or search keyword.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted text-foreground"
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={() =>
                  handleOpenCreateModal(activeTab === "quotations" ? "quotation" : "invoice")
                }
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90"
              >
                + Create {activeTab === "quotations" ? "Quotation" : "Invoice"}
              </button>
            </div>
          </div>
        ) : (
          filteredItems.map((item) => (
            <InvoiceListItem
              key={item.id}
              invoice={item}
              onView={handleView}
              onEdit={handleEdit}
              onSendWhatsApp={handleSendWhatsApp}
              onMarkAsPaid={handleMarkAsPaid}
              onDuplicate={handleDuplicate}
              onConvertToInvoice={item.type === "quotation" ? handleConvertToInvoice : undefined}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Modals & Dialogs */}
      <InvoiceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialInvoice={editingInvoice}
        defaultType={modalDefaultType}
        onSave={handleSaveInvoice}
        onView={handleView}
        onSendWhatsApp={handleSendWhatsApp}
      />

      <InvoiceViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        invoice={viewingInvoice}
        onEdit={handleEdit}
        onSendWhatsApp={handleSendWhatsApp}
        onMarkAsPaid={handleMarkAsPaid}
      />

      <WhatsAppShareDialog
        open={waDialogOpen}
        onOpenChange={setWaDialogOpen}
        invoice={waInvoice}
      />
    </div>
  );
}
