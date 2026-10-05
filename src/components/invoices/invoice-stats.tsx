"use client";

import type { InvoiceStats } from "@/types/invoices";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";

interface InvoiceStatsProps {
  stats: InvoiceStats;
  activeCurrency?: string;
}

export function InvoiceStatsBar({ stats, activeCurrency = "AED" }: InvoiceStatsProps) {
  const formatAmount = (num: number) => {
    return `${activeCurrency} ${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const statCards = [
    {
      label: "Total Billed",
      value: formatAmount(stats.totalInvoiced),
      countText: `${stats.invoiceCount} invoices`,
      icon: DollarSign,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      accent: "from-blue-500/10 to-transparent",
    },
    {
      label: "Total Collected",
      value: formatAmount(stats.totalPaid),
      countText: `${stats.receiptCount} payment receipts`,
      icon: CheckCircle2,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      accent: "from-emerald-500/10 to-transparent",
    },
    {
      label: "Pending / Due",
      value: formatAmount(stats.totalPending),
      countText: "Awaiting settlement",
      icon: Clock,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      accent: "from-amber-500/10 to-transparent",
    },
    {
      label: "Overdue Amount",
      value: formatAmount(stats.totalOverdue),
      countText: "Requires follow-up",
      icon: AlertTriangle,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      accent: "from-rose-500/10 to-transparent",
    },
    {
      label: "Active Proposals",
      value: `${stats.quotationCount} Quotes`,
      countText: "Pipeline estimates",
      icon: FileSpreadsheet,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      accent: "from-purple-500/10 to-transparent",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
      {statCards.map((card, idx) => (
        <div
          key={idx}
          className="relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-primary/30"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {card.label}
            </span>
            <div className={`p-2 rounded-lg border ${card.color}`}>
              <card.icon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {card.value}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground font-medium">
              {card.countText}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
