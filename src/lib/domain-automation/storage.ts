import type {
  DomainConfiguration,
  DomainApiSettings,
  ServerStatus,
  DnsNodeCheck,
} from '@/types/domain-automation';
import {
  DEFAULT_SERVER_IP,
  DEFAULT_NAMESERVERS,
  buildDefaultDnsRecords,
  DEFAULT_SECURITY_SETTINGS,
  DEFAULT_SPEED_SETTINGS,
  DEFAULT_CACHE_SETTINGS,
  DEFAULT_SSL_SETTINGS,
  DEFAULT_WAF_SETTINGS,
} from './dns-presets';

const STORAGE_DOMAINS_KEY = 'wacrm_domain_automations_v1';
const STORAGE_API_KEY = 'wacrm_domain_api_settings_v1';

export const INITIAL_DOMAINS: DomainConfiguration[] = [
  {
    id: 'dom-1',
    domain: 'dentalclinicpro.com',
    serverIp: DEFAULT_SERVER_IP,
    provider: 'cloudflare',
    status: 'active',
    devMode: false,
    nameservers: DEFAULT_NAMESERVERS,
    sslMode: 'full',
    dnsRecords: buildDefaultDnsRecords('dentalclinicpro.com', DEFAULT_SERVER_IP),
    securitySettings: DEFAULT_SECURITY_SETTINGS,
    speedSettings: DEFAULT_SPEED_SETTINGS,
    cacheSettings: DEFAULT_CACHE_SETTINGS,
    sslSettings: DEFAULT_SSL_SETTINGS,
    wafSettings: DEFAULT_WAF_SETTINGS,
    wordpressOptimized: true,
    clientName: 'Dr. Tariq Mahmood (Clinic Pro)',
    notes: 'WordPress + WooCommerce Appointment booking live with Cloudflare Edge Cache',
    createdAt: '2026-09-24T10:00:00Z',
    updatedAt: '2026-09-29T14:30:00Z',
  },
  {
    id: 'dom-2',
    domain: 'glamourlounge.pk',
    serverIp: DEFAULT_SERVER_IP,
    provider: 'namecheap_cloudflare',
    status: 'active',
    devMode: true,
    devModeExpiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    nameservers: DEFAULT_NAMESERVERS,
    sslMode: 'full',
    dnsRecords: buildDefaultDnsRecords('glamourlounge.pk', DEFAULT_SERVER_IP),
    securitySettings: DEFAULT_SECURITY_SETTINGS,
    speedSettings: DEFAULT_SPEED_SETTINGS,
    cacheSettings: { ...DEFAULT_CACHE_SETTINGS, devMode: true },
    sslSettings: DEFAULT_SSL_SETTINGS,
    wafSettings: DEFAULT_WAF_SETTINGS,
    wordpressOptimized: true,
    clientName: 'Sara Khan (Salon Suite)',
    notes: 'Dev Mode Active: Elementor design edits in progress; caching bypassed for 3h',
    createdAt: '2026-09-28T12:00:00Z',
    updatedAt: '2026-10-01T11:00:00Z',
  },
  {
    id: 'dom-3',
    domain: 'jeosetechsol.com',
    serverIp: DEFAULT_SERVER_IP,
    provider: 'cloudflare',
    status: 'configured',
    devMode: false,
    nameservers: DEFAULT_NAMESERVERS,
    sslMode: 'full',
    dnsRecords: buildDefaultDnsRecords('jeosetechsol.com', DEFAULT_SERVER_IP),
    securitySettings: DEFAULT_SECURITY_SETTINGS,
    speedSettings: DEFAULT_SPEED_SETTINGS,
    cacheSettings: DEFAULT_CACHE_SETTINGS,
    sslSettings: DEFAULT_SSL_SETTINGS,
    wafSettings: DEFAULT_WAF_SETTINGS,
    wordpressOptimized: true,
    clientName: 'Jeose Tech Solutions',
    notes: 'Nameservers sent to client on WhatsApp; awaiting client NS update',
    createdAt: '2026-09-30T09:15:00Z',
    updatedAt: '2026-09-30T09:15:00Z',
  },
];

export const INITIAL_API_SETTINGS: DomainApiSettings = {
  cloudflareApiToken: '••••••••••••••••••••••••••••••••••••••••',
  cloudflareAccountId: 'a1b2c3d4e5f6789012345678abcdef01',
  cloudflareEmail: 'devops@jeosecrm.com',
  namecheapApiKey: '••••••••••••••••••••••••••••••••',
  namecheapUsername: 'jeosehost',
  namecheapClientIp: '147.93.170.17',
  defaultServerIp: DEFAULT_SERVER_IP,
  defaultNameservers: DEFAULT_NAMESERVERS,
};

