import { NextRequest, NextResponse } from "next/server";
import net from "node:net";
import { cacheGet, cacheSet } from "@/lib/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COMMON_PORTS = [
  21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 587, 993, 995,
  1433, 1521, 3306, 3389, 5432, 5900, 6379, 8080, 8443, 8888, 27017,
];

interface PortResult {
  port: number;
  service: string;
  open: boolean;
}

const PORT_SERVICES: Record<number, string> = {
  21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS",
  80: "HTTP", 110: "POP3", 143: "IMAP", 443: "HTTPS", 445: "SMB",
  587: "SMTP-TLS", 993: "IMAPS", 995: "POP3S", 1433: "MSSQL",
  1521: "Oracle", 3306: "MySQL", 3389: "RDP", 5432: "PostgreSQL",
  5900: "VNC", 6379: "Redis", 8080: "HTTP-Alt", 8443: "HTTPS-Alt",
  8888: "HTTP-Alt", 27017: "MongoDB",
};

function sanitizeHost(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  const cleaned = trimmed.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
  if (!/^[a-z0-9.-]+$/.test(cleaned)) return null;
  return cleaned;
}

function scanPort(host: string, port: number, timeout: number): Promise<PortResult> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.on("connect", () => {
      socket.destroy();
      resolve({ port, service: PORT_SERVICES[port] || "Unknown", open: true });
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve({ port, service: PORT_SERVICES[port] || "Unknown", open: false });
    });
    socket.on("error", () => {
      socket.destroy();
      resolve({ port, service: PORT_SERVICES[port] || "Unknown", open: false });
    });
    socket.connect(port, host);
  });
}

export async function GET(req: NextRequest) {
  const rawHost = req.nextUrl.searchParams.get("host") ?? "";
  const skipCache = req.nextUrl.searchParams.get("skipCache") === "1";
  const host = sanitizeHost(rawHost);

  if (!host) {
    return NextResponse.json({ error: "Invalid hostname or IP." }, { status: 400 });
  }

  const cacheKey = `port-scanner:${host}`;
  if (!skipCache) {
    const cached = cacheGet<{ results: PortResult[]; host: string }>(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });
  }

  const results = await Promise.all(
    COMMON_PORTS.map((port) => scanPort(host, port, 3000)),
  );

  const payload = { host, results, openCount: results.filter((r) => r.open).length };
  cacheSet(cacheKey, payload, 10 * 60 * 1000);
  return NextResponse.json({ ...payload, cached: false });
}
