import { NextRequest, NextResponse } from "next/server";
import { cacheGet, cacheSet } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Breach {
  name: string;
  domain: string;
  breachDate: string;
  addedDate: string;
  modifiedDate: string;
  pwnCount: number;
  description: string;
  logoPath: string;
  dataClasses: string[];
  isVerified: boolean;
  isFabricated: boolean;
  isSensitive: boolean;
  isRetired: boolean;
  isSpamList: boolean;
}

interface Paste {
  source: string;
  id: string;
  title: string;
  date: string;
  emailCount: number;
}

export interface BreachCheckResult {
  query: string;
  queryType: "email" | "username";
  found: boolean;
  breachCount: number;
  breaches: Breach[];
  pasteCount: number;
  pastes: Paste[];
  fetchedAt: string;
  durationMs: number;
  cached: boolean;
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const HIBP_API = "https://haveibeenpwned.com/api/v3";

function sanitizeQuery(raw: string): { value: string; type: "email" | "username" } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Email regex (simplified)
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  // Username: alphanumeric + dots, dashes, underscores
  const isUsername = /^[A-Za-z0-9_.-]+$/.test(trimmed);
  if (isEmail) return { value: trimmed.toLowerCase(), type: "email" };
  if (isUsername && trimmed.length <= 100) return { value: trimmed, type: "username" };
  return null;
}

async function fetchHibp(path: string): Promise<{ status: number; data: unknown }> {
  const res = await fetch(`${HIBP_API}${path}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "OSINT-Toolkit/1.0",
    },
    signal: AbortSignal.timeout(10000),
  });
  let data: unknown = null;
  if (res.status === 200) {
    try {
      data = await res.json();
    } catch {
      /* noop */
    }
  }
  return { status: res.status, data };
}

/* ------------------------------------------------------------------ */
/*  Handler                                                            */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  const rawQuery = req.nextUrl.searchParams.get("query") ?? "";
  const skipCache = req.nextUrl.searchParams.get("skipCache") === "1";

  const sanitized = sanitizeQuery(rawQuery);
  if (!sanitized) {
    return NextResponse.json(
      { error: "Invalid query. Enter a valid email address or username." },
      { status: 400 },
    );
  }

  const cacheKey = `breach-check:${sanitized.value}`;
  if (!skipCache) {
    const cached = cacheGet<BreachCheckResult>(cacheKey);
    if (cached) {
      return NextResponse.json(
        { ...cached, cached: true },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
      );
    }
  }

  const started = Date.now();

  try {
    // HIBP API: breaches for an account (email or username)
    // Note: HIBP v3 requires the query to be URL-encoded.
    // For usernames, the API treats them the same as emails — it checks
    // if that string appears as an account identifier in any breach.
    const encoded = encodeURIComponent(sanitized.value);

    const [breachRes, pasteRes] = await Promise.allSettled([
      fetchHibp(`/breachedaccount?account=${encoded}&truncateResponse=false`),
      // Pastes are email-only
      sanitized.type === "email"
        ? fetchHibp(`/pasteaccount/${encoded}`)
        : Promise.resolve({ status: 404, data: null }),
    ]);

    const breachResult =
      breachRes.status === "fulfilled" ? breachRes.value : { status: 0, data: null, error: breachRes.reason?.message };
    const pasteResult =
      pasteRes.status === "fulfilled" ? pasteRes.value : { status: 0, data: null };

    // 404 from HIBP means "not found in any breach" — that's a good result
    if (breachResult.status === 404) {
      const payload: BreachCheckResult = {
        query: sanitized.value,
        queryType: sanitized.type,
        found: false,
        breachCount: 0,
        breaches: [],
        pasteCount: 0,
        pastes: [],
        fetchedAt: new Date().toISOString(),
        durationMs: Date.now() - started,
        cached: false,
      };
      cacheSet(cacheKey, payload, 10 * 60 * 1000);
      return NextResponse.json(payload, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    if (breachResult.status === 401) {
      return NextResponse.json(
        {
          error: "HIBP API rejected the request. The query format may not be supported.",
        } as Partial<BreachCheckResult>,
        { status: 400 },
      );
    }

    if (breachResult.status === 429) {
      return NextResponse.json(
        {
          error: "HIBP API rate limit exceeded. Try again in a minute.",
        } as Partial<BreachCheckResult>,
        { status: 429 },
      );
    }

    if (breachResult.status !== 200) {
      return NextResponse.json(
        {
          error: `HIBP API returned HTTP ${breachResult.status}`,
        } as Partial<BreachCheckResult>,
        { status: 502 },
      );
    }

    const breaches = (breachResult.data as Breach[]) || [];
    const pastes =
      pasteResult.status === 200 ? ((pasteResult as { data: unknown }).data as Paste[]) || [] : [];

    const payload: BreachCheckResult = {
      query: sanitized.value,
      queryType: sanitized.type,
      found: breaches.length > 0 || pastes.length > 0,
      breachCount: breaches.length,
      breaches: breaches.sort(
        (a, b) => new Date(b.breachDate).getTime() - new Date(a.breachDate).getTime(),
      ),
      pasteCount: pastes.length,
      pastes: pastes.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
      fetchedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      cached: false,
    };

    cacheSet(cacheKey, payload, 10 * 60 * 1000);
    return NextResponse.json(payload, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (e) {
    const payload: BreachCheckResult = {
      query: sanitized.value,
      queryType: sanitized.type,
      found: false,
      breachCount: 0,
      breaches: [],
      pasteCount: 0,
      pastes: [],
      fetchedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      cached: false,
      error: (e as Error).message,
    };
    return NextResponse.json(payload, { status: 500 });
  }
}
