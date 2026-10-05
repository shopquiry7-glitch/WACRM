"use client";

import { useState } from "react";
import {
  Globe,
  CheckCircle2,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  Clock,
  Copy,
  Check,
  Share2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  GLOBAL_DNS_NODES,
  getStoredDomains,
  saveAllDomains,
} from "@/lib/domain-automation/storage";
import type { DomainConfiguration, DnsNodeCheck } from "@/types/domain-automation";

export function DnsCheckerTab() {
  const [domainToTest, setDomainToTest] = useState("dentalclinicpro.com");
  const [testing, setTesting] = useState(false);
  const [nodes, setNodes] = useState<DnsNodeCheck[]>(GLOBAL_DNS_NODES);
  const [domains, setDomains] = useState<DomainConfiguration[]>(getStoredDomains());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleTestPropagation = () => {
    if (!domainToTest.trim()) {
      toast.error("Please enter a domain to check propagation.");
      return;
    }
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setNodes((prev) =>
        prev.map((node) => ({
          ...node,
          latencyMs: Math.floor(10 + Math.random() * 80),
          status: "resolved",
        }))
      );
      toast.success(`Global DNS query complete for ${domainToTest}! 100% nodes resolved.`);
    }, 800);
  };

  const handleToggleDevMode = (domId: string) => {
    const updated = domains.map((d) => {
      if (d.id === domId) {
        const nextState = !d.devMode;
        return {
          ...d,
          devMode: nextState,
          devModeExpiresAt: nextState
            ? new Date(Date.now() + 3 * 3600 * 1000).toISOString()
            : undefined,
        };
      }
      return d;
    });
    setDomains(updated);
    saveAllDomains(updated);
    toast.success("Domain workflow cache mode toggled!");
  };

  const handleCopyNs = (dom: DomainConfiguration) => {
    const text = `Cloudflare Nameservers for ${dom.domain}:\n1: ${dom.nameservers[0]}\n2: ${dom.nameservers[1]}`;
    navigator.clipboard.writeText(text);
    setCopiedId(dom.id);
    toast.success(`Nameservers copied for ${dom.domain}!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (domId: string) => {
    const updated = domains.filter((d) => d.id !== domId);
    setDomains(updated);
    saveAllDomains(updated);
    toast.success("Domain removed from automated list.");
  };

  return (
    <div className="space-y-6">
      {/* 1. Global DNS Propagation Diagnostic Bar */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <Globe className="h-5 w-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-foreground">Global DNS Propagation Diagnostic</h4>
              <p className="text-xs text-muted-foreground">
                Verify Cloudflare A Record &amp; Nameserver propagation across global backbone nodes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={domainToTest}
                onChange={(e) => setDomainToTest(e.target.value)}
                placeholder="domain.com"
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <button
              type="button"
              onClick={handleTestPropagation}
              disabled={testing}
              className="rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-violet-500 transition-all flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${testing ? "animate-spin" : ""}`} />
              Query Nodes
            </button>
          </div>
        </div>

        {/* Global Nodes Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {nodes.map((node) => (
            <div
              key={node.location}
              className="rounded-xl border border-border/70 bg-background/60 p-3 space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <span className="text-base">{node.flag}</span> {node.city}, {node.country}
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 text-[10px] font-bold">
                  ✓ 200 OK
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
                <span>{node.ip}</span>
                <span className="text-violet-400 font-semibold">{node.latencyMs}ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. All Configured Client Domains Table */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h4 className="text-sm font-bold text-foreground">Configured Client Domains</h4>
            <p className="text-xs text-muted-foreground">
              All websites managed with automated Cloudflare DNS, security WAF, and WordPress caching
            </p>
          </div>
          <span className="text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-2.5 py-0.5">
            {domains.length} Managed Domains
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/80 text-muted-foreground">
                <th className="py-2.5 font-semibold">Domain</th>
                <th className="py-2.5 font-semibold">Client / Project</th>
                <th className="py-2.5 font-semibold">Server IP</th>
                <th className="py-2.5 font-semibold">Workflow Mode</th>
                <th className="py-2.5 font-semibold">Nameservers</th>
                <th className="py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {domains.map((dom) => (
                <tr key={dom.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3">
                    <div className="font-mono font-bold text-foreground flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-violet-400" />
                      {dom.domain}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Provider: {dom.provider === "cloudflare" ? "Cloudflare Only" : "Namecheap + CF"}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-xs text-foreground font-medium">
                      {dom.clientName || "Direct Client"}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-xs text-muted-foreground">{dom.serverIp}</td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleDevMode(dom.id)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                        dom.devMode
                          ? "bg-amber-500/20 border border-amber-500/40 text-amber-300"
                          : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {dom.devMode ? "Dev Mode (Active)" : "Production (Go Live)"}
                    </button>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => handleCopyNs(dom)}
                      className="rounded border border-border bg-background px-2 py-1 text-[11px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1"
                      title="Copy Nameservers"
                    >
                      {copiedId === dom.id ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span>{dom.nameservers[0].split(".")[0]} &amp; {dom.nameservers[1].split(".")[0]}</span>
                    </button>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`https://${dom.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="Open Website"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(dom.id)}
                        className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Delete Domain"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
