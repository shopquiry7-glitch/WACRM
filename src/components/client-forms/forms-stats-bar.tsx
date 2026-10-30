"use client";

import { useMemo } from "react";
import type { ClientFormSubmission } from "@/types/client-forms";
import { calculateFormsStats } from "@/lib/client-forms/storage";
import {
  FileText,
  Clock,
  CheckCircle2,
  Sparkles,
  Layers,
  Coins,
} from "lucide-react";

interface FormsStatsBarProps {
  submissions: ClientFormSubmission[];
}

export function FormsStatsBar({ submissions }: FormsStatsBarProps) {
  const stats = useMemo(() => calculateFormsStats(submissions), [submissions]);

  const cards = [
    {
      title: "Total Submissions",
      value: stats.total,
      subtitle: "Lifetime client forms",
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      title: "New / Unread",
      value: stats.newCount,
      subtitle: "Require attention",
      icon: Sparkles,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "In Review / Progress",
      value: stats.reviewingCount + stats.inProgressCount,
      subtitle: "Being designed",
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Completed Projects",
      value: stats.completedCount,
      subtitle: "Delivered & approved",
      icon: CheckCircle2,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      title: "Pipeline Value",
      value: `AED ${stats.totalEstimatedRevenue}`,
      subtitle: "From client forms",
      icon: Coins,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c, i) => (
        <div
          key={i}
          className={`rounded-2xl border ${c.border} bg-card/70 p-3.5 backdrop-blur-sm shadow-xs flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground truncate">
              {c.title}
            </span>
            <div className={`flex h-7 w-7 items-center justify-center rounded-xl ${c.bg} ${c.color}`}>
              <c.icon className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {c.value}
            </div>
            <span className="text-[10px] text-muted-foreground">{c.subtitle}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

