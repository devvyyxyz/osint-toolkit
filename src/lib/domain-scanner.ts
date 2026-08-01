/**
 * Domain Scanner — core scanning logic.
 *
 * All data sources are free and require no API keys:
 *   - DNS records: Node.js built-in `dns` module
 *   - WHOIS: RDAP API (https://rdap.org/domain/{domain}) — JSON, free, no auth
 *   - SSL certificate: Node.js `tls` module (connect, inspect cert, disconnect)
 *   - Subdomain enumeration: DNS resolution of ~40 common subdomain names
 *   - Tech stack: HTTP header + HTML fingerprint matching
 *   - Security headers: HTTP response header analysis
 *   - Wayback Machine: CDX API (https://web.archive.org/cdx/search/cdx)
 *
 * Everything runs in parallel where possible to keep the scan fast.
 */

import dns from "node:dns/promises";
import net from "node:net";
import tls from "node:tls";
import { URL } from "node:url";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DnsRecords {
  A: string[];
  AAAA: string[];
  MX: string[];
  NS: string[];
  TXT: string[];
  CNAME: string[];
  CAA: string[];
  SOA: string[];
}

export interface SslCertInfo {
  valid: boolean;
  validFrom: string | null;
  validTo: string | null;
  daysUntilExpiry: number | null;
  issuer: string | null;
  subject: string | null;
  subjectAltNames: string[];
  serialNumber: string | null;
  fingerprint: string | null;
  error?: string;
}

export interface RdapResponse {
  found: boolean;
  domainName: string | null;
  registrar: string | null;
  status: string[];
  nameservers: string[];
  events: Array<{ eventAction: string; eventDate: string }>;
  entities: Array<{ roles: string[]; vcardArray: unknown[] }>;
  error?: string;
}

export interface SubdomainResult {
  subdomain: string;
  ips: string[];
  type: string;
}

export interface TechStackItem {
  name: string;
  category: string;
  confidence: "high" | "medium" | "low";
}

export interface SecurityHeaders {
  score: number; // 0-100
  headers: Array<{
    name: string;
    present: boolean;
    value: string | null;
    severity: "critical" | "warning" | "info" | "good";
    description: string;
  }>;
}

export interface WaybackInfo {
  totalSnapshots: number | null;
  firstSnapshot: string | null;
  lastSnapshot: string | null;
  error?: string;
}

export interface HttpProbe {
  url: string;
  finalUrl: string;
  statusCode: number | null;
  redirected: boolean;
  redirectChain: string[];
  server: string | null;
  poweredBy: string | null;
  contentType: string | null;
  title: string | null;
  bodySize: number;
  error?: string;
}

