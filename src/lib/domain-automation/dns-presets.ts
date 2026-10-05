import type {
  DnsRecordConfig,
  SecuritySettings,
  SpeedSettings,
  CacheSettings,
  SslSettings,
  WafSettings,
} from '@/types/domain-automation';

export const DEFAULT_SERVER_IP = '147.93.170.17';

export const DEFAULT_NAMESERVERS: [string, string] = [
  'dane.ns.cloudflare.com',
  'elena.ns.cloudflare.com',
];

export function buildDefaultDnsRecords(
  domain: string,
  serverIp: string = DEFAULT_SERVER_IP
): DnsRecordConfig[] {
  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const ip = serverIp.trim() || DEFAULT_SERVER_IP;

  return [
    {
      id: 'dns-1',
      type: 'A',
      name: '@',
      content: ip,
      proxied: true,
      ttl: 'Auto',
      description: 'Root domain — Web traffic routed through Cloudflare edge',
    },
    {
      id: 'dns-2',
      type: 'CNAME',
      name: 'www',
      content: cleanDomain || '@',
      proxied: true,
      ttl: 'Auto',
      description: 'WWW canonical alias — Proxied for edge speed',
    },
    {
      id: 'dns-3',
      type: 'A',
      name: 'cpanel',
      content: ip,
      proxied: false,
      ttl: 'Auto',
      description: 'cPanel server access (Bypasses proxy for direct login)',
    },
    {
      id: 'dns-4',
      type: 'A',
      name: 'whm',
      content: ip,
      proxied: false,
      ttl: 'Auto',
      description: 'WHM server management access (DNS only)',
    },
    {
      id: 'dns-5',
      type: 'A',
      name: 'webmail',
      content: ip,
      proxied: false,
      ttl: 'Auto',
      description: 'Webmail direct interface (DNS only)',
    },
    {
      id: 'dns-6',
      type: 'CNAME',
      name: 'mail',
      content: cleanDomain || '@',
      proxied: false,
      ttl: 'Auto',
      description: 'Mail protocol routing (DNS only for SMTP/IMAP stability)',
    },
    {
      id: 'dns-7',
      type: 'CNAME',
      name: 'ftp',
      content: cleanDomain || '@',
      proxied: false,
      ttl: 'Auto',
      description: 'FTP file transfer (Direct connection required)',
    },
    {
      id: 'dns-8',
      type: 'MX',
      name: '@',
      content: `mail.${cleanDomain || 'domain.com'}`,
      proxied: false,
      ttl: 'Auto',
      priority: 10,
      description: 'Primary mail exchanger (Priority 10)',
    },
    {
      id: 'dns-9',
      type: 'TXT',
      name: '@',
      content: `v=spf1 +a +mx +ip4:${ip} ~all`,
      proxied: false,
      ttl: 'Auto',
      description: 'SPF Record — Prevents spoofing and ensures inbox delivery',
    },
    {
      id: 'dns-10',
      type: 'TXT',
      name: '_dmarc',
      content: `v=DMARC1; p=none; sp=none; rua=mailto:dmarc-reports@${cleanDomain || 'domain.com'}`,
      proxied: false,
      ttl: 'Auto',
      description: 'DMARC Policy — Email authentication standard',
    },
  ];
}

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  securityLevel: 'Medium',
  emailObfuscation: false,
  serverSideExcludes: false,
  opportunisticEncryption: true,
  minTlsVersion: '1.2',
  webSockets: true,
  browserIntegrityCheck: true,
  hotlinkProtection: false,
  autoHttpsRewrites: true,
  zeroRtt: false,
  challengeTtl: '30 minutes',
};

export const DEFAULT_SPEED_SETTINGS: SpeedSettings = {
  autoMinify: false, // OFF for WordPress safe scripts
  earlyHints103: true,
  http2: true,
  rocketLoader: false, // OFF for Elementor & WooCommerce compatibility
  brotli: true,
  http3Quic: true,
  zeroRttOff: true,
};

export const DEFAULT_CACHE_SETTINGS: CacheSettings = {
  cacheLevel: 'Standard',
  browserCacheTtl: 'Respect Existing Headers',
  alwaysOnline: false,
  alwaysHttps: true,
  devMode: false,
};

export const DEFAULT_SSL_SETTINGS: SslSettings = {
  sslMode: 'full', // Full (Strict) for valid origin SSL certificates
  sslRecommender: true,
};

export const DEFAULT_WAF_SETTINGS: WafSettings = {
  blockCountries: ['RU', 'CN', 'BR', 'BD', 'ID', 'NL', 'ES'],
  botFightMode: true,
  cacheBypassRules: [
    'wp-admin*',
    'wp-login.php*',
    'wp-json*',
    '*cart*',
    '*checkout*',
    '*my-account*',
    '*wc-ajax=*',
    'POST requests',
    'Cookie: wordpress_logged_in_*',
  ],
};
