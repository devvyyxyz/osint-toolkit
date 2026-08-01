import { NextRequest, NextResponse } from "next/server";
import { cacheGet, cacheSet } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface IpResult {
  ip: string;
  hostname: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  postal: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  org: string | null;
  asn: string | null;
  reverseDns: string[];
  error?: string;
}

function sanitizeIp(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // IPv4, IPv6, or hostname
  if (/^[\d.a-fA-F:]+$/.test(trimmed) || /^[a-zA-Z0-9.-]+$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const rawIp = req.nextUrl.searchParams.get("ip") ?? "";
  const skipCache = req.nextUrl.searchParams.get("skipCache") === "1";
  const ip = sanitizeIp(rawIp);

  if (!ip) {
    return NextResponse.json({ error: "Invalid IP address or hostname." }, { status: 400 });
  }

  const cacheKey = `ip-lookup:${ip}`;
  if (!skipCache) {
    const cached = cacheGet<IpResult>(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });
  }

  try {
    // Use ipapi.co for geolocation (free, no key needed)
    const geoRes = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      headers: { "User-Agent": "OSINT-Toolkit/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    let geo: Record<string, unknown> = {};
    if (geoRes.ok) {
      geo = await geoRes.json();
    }

    // Reverse DNS lookup
    let reverseDns: string[] = [];
    try {
      const { resolveCname, resolvePtr } = await import("node:dns/promises");
      try {
        const ptr = await resolvePtr(ip);
        reverseDns = ptr;
      } catch {
        try {
          const cname = await resolveCname(ip);
          reverseDns = cname;
        } catch { /* noop */ }
      }
    } catch { /* noop */ }

    const result: IpResult = {
      ip: (geo.ip as string) || ip,
      hostname: (geo.hostname as string) || null,
      city: (geo.city as string) || null,
      region: (geo.region as string) || null,
      country: (geo.country_name as string) || null,
      countryCode: (geo.country_code as string) || null,
      postal: (geo.postal as string) || null,
      latitude: (geo.latitude as number) || null,
      longitude: (geo.longitude as number) || null,
      timezone: (geo.timezone as string) || null,
      org: (geo.org as string) || null,
      asn: (geo.asn as string) || null,
      reverseDns,
    };

    cacheSet(cacheKey, result, 30 * 60 * 1000);
    return NextResponse.json({ ...result, cached: false });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
