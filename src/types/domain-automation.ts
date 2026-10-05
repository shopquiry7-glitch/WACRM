export type DomainProvider = 'cloudflare' | 'namecheap_cloudflare';

export type DomainStatus = 'configured' | 'pending' | 'active' | 'error';

export type SslMode = 'off' | 'flexible' | 'full' | 'strict';

export interface DnsRecordConfig {
  id: string;
  type: 'A' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV';
  name: string;
  content: string;
  proxied: boolean;
  ttl: string | number;
  priority?: number;
  description?: string;
}

export interface SecuritySettings {
  securityLevel: string;
  emailObfuscation: boolean;
  serverSideExcludes: boolean;
  opportunisticEncryption: boolean;
  minTlsVersion: string;
  webSockets: boolean;
  browserIntegrityCheck: boolean;
  hotlinkProtection: boolean;
  autoHttpsRewrites: boolean;
  zeroRtt: boolean;
  challengeTtl: string;
}

export interface SpeedSettings {
  autoMinify: boolean;
  earlyHints103: boolean;
  http2: boolean;
  rocketLoader: boolean;
  brotli: boolean;
  http3Quic: boolean;
  zeroRttOff: boolean;
}

export interface CacheSettings {
  cacheLevel: string;
  browserCacheTtl: string;
  alwaysOnline: boolean;
  alwaysHttps: boolean;
  devMode: boolean;
}

export interface SslSettings {
  sslMode: SslMode;
  sslRecommender: boolean;
}

export interface WafSettings {
  blockCountries: string[];
  botFightMode: boolean;
  cacheBypassRules: string[];
}

export interface DomainConfiguration {
  id: string;
  domain: string;
  serverIp: string;
  provider: DomainProvider;
  status: DomainStatus;
  devMode: boolean;
  devModeExpiresAt?: string;
  nameservers: [string, string];
  sslMode: SslMode;
  dnsRecords: DnsRecordConfig[];
  securitySettings: SecuritySettings;
  speedSettings: SpeedSettings;
  cacheSettings: CacheSettings;
  sslSettings: SslSettings;
  wafSettings: WafSettings;
  wordpressOptimized: boolean;
  clientName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServerService {
  name: string;
  port: number;
  status: 'active' | 'inactive' | 'restarting';
  uptime: string;
}

export interface ServerStatus {
  ip: string;
  hostname: string;
  location: string;
  status: 'online' | 'offline' | 'degraded';
  latencyMs: number;
  cpuPercent: number;
  ramUsedGb: number;
  ramTotalGb: number;
  diskUsedGb: number;
  diskTotalGb: number;
  uptime: string;
  services: ServerService[];
  hostedDomains: {
    domain: string;
    sslActive: boolean;
    proxied: boolean;
    phpVersion: string;
    trafficToday: string;
  }[];
}

export interface DomainApiSettings {
  cloudflareApiToken: string;
  cloudflareAccountId: string;
  cloudflareEmail: string;
  namecheapApiKey: string;
  namecheapUsername: string;
  namecheapClientIp: string;
  defaultServerIp: string;
  defaultNameservers: [string, string];
}

export interface DnsNodeCheck {
  location: string;
  city: string;
  country: string;
  flag: string;
  ip: string;
  latencyMs: number;
  status: 'resolved' | 'propagating' | 'pending';
}