export interface DomainScanResult {
  domain: string;
  fetchedAt: string;
  durationMs: number;
  dns: DnsRecords;
  rdap: RdapResponse;
  ssl: SslCertInfo;
  subdomains: SubdomainResult[];
  techStack: TechStackItem[];
  securityHeaders: SecurityHeaders;
  wayback: WaybackInfo;
  httpProbe: HttpProbe;
  robotsTxt: string | null;
  sitemapXml: string | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const SCAN_TIMEOUT = 8000;

function sanitizeDomain(raw: string): string | null {
  let d = raw.trim().toLowerCase();
  // Strip protocol
  d = d.replace(/^https?:\/\//, "");
  // Strip path
  d = d.split("/")[0];
  // Strip port
  d = d.split(":")[0];
  // Strip leading www. for the base domain but keep it as a valid input
  // Basic validation: must have at least one dot, only valid chars
  if (!/^[a-z0-9.-]+$/.test(d)) return null;
  if (!d.includes(".")) return null;
  if (d.startsWith(".") || d.endsWith(".")) return null;
  if (d.length > 253) return null;
  return d;
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number = SCAN_TIMEOUT,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await promise;
  } finally {
    clearTimeout(timeout);
  }
}

/* ------------------------------------------------------------------ */
/*  DNS records                                                        */
/* ------------------------------------------------------------------ */

async function resolveDns(domain: string): Promise<DnsRecords> {
  const empty: DnsRecords = {
    A: [], AAAA: [], MX: [], NS: [], TXT: [],
    CNAME: [], CAA: [], SOA: [],
  };

  const [a, aaaa, mx, ns, txt, caa, soa] = await Promise.allSettled([
    dns.resolve4(domain),
    dns.resolve6(domain),
    dns.resolveMx(domain),
    dns.resolveNs(domain),
    dns.resolveTxt(domain),
    dns.resolveCaa(domain),
    dns.resolveSoa(domain),
  ]);

  // CNAME — only for the root domain, usually fails for domains with A records
  let cname: string[] = [];
  try {
    const c = await dns.resolveCname(domain);
    cname = c;
  } catch {
    // Expected to fail for most domains with direct A records
  }

  return {
    A: a.status === "fulfilled" ? a.value : [],
    AAAA: aaaa.status === "fulfilled" ? aaaa.value : [],
    MX:
      mx.status === "fulfilled"
        ? mx.value.map((m) => `${m.priority} ${m.exchange}`)
        : [],
    NS: ns.status === "fulfilled" ? ns.value : [],
    TXT:
      txt.status === "fulfilled"
        ? txt.value.map((t) => t.join(""))
        : [],
    CNAME: cname,
    CAA:
      caa.status === "fulfilled"
        ? caa.value.map(
            (c) => `${c.flags} ${c.tag} "${c.value}"`,
          )
        : [],
    SOA:
      soa.status === "fulfilled"
        ? [
            `${soa.value.nsname} ${soa.value.hostmaster} ${soa.value.serial} ${soa.value.refresh} ${soa.value.retry} ${soa.value.expire} ${soa.value.minttl}`,
          ]
        : [],
  };
}

/* ------------------------------------------------------------------ */
/*  RDAP / WHOIS                                                       */
/* ------------------------------------------------------------------ */

async function fetchRdap(domain: string): Promise<RdapResponse> {
  const empty: RdapResponse = {
    found: false,
    domainName: null,
    registrar: null,
    status: [],
    nameservers: [],
    events: [],
    entities: [],
  };

  try {
    const res = await fetch(
      `https://rdap.org/domain/${encodeURIComponent(domain)}`,
      {
        headers: { Accept: "application/rdap+json" },
        signal: AbortSignal.timeout(SCAN_TIMEOUT),
      },
    );

    if (res.status === 404) {
      return { ...empty, error: "Domain not found in RDAP" };
    }
    if (!res.ok) {
      return { ...empty, error: `RDAP returned HTTP ${res.status}` };
    }

    const data = (await res.json()) as Record<string, unknown>;

    // Extract registrar from entities
    const entities = (data.entities as Array<Record<string, unknown>>) || [];
    let registrar: string | null = null;
    for (const e of entities) {
      const roles = (e.roles as string[]) || [];
      if (roles.includes("registrar")) {
        const vcard = e.vcardArray as unknown[];
        if (vcard && vcard[1] && Array.isArray(vcard[1])) {
          for (const field of vcard[1] as unknown[]) {
            if (Array.isArray(field) && field[0] === "fn" && field[3]) {
              registrar = field[3] as string;
              break;
            }
          }
        }
      }
    }

    return {
      found: true,
      domainName: (data.ldhName as string) || domain,
      registrar,
      status: (data.status as string[]) || [],
      nameservers: ((data.nameservers as Array<Record<string, unknown>>) || [])
        .map((n) => (n.ldhName as string) || "")
        .filter(Boolean),
      events: (data.events as Array<{ eventAction: string; eventDate: string }>) || [],
      entities: (entities as Array<{ roles: string[]; vcardArray: unknown[] }>) || [],
    };
  } catch (e) {
    return { ...empty, error: (e as Error).message };
  }
}

/* ------------------------------------------------------------------ */
/*  SSL certificate                                                    */
/* ------------------------------------------------------------------ */

async function inspectSsl(domain: string): Promise<SslCertInfo> {
  return new Promise((resolve) => {
    const empty: SslCertInfo = {
      valid: false,
      validFrom: null,
      validTo: null,
      daysUntilExpiry: null,
      issuer: null,
      subject: null,
      subjectAltNames: [],
      serialNumber: null,
      fingerprint: null,
    };

    const socket = tls.connect(
      {
        host: domain,
        port: 443,
        servername: domain,
        rejectUnauthorized: false, // We want to inspect even invalid certs
      },
      () => {
        const cert = socket.getPeerCertificate();
        if (!cert || Object.keys(cert).length === 0) {
          socket.destroy();
          resolve({ ...empty, error: "No certificate presented" });
          return;
        }

        const validFrom = cert.valid_from || null;
        const validTo = cert.valid_to || null;
        let daysUntilExpiry: number | null = null;

        try {
          const expiry = new Date(validTo || "");
          daysUntilExpiry = Math.floor(
            (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
          );
        } catch {
          /* noop */
        }

        const san: string[] = [];
        if (cert.subjectaltname) {
          // Format: "DNS:example.com, DNS:www.example.com, IP:1.2.3.4"
          cert.subjectaltname
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.startsWith("DNS:"))
            .forEach((s) => san.push(s.replace("DNS:", "")));
        }

        socket.destroy();
        resolve({
          valid: socket.authorized,
          validFrom,
          validTo,
          daysUntilExpiry,
          issuer: cert.issuer?.O || cert.issuer?.CN || null,
          subject: cert.subject?.CN || cert.subject?.O || domain,
          subjectAltNames: san,
          serialNumber: cert.serialNumber || null,
          fingerprint: cert.fingerprint || null,
        });
      },
    );

    socket.setTimeout(SCAN_TIMEOUT);
    socket.on("timeout", () => {
      socket.destroy();
      resolve({ ...empty, error: "Connection timed out" });
    });
    socket.on("error", (err) => {
      resolve({ ...empty, error: err.message });
    });
  });
}

/* ------------------------------------------------------------------ */
/*  Subdomain enumeration                                              */
/* ------------------------------------------------------------------ */

const COMMON_SUBDOMAINS = [
  "www", "mail", "smtp", "imap", "pop", "pop3",
  "api", "api1", "api2", "apiv1", "apiv2",
  "dev", "staging", "stage", "test", "qa", "sandbox",
  "app", "apps", "portal", "admin", "dashboard", "panel",
  "blog", "forum", "wiki", "docs", "help", "support",
  "shop", "store", "cart", "checkout", "pay",
  "cdn", "static", "assets", "media", "img", "images",
  "secure", "ssl", "vpn", "remote", "gateway",
  "ns1", "ns2", "dns", "dns1", "dns2",
  "m", "mobile", "wap",
  "beta", "alpha", "preview", "demo",
  "auth", "login", "sso", "oauth", "id",
  "git", "gitlab", "jenkins", "ci", "build",
  "status", "monitor", "metrics", "grafana",
  "autodiscover", "autoconfig", "mta", "mx",
];

async function enumerateSubdomains(
  domain: string,
): Promise<SubdomainResult[]> {
  const results: SubdomainResult[] = [];

  // Probe all subdomains in parallel batches of 20 to avoid overwhelming DNS
  const batchSize = 20;
  for (let i = 0; i < COMMON_SUBDOMAINS.length; i += batchSize) {
    const batch = COMMON_SUBDOMAINS.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(async (sub) => {
        const fullname = `${sub}.${domain}`;
        try {
          const ips = await dns.resolve4(fullname);
          return { subdomain: fullname, ips, type: "A" };
        } catch {
          // Try CNAME
          try {
            const cnames = await dns.resolveCname(fullname);
            return { subdomain: fullname, ips: cnames, type: "CNAME" };
          } catch {
            return null;
          }
        }
      }),
    );
    for (const r of batchResults) {
      if (r.status === "fulfilled" && r.value) {
        results.push(r.value);
      }
    }
  }

