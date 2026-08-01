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
  /** When the HIBP API is unavailable (no key, Cloudflare, rate limit),
   *  this explains why and what the user can do. */
  apiStatus: "ok" | "no_api_key" | "cloudflare_blocked" | "rate_limited" | "error";
  apiMessage?: string;
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const HIBP_API = "https://haveibeenpwned.com/api/v3";

function sanitizeQuery(raw: string): { value: string; type: "email" | "username" } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  const isUsername = /^[A-Za-z0-9_.-]+$/.test(trimmed);
  if (isEmail) return { value: trimmed.toLowerCase(), type: "email" };
  if (isUsername && trimmed.length <= 100) return { value: trimmed, type: "username" };
  return null;
}

/**
 * Fetch from HIBP. Returns:
 *  - { status, data } on a JSON response
 *  - { status, html: true } if the response is HTML (Cloudflare challenge)
 */
async function fetchHibp(
  path: string,
  apiKey?: string,
): Promise<{ status: number; data: unknown; isHtml: boolean }> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "OSINT-Toolkit/1.0",
  };
  if (apiKey) {
    headers["hibp-api-key"] = apiKey;
  }

  const res = await fetch(`${HIBP_API}${path}`, {
    headers,
    signal: AbortSignal.timeout(10000),
  });

  const contentType = res.headers.get("content-type") || "";

  // HIBP returns JSON for API responses. If we get HTML, it's a
  // Cloudflare challenge page — the API is blocking us.
  if (contentType.includes("text/html")) {
    return { status: res.status, data: null, isHtml: true };
  }

  let data: unknown = null;
  if (res.status === 200) {
    try {
      data = await res.json();
    } catch {
      /* noop */
    }
  }
  return { status: res.status, data, isHtml: false };
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
  const apiKey = process.env.HIBP_API_KEY;

  try {
    const encoded = encodeURIComponent(sanitized.value);

    // Attempt the HIBP API
    const [breachRes, pasteRes] = await Promise.allSettled([
      fetchHibp(`/breachedaccount?account=${encoded}&truncateResponse=false`, apiKey),
      sanitized.type === "email"
        ? fetchHibp(`/pasteaccount/${encoded}`, apiKey)
        : Promise.resolve({ status: 404, data: null, isHtml: false }),
    ]);

    const breachResult =
      breachRes.status === "fulfilled"
        ? breachRes.value
        : { status: 0, data: null, isHtml: false };
    const pasteResult =
      pasteRes.status === "fulfilled"
        ? pasteRes.value
        : { status: 404, data: null, isHtml: false };

    // --- Detect API unavailability ---

    // Cloudflare challenge (HTML response)
    if (breachResult.isHtml) {
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
        apiStatus: apiKey ? "cloudflare_blocked" : "no_api_key",
        apiMessage: apiKey
          ? "Have I Been Pwned is blocking this server's requests (Cloudflare). Try again later."
          : "Have I Been Pwned now requires a free API key for account lookups. Get one at haveibeenpwned.com/API/Key and set it as the HIBP_API_KEY environment variable.",
      };
      return NextResponse.json(payload, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    // 401 = API key required
    if (breachResult.status === 401) {
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
        apiStatus: "no_api_key",
        apiMessage:
          "Have I Been Pwned requires a free API key for account lookups. Get one at haveibeenpwned.com/API/Key and set it as the HIBP_API_KEY environment variable.",
      };
      return NextResponse.json(payload, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    // 429 = rate limited
    if (breachResult.status === 429) {
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
        apiStatus: "rate_limited",
        apiMessage:
          "Have I Been Pwned API rate limit exceeded. Try again in a minute.",
      };
      return NextResponse.json(payload, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    // 404 = genuinely not found in any breach (good news!)
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
        apiStatus: "ok",
      };
      cacheSet(cacheKey, payload, 10 * 60 * 1000);
      return NextResponse.json(payload, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    // Any other unexpected status
    if (breachResult.status !== 200) {
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
        apiStatus: "error",
        apiMessage: `HIBP API returned HTTP ${breachResult.status}`,
      };
      return NextResponse.json(payload, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    // --- Success — we have real breach data ---
    const breaches = (breachResult.data as Breach[]) || [];
    const pastes =
      pasteResult.status === 200 && !pasteResult.isHtml
        ? (pasteResult.data as Paste[]) || []
        : [];

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
      apiStatus: "ok",
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
      apiStatus: "error",
      error: (e as Error).message,
      apiMessage: `Network error: ${(e as Error).message}`,
    };
    return NextResponse.json(payload, { status: 500 });
  }
}
