"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import {
  Globe,
  Server,
  Key,
  Activity,
  Zap,
  Shield,
  Sparkles,
  ExternalLink,
  Lock,
} from "lucide-react";
import { ConfigureDomainTab } from "@/components/domain-automation/configure-domain-tab";
import { ServerMonitorTab } from "@/components/domain-automation/server-monitor-tab";
import { ApiSettingsTab } from "@/components/domain-automation/api-settings-tab";
import { DnsCheckerTab } from "@/components/domain-automation/dns-checker-tab";

type TabId = "configure" | "monitor" | "api" | "checker";

export default function DomainAutomationPage() {
  const [activeTab, setActiveTab] = useState<TabId>("configure");
  const { accountRole, profileLoading } = useAuth();

  if (!profileLoading && accountRole && !["owner", "admin"].includes(accountRole)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-4 border border-amber-500/20">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Developer Access Required</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Domain Automation, Cloudflare DNS, and VPS Server Monitoring are restricted to Developers and System Administrators.
        </p>
        <div className="mt-5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25 border border-violet-400/30">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
                Domain Automation
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 border border-violet-500/25 px-2.5 py-0.5 text-xs font-bold text-violet-400">
                <Sparkles className="h-3 w-3" /> Professional Suite
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Cloudflare, DNS setup &amp; VPS server monitoring
            </p>
          </div>
        </div>

        {/* Quick Status Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <Server className="h-3.5 w-3.5 text-sky-400" />
            <span>VPS:</span>
            <strong className="font-mono text-foreground">147.93.170.17</strong>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>CF API:</span>
            <strong className="text-emerald-400">Connected</strong>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/60">
        <button
          type="button"
          onClick={() => setActiveTab("configure")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "configure"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Globe className="h-4 w-4" />
          Configure Domain
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("monitor")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "monitor"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Server className="h-4 w-4" />
          Server Monitor
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("api")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "api"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Key className="h-4 w-4" />
          API Settings
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("checker")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === "checker"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Activity className="h-4 w-4" />
          Propagation &amp; Domains
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "configure" && <ConfigureDomainTab />}
        {activeTab === "monitor" && <ServerMonitorTab />}
        {activeTab === "api" && <ApiSettingsTab />}
        {activeTab === "checker" && <DnsCheckerTab />}
      </div>
    </div>
  );
}