  return results;
}

/* ------------------------------------------------------------------ */
/*  HTTP probe + tech stack + security headers                         */
/* ------------------------------------------------------------------ */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function probeHttp(
  domain: string,
): Promise<{ probe: HttpProbe; techStack: TechStackItem[]; security: SecurityHeaders; robots: string | null; sitemap: string | null }> {
  const url = `https://${domain}/`;
  const probe: HttpProbe = {
    url,
    finalUrl: url,
    statusCode: null,
    redirected: false,
    redirectChain: [],
    server: null,
    poweredBy: null,
    contentType: null,
    title: null,
    bodySize: 0,
  };

  let bodyText = "";

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,*/*",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(SCAN_TIMEOUT),
    });

    probe.statusCode = res.status;
    probe.finalUrl = res.url;
    probe.redirected = res.redirected;
    probe.server = res.headers.get("server");
    probe.poweredBy = res.headers.get("x-powered-by");
    probe.contentType = res.headers.get("content-type");

    // Read up to 200KB for title + tech fingerprinting
    const reader = res.body?.getReader();
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
    probe.bodySize = bodyText.length;

    // Extract title
    const titleMatch = bodyText.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch) probe.title = titleMatch[1].trim();

    // --- Tech stack detection ---
    const tech: TechStackItem[] = [];
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });

    // Server-based detection
    if (probe.server) {
      const s = probe.server.toLowerCase();
      if (s.includes("nginx")) tech.push({ name: "Nginx", category: "Web Server", confidence: "high" });
      if (s.includes("apache")) tech.push({ name: "Apache", category: "Web Server", confidence: "high" });
      if (s.includes("cloudflare")) tech.push({ name: "Cloudflare", category: "CDN/Proxy", confidence: "high" });
      if (s.includes("microsoft-iis")) tech.push({ name: "IIS", category: "Web Server", confidence: "high" });
      if (s.includes("caddy")) tech.push({ name: "Caddy", category: "Web Server", confidence: "high" });
      if (s.includes("liteengine") || s.includes("litespeed")) tech.push({ name: "LiteSpeed", category: "Web Server", confidence: "high" });
      if (s.includes("envoy")) tech.push({ name: "Envoy", category: "Proxy", confidence: "high" });
      if (s.includes("aws")) tech.push({ name: "AWS", category: "Hosting", confidence: "medium" });
      if (s.includes("gunicorn")) tech.push({ name: "Gunicorn", category: "App Server", confidence: "high" });
      if (s.includes("uvicorn")) tech.push({ name: "Uvicorn", category: "App Server", confidence: "high" });
    }

    // X-Powered-By
    if (probe.poweredBy) {
      const p = probe.poweredBy.toLowerCase();
      if (p.includes("express")) tech.push({ name: "Express.js", category: "Framework", confidence: "high" });
      if (p.includes("php")) tech.push({ name: "PHP", category: "Language", confidence: "high" });
      if (p.includes("asp.net")) tech.push({ name: "ASP.NET", category: "Framework", confidence: "high" });
      if (p.includes("next")) tech.push({ name: "Next.js", category: "Framework", confidence: "high" });
      if (p.includes("django")) tech.push({ name: "Django", category: "Framework", confidence: "high" });
    }

    // Header-based
    if (headers["x-vercel-id"]) tech.push({ name: "Vercel", category: "Hosting", confidence: "high" });
    if (headers["x-amz-cf-id"]) tech.push({ name: "AWS CloudFront", category: "CDN", confidence: "high" });
    if (headers["x-served-by"]?.includes("varnish")) tech.push({ name: "Varnish", category: "Cache", confidence: "high" });
    if (headers["cf-ray"]) tech.push({ name: "Cloudflare", category: "CDN/Proxy", confidence: "high" });
    if (headers["x-fastly-request-id"]) tech.push({ name: "Fastly", category: "CDN", confidence: "high" });
    if (headers["x-akamai-transformed"]) tech.push({ name: "Akamai", category: "CDN", confidence: "high" });
    if (headers["x-ghs"]) tech.push({ name: "GitHub Pages", category: "Hosting", confidence: "high" });

    // HTML-based detection
    const body = bodyText.toLowerCase();
    if (body.includes("__next_data__") || body.includes("_next/static")) tech.push({ name: "Next.js", category: "Framework", confidence: "high" });
    if (body.includes("data-reactroot") || body.includes("_react")) tech.push({ name: "React", category: "JS Library", confidence: "high" });
    if (body.includes("ng-version") || body.includes("_nghost")) tech.push({ name: "Angular", category: "Framework", confidence: "high" });
    if (body.includes("__vue") || body.includes("data-v-")) tech.push({ name: "Vue.js", category: "Framework", confidence: "high" });
    if (body.includes("wp-content") || body.includes("wp-includes")) tech.push({ name: "WordPress", category: "CMS", confidence: "high" });
    if (body.includes("cdn.jsdelivr.net/npm/bootstrap")) tech.push({ name: "Bootstrap", category: "CSS Framework", confidence: "medium" });
    if (body.includes("cdn.tailwindcss.com") || body.includes("tailwind")) tech.push({ name: "Tailwind CSS", category: "CSS Framework", confidence: "medium" });
    if (body.includes("jquery")) tech.push({ name: "jQuery", category: "JS Library", confidence: "medium" });
    if (body.includes("cloudflareinsights") || body.includes("cloudflare-static")) tech.push({ name: "Cloudflare", category: "CDN/Proxy", confidence: "high" });
    if (body.includes("google-analytics") || body.includes("googletagmanager")) tech.push({ name: "Google Analytics", category: "Analytics", confidence: "high" });
    if (body.includes("plausible.io")) tech.push({ name: "Plausible", category: "Analytics", confidence: "high" });
    if (body.includes("sentry")) tech.push({ name: "Sentry", category: "Monitoring", confidence: "medium" });

    // Deduplicate by name
    const seen = new Set<string>();
    const dedupedTech = tech.filter((t) => {
      if (seen.has(t.name)) return false;
      seen.add(t.name);
      return true;
    });

    // --- Security headers analysis ---
    const securityHeaders: SecurityHeaders = {
      score: 0,
      headers: [
        {
          name: "Strict-Transport-Security",
          present: !!headers["strict-transport-security"],
          value: headers["strict-transport-security"] || null,
          severity: "critical",
          description: "HSTS forces HTTPS and prevents downgrade attacks",
        },
        {
          name: "Content-Security-Policy",
          present: !!headers["content-security-policy"],
          value: headers["content-security-policy"] ? "(present, value truncated)" : null,
          severity: "critical",
          description: "CSP prevents XSS and data injection attacks",
        },
        {
          name: "X-Frame-Options",
          present: !!headers["x-frame-options"],
          value: headers["x-frame-options"] || null,
          severity: "warning",
          description: "Prevents clickjacking via iframe embedding",
        },
        {
          name: "X-Content-Type-Options",
          present: !!headers["x-content-type-options"],
          value: headers["x-content-type-options"] || null,
          severity: "warning",
          description: "Prevents MIME-type sniffing",
        },
        {
          name: "Referrer-Policy",
          present: !!headers["referrer-policy"],
          value: headers["referrer-policy"] || null,
          severity: "info",
          description: "Controls how much referrer info is leaked",
        },
        {
          name: "Permissions-Policy",
          present: !!headers["permissions-policy"],
          value: headers["permissions-policy"] ? "(present)" : null,
          severity: "info",
          description: "Restricts access to browser features (camera, mic, etc.)",
        },
      ],
    };

    // Score: critical=25, warning=15, info=5 each
    let score = 0;
    for (const h of securityHeaders.headers) {
      if (h.present) {
        score += h.severity === "critical" ? 25 : h.severity === "warning" ? 15 : 5;
      }
    }
    securityHeaders.score = Math.min(100, score);

    // --- robots.txt and sitemap.xml ---
    let robots: string | null = null;
    let sitemap: string | null = null;
    try {
      const robotsRes = await fetch(`https://${domain}/robots.txt`, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(5000),
      });
      if (robotsRes.ok) {
        robots = (await robotsRes.text()).slice(0, 2000);
      }
    } catch { /* noop */ }
    try {
      const sitemapRes = await fetch(`https://${domain}/sitemap.xml`, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(5000),
      });
      if (sitemapRes.ok) {
        sitemap = (await sitemapRes.text()).slice(0, 2000);
      }
    } catch { /* noop */ }

    return { probe, techStack: dedupedTech, security: securityHeaders, robots, sitemap };
  } catch (e) {
    probe.error = (e as Error).message;
    return {
      probe,
      techStack: [],
      security: { score: 0, headers: [] },
      robots: null,
      sitemap: null,
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Wayback Machine                                                    */
/* ------------------------------------------------------------------ */

async function fetchWayback(domain: string): Promise<WaybackInfo> {
  try {
    // The CDX API returns one row per snapshot. We request just the
    // first and last to get the date range, plus a count.
    const url = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain)}&output=json&limit=1`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(SCAN_TIMEOUT),
    });
    if (!res.ok) {
      return { totalSnapshots: null, firstSnapshot: null, lastSnapshot: null, error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as unknown[][];
    // data[0] is the header row, data[1] is the first snapshot
    if (!data || data.length < 2) {
      return { totalSnapshots: 0, firstSnapshot: null, lastSnapshot: null };
    }

    // Get the first snapshot timestamp
    const firstTs = (data[1] as string[])[1]; // timestamp column

    // Get the last snapshot by reversing the sort
    const lastUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain)}&output=json&limit=-1`;
    const lastRes = await fetch(lastUrl, {
      signal: AbortSignal.timeout(SCAN_TIMEOUT),
    });
    let lastTs: string | null = null;
    if (lastRes.ok) {
      const lastData = (await lastRes.json()) as unknown[][];
      if (lastData && lastData.length >= 2) {
        lastTs = (lastData[1] as string[])[1];
      }
    }

    // Format timestamps: "20170115123456" → "2017-01-15"
    const formatTs = (ts: string | null): string | null => {
      if (!ts || ts.length < 8) return null;
      return `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`;
    };

    return {
      totalSnapshots: null, // We don't do a full count (too expensive)
      firstSnapshot: formatTs(firstTs),
      lastSnapshot: formatTs(lastTs),
    };
  } catch (e) {
    return {
      totalSnapshots: null,
      firstSnapshot: null,
      lastSnapshot: null,
      error: (e as Error).message,
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Main scanner                                                       */
/* ------------------------------------------------------------------ */

export async function scanDomain(
  rawDomain: string,
): Promise<DomainScanResult> {
  const domain = sanitizeDomain(rawDomain);
  if (!domain) {
    throw new Error("Invalid domain. Enter a valid domain like example.com");
  }

  const started = Date.now();

  // Run all independent probes in parallel
  const [dnsResult, rdapResult, sslResult, subdomainResult, httpResult, waybackResult] =
    await Promise.all([
      resolveDns(domain),
      fetchRdap(domain),
      inspectSsl(domain),
      enumerateSubdomains(domain),
      probeHttp(domain),
      fetchWayback(domain),
    ]);

  return {
    domain,
    fetchedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    dns: dnsResult,
    rdap: rdapResult,
    ssl: sslResult,
    subdomains: subdomainResult,
    techStack: httpResult.techStack,
    securityHeaders: httpResult.security,
    wayback: waybackResult,
    httpProbe: httpResult.probe,
    robotsTxt: httpResult.robots,
    sitemapXml: httpResult.sitemap,
  };
}

export { sanitizeDomain };
