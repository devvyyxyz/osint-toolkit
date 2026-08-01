import { NextRequest, NextResponse } from "next/server";
import tls from "node:tls";
import { cacheGet, cacheSet } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SslResult {
  domain: string;
  valid: boolean;
  validFrom: string | null;
  validTo: string | null;
  daysUntilExpiry: number | null;
  issuer: string | null;
  subject: string | null;
  subjectAltNames: string[];
  serialNumber: string | null;
  fingerprint: string | null;
  protocol: string | null;
  cipherName: string | null;
  error?: string;
}

function sanitizeDomain(raw: string): string | null {
  let d = raw.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
  if (!/^[a-z0-9.-]+$/.test(d) || !d.includes(".")) return null;
  return d;
}

export async function GET(req: NextRequest) {
  const rawDomain = req.nextUrl.searchParams.get("domain") ?? "";
  const skipCache = req.nextUrl.searchParams.get("skipCache") === "1";
  const domain = sanitizeDomain(rawDomain);

  if (!domain) {
    return NextResponse.json({ error: "Invalid domain." }, { status: 400 });
  }

  const cacheKey = `ssl-inspector:${domain}`;
  if (!skipCache) {
    const cached = cacheGet<SslResult>(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });
  }

  const result: SslResult = {
    domain, valid: false, validFrom: null, validTo: null,
    daysUntilExpiry: null, issuer: null, subject: null,
    subjectAltNames: [], serialNumber: null, fingerprint: null,
    protocol: null, cipherName: null,
  };

  await new Promise<void>((resolve) => {
    const socket = tls.connect(
      { host: domain, port: 443, servername: domain, rejectUnauthorized: false },
      () => {
        const cert = socket.getPeerCertificate();
        const protocol = socket.getProtocol();
        const cipher = socket.getCipher();

        if (cert && Object.keys(cert).length > 0) {
          result.valid = socket.authorized;
          result.validFrom = cert.valid_from || null;
          result.validTo = cert.valid_to || null;
          result.issuer = cert.issuer?.O || cert.issuer?.CN || null;
          result.subject = cert.subject?.CN || cert.subject?.O || domain;
          result.serialNumber = cert.serialNumber || null;
          result.fingerprint = cert.fingerprint || null;
          result.protocol = protocol || null;
          result.cipherName = cipher?.name || null;

          if (cert.subjectaltname) {
            result.subjectAltNames = cert.subjectaltname
              .split(",").map((s: string) => s.trim())
              .filter((s: string) => s.startsWith("DNS:"))
              .map((s: string) => s.replace("DNS:", ""));
          }

          try {
            const expiry = new Date(cert.valid_to || "");
            result.daysUntilExpiry = Math.floor((expiry.getTime() - Date.now()) / 86400000);
          } catch { /* noop */ }
        }
        socket.destroy();
        resolve();
      },
    );
    socket.setTimeout(8000);
    socket.on("timeout", () => { result.error = "Connection timed out"; socket.destroy(); resolve(); });
    socket.on("error", (err) => { result.error = err.message; resolve(); });
  });

  cacheSet(cacheKey, result, 10 * 60 * 1000);
  return NextResponse.json({ ...result, cached: false });
}
