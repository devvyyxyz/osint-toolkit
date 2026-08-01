import { NextRequest, NextResponse } from "next/server";
import { cacheGet, cacheSet } from "@/lib/cache";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain") ?? "";
  if (!domain.trim()) return NextResponse.json({ error: "Missing domain" }, { status: 400 });
  
  const cacheKey = `vuln-scanner:${domain}`;
  if (req.nextUrl.searchParams.get("skipCache") !== "1") {
    const cached = cacheGet<unknown>(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });
  }

  const normalized = domain.replace(/^https?:\/\//, "").split("/")[0];
  const issues: Array<{ severity: string; title: string; description: string }> = [];

  try {
    // Check HTTPS
    const httpsRes = await fetch(`https://${normalized}/`, { signal: AbortSignal.timeout(5000), redirect: "manual" }).catch(() => null);
    if (!httpsRes) issues.push({ severity: "high", title: "No HTTPS", description: "Site does not respond on port 443" });
    
    // Check security headers
    if (httpsRes) {
      const h = httpsRes.headers;
      if (!h.get("strict-transport-security")) issues.push({ severity: "medium", title: "Missing HSTS", description: "Strict-Transport-Security header not set" });
      if (!h.get("content-security-policy")) issues.push({ severity: "medium", title: "Missing CSP", description: "Content-Security-Policy header not set" });
      if (!h.get("x-frame-options")) issues.push({ severity: "low", title: "Missing X-Frame-Options", description: "Clickjacking protection not set" });
      if (!h.get("x-content-type-options")) issues.push({ severity: "low", title: "Missing X-Content-Type-Options", description: "MIME sniffing protection not set" });
      if (h.get("server")) issues.push({ severity: "info", title: "Server header exposed", description: `Server: ${h.get("server")}` });
      if (h.get("x-powered-by")) issues.push({ severity: "info", title: "X-Powered-By exposed", description: `Technology: ${h.get("x-powered-by")}` });
    }

    // Check for open redirect
    const redirectRes = await fetch(`https://${normalized}/?redirect=https://evil.com`, { signal: AbortSignal.timeout(5000), redirect: "manual" }).catch(() => null);
    if (redirectRes && redirectRes.status >= 300 && redirectRes.status < 400) {
      const loc = redirectRes.headers.get("location") || "";
      if (loc.includes("evil.com")) issues.push({ severity: "high", title: "Open Redirect", description: "Site redirects to arbitrary URLs" });
    }

    const result = { domain: normalized, issues, score: Math.max(0, 100 - issues.reduce((s, i) => s + (i.severity === "high" ? 25 : i.severity === "medium" ? 15 : i.severity === "low" ? 5 : 0), 0)) };
    cacheSet(cacheKey, result, 10 * 60 * 1000);
    return NextResponse.json({ ...result, cached: false });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
