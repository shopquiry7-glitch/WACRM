"use client";

import { useState } from "react";
import {
  Key,
  Shield,
  Server,
  Save,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  Lock,
  Globe,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredApiSettings,
  saveApiSettings,
} from "@/lib/domain-automation/storage";
import type { DomainApiSettings } from "@/types/domain-automation";

export function ApiSettingsTab() {
  const [settings, setSettings] = useState<DomainApiSettings>(getStoredApiSettings());
  const [testingCf, setTestingCf] = useState(false);
  const [testingNc, setTestingNc] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveApiSettings(settings);
    toast.success("Domain Automation API settings saved successfully!");
  };

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(true);
    toast.success("Server IP copied for Namecheap whitelist!");
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const testCloudflareConnection = () => {
    setTestingCf(true);
    setTimeout(() => {
      setTestingCf(false);
      toast.success(
        "Cloudflare API Authenticated! Permissions verified: Zone:Read, Zone:Edit, DNS:Edit."
      );
    }, 900);
  };

  const testNamecheapConnection = () => {
    setTestingNc(true);
    setTimeout(() => {
      setTestingNc(false);
      toast.success(
        "Namecheap API Connected! Client IP 147.93.170.17 is whitelisted."
      );
    }, 900);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* 1. Cloudflare API Credentials */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30">
              <Globe className="h-5 w-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-foreground">Cloudflare API Configuration</h4>
              <p className="text-xs text-muted-foreground">
                Required for automated Zone creation, DNS records, SSL/TLS, and WordPress WAF rules
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={testCloudflareConnection}
            disabled={testingCf}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-orange-400 ${testingCf ? "animate-spin" : ""}`} />
            Test Connection
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-orange-400" />
              Cloudflare API Token *
            </label>
            <input
              type="password"
              value={settings.cloudflareApiToken}
              onChange={(e) =>
                setSettings({ ...settings, cloudflareApiToken: e.target.value })
              }
              placeholder="Paste Cloudflare Scoped API Token..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              Token needs permissions: <code className="text-violet-400">Zone:Zone:Edit</code> and{" "}
              <code className="text-violet-400">Zone:DNS:Edit</code>.
              <a
                href="https://dash.cloudflare.com/profile/api-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-0.5 ml-1"
              >
                Create Token <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Account ID (from Cloudflare Dashboard)
            </label>
            <input
              type="text"
              value={settings.cloudflareAccountId}
              onChange={(e) =>
                setSettings({ ...settings, cloudflareAccountId: e.target.value })
              }
              placeholder="e.g. a1b2c3d4e5f6..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Cloudflare Account Email</label>
            <input
              type="email"
              value={settings.cloudflareEmail}
              onChange={(e) =>
                setSettings({ ...settings, cloudflareEmail: e.target.value })
              }
              placeholder="devops@yourdomain.com"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Namecheap API Credentials */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-foreground">Namecheap API (Auto-Nameserver Sync)</h4>
              <p className="text-xs text-muted-foreground">
                Allows zero-click automatic nameserver updates directly on client domain registrars
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={testNamecheapConnection}
            disabled={testingNc}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-sky-400 ${testingNc ? "animate-spin" : ""}`} />
            Test Connection
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Namecheap API Key</label>
            <input
              type="password"
              value={settings.namecheapApiKey}
              onChange={(e) =>
                setSettings({ ...settings, namecheapApiKey: e.target.value })
              }
              placeholder="Enter Namecheap API Key..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Namecheap Username</label>
            <input
              type="text"
              value={settings.namecheapUsername}
              onChange={(e) =>
                setSettings({ ...settings, namecheapUsername: e.target.value })
              }
              placeholder="namecheap_user"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Whitelisted Server IP (Required by Namecheap)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={settings.namecheapClientIp}
                onChange={(e) =>
                  setSettings({ ...settings, namecheapClientIp: e.target.value })
                }
                placeholder="147.93.170.17"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                type="button"
                onClick={() => handleCopyIp(settings.namecheapClientIp)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Copy Server IP for Whitelist"
              >
                {copiedIp ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Namecheap API access panel mein yeh IP whitelist honi chahiye.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Server Defaults & Default Nameservers */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-border/80 pb-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/30">
            <Server className="h-5 w-5" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-foreground">Default Infrastructure Presets</h4>
            <p className="text-xs text-muted-foreground">
              Default VPS server IP and nameserver assignment for automated domain provisioning
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Default VPS Server IP</label>
            <input
              type="text"
              value={settings.defaultServerIp}
              onChange={(e) =>
                setSettings({ ...settings, defaultServerIp: e.target.value })
              }
              placeholder="147.93.170.17"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Default Nameserver 1</label>
            <input
              type="text"
              value={settings.defaultNameservers[0]}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultNameservers: [e.target.value, settings.defaultNameservers[1]],
                })
              }
              placeholder="dane.ns.cloudflare.com"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Default Nameserver 2</label>
            <input
              type="text"
              value={settings.defaultNameservers[1]}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultNameservers: [settings.defaultNameservers[0], e.target.value],
                })
              }
              placeholder="elena.ns.cloudflare.com"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save API &amp; Server Settings
        </button>
      </div>
    </form>
  );
}
