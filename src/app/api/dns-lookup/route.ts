import { NextRequest, NextResponse } from "next/server";
import dns from "node:dns/promises";
import { cacheGet, cacheSet } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface DnsResult {
  domain: string;
  records: Array<{ type: string; values: string[] }>;
  error?: string;
}

const RECORD_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA", "CAA"] as const;

function sanitizeDomain(raw: string): string | null {
  let d = raw.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
  if (!/^[a-z0-9.-]+$/.test(d) || !d.includes(".") || d.length > 253) return null;
  return d;
}

export async function GET(req: NextRequest) {
  const rawDomain = req.nextUrl.searchParams.get("domain") ?? "";
  const skipCache = req.nextUrl.searchParams.get("skipCache") === "1";
  const domain = sanitizeDomain(rawDomain);

  if (!domain) {
    return NextResponse.json({ error: "Invalid domain." }, { status: 400 });
  }

  const cacheKey = `dns-lookup:${domain}`;
  if (!skipCache) {
    const cached = cacheGet<DnsResult>(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });
  }

  const records: DnsResult["records"] = [];

  for (const type of RECORD_TYPES) {
    try {
      let values: string[] = [];
      switch (type) {
        case "A": values = await dns.resolve4(domain); break;
        case "AAAA": values = await dns.resolve6(domain); break;
        case "MX": values = (await dns.resolveMx(domain)).map((m) => `${m.priority} ${m.exchange}`); break;
        case "NS": values = await dns.resolveNs(domain); break;
        case "TXT": values = (await dns.resolveTxt(domain)).map((t) => t.join("")); break;
        case "CNAME":
          try { values = await dns.resolveCname(domain); } catch { /* expected to fail */ }
          break;
        case "CAA": values = (await dns.resolveCaa(domain)).map((c) => `${c.flags} ${c.tag} "${c.value}"`); break;
        case "SOA": {
          const s = await dns.resolveSoa(domain);
          values = [`${s.nsname} ${s.hostmaster} ${s.serial} ${s.refresh} ${s.retry} ${s.expire} ${s.minttl}`];
          break;
        }
      }
      records.push({ type, values });
    } catch {
      records.push({ type, values: [] });
    }
  }

  const result: DnsResult = { domain, records };
  cacheSet(cacheKey, result, 10 * 60 * 1000);
  return NextResponse.json({ ...result, cached: false });
}
