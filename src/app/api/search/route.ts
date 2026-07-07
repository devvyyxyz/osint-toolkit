import { NextRequest, NextResponse } from "next/server";
import { PLATFORMS, SEARCH_HEADERS, type DetectionResult } from "@/lib/platforms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface SearchHit {
  platformId: string;
  platformName: string;
  category: string;
  url: string;
  status: DetectionResult | "blocked" | "error";
  httpStatus: number | null;
  detail: string;
  durationMs: number;
}

export interface SearchResponse {
  username: string;
  total: number;
  found: number;
  notFound: number;
  blocked: number;
  errors: number;
  results: SearchHit[];
}

function sanitize(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // strip leading @ and any surrounding whitespace
  const cleaned = trimmed.replace(/^@+/, "").trim();
  if (!cleaned) return null;
  // Sanity check: allow letters, numbers, underscores, dashes, dots
  if (!/^[A-Za-z0-9_.-]+$/.test(cleaned)) return null;
  if (cleaned.length > 64) return null;
  return cleaned;
}

async function probePlatform(
  platformId: string,
  username: string,
): Promise<SearchHit> {
  const platform = PLATFORMS.find((p) => p.id === platformId)!;
  const url = platform.url(username);
  const started = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url, {
      method: "GET",
      headers: SEARCH_HEADERS,
      redirect: "follow",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // Read up to 200 KB of the body — enough for header / meta-tag checks,
    // small enough to avoid pulling huge pages into memory.
    const reader = res.body?.getReader();
    let bodyText = "";
    if (reader) {
      const decoder = new TextDecoder("utf-8");
      let total = 0;
      while (total < 200 * 1024) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          bodyText += decoder.decode(value, { stream: true });
          total += value.length;
        }
      }
      try {
        await reader.cancel();
      } catch {
        /* noop */
      }
    }

    const durationMs = Date.now() - started;
    const detection = platform.detect({
      status: res.status,
      body: bodyText,
      finalUrl: res.url || url,
    });

    let status: SearchHit["status"] = detection;
    let detail: string;
    switch (detection) {
      case "found":
        detail = "Profile page loaded successfully.";
        break;
      case "not_found":
        detail = "Platform returned a not-found response.";
        break;
      default:
        // Map explicit "blocked" HTTP statuses so the UI can distinguish them.
        if (res.status === 401 || res.status === 403) {
          status = "blocked";
          detail = `Blocked (HTTP ${res.status}). The site requires login or blocks automated requests.`;
        } else if (res.status === 429) {
          status = "blocked";
          detail = "Rate-limited (HTTP 429). Try again later.";
        } else {
          status = "unknown";
          detail = `Inconclusive response (HTTP ${res.status}). Click to verify manually.`;
        }
    }

    return {
      platformId,
      platformName: platform.name,
      category: platform.category,
      url,
      status,
      httpStatus: res.status,
      detail,
      durationMs,
    };
  } catch (err: unknown) {
    const durationMs = Date.now() - started;
    const aborted =
      err instanceof DOMException && err.name === "AbortError";
    const message = aborted
      ? "Request timed out after 12s."
      : err instanceof Error
        ? err.message
        : "Unknown network error.";

    return {
      platformId,
      platformName: platform.name,
      category: platform.category,
      url,
      status: "error",
      httpStatus: null,
      detail: message,
      durationMs,
    };
  }
}

export async function GET(req: NextRequest) {
  const usernameParam = req.nextUrl.searchParams.get("username") ?? "";
  const username = sanitize(usernameParam);

  if (!username) {
    return NextResponse.json(
      {
        error:
          "Invalid username. Only letters, numbers, dots, dashes and underscores are allowed (max 64 chars).",
      },
      { status: 400 },
    );
  }

  // Probe every platform in parallel.
  const results = await Promise.all(
    PLATFORMS.map((p) => probePlatform(p.id, username)),
  );

  // Sort: found first, then unknown/blocked, then not_found, then error.
  const rank: Record<SearchHit["status"], number> = {
    found: 0,
    unknown: 1,
    blocked: 2,
    error: 3,
    not_found: 4,
  };
  results.sort((a, b) => {
    if (rank[a.status] !== rank[b.status]) {
      return rank[a.status] - rank[b.status];
    }
    return a.platformName.localeCompare(b.platformName);
  });

  const summary: SearchResponse = {
    username,
    total: results.length,
    found: results.filter((r) => r.status === "found").length,
    notFound: results.filter((r) => r.status === "not_found").length,
    blocked: results.filter((r) => r.status === "blocked").length,
    errors: results.filter((r) => r.status === "error").length,
    results,
  };

  return NextResponse.json(summary, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
