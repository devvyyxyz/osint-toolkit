/**
 * Shared tool implementations for simple lookup tools.
 * Each function takes input, returns structured data.
 * Used by individual API route files to avoid code duplication.
 */
import dns from "node:dns/promises";
import { createHash } from "node:crypto";

/* ---- Email Lookup ---- */
export async function emailLookup(email: string) {
  const domain = email.split("@")[1];
  if (!domain) throw new Error("Invalid email format");

  let mxRecords: string[] = [];
  let hasMx = false;
  try {
    const mx = await dns.resolveMx(domain);
    mxRecords = mx.map((r) => `${r.priority} ${r.exchange}`);
    hasMx = mx.length > 0;
  } catch { /* no MX */ }

  let aRecords: string[] = [];
  try { aRecords = await dns.resolve4(domain); } catch { /* noop */ }

  return {
    email, domain, valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    hasMx, mxRecords, aRecords,
    disposable: ["tempmail", "guerrillamail", "mailinator", "10minutemail", "throwaway"].some(d => domain.includes(d)),
  };
}

/* ---- Phone Lookup ---- */
export function phoneLookup(phone: string) {
  const cleaned = phone.replace(/[^0-9+]/g, "");
  const hasCountryCode = cleaned.startsWith("+");
  const digits = cleaned.replace("+", "");

  // Basic carrier detection by number pattern
  let country = "Unknown";
  if (digits.startsWith("1")) country = "United States/Canada";
  else if (digits.startsWith("44")) country = "United Kingdom";
  else if (digits.startsWith("61")) country = "Australia";
  else if (digits.startsWith("33")) country = "France";
  else if (digits.startsWith("49")) country = "Germany";
  else if (digits.startsWith("81")) country = "Japan";
  else if (digits.startsWith("86")) country = "China";
  else if (digits.startsWith("91")) country = "India";
  else if (digits.startsWith("7")) country = "Russia/Kazakhstan";

  return {
    phone: cleaned, raw: phone, country,
    hasCountryCode, digitCount: digits.length,
    valid: digits.length >= 7 && digits.length <= 15,
    format: hasCountryCode ? `+${digits}` : digits,
  };
}

/* ---- Name Search ---- */
export async function nameSearch(name: string) {
  // Search across multiple free sources
  const results: Array<{ source: string; url: string; type: string }> = [];

  const encoded = encodeURIComponent(name);
  results.push({ source: "Google", url: `https://www.google.com/search?q="${encoded}"`, type: "Search" });
  results.push({ source: "LinkedIn", url: `https://www.linkedin.com/search/results/people/?keywords=${encoded}`, type: "Professional" });
  results.push({ source: "Facebook", url: `https://www.facebook.com/search/people/?q=${encoded}`, type: "Social" });
  results.push({ source: "Whitepages", url: `https://www.whitepages.com/name/${encoded.replace(/\s+/g, "-")}`, type: "Public Records" });
  results.push({ source: "TruePeopleSearch", url: `https://www.truepeoplesearch.com/results?name=${encoded}`, type: "People Search" });
  results.push({ source: "BeenVerified", url: `https://www.beenverified.com/people/${encoded.replace(/\s+/g, "-")}`, type: "Background Check" });

  return { name, results };
}

/* ---- Fingerprint ---- */
export function fingerprint(data: Record<string, string>) {
  const hash = createHash("sha256").update(JSON.stringify(data)).digest("hex");
  return {
    input: data,
    fingerprint: hash,
    shortId: hash.substring(0, 16),
    algorithm: "SHA-256",
  };
}

/* ---- Malware/Phishing URL Check ---- */
export async function urlSafetyCheck(url: string) {
  const normalized = url.startsWith("http") ? url : `https://${url}`;
  let safe = true;
  let flagged: string[] = [];

  // Check against multiple free blacklist APIs
  try {
    // URLVoid API (free tier)
    const domain = new URL(normalized).hostname;
    const res = await fetch(`https://api.urlvoid.com/api1000/${domain}/`, {
      signal: AbortSignal.timeout(5000),
    }).catch(() => null);
    if (res?.ok) {
      const text = await res.text();
      if (text.includes("MALICIOUS")) { safe = false; flagged.push("URLVoid"); }
    }
  } catch { /* noop */ }

  // Check if URL uses HTTPS
  if (!normalized.startsWith("https://")) {
    flagged.push("No HTTPS");
  }

  // Check for suspicious patterns
  const suspicious = ["bit.ly", "tinyurl", "t.co", "goo.gl", "ow.ly"];
  const hostname = new URL(normalized).hostname;
  if (suspicious.some(s => hostname.includes(s))) {
    flagged.push("URL Shortener");
  }

  // Check for IP address as hostname
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    flagged.push("IP-based URL");
  }

  return { url: normalized, hostname, safe: safe && flagged.length === 0, flags: flagged };
}

