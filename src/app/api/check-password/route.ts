import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { cacheGet, cacheSet } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Password breach checker using the free HIBP k-anonymity API.
 *
 * How it works:
 *  1. SHA1-hash the password
 *  2. Send only the first 5 characters of the hash to api.pwnedpasswords.com
 *  3. Get back all hash suffixes that start with those 5 chars
 *  4. Check if our full hash is in the list
 *
 * This is k-anonymity: the server never sees the full hash, so it can't
 * know which password we're checking. No API key required.
 */

export interface PasswordCheckResult {
  /** Whether the password has appeared in known data breaches */
  found: boolean;
  /** Number of times the password was found in breach datasets */
  count: number;
  /** The first 5 chars of the SHA1 hash (safe to share — sent to HIBP) */
  hashPrefix: string;
  /** Severity assessment based on count */
  severity: "safe" | "low" | "moderate" | "high" | "critical";
  severityLabel: string;
  /** How long the check took */
  durationMs: number;
  cached: boolean;
  error?: string;
}

function assessSeverity(count: number): {
  severity: PasswordCheckResult["severity"];
  severityLabel: string;
} {
  if (count === 0) return { severity: "safe", severityLabel: "Not found in breaches" };
  if (count < 10) return { severity: "low", severityLabel: "Rarely seen" };
  if (count < 1000) return { severity: "moderate", severityLabel: "Somewhat common" };
  if (count < 100000) return { severity: "high", severityLabel: "Very common" };
  return { severity: "critical", severityLabel: "Extremely common — do not use" };
}

export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get("password") ?? "";

  if (!password) {
    return NextResponse.json(
      { error: "No password provided. Use ?password=YOUR_PASSWORD" },
      { status: 400 },
    );
  }

  if (password.length > 1000) {
    return NextResponse.json(
      { error: "Password too long (max 1000 chars)." },
      { status: 400 },
    );
  }

  // SHA1 hash the password (uppercase, as HIBP expects)
  const sha1 = createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = sha1.substring(0, 5);
  const suffix = sha1.substring(5);

  // Cache by hash prefix+suffix (not the password itself, though the
  // hash is equivalent — but this is fine since HIBP already publishes
  // these hashes publicly)
  const cacheKey = `pw-check:${prefix}:${suffix}`;
  const skipCache = req.nextUrl.searchParams.get("skipCache") === "1";

  if (!skipCache) {
    const cached = cacheGet<PasswordCheckResult>(cacheKey);
    if (cached) {
      return NextResponse.json(
        { ...cached, cached: true },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
      );
    }
  }

  const started = Date.now();

  try {
    // Fetch all hash suffixes that share our 5-char prefix
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        "User-Agent": "OSINT-Toolkit/1.0",
        "Add-Padding": "true", // HIBP returns more accurate counts with this
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          found: false,
          count: 0,
          hashPrefix: prefix,
          severity: "safe" as const,
          severityLabel: "Check failed",
          durationMs: Date.now() - started,
          cached: false,
          error: `HIBP password API returned HTTP ${res.status}`,
        } satisfies PasswordCheckResult,
        { status: 502 },
      );
    }

    const text = await res.text();

    // Response format: "SUFFIX:COUNT\nSUFFIX:COUNT\n..."
    // Our suffix is what we're looking for
    let count = 0;
    const lines = text.split("\n");
    for (const line of lines) {
      const [hashSuffix, hashCount] = line.trim().split(":");
      if (hashSuffix === suffix) {
        count = parseInt(hashCount, 10) || 0;
        break;
      }
    }

    const { severity, severityLabel } = assessSeverity(count);

    const payload: PasswordCheckResult = {
      found: count > 0,
      count,
      hashPrefix: prefix,
      severity,
      severityLabel,
      durationMs: Date.now() - started,
      cached: false,
    };

    // Cache for 1 hour — passwords don't un-breach
    cacheSet(cacheKey, payload, 60 * 60 * 1000);

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (e) {
    return NextResponse.json(
      {
        found: false,
        count: 0,
        hashPrefix: prefix,
        severity: "safe" as const,
        severityLabel: "Check failed",
        durationMs: Date.now() - started,
        cached: false,
        error: (e as Error).message,
      } satisfies PasswordCheckResult,
      { status: 500 },
    );
  }
}
