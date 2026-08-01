import { NextRequest, NextResponse } from "next/server";
import { cacheGet, cacheSet } from "@/lib/cache";
import * as tools from "@/lib/simple-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOOL_MAP: Record<string, { fn: string; param: string }> = {
  "email-lookup": { fn: "emailLookup", param: "email" },
  "phone-lookup": { fn: "phoneLookup", param: "phone" },
  "name-search": { fn: "nameSearch", param: "name" },
  "fingerprint": { fn: "fingerprint", param: "data" },
  "malware-scanner": { fn: "urlSafetyCheck", param: "url" },
  "phishing-detector": { fn: "urlSafetyCheck", param: "url" },
  "link-extractor": { fn: "linkExtractor", param: "url" },
  "wayback-explorer": { fn: "waybackExplorer", param: "url" },
  "tech-detector": { fn: "techDetector", param: "url" },
  "code-search": { fn: "codeSearch", param: "query" },
  "dns-history": { fn: "dnsHistory", param: "domain" },
  "hashtag-tracker": { fn: "hashtagTracker", param: "tag" },
  "api-explorer": { fn: "apiExplorer", param: "service" },
};

export async function GET(req: NextRequest) {
  const path = req.nextUrl.pathname.split("/").pop() || "";
  const config = TOOL_MAP[path];
  if (!config) return NextResponse.json({ error: "Unknown tool" }, { status: 400 });

  const input = req.nextUrl.searchParams.get(config.param) ?? "";
  if (!input.trim()) return NextResponse.json({ error: `Missing ${config.param} parameter` }, { status: 400 });

  const cacheKey = `${path}:${input}`;
  if (req.nextUrl.searchParams.get("skipCache") !== "1") {
    const cached = cacheGet<unknown>(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });
  }

  try {
    const fn = (tools as Record<string, unknown>)[config.fn] as (input: unknown) => Promise<unknown>;
    const data = config.fn === "fingerprint"
      ? fn(Object.fromEntries(req.nextUrl.searchParams))
      : fn(input.trim());
    const result = await Promise.resolve(data);
    cacheSet(cacheKey, result, 10 * 60 * 1000);
    return NextResponse.json({ ...result, cached: false });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
