/**
 * Classifies WHY a request was blocked, not just that it was.
 *
 * Many platforms return 403/429 to indicate an anti-bot challenge,
 * a login wall, or rate-limiting. The HTTP status alone isn't enough —
 * the response body almost always tells us which one it is.
 *
 * Used by /api/inspect to add a `blockType` field to the response so
 * the UI can show "Cloudflare challenge" vs "Rate-limited" vs
 * "Login required" instead of a generic "Blocked".
 */

export type BlockType =
  | "cloudflare" // Cloudflare "Just a moment..." interstitial
  | "recaptcha" // Google reCAPTCHA v2/v3 challenge
  | "hcaptcha" // hCaptcha challenge
  | "login_required" // 401/403 with login page
  | "rate_limited" // 429
  | "geoblocked" // 451 (legal)
  | "generic_403" // 403 with no recognized pattern
  | "generic_401" // 401 with no recognized pattern
  | "timeout"
  | "network_error"
  | null; // not blocked, or unknown

export interface BlockInfo {
  type: BlockType;
  label: string; // short human label
  description: string; // longer explanation shown in the modal
  hint: string; // actionable hint for the user
}

const CLASSIFICATIONS: Record<Exclude<BlockType, null>, Omit<BlockInfo, "type">> = {
  cloudflare: {
    label: "Cloudflare challenge",
    description:
      "The site is behind Cloudflare's bot protection. It served an interstitial page asking the browser to verify it's human.",
    hint: "Open the original URL in a browser — Cloudflare will issue a cookie that lets you through for ~30 minutes.",
  },
  recaptcha: {
    label: "reCAPTCHA challenge",
    description:
      "The site returned a Google reCAPTCHA challenge that requires human interaction.",
    hint: "Click through to solve the captcha manually in a browser tab.",
  },
  hcaptcha: {
    label: "hCaptcha challenge",
    description:
      "The site returned an hCaptcha challenge that requires human interaction.",
    hint: "Click through to solve the captcha manually in a browser tab.",
  },
  login_required: {
    label: "Login required",
    description:
      "The site returned a login page — profiles are only visible to authenticated users.",
    hint: "Log in to the site in a browser, then re-check (your session cookie won't transfer to this tool, though).",
  },
  rate_limited: {
    label: "Rate-limited",
    description:
      "The site is throttling requests from this server's IP. Too many probes in too short a window.",
    hint: "Wait a few minutes and try again. The cache will also avoid re-probing for 5 minutes.",
  },
  geoblocked: {
    label: "Geographically blocked",
    description:
      "The site returned HTTP 451 — access is restricted in this region for legal reasons.",
    hint: "Try again from a different region if you have access to one.",
  },
  generic_403: {
    label: "Blocked (403)",
    description:
      "The site returned HTTP 403 without a recognizable challenge pattern. It likely blocks all automated requests.",
    hint: "Open the original URL in a browser to verify manually.",
  },
  generic_401: {
    label: "Authentication required (401)",
    description:
      "The site returned HTTP 401 — authentication is required to view this resource.",
    hint: "Open the original URL in a browser and log in.",
  },
  timeout: {
    label: "Request timed out",
    description:
      "The request took longer than 12 seconds and was aborted. The site may be slow, overloaded, or deliberately hanging bot connections.",
    hint: "Try again — if it keeps timing out, the site may be intentionally dropping automated requests.",
  },
  network_error: {
    label: "Network error",
    description:
      "The request failed before any response was received. This could be a DNS failure, connection reset, or TLS handshake issue.",
    hint: "Try again in a moment. If it persists, the site may be down or blocking this server's IP.",
  },
};

/**
 * Inspect the HTTP status, response body, and any error to classify
 * what kind of block (if any) we hit.
 */
export function classifyBlock(opts: {
  status: number | null;
  body: string;
  errorMessage?: string;
}): BlockInfo | null {
  const { status, body, errorMessage } = opts;

  // Network error / timeout path
  if (status === null) {
    if (errorMessage) {
      const msg = errorMessage.toLowerCase();
      if (msg.includes("timed out") || msg.includes("abort")) {
        return { type: "timeout", ...CLASSIFICATIONS.timeout };
      }
      return { type: "network_error", ...CLASSIFICATIONS.network_error };
    }
    return null;
  }

  // Body-sniffing takes priority over status-code heuristics, because
  // a Cloudflare interstitial is usually served with 403 or 503.
  if (body) {
    const b = body.toLowerCase();
    if (
      b.includes("just a moment") ||
      b.includes("cf-challenge") ||
      b.includes("_cf_chl_opt") ||
      b.includes("cf-browser-verification") ||
      (b.includes("cloudflare") && b.includes("ray id"))
    ) {
      return { type: "cloudflare", ...CLASSIFICATIONS.cloudflare };
    }
    if (
      b.includes("g-recaptcha") ||
      b.includes("www.google.com/recaptcha") ||
      b.includes("recaptcha/api/challenge")
    ) {
      return { type: "recaptcha", ...CLASSIFICATIONS.recaptcha };
    }
    if (
      b.includes("h-captcha") ||
      b.includes("hcaptcha.com") ||
      b.includes("data-hcaptcha")
    ) {
      return { type: "hcaptcha", ...CLASSIFICATIONS.hcaptcha };
    }
    if (
      (status === 401 || status === 403) &&
      (b.includes("sign in") || b.includes("log in") || b.includes("loginform") || b.includes("login-form"))
    ) {
      return { type: "login_required", ...CLASSIFICATIONS.login_required };
    }
  }

  // Status-code fallbacks
  if (status === 429) {
    return { type: "rate_limited", ...CLASSIFICATIONS.rate_limited };
  }
  if (status === 451) {
    return { type: "geoblocked", ...CLASSIFICATIONS.geoblocked };
  }
  if (status === 401) {
    return { type: "generic_401", ...CLASSIFICATIONS.generic_401 };
  }
  if (status === 403) {
    return { type: "generic_403", ...CLASSIFICATIONS.generic_403 };
  }

  return null;
}
