import { NextRequest, NextResponse } from "next/server";
import { scanDomain, sanitizeDomain } from "@/lib/domain-scanner";
import { cacheGet, cacheSet } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rawDomain = req.nextUrl.searchParams.get("domain") ?? "";
  const domain = sanitizeDomain(rawDomain);
  const skipCache = req.nextUrl.searchParams.get("skipCache") === "1";

  if (!domain) {
    return NextResponse.json(
      { error: "Invalid domain. Enter a valid domain like example.com" },
      { status: 400 },
    );
  }

  // Cache check — 10 minute TTL for domain scans (longer than username
  // search since DNS/WHOIS data changes very slowly)
  const cacheKey = `scan-domain:${domain}`;
  if (!skipCache) {
    const cached = cacheGet<unknown>(cacheKey);
    if (cached) {
      return NextResponse.json(
        { ...cached, cached: true },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
      );
    }
  }

  try {
    const result = await scanDomain(domain);
    cacheSet(cacheKey, result, 10 * 60 * 1000); // 10 min
    return NextResponse.json(
      { ...result, cached: false },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
