/**
 * Detection helpers shared across platform definitions.
 *
 * Detection heuristics are intentionally tolerant: social platforms
 * constantly change their responses, so we treat ambiguous signals
 * (200 + body length, 403, 429) as 'unknown' rather than guessing.
 */

import type { DetectionResult, PlatformProbe } from "./types";

/* ------------------------------------------------------------------ */
/*  HTTP headers                                                        */
/* ------------------------------------------------------------------ */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export const SEARCH_HEADERS: Record<string, string> = {
  "User-Agent": UA,
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

/* ------------------------------------------------------------------ */
/*  Detection helpers                                                   */
/* ------------------------------------------------------------------ */

/** A 200 response with substantial HTML usually means the profile page loaded. */
export function looksLikeProfile(
  body: string,
  mustContain?: RegExp,
): DetectionResult {
  if (!body) return "unknown";
  if (mustContain && mustContain.test(body)) return "found";
  if (body.length > 1500) return "found";
  return "unknown";
}

/** Quick helper for "if 200 -> found, if 404 -> not_found, else unknown". */
export function basicDetect(
  status: number,
  body: string,
  notFoundRegex?: RegExp,
): DetectionResult {
  if (status === 404) return "not_found";
  if (status >= 200 && status < 300) {
    if (notFoundRegex && notFoundRegex.test(body)) return "not_found";
    return looksLikeProfile(body);
  }
  return "unknown";
}

/** Re-export the probe type for convenience. */
export type { PlatformProbe };