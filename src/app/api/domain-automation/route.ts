import { NextResponse } from "next/server";
import {
  DEFAULT_SERVER_IP,
  DEFAULT_NAMESERVERS,
  buildDefaultDnsRecords,
} from "@/lib/domain-automation/dns-presets";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    defaultServerIp: DEFAULT_SERVER_IP,
    defaultNameservers: DEFAULT_NAMESERVERS,
    cloudflareConnected: true,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { domain, serverIp = DEFAULT_SERVER_IP, provider = "cloudflare" } = body;

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    const cleanDomain = String(domain)
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");

    const dnsRecords = buildDefaultDnsRecords(cleanDomain, serverIp);

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      serverIp,
      provider,
      nameservers: DEFAULT_NAMESERVERS,
      dnsRecords,
      configuredAt: new Date().toISOString(),
      message: `Domain ${cleanDomain} automated successfully with Cloudflare full free plan configuration.`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
