import { NextRequest, NextResponse } from "next/server";
import { PLATFORM_MAP, SEARCH_HEADERS } from "@/lib/platforms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface InspectResponse {
  platformId: string;
  platformName: string;
  category: string;
  url: string;
  finalUrl: string | null;
  httpStatus: number | null;
  durationMs: number;
  fetchedAt: string;
  // OpenGraph / meta
  title: string | null;
  description: string | null;
  image: string | null; // og:image — usually pfp or preview
  imageAlt: string | null;
  siteName: string | null;
  siteType: string | null;
  // Twitter Card (often holds a larger image — useful as a "banner")
  twitterCard: string | null;
  twitterImage: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  // Response details
  bodySize: number;
  textSnippet: string | null;
  headers: Record<string, string>;
  references: Array<{ label: string; url: string }>;
  error?: string;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

/** Match <meta property="X" content="Y"> OR <meta name="X" content="Y"> (in either attr order). */
function extractMeta(html: string, key: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`,
      "i",
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return decodeEntities(m[1]).trim();
  }
  return null;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? decodeEntities(m[1]).trim() : null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveUrl(base: string, rel: string | null): string | null {
  if (!rel) return null;
  try {
    return new URL(rel, base).toString();
  } catch {
    return null;
  }
}

function sanitize(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const cleaned = trimmed.replace(/^@+/, "").trim();
  if (!cleaned) return null;
  if (!/^[A-Za-z0-9_.-]+$/.test(cleaned)) return null;
  if (cleaned.length > 64) return null;
  return cleaned;
}

function buildReferences(
  platformId: string,
  username: string,
  profileUrl: string,
): Array<{ label: string; url: string }> {
  const refs: Array<{ label: string; url: string }> = [
    { label: "Open original profile", url: profileUrl },
    {
      label: "Wayback Machine history",
      url: `https://web.archive.org/web/*/${profileUrl.replace(/\/$/, "")}`,
    },
    {
      label: `Google search for "${username}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(username)}`,
    },
  ];

  // A few platform-specific extras that help manual verification.
  switch (platformId) {
    case "twitter":
      refs.push({
        label: "Search on Nitter (mirror)",
        url: `https://nitter.net/${username}`,
      });
      break;
    case "reddit":
      refs.push({
        label: "Reddit user overview",
        url: `https://www.reddit.com/user/${username}/overview`,
      });
      break;
    case "instagram":
      refs.push({
        label: "Search on Imginn (mirror)",
        url: `https://imginn.com/${username}/`,
      });
      break;
    case "github":
      refs.push({
        label: "GitHub repositories",
        url: `https://www.github.com/${username}?tab=repositories`,
      });
      break;
    case "telegram":
      refs.push({
        label: "Telegram profile preview",
        url: `https://t.me/${username}`,
      });
      break;
  }

  return refs;
}

const INTERESTING_HEADERS = [
  "content-type",
  "server",
  "x-powered-by",
  "x-frame-options",
  "content-security-policy",
  "cache-control",
  "location",
  "set-cookie",
  "strict-transport-security",
  "x-content-type-options",
];

export async function GET(req: NextRequest) {
  const username = sanitize(req.nextUrl.searchParams.get("username") ?? "");
  const platformId = req.nextUrl.searchParams.get("platformId") ?? "";
  const platform = PLATFORM_MAP[platformId];

  if (!username) {
    return NextResponse.json(
      { error: "Invalid username." },
      { status: 400 },
    );
  }
  if (!platform) {
    return NextResponse.json(
      { error: "Unknown platform id." },
      { status: 400 },
    );
  }

  const url = platform.url(username);
  const started = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      method: "GET",
      headers: SEARCH_HEADERS,
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    // Read up to 1 MB so we can parse meta tags + capture a text snippet.
    const reader = res.body?.getReader();
    let raw = "";
    let total = 0;
    if (reader) {
      const decoder = new TextDecoder("utf-8");
      while (total < 1024 * 1024) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          raw += decoder.decode(value, { stream: true });
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
    const finalUrl = res.url || url;
    const baseForResolve = res.url || url;

    const ogTitle = extractMeta(raw, "og:title");
    const ogDescription = extractMeta(raw, "og:description");
    const ogImage = resolveUrl(baseForResolve, extractMeta(raw, "og:image"));
    const ogImageAlt = extractMeta(raw, "og:image:alt");
    const ogSiteName = extractMeta(raw, "og:site_name");
    const ogType = extractMeta(raw, "og:type");
    const twitterCard = extractMeta(raw, "twitter:card");
    const twitterImage = resolveUrl(
      baseForResolve,
      extractMeta(raw, "twitter:image"),
    );
    const twitterTitle =
      extractMeta(raw, "twitter:title") ?? ogTitle ?? extractTitle(raw);
    const twitterDescription =
      extractMeta(raw, "twitter:description") ?? ogDescription;

    const headers: Record<string, string> = {};
    INTERESTING_HEADERS.forEach((h) => {
      const v = res.headers.get(h);
      if (v) headers[h] = v.length > 200 ? v.slice(0, 200) + "…" : v;
    });

    const textSnippet = stripHtml(raw).slice(0, 600) || null;

    const payload: InspectResponse = {
      platformId,
      platformName: platform.name,
      category: platform.category,
      url,
      finalUrl,
      httpStatus: res.status,
      durationMs,
      fetchedAt: new Date().toISOString(),
      title: ogTitle ?? extractTitle(raw),
      description: ogDescription,
      image: ogImage,
      imageAlt: ogImageAlt,
      siteName: ogSiteName,
      siteType: ogType,
      twitterCard,
      twitterImage,
      twitterTitle,
      twitterDescription,
      bodySize: total,
      textSnippet,
      headers,
      references: buildReferences(platformId, username, url),
    };

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err: unknown) {
    const durationMs = Date.now() - started;
    const aborted =
      err instanceof DOMException && err.name === "AbortError";
    const message = aborted
      ? "Request timed out after 15s."
      : err instanceof Error
        ? err.message
        : "Unknown network error.";

    const payload: InspectResponse = {
      platformId,
      platformName: platform.name,
      category: platform.category,
      url,
      finalUrl: null,
      httpStatus: null,
      durationMs,
      fetchedAt: new Date().toISOString(),
      title: null,
      description: null,
      image: null,
      imageAlt: null,
      siteName: null,
      siteType: null,
      twitterCard: null,
      twitterImage: null,
      twitterTitle: null,
      twitterDescription: null,
      bodySize: 0,
      textSnippet: null,
      headers: {},
      references: buildReferences(platformId, username, url),
      error: message,
    };

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  }
}
