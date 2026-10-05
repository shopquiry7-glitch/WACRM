"use client";

import { useState } from "react";
import {
  Server,
  Activity,
  HardDrive,
  Cpu,
  Clock,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Terminal,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { MOCK_SERVER_STATUS } from "@/lib/domain-automation/storage";

export function ServerMonitorTab() {
  const [server, setServer] = useState(MOCK_SERVER_STATUS);
  const [refreshing, setRefreshing] = useState(false);
  const [pingRunning, setPingRunning] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setServer((prev) => ({
        ...prev,
        latencyMs: Math.floor(25 + Math.random() * 20),
        cpuPercent: Math.floor(15 + Math.random() * 12),
        ramUsedGb: +(3.0 + Math.random() * 0.4).toFixed(1),
      }));
      toast.success("Server metrics updated in real time!");
    }, 600);
  };

  const handlePing = () => {
    setPingRunning(true);
    setPingResult(null);
    setTimeout(() => {
      setPingRunning(false);
      setPingResult(
        `PING ${server.ip} (56 data bytes)\n64 bytes from ${server.ip}: icmp_seq=1 ttl=54 time=32.4 ms\n64 bytes from ${server.ip}: icmp_seq=2 ttl=54 time=28.1 ms\n64 bytes from ${server.ip}: icmp_seq=3 ttl=54 time=31.8 ms\n--- ${server.ip} ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss, avg 30.7 ms`
      );
      toast.success("Ping test completed: 0% packet loss, 30.7ms avg latency.");
    }, 800);
  };

  const handleRestartService = (serviceName: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: `Reloading ${serviceName}...`,
        success: `${serviceName} reloaded successfully with zero downtime!`,
        error: "Failed to reload service.",
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Server Headline Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Server className="h-6 w-6" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-foreground font-mono">{server.ip}</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online &amp; Healthy
              </span>
              <span className="text-xs text-muted-foreground font-mono">({server.hostname})</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Location: {server.location} · Latency: <strong className="text-sky-400">{server.latencyMs}ms</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePing}
            disabled={pingRunning}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-all flex items-center gap-1.5"
          >
            <Activity className="h-3.5 w-3.5 text-sky-400" />
            Ping Test
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Ping Output Modal if active */}
      {pingResult && (
        <div className="rounded-xl border border-sky-500/30 bg-slate-950 p-4 font-mono text-xs text-sky-300 space-y-1 shadow-inner">
          <div className="flex items-center justify-between pb-1 border-b border-sky-900/50 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-sky-400" /> Ping Diagnostic Result
            </span>
            <button
              onClick={() => setPingResult(null)}
              className="text-xs hover:text-white"
            >
              ✕ Close
            </button>
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed text-emerald-400 mt-2">{pingResult}</pre>
        </div>
      )}

      {/* Resource Utilization Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Load */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <Cpu className="h-3.5 w-3.5 text-violet-400" /> CPU Usage
            </span>
            <span className="font-mono text-xs font-bold text-foreground">{server.cpuPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
              style={{ width: `${server.cpuPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">AMD EPYC™ 8 vCPU Cores</p>
        </div>

        {/* RAM Usage */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="h-3.5 w-3.5 text-sky-400" /> RAM Memory
            </span>
            <span className="font-mono text-xs font-bold text-foreground">
              {server.ramUsedGb} / {server.ramTotalGb} GB
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-500"
              style={{ width: `${(server.ramUsedGb / server.ramTotalGb) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {Math.round((server.ramUsedGb / server.ramTotalGb) * 100)}% allocated (DDR5 ECC)
          </p>
        </div>

        {/* NVMe Disk */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <HardDrive className="h-3.5 w-3.5 text-emerald-400" /> NVMe Storage
            </span>
            <span className="font-mono text-xs font-bold text-foreground">
              {server.diskUsedGb} / {server.diskTotalGb} GB
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${(server.diskUsedGb / server.diskTotalGb) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {Math.round((server.diskUsedGb / server.diskTotalGb) * 100)}% utilized (PCIe 4.0 NVMe)
          </p>
        </div>

        {/* Uptime */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5 text-amber-400" /> System Uptime
            </span>
            <span className="font-mono text-xs font-bold text-emerald-400">99.99%</span>
          </div>
          <p className="text-xs font-bold text-foreground mt-1 truncate">{server.uptime}</p>
          <p className="text-[11px] text-muted-foreground">Zero unscheduled downtime</p>
        </div>
      </div>

      {/* Services Health Matrix */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-400" />
            Core Server Services (Web, Database &amp; Cache)
          </h4>
          <span className="text-xs text-muted-foreground">All daemons operational</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {server.services.map((svc) => (
            <div
              key={svc.name}
              className="rounded-xl border border-border/80 bg-background/60 p-3 flex items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-foreground">{svc.name}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Port: <span className="font-mono text-foreground font-semibold">{svc.port}</span> · Uptime: {svc.uptime}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRestartService(svc.name)}
                className="rounded-md border border-border px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                title="Graceful reload service"
              >
                Reload
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Hosted Websites On This Server */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-sky-400" />
              Websites Hosted on {server.ip}
            </h4>
            <p className="text-xs text-muted-foreground">
              Automated domains connected via Cloudflare Edge to this VPS origin
            </p>
          </div>
          <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded-full px-2.5 py-0.5">
            {server.hostedDomains.length} Active Domains
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/80 text-muted-foreground">
                <th className="py-2.5 font-semibold">Domain Name</th>
                <th className="py-2.5 font-semibold">SSL Status</th>
                <th className="py-2.5 font-semibold">Cloudflare Proxy</th>
                <th className="py-2.5 font-semibold">PHP Environment</th>
                <th className="py-2.5 font-semibold">Traffic (24h)</th>
                <th className="py-2.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {server.hostedDomains.map((item) => (
                <tr key={item.domain} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 font-mono font-bold text-foreground flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    {item.domain}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      <ShieldCheck className="h-3 w-3" /> Full (Strict)
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 rounded bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 text-[10px] font-semibold text-orange-400">
                      Proxied 🟠
                    </span>
                  </td>
                  <td className="py-3 font-mono text-muted-foreground">{item.phpVersion}</td>
                  <td className="py-3 font-mono text-foreground font-semibold">{item.trafficToday}</td>
                  <td className="py-3 text-right">
                    <a
                      href={`https://${item.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center gap-1"
                    >
                      Visit <ExternalLink className="h-3 w-3" />
                    </a>
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
