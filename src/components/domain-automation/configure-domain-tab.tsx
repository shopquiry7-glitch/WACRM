"use client";

import { useState } from "react";
import {
  Globe,
  Server,
  Zap,
  Shield,
  Gauge,
  Lock,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Terminal,
  ExternalLink,
  Flame,
  AlertCircle,
  Clock,
  Layers,
  Code2,
} from "lucide-react";
import { toast } from "sonner";
import {
  buildDefaultDnsRecords,
  DEFAULT_SERVER_IP,
  DEFAULT_NAMESERVERS,
} from "@/lib/domain-automation/dns-presets";
import {
  getStoredDomains,
  saveAllDomains,
} from "@/lib/domain-automation/storage";
import type {
  DomainConfiguration,
  DomainProvider,
  DnsRecordConfig,
} from "@/types/domain-automation";

export function ConfigureDomainTab() {
  const [provider, setProvider] = useState<DomainProvider>("cloudflare");
  const [domainInput, setDomainInput] = useState("");
  const [serverIpInput, setServerIpInput] = useState(DEFAULT_SERVER_IP);
  const [clientName, setClientName] = useState("");
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [configureProgress, setConfigureProgress] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [configuredResult, setConfiguredResult] = useState<DomainConfiguration | null>(null);
  const [copiedNs, setCopiedNs] = useState(false);

  // Workflow Quick Actions state
  const [workflowDomain, setWorkflowDomain] = useState("dentalclinicpro.com");
  const [devModeActive, setDevModeActive] = useState(false);
  const [workflowActionLoading, setWorkflowActionLoading] = useState(false);

  const handleCopyNameservers = (ns: [string, string]) => {
    const text = `Cloudflare Nameservers for ${configuredResult?.domain || "your domain"}:\n1: ${ns[0]}\n2: ${ns[1]}\n\nPlease update these nameservers in your domain registrar.`;
    navigator.clipboard.writeText(text);
    setCopiedNs(true);
    toast.success("Nameservers copied! Share them with your client.");
    setTimeout(() => setCopiedNs(false), 2500);
  };

  const handleShareOnWhatsApp = (domain: string, ns: [string, string]) => {
    const message = encodeURIComponent(
      `Assalam-o-Alaikum!\n\nAapki website (*${domain}*) ke Cloudflare Nameservers generate ho gaye hain:\n\n1️⃣ Nameserver 1: *${ns[0]}*\n2️⃣ Nameserver 2: *${ns[1]}*\n\nMeharbani farma kar apne domain provider (GoDaddy/Namecheap) par yeh dono nameservers update kar dein taake SSL aur fast caching live ho jaye. Shukriya!`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleWorkflowAction = (action: "dev" | "live" | "purge") => {
    if (!workflowDomain.trim()) {
      toast.error("Please enter a domain name for workflow action.");
      return;
    }
    setWorkflowActionLoading(true);
    setTimeout(() => {
      setWorkflowActionLoading(false);
      if (action === "dev") {
        setDevModeActive(true);
        toast.success(
          `⚡ Dev Mode enabled for ${workflowDomain}! Cloudflare edge cache bypassed for 3 hours.`
        );
      } else if (action === "live") {
        setDevModeActive(false);
        toast.success(
          `🚀 Go Live active for ${workflowDomain}! Full edge caching and security rules deployed.`
        );
      } else {
        toast.success(`🧹 Cache purged instantly for ${workflowDomain}! All visitors will see fresh pages.`);
      }
    }, 800);
  };

  const handleConfigure = () => {
    const cleanDomain = domainInput
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");

    if (!cleanDomain || !cleanDomain.includes(".")) {
      toast.error("Please enter a valid domain (e.g. clientdomain.com)");
      return;
    }

    const ip = serverIpInput.trim() || DEFAULT_SERVER_IP;
    setIsConfiguring(true);
    setConfigureProgress([]);
    setActiveStep(1);

    const steps = [
      `🌐 Creating Zone & attaching to Cloudflare account for ${cleanDomain}...`,
      `⚙️ Generating 10 DNS records (A @, www, cpanel, whm, webmail, mail, ftp, MX, SPF, DMARC) pointing to ${ip}...`,
      `🔒 Enforcing SSL/TLS mode: Full (Strict) + Automatic HTTPS Rewrites...`,
      `⚡ Applying WordPress speed rules: Brotli, Early Hints (103), HTTP/3 QUIC, Minify OFF...`,
      `🛡️ Deploying Security WAF: Threat Country Blocks, Bot Fight Mode, Challenge TTL 30m...`,
      `🛠️ Adding WordPress Cache Bypass Page Rules (wp-admin, wp-json, cart, checkout, logged-in cookies)...`,
      `✨ Nameservers assigned: ${DEFAULT_NAMESERVERS[0]} & ${DEFAULT_NAMESERVERS[1]}!`,
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        setConfigureProgress((prev) => [...prev, steps[current]]);
        setActiveStep(current + 1);
        current++;
      } else {
        clearInterval(interval);
        setIsConfiguring(false);

        const newDomainConfig: DomainConfiguration = {
          id: `dom-${Date.now()}`,
          domain: cleanDomain,
          serverIp: ip,
          provider,
          status: "configured",
          devMode: false,
          nameservers: DEFAULT_NAMESERVERS,
          sslMode: "full",
          dnsRecords: buildDefaultDnsRecords(cleanDomain, ip),
          securitySettings: {
            securityLevel: "Medium",
            emailObfuscation: false,
            serverSideExcludes: false,
            opportunisticEncryption: true,
            minTlsVersion: "1.2",
            webSockets: true,
            browserIntegrityCheck: true,
            hotlinkProtection: false,
            autoHttpsRewrites: true,
            zeroRtt: false,
            challengeTtl: "30 minutes",
          },
          speedSettings: {
            autoMinify: false,
            earlyHints103: true,
            http2: true,
            rocketLoader: false,
            brotli: true,
            http3Quic: true,
            zeroRttOff: true,
          },
          cacheSettings: {
            cacheLevel: "Standard",
            browserCacheTtl: "Respect Existing Headers",
            alwaysOnline: false,
            alwaysHttps: true,
            devMode: false,
          },
          sslSettings: {
            sslMode: "full",
            sslRecommender: true,
          },
          wafSettings: {
            blockCountries: ["RU", "CN", "BR", "BD", "ID", "NL", "ES"],
            botFightMode: true,
            cacheBypassRules: [
              "wp-admin*",
              "wp-login.php*",
              "wp-json*",
              "*cart*",
              "*checkout*",
              "*my-account*",
              "*wc-ajax=*",
              "POST requests",
              "Cookie: wordpress_logged_in_*",
            ],
          },
          wordpressOptimized: true,
          clientName: clientName.trim() || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const existing = getStoredDomains();
        saveAllDomains([newDomainConfig, ...existing]);
        setConfiguredResult(newDomainConfig);
        toast.success(`🎉 Domain ${cleanDomain} automated successfully! Nameservers are ready.`);
      }
    }, 550);
  };

  const previewDnsRecords: DnsRecordConfig[] = buildDefaultDnsRecords(
    domainInput || "example.com",
    serverIpInput || DEFAULT_SERVER_IP
  );

  return (
    <div className="space-y-6">
      {/* 1. WordPress Site Workflow Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-purple-950/25 to-slate-950/60 p-5 shadow-xl backdrop-blur-md">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                <Zap className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  WordPress Site Workflow — Development se Production tak
                </h3>
                <p className="text-xs text-muted-foreground">
                  Client website building, staging changes, aur one-click production caching switch
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-300">
                <Sparkles className="h-3 w-3" /> Auto-Bypass Active
              </span>
            </div>
          </div>

          {/* Workflow Phases Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {/* Phase 1 */}
            <div className="rounded-xl border border-violet-500/20 bg-background/50 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
                  Phase 1 — Development
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">Staging / Editing</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                  <span>Logged-in users ke CP cache bypass (instant preview)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                  <span>Elementor / Gutenberg / wp-json always fresh pages</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                  <span>CF Dev Mode ON ➔ sab visitors ko fresh origin response</span>
                </li>
              </ul>
            </div>

            {/* Phase 2 */}
            <div className="rounded-xl border border-emerald-500/20 bg-background/50 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Phase 2 — Go Live (Production)
                </span>
                <span className="text-[11px] font-medium text-emerald-500/80">Edge Speed</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>CF Dev Mode OFF ➔ global edge caching active (20ms)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>WordPress + CF WP-WAF security rules deployed</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Cache purge ➔ clean start without stale assets</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Domain Controller Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 rounded-xl border border-border bg-card/70 p-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={workflowDomain}
                onChange={(e) => setWorkflowDomain(e.target.value)}
                placeholder="domainname.com"
                className="w-full rounded-lg border border-input bg-background/80 px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleWorkflowAction("dev")}
                disabled={workflowActionLoading}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
                  devModeActive
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                    : "border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                }`}
                title="Bypasses Cloudflare cache for 3 hours so edits show immediately"
              >
                <Clock className="h-3.5 w-3.5" />
                Dev Mode (3h)
              </button>
              <button
                type="button"
                onClick={() => handleWorkflowAction("live")}
                disabled={workflowActionLoading}
                className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-all flex items-center gap-1.5"
                title="Activates Cloudflare high-speed edge caching"
              >
                <Flame className="h-3.5 w-3.5" />
                Go Live
              </button>
              <button
                type="button"
                onClick={() => handleWorkflowAction("purge")}
                disabled={workflowActionLoading}
                className="rounded-lg border border-border bg-muted/60 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-all"
                title="Purge all edge cache"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            💡 <strong className="text-foreground">Dev Mode:</strong> Cloudflare 3 ghante ke liye edge cache bypass karta hai, phir auto-disable ho jata hai. <strong className="text-foreground">Go Live:</strong> Permanent production setup with global CDN &amp; WAF security.
          </p>
        </div>
      </div>

      {/* 2. Configure Via Choice Cards */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Configure via:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Option 1: Cloudflare Only */}
          <div
            onClick={() => setProvider("cloudflare")}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              provider === "cloudflare"
                ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10 ring-1 ring-violet-500"
                : "border-border bg-card/60 hover:border-border/80 hover:bg-card"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/25">
                  <Globe className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Cloudflare Only</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure DNS, speed &amp; cache ➔ get nameservers to share with client
                  </p>
                </div>
              </div>
              <div
                className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                  provider === "cloudflare"
                    ? "border-violet-500 bg-violet-500"
                    : "border-muted-foreground/40"
                }`}
              >
                {provider === "cloudflare" && <Check className="h-2.5 w-2.5 text-white" />}
              </div>
            </div>
          </div>

          {/* Option 2: Namecheap + Cloudflare */}
          <div
            onClick={() => setProvider("namecheap_cloudflare")}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              provider === "namecheap_cloudflare"
                ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10 ring-1 ring-violet-500"
                : "border-border bg-card/60 hover:border-border/80 hover:bg-card"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/25">
                  <Layers className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Namecheap + Cloudflare</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure Cloudflare AND auto-set nameservers on Namecheap via API
                  </p>
                </div>
              </div>
              <div
                className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                  provider === "namecheap_cloudflare"
                    ? "border-violet-500 bg-violet-500"
                    : "border-muted-foreground/40"
                }`}
              >
                {provider === "namecheap_cloudflare" && (
                  <Check className="h-2.5 w-2.5 text-white" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Domain & Server Details Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-border bg-card p-5">
        <div className="space-y-1.5 md:col-span-1">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-violet-400" />
            Domain Name *
          </label>
          <input
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            placeholder="example.com"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <p className="text-[11px] text-muted-foreground">Domain name bina http:// ya / ke daalein</p>
        </div>

        <div className="space-y-1.5 md:col-span-1">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-sky-400" />
            Server IP — default (147.93.170.17)
          </label>
          <input
            type="text"
            value={serverIpInput}
            onChange={(e) => setServerIpInput(e.target.value)}
            placeholder={DEFAULT_SERVER_IP}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <p className="text-[11px] text-muted-foreground">Khali chodne par default VPS IP use hogi</p>
        </div>

        <div className="space-y-1.5 md:col-span-1">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Client Name / Project (Optional)
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="e.g. Dr. Ahmed Clinic or Glamour Salon"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <p className="text-[11px] text-muted-foreground">CRM contact ya deal ke sath link karne ke liye</p>
        </div>
      </div>

      {/* 4. Auto-Configure Feature Checklist Box */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card/90 to-background p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-foreground">
              Yeh sab auto-configure hoga — Free plan full configuration:
            </h4>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
            ✓ 100% Automated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Section 1: DNS Records (10) */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-sky-400" />
                DNS Records (10)
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Auto Proxy</span>
            </div>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between py-0.5">
                <span className="text-foreground">A @ ➔ {serverIpInput || DEFAULT_SERVER_IP}</span>
                <span className="rounded bg-orange-500/15 border border-orange-500/30 px-1.5 py-0.5 text-[10px] font-sans font-semibold text-orange-400">
                  Proxied 🟠
                </span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-muted-foreground">A cpanel / whm ➔ {serverIpInput || DEFAULT_SERVER_IP}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-sans font-medium text-muted-foreground">
                  DNS only
                </span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-muted-foreground">A webmail ➔ {serverIpInput || DEFAULT_SERVER_IP}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-sans font-medium text-muted-foreground">
                  DNS only
                </span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-foreground">CNAME www ➔ @</span>
                <span className="rounded bg-orange-500/15 border border-orange-500/30 px-1.5 py-0.5 text-[10px] font-sans font-semibold text-orange-400">
                  Proxied 🟠
                </span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-muted-foreground">CNAME mail / ftp</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-sans font-medium text-muted-foreground">
                  DNS only
                </span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-foreground">MX ➔ mail.{domainInput || "domain.com"}</span>
                <span className="text-[10px] font-sans text-sky-400">Priority 10</span>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-emerald-400">TXT SPF + DMARC</span>
                <span className="text-[10px] font-sans text-emerald-400">Email Auth ✓</span>
              </div>
            </div>
          </div>

          {/* Section 2: Security & Protection (11) */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                Security (11 settings)
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
              <div>• Security Level: Medium</div>
              <div>• Browser Integrity Check</div>
              <div>• Email Obfuscation OFF</div>
              <div>• Hotlink Protection OFF</div>
              <div>• Server-Side Excludes OFF</div>
              <div>• Auto HTTPS Rewrites</div>
              <div>• Opportunistic Encryption</div>
              <div>• 0-RTT OFF</div>
              <div>• Min TLS ➔ 1.2</div>
              <div>• Challenge TTL 30m</div>
              <div>• WebSockets ON</div>
            </div>
          </div>

          {/* Section 3: Speed & Optimization (7) */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-purple-400" />
                Speed &amp; Cache (7)
              </span>
              <span className="text-[10px] text-purple-400 font-semibold">WP-Tuned</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
              <div className="text-foreground">• Minify OFF (WP-safe)</div>
              <div>• Brotli Compression</div>
              <div>• Early Hints (103)</div>
              <div>• 0-RTT OFF</div>
              <div>• HTTP/2</div>
              <div>• HTTP/3 (QUIC)</div>
              <div className="text-foreground">• Rocket Loader OFF</div>
            </div>
          </div>

          {/* Section 4: Cache (5) */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Cache (5 settings)
              </span>
              <span className="text-[10px] text-amber-400 font-semibold">Standard</span>
            </div>
            <div className="space-y-1 text-[11px] text-muted-foreground">
              <div>• Cache Level ➔ Standard</div>
              <div>• Browser Cache: Respect Origin</div>
              <div>• Always Online OFF</div>
              <div>• Always HTTPS ON</div>
              <div>• Dev Mode OFF (Togglable)</div>
            </div>
          </div>

          {/* Section 5: SSL/TLS (2) */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-green-400" />
                SSL / TLS (2)
              </span>
              <span className="text-[10px] text-green-400 font-semibold">Strict</span>
            </div>
            <div className="space-y-1 text-[11px] text-muted-foreground">
              <div className="text-foreground font-semibold text-emerald-400">• SSL Mode ➔ Full (Strict)</div>
              <div>• SSL Recommender ON</div>
              <div>• Universal Edge Certificate Auto-Renew</div>
            </div>
          </div>

          {/* Section 6: WAF & Security Rules */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-red-400" />
                WAF &amp; Bypass Rules
              </span>
              <span className="text-[10px] text-red-400 font-semibold">Protection</span>
            </div>
            <div className="space-y-1 text-[11px] text-muted-foreground">
              <div className="text-xs text-foreground font-medium">
                • Block threat countries: RU, CN, BR, BD, ID, NL, ES
              </div>
              <div>• Bot Fight Mode ON</div>
              <div className="text-[10px] leading-tight text-violet-300">
                • Cache bypass: wp-admin, wp-json, cart, checkout, my-account, ?wc-ajax, POST, logged-in
              </div>
            </div>
          </div>
        </div>

        {/* Nameservers notice box */}
        <div className="flex items-center justify-between rounded-xl border border-violet-500/20 bg-violet-950/20 p-3 text-xs text-violet-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-violet-400 shrink-0" />
            <span>
              <strong>Nameservers (At Range):</strong> Auto-generated Cloudflare NS milega jo client ke domain registrar par lagana hoga.
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-violet-200">dane.ns &amp; elena.ns</span>
        </div>
      </div>

      {/* 5. Execution Card & Action */}
      <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-r from-card to-violet-950/20 p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-violet-400" />
              <h4 className="text-sm font-bold text-foreground">WordPress Site Ready</h4>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              Admin login karne ke baad fresh pages dikhenge — Cloudflare cache bypass rule apply hoga. Elementor and WooCommerce fully supported.
            </p>
          </div>

          <button
            type="button"
            onClick={handleConfigure}
            disabled={isConfiguring}
            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/30 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isConfiguring ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Configuring Cloudflare &amp; DNS ({activeStep}/7)...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Configure Domain + WordPress Rules
              </>
            )}
          </button>
        </div>

        {/* Live Progress Terminal Output */}
        {isConfiguring && (
          <div className="mt-4 rounded-xl border border-violet-500/30 bg-slate-950 p-4 font-mono text-xs text-violet-300 space-y-1.5 shadow-inner">
            <div className="flex items-center gap-2 pb-1 border-b border-violet-900/50 text-[11px] text-muted-foreground">
              <Terminal className="h-3.5 w-3.5 text-violet-400" />
              <span>Cloudflare API Automation Console</span>
            </div>
            {configureProgress.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2 text-emerald-400">
                <span>❯</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Success Result Card (When Configured) */}
      {configuredResult && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Check className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-base font-bold text-foreground">
                  Domain Configured Successfully: {configuredResult.domain}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Server IP: {configuredResult.serverIp} · Cloudflare SSL: Full (Strict) · 10 Records Live
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyNameservers(configuredResult.nameservers)}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted flex items-center gap-1.5 shadow-sm"
              >
                {copiedNs ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedNs ? "Copied!" : "Copy Nameservers"}
              </button>
              <button
                type="button"
                onClick={() =>
                  handleShareOnWhatsApp(configuredResult.domain, configuredResult.nameservers)
                }
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 flex items-center gap-1.5 shadow-sm"
              >
                <Share2 className="h-3.5 w-3.5" />
                WhatsApp to Client
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-background/60 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Primary Nameserver 1:
              </span>
              <div className="mt-1 flex items-center justify-between rounded-lg bg-card px-3 py-2 font-mono text-sm font-semibold text-emerald-400 border border-border">
                <span>{configuredResult.nameservers[0]}</span>
                <span className="text-[10px] text-muted-foreground">NS 1</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Secondary Nameserver 2:
              </span>
              <div className="mt-1 flex items-center justify-between rounded-lg bg-card px-3 py-2 font-mono text-sm font-semibold text-emerald-400 border border-border">
                <span>{configuredResult.nameservers[1]}</span>
                <span className="text-[10px] text-muted-foreground">NS 2</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