/* ---- Link Extractor ---- */
export async function linkExtractor(url: string) {
  const normalized = url.startsWith("http") ? url : `https://${url}`;
  const res = await fetch(normalized, {
    headers: { "User-Agent": "Mozilla/5.0 (OSINT-Toolkit/1.0)" },
    signal: AbortSignal.timeout(10000),
    redirect: "follow",
  });
  const html = await res.text();
  const linkRegex = /href=["']([^"']+)["']/gi;
  const links: string[] = [];
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const resolved = new URL(match[1], normalized).toString();
      links.push(resolved);
    } catch { /* skip invalid */ }
  }
  const unique = [...new Set(links)];

  return {
    url: normalized, finalUrl: res.url,
    totalLinks: unique.length,
    links: unique.slice(0, 50),
    internal: unique.filter(l => l.includes(new URL(normalized).hostname)),
    external: unique.filter(l => !l.includes(new URL(normalized).hostname)),
  };
}

/* ---- Wayback Explorer ---- */
export async function waybackExplorer(url: string) {
  const encoded = encodeURIComponent(url);
  const res = await fetch(
    `https://web.archive.org/cdx/search/cdx?url=${encoded}&output=json&limit=20&fl=timestamp,original,statuscode,mimetype`,
    { signal: AbortSignal.timeout(10000) },
  );
  if (!res.ok) throw new Error(`Wayback API returned ${res.status}`);
  const data = await res.json() as unknown[][];
  if (data.length < 2) return { url, snapshots: [], total: 0 };

  const snapshots = data.slice(1).map((row) => ({
    timestamp: row[0] as string,
    original: row[1] as string,
    status: row[2] as string,
    mimeType: row[3] as string,
    formatted: `${(row[0] as string).slice(0, 4)}-${(row[0] as string).slice(4, 6)}-${(row[0] as string).slice(6, 8)}`,
    archiveUrl: `https://web.archive.org/web/${row[0]}/${row[1]}`,
  }));

  return { url, snapshots, total: snapshots.length };
}

/* ---- Tech Detector ---- */
export async function techDetector(url: string) {
  const normalized = url.startsWith("http") ? url : `https://${url}`;
  const res = await fetch(normalized, {
    headers: { "User-Agent": "Mozilla/5.0 (OSINT-Toolkit/1.0)" },
    signal: AbortSignal.timeout(8000),
    redirect: "follow",
  });
  const headers: Record<string, string> = {};
  res.headers.forEach((v, k) => { headers[k] = v; });
  const body = await res.text();
  const bodyLower = body.toLowerCase();

  const tech: Array<{ name: string; category: string; confidence: string }> = [];
  const h = headers;

  if (h["server"]?.includes("nginx")) tech.push({ name: "Nginx", category: "Web Server", confidence: "high" });
  if (h["server"]?.includes("apache")) tech.push({ name: "Apache", category: "Web Server", confidence: "high" });
  if (h["server"]?.includes("cloudflare")) tech.push({ name: "Cloudflare", category: "CDN", confidence: "high" });
  if (h["x-powered-by"]?.includes("express")) tech.push({ name: "Express.js", category: "Framework", confidence: "high" });
  if (h["x-powered-by"]?.includes("php")) tech.push({ name: "PHP", category: "Language", confidence: "high" });
  if (h["x-vercel-id"]) tech.push({ name: "Vercel", category: "Hosting", confidence: "high" });
  if (h["cf-ray"]) tech.push({ name: "Cloudflare", category: "CDN", confidence: "high" });
  if (bodyLower.includes("_next/static")) tech.push({ name: "Next.js", category: "Framework", confidence: "high" });
  if (bodyLower.includes("react")) tech.push({ name: "React", category: "JS Library", confidence: "medium" });
  if (bodyLower.includes("vue")) tech.push({ name: "Vue.js", category: "Framework", confidence: "medium" });
  if (bodyLower.includes("angular")) tech.push({ name: "Angular", category: "Framework", confidence: "medium" });
  if (bodyLower.includes("wordpress") || bodyLower.includes("wp-content")) tech.push({ name: "WordPress", category: "CMS", confidence: "high" });
  if (bodyLower.includes("jquery")) tech.push({ name: "jQuery", category: "JS Library", confidence: "medium" });
  if (bodyLower.includes("bootstrap")) tech.push({ name: "Bootstrap", category: "CSS", confidence: "medium" });
  if (bodyLower.includes("tailwind")) tech.push({ name: "Tailwind CSS", category: "CSS", confidence: "medium" });
  if (bodyLower.includes("google-analytics")) tech.push({ name: "Google Analytics", category: "Analytics", confidence: "high" });

  return { url: normalized, finalUrl: res.url, technologies: tech, headers };
}