export const MOCK_SERVER_STATUS: ServerStatus = {
  ip: DEFAULT_SERVER_IP,
  hostname: 'vps-core-de-01.jeose.net',
  location: 'Frankfurt, Germany (Fast EU-PK Route)',
  status: 'online',
  latencyMs: 38,
  cpuPercent: 19,
  ramUsedGb: 3.1,
  ramTotalGb: 8.0,
  diskUsedGb: 38.6,
  diskTotalGb: 160.0,
  uptime: '47 days, 14 hours, 22 mins',
  services: [
    { name: 'Nginx Reverse Proxy', port: 80, status: 'active', uptime: '99.98%' },
    { name: 'Nginx SSL (HTTPS)', port: 443, status: 'active', uptime: '99.99%' },
    { name: 'PHP-FPM 8.2 & 8.3', port: 9000, status: 'active', uptime: '99.95%' },
    { name: 'MariaDB / MySQL', port: 3306, status: 'active', uptime: '99.99%' },
    { name: 'Redis Object Cache', port: 6379, status: 'active', uptime: '100%' },
    { name: 'SSH Secure Shell', port: 22, status: 'active', uptime: '100%' },
  ],
  hostedDomains: [
    { domain: 'dentalclinicpro.com', sslActive: true, proxied: true, phpVersion: 'PHP 8.2', trafficToday: '14.2K req' },
    { domain: 'glamourlounge.pk', sslActive: true, proxied: true, phpVersion: 'PHP 8.2', trafficToday: '8.7K req' },
    { domain: 'jeosetechsol.com', sslActive: true, proxied: true, phpVersion: 'PHP 8.3', trafficToday: '3.1K req' },
    { domain: 'crmverse.app', sslActive: true, proxied: true, phpVersion: 'Next.js 16', trafficToday: '89.4K req' },
  ],
};

export const GLOBAL_DNS_NODES: DnsNodeCheck[] = [
  { location: 'London', city: 'London', country: 'United Kingdom', flag: '🇬🇧', ip: '147.93.170.17', latencyMs: 18, status: 'resolved' },
  { location: 'Frankfurt', city: 'Frankfurt', country: 'Germany', flag: '🇩🇪', ip: '147.93.170.17', latencyMs: 12, status: 'resolved' },
  { location: 'New York', city: 'New York', country: 'United States', flag: '🇺🇸', ip: '147.93.170.17', latencyMs: 74, status: 'resolved' },
  { location: 'Singapore', city: 'Singapore', country: 'Singapore', flag: '🇸🇬', ip: '147.93.170.17', latencyMs: 65, status: 'resolved' },
  { location: 'Dubai', city: 'Dubai', country: 'United Arab Emirates', flag: '🇦🇪', ip: '147.93.170.17', latencyMs: 42, status: 'resolved' },
  { location: 'Tokyo', city: 'Tokyo', country: 'Japan', flag: '🇯🇵', ip: '147.93.170.17', latencyMs: 110, status: 'resolved' },
  { location: 'Sydney', city: 'Sydney', country: 'Australia', flag: '🇦🇺', ip: '147.93.170.17', latencyMs: 145, status: 'resolved' },
  { location: 'Sao Paulo', city: 'Sao Paulo', country: 'Brazil', flag: '🇧🇷', ip: '147.93.170.17', latencyMs: 168, status: 'resolved' },
];

export function getStoredDomains(): DomainConfiguration[] {
  if (typeof window === 'undefined') return INITIAL_DOMAINS;
  try {
    const raw = localStorage.getItem(STORAGE_DOMAINS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_DOMAINS_KEY, JSON.stringify(INITIAL_DOMAINS));
      return INITIAL_DOMAINS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DOMAINS;
  } catch (err) {
    console.error('Failed to load domains from storage:', err);
    return INITIAL_DOMAINS;
  }
}

export function saveAllDomains(domains: DomainConfiguration[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_DOMAINS_KEY, JSON.stringify(domains));
  } catch (err) {
    console.error('Failed to persist domains:', err);
  }
}

export function getStoredApiSettings(): DomainApiSettings {
  if (typeof window === 'undefined') return INITIAL_API_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_API_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_API_KEY, JSON.stringify(INITIAL_API_SETTINGS));
      return INITIAL_API_SETTINGS;
    }
    return { ...INITIAL_API_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_API_SETTINGS;
  }
}

export function saveApiSettings(settings: DomainApiSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_API_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save API settings:', err);
  }
}
