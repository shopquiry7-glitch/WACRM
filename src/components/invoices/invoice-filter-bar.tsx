"use client";

import { Search, X } from "lucide-react";
import { SALES_TEAM } from "@/lib/invoices/mock-data";

interface InvoiceFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  salesPersonId: string;
  onSalesPersonChange: (value: string) => void;
  currency: string;
  onCurrencyChange: (value: string) => void;
  sortBy: "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
  onSortByChange: (value: "date-desc" | "date-asc" | "amount-desc" | "amount-asc") => void;
  activeTab: "invoices" | "quotations" | "receipts";
  onClearFilters: () => void;
}

export function InvoiceFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  salesPersonId,
  onSalesPersonChange,
  currency,
  onCurrencyChange,
  sortBy,
  onSortByChange,
  activeTab,
  onClearFilters,
}: InvoiceFilterBarProps) {
  const hasActiveFilters =
    Boolean(search) ||
    status !== "all" ||
    salesPersonId !== "all" ||
    currency !== "all" ||
    sortBy !== "date-desc";

  const placeholderText =
    activeTab === "quotations"
      ? "Search quotations by client, code, or rep..."
      : activeTab === "receipts"
      ? "Search receipts by client, transaction ID, or rep..."
      : "Search invoices...";

  return (
    <div className="space-y-3 mb-5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input matching screenshot */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholderText}
            className="w-full h-11 pl-10 pr-9 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Status Select */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-11 px-3 rounded-xl border border-border bg-card text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="sent">Sent</option>
            <option value="partial">Partial</option>
            <option value="overdue">Overdue</option>
            <option value="draft">Draft</option>
            <option value="accepted">Accepted</option>
          </select>

          {/* Sales Team Filter - Featuring Alina and Maya */}
          <select
            value={salesPersonId}
            onChange={(e) => onSalesPersonChange(e.target.value)}
            className="h-11 px-3 rounded-xl border border-border bg-card text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
          >
            <option value="all">Sales: All Team</option>
            {SALES_TEAM.map((member) => (
              <option key={member.id} value={member.id}>
                {member.displayName} ({member.role.split(" ")[0]})
              </option>
            ))}
          </select>

          {/* Currency Filter */}
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="h-11 px-3 rounded-xl border border-border bg-card text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
          >
            <option value="all">Currency</option>
            <option value="AED">AED</option>
            <option value="SAR">SAR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="PKR">PKR</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) =>
              onSortByChange(
                e.target.value as "date-desc" | "date-asc" | "amount-desc" | "amount-asc"
              )
            }
            className="h-11 px-3 rounded-xl border border-border bg-card text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="h-11 px-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors whitespace-nowrap"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