/* ---- Code Search (GitHub) ---- */
export async function codeSearch(query: string) {
  const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=10`, {
    headers: { "User-Agent": "OSINT-Toolkit/1.0", Accept: "application/vnd.github.v3+json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
  const data = await res.json() as { total_count: number; items: Array<Record<string, unknown>> };

  return {
    query, totalCount: data.total_count,
    results: (data.items || []).map((item) => ({
      name: item.full_name, url: item.html_url,
      description: item.description, stars: item.stargazers_count,
      language: item.language, forks: item.forks_count,
      updatedAt: item.updated_at,
    })),
  };
}

/* ---- DNS History ---- */
export async function dnsHistory(domain: string) {
  // Use Google DNS-over-HTTPS for current records, plus Wayback for historical
  const current: Record<string, string[]> = {};
  const types = ["A", "AAAA", "MX", "NS", "TXT"];

  for (const type of types) {
    try {
      const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`, {
        headers: { Accept: "application/dns-json" },
        signal: AbortSignal.timeout(5000),
      });
      const data = await res.json();
      const answers = (data.Answer || []).map((a: { data: string }) => a.data);
      current[type] = answers;
    } catch { current[type] = []; }
  }

  // Get Wayback snapshots to show when the domain was first/last seen
  const waybackRes = await fetch(
    `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain)}&output=json&limit=1&fl=timestamp`,
    { signal: AbortSignal.timeout(5000) },
  ).catch(() => null);
  let firstSeen: string | null = null;
  if (waybackRes?.ok) {
    const data = await waybackRes.json() as unknown[][];
    if (data.length > 1) firstSeen = data[1][0] as string;
  }

  return { domain, current, firstSeen };
}

/* ---- Hashtag Tracker ---- */
export function hashtagTracker(tag: string) {
  const cleaned = tag.replace(/^#/, "");
  const platforms = [
    { name: "Instagram", url: `https://www.instagram.com/explore/tags/${cleaned}/` },
    { name: "Twitter/X", url: `https://x.com/search?q=%23${cleaned}` },
    { name: "TikTok", url: `https://www.tiktok.com/tag/${cleaned}` },
    { name: "YouTube", url: `https://www.youtube.com/results?search_query=%23${cleaned}` },
    { name: "LinkedIn", url: `https://www.linkedin.com/search/results/all/?keywords=%23${cleaned}` },
    { name: "Pinterest", url: `https://www.pinterest.com/search/pins/?q=%23${cleaned}` },
    { name: "Reddit", url: `https://www.reddit.com/search/?q=%23${cleaned}` },
    { name: "Tumblr", url: `https://www.tumblr.com/tagged/${cleaned}` },
    { name: "Facebook", url: `https://www.facebook.com/hashtag/${cleaned}` },
  ];
  return { hashtag: `#${cleaned}`, platforms };
}

/* ---- API Explorer ---- */
export function apiExplorer(service: string) {
  const apis: Record<string, Array<{ name: string; endpoint: string; method: string; auth: string; description: string }>> = {
    github: [
      { name: "Search Repos", endpoint: "GET /search/repositories?q={query}", method: "GET", auth: "None (rate-limited)", description: "Search public repositories" },
      { name: "Get User", endpoint: "GET /users/{username}", method: "GET", auth: "None (rate-limited)", description: "Get public user profile" },
      { name: "List Repos", endpoint: "GET /users/{username}/repos", method: "GET", auth: "None (rate-limited)", description: "List user's repositories" },
    ],
    reddit: [
      { name: "Search", endpoint: "GET /search.json?q={query}", method: "GET", auth: "None", description: "Search Reddit posts" },
      { name: "User About", endpoint: "GET /user/{username}/about.json", method: "GET", auth: "None", description: "Get user info" },
    ],
    mastodon: [
      { name: "Account Lookup", endpoint: "GET /api/v1/accounts/lookup?acct={username}", method: "GET", auth: "None", description: "Lookup Mastodon account" },
    ],
    hibp: [
      { name: "Breached Account", endpoint: "GET /breachedaccount?account={email}", method: "GET", auth: "API Key Required", description: "Check if email is in breaches" },
      { name: "Password Check", endpoint: "GET /range/{hash-prefix}", method: "GET", auth: "None", description: "Check password (k-anonymity)" },
    ],
  };
  const result = apis[service.toLowerCase()];
  if (!result) return { service, endpoints: [], error: `No APIs found for "${service}". Try: github, reddit, mastodon, hibp` };
  return { service, endpoints: result };
}
