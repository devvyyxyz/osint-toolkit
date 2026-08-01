"use client";

import * as React from "react";
import {
  Globe,
  Server,
  Shield,
  Lock,
  Tag,
  ListChecks,
  Clock,
  Search,
  Loader2,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  XCircle,
  FileText,
  Network,
  Calendar,
  Building2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

/* ------------------------------------------------------------------ */
/*  Types — mirrors the API response                                   */
/* ------------------------------------------------------------------ */

interface DnsRecords {
  A: string[];
  AAAA: string[];
  MX: string[];
  NS: string[];
  TXT: string[];
  CNAME: string[];
  CAA: string[];
  SOA: string[];
}

interface SslCertInfo {
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

interface RdapResponse {
  found: boolean;
  domainName: string | null;
  registrar: string | null;
  status: string[];
  nameservers: string[];
  events: Array<{ eventAction: string; eventDate: string }>;
  error?: string;
}

interface SubdomainResult {
  subdomain: string;
  ips: string[];
  type: string;
}

interface TechStackItem {
  name: string;
  category: string;
  confidence: string;
}

interface SecurityHeaders {
  score: number;
  headers: Array<{
    name: string;
    present: boolean;
    value: string | null;
    severity: string;
    description: string;
  }>;
}

interface WaybackInfo {
  totalSnapshots: number | null;
  firstSnapshot: string | null;
  lastSnapshot: string | null;
  error?: string;
}

interface HttpProbe {
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

interface DomainScanResult {
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
  cached: boolean;
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DomainScannerView({
  result,
  loading,
  error,
}: {
  result: DomainScanResult | null;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="space-y-4">
      {/* Loading state */}
      {loading && !result && <LoadingState />}

      {/* Error state */}
      {error && !loading && (
        <Card className="border-red-500/40 bg-red-500/10">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-red-600 dark:text-red-400" />
            <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
              Scan failed
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !result && !error && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Globe className="h-10 w-10 mx-auto mb-4 opacity-40" />
            <p className="text-sm font-medium mb-1">No scan yet</p>
            <p className="text-xs">
              Enter a domain in the sidebar (e.g.{" "}
              <span className="font-mono text-foreground">example.com</span>)
              and press <span className="font-medium text-foreground">Scan</span>{" "}
              to scan DNS, WHOIS, SSL, subdomains, tech stack, and security headers.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && !loading && (
        <ScanResults result={result} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading state                                                      */
/* ------------------------------------------------------------------ */

function LoadingState() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Scanning domain — DNS, WHOIS, SSL, subdomains, tech stack...</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Scan results — the full layout                                     */
/* ------------------------------------------------------------------ */

function ScanResults({ result }: { result: DomainScanResult }) {
  return (
    <div className="space-y-3">
      {/* Summary header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <span className="font-mono">{result.domain}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {result.httpProbe.title && (
              <span className="mr-2">"{result.httpProbe.title}"</span>
            )}
            Scanned in {result.durationMs}ms
            {result.cached && " · cached (10min)"}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a
            href={`https://${result.domain}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            Visit site
          </a>
        </Button>
      </div>

      {/* Grid of result cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <HttpProbeCard result={result} />
        <DnsCard dns={result.dns} />
        <SslCard ssl={result.ssl} domain={result.domain} />
        <WhoisCard rdap={result.rdap} />
        <SubdomainsCard subdomains={result.subdomains} domain={result.domain} />
        <TechStackCard techStack={result.techStack} />
        <SecurityHeadersCard security={result.securityHeaders} />
        <WaybackCard wayback={result.wayback} domain={result.domain} />
        <RobotsSitemapCard robots={result.robotsTxt} sitemap={result.sitemapXml} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Individual section cards                                           */
/* ------------------------------------------------------------------ */

function SectionCard({
  icon,
  title,
  children,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-muted-foreground">{icon}</span>
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function Row({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start gap-2 text-xs py-0.5">
      <span className="text-muted-foreground shrink-0 w-20">{label}</span>
      <span className={`flex-1 break-all ${mono ? "font-mono text-[11px]" : ""}`}>
        {value}
      </span>
    </div>
  );
}

/* ---- HTTP Probe ---- */
function HttpProbeCard({ result }: { result: DomainScanResult }) {
  const p = result.httpProbe;
  const statusColor =
    p.statusCode && p.statusCode >= 200 && p.statusCode < 300
      ? "text-emerald-600 dark:text-emerald-400"
      : p.statusCode && p.statusCode >= 300 && p.statusCode < 400
        ? "text-blue-600 dark:text-blue-400"
        : "text-red-600 dark:text-red-400";

  return (
    <SectionCard icon={<Server className="h-4 w-4" />} title="HTTP Probe">
      {p.error ? (
        <div className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{p.error}</span>
        </div>
      ) : (
        <div className="space-y-0.5">
          <Row
            label="Status"
            value={<span className={`font-mono font-medium ${statusColor}`}>{p.statusCode}</span>}
          />
          <Row label="Server" value={p.server} mono />
          <Row label="Powered by" value={p.poweredBy} mono />
          <Row label="Content-Type" value={p.contentType} mono />
          <Row label="Redirected" value={p.redirected ? `Yes → ${p.finalUrl}` : "No"} />
          <Row label="Body size" value={`${(p.bodySize / 1024).toFixed(1)} KB`} />
        </div>
      )}
    </SectionCard>
  );
}

/* ---- DNS Records ---- */
function DnsCard({ dns }: { dns: DnsRecords }) {
  const records: Array<[string, string[]]> = [
    ["A", dns.A],
    ["AAAA", dns.AAAA],
    ["CNAME", dns.CNAME],
    ["MX", dns.MX],
    ["NS", dns.NS],
    ["TXT", dns.TXT],
    ["CAA", dns.CAA],
    ["SOA", dns.SOA],
  ];
  const hasAny = records.some(([, v]) => v.length > 0);

  return (
    <SectionCard icon={<Network className="h-4 w-4" />} title="DNS Records">
      {!hasAny ? (
        <p className="text-xs text-muted-foreground">No DNS records found</p>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {records.map(([type, values]) =>
            values.length > 0 ? (
              <div key={type}>
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-[10px] h-4 px-1">
                    {type}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">{values.length}</span>
                </div>
                <div className="ml-1 mt-0.5 space-y-0.5">
                  {values.slice(0, 5).map((v, i) => (
                    <div key={i} className="text-[11px] font-mono break-all">
                      {v}
                    </div>
                  ))}
                  {values.length > 5 && (
                    <div className="text-[10px] text-muted-foreground">
                      +{values.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            ) : null,
          )}
        </div>
      )}
    </SectionCard>
  );
}

/* ---- SSL Certificate ---- */
function SslCard({ ssl, domain }: { ssl: SslCertInfo; domain: string }) {
  const expiringSoon =
    ssl.daysUntilExpiry !== null && ssl.daysUntilExpiry < 30;
  const expired = ssl.daysUntilExpiry !== null && ssl.daysUntilExpiry < 0;

  return (
    <SectionCard icon={<Lock className="h-4 w-4" />} title="SSL Certificate">
      {ssl.error ? (
        <div className="text-xs text-muted-foreground">
          <p className="text-red-600 dark:text-red-400 mb-1">No HTTPS / cert</p>
          <p className="text-[11px]">{ssl.error}</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 mb-1">
            {ssl.valid ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
            )}
            <span className={`text-xs font-medium ${ssl.valid ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {ssl.valid ? "Valid" : "Invalid"}
            </span>
          </div>
          <Row label="Issuer" value={ssl.issuer} />
          <Row label="Subject" value={ssl.subject} />
          <Row label="Valid from" value={ssl.validFrom} mono />
          <Row label="Valid to" value={ssl.validTo} mono />
          <Row
            label="Expires in"
            value={
              <span className={expired ? "text-red-600 dark:text-red-400" : expiringSoon ? "text-amber-600 dark:text-amber-400" : ""}>
                {ssl.daysUntilExpiry !== null ? `${ssl.daysUntilExpiry} days` : null}
              </span>
            }
          />
          {ssl.subjectAltNames.length > 0 && (
            <div className="mt-1">
              <div className="text-muted-foreground text-[10px] mb-0.5">SANs ({ssl.subjectAltNames.length})</div>
              <div className="flex flex-wrap gap-1">
                {ssl.subjectAltNames.slice(0, 5).map((san, i) => (
                  <Badge key={i} variant="outline" className="text-[9px] h-3.5 px-1">
                    {san}
                  </Badge>
                ))}
                {ssl.subjectAltNames.length > 5 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{ssl.subjectAltNames.length - 5}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

/* ---- WHOIS / RDAP ---- */
function WhoisCard({ rdap }: { rdap: RdapResponse }) {
  const registrationDate = rdap.events.find((e) => e.eventAction === "registration")?.eventDate;
  const expirationDate = rdap.events.find((e) => e.eventAction === "expiration")?.eventDate;
  const lastChanged = rdap.events.find((e) => e.eventAction === "last changed")?.eventDate;

  return (
    <SectionCard icon={<Building2 className="h-4 w-4" />} title="WHOIS / RDAP">
      {!rdap.found ? (
        <div className="text-xs text-muted-foreground">
          <p className="mb-1">No RDAP data found</p>
          {rdap.error && <p className="text-[11px]">{rdap.error}</p>}
        </div>
      ) : (
        <div className="space-y-0.5">
          <Row label="Domain" value={rdap.domainName} mono />
          <Row label="Registrar" value={rdap.registrar} />
          <Row label="Registered" value={formatDate(registrationDate)} />
          <Row label="Expires" value={formatDate(expirationDate)} />
          <Row label="Updated" value={formatDate(lastChanged)} />
          {rdap.status.length > 0 && (
            <div className="mt-1">
              <div className="text-muted-foreground text-[10px] mb-0.5">Status</div>
              <div className="flex flex-wrap gap-1">
                {rdap.status.map((s, i) => (
                  <Badge key={i} variant="outline" className="text-[9px] h-3.5 px-1">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {rdap.nameservers.length > 0 && (
            <div className="mt-1">
              <div className="text-muted-foreground text-[10px] mb-0.5">Nameservers</div>
              <div className="space-y-0.5">
                {rdap.nameservers.map((ns, i) => (
                  <div key={i} className="text-[11px] font-mono">{ns}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

/* ---- Subdomains ---- */
function SubdomainsCard({
  subdomains,
  domain,
}: {
  subdomains: SubdomainResult[];
  domain: string;
}) {
  return (
    <SectionCard icon={<Network className="h-4 w-4" />} title={`Subdomains (${subdomains.length})`}>
      {subdomains.length === 0 ? (
        <p className="text-xs text-muted-foreground">No common subdomains found</p>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {subdomains.map((s) => (
            <div key={s.subdomain} className="text-xs">
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="text-[9px] h-3.5 px-1">
                  {s.type}
                </Badge>
                <a
                  href={`https://${s.subdomain}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="font-mono text-[11px] text-primary hover:underline truncate"
                >
                  {s.subdomain}
                </a>
              </div>
              <div className="ml-5 text-[10px] font-mono text-muted-foreground">
                {s.ips.join(", ")}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* ---- Tech Stack ---- */
function TechStackCard({ techStack }: { techStack: TechStackItem[] }) {
  const categories = React.useMemo(() => {
    const map = new Map<string, TechStackItem[]>();
    for (const t of techStack) {
      if (!map.has(t.category)) map.set(t.category, []);
      map.get(t.category)!.push(t);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [techStack]);

  return (
    <SectionCard icon={<Tag className="h-4 w-4" />} title={`Tech Stack (${techStack.length})`}>
      {techStack.length === 0 ? (
        <p className="text-xs text-muted-foreground">No technologies detected</p>
      ) : (
        <div className="space-y-2">
          {categories.map(([cat, items]) => (
            <div key={cat}>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                {cat}
              </div>
              <div className="flex flex-wrap gap-1">
                {items.map((t, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className={`text-[10px] h-4 px-1 ${
                      t.confidence === "low" ? "opacity-60" : ""
                    }`}
                    title={`${t.confidence} confidence`}
                  >
                    {t.name}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* ---- Security Headers ---- */
function SecurityHeadersCard({ security }: { security: SecurityHeaders }) {
  const scoreColor =
    security.score >= 80
      ? "text-emerald-600 dark:text-emerald-400"
      : security.score >= 50
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  return (
    <SectionCard icon={<Shield className="h-4 w-4" />} title="Security Headers">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-2xl font-bold ${scoreColor}`}>
          {security.score}
        </span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
      <div className="space-y-1">
        {security.headers.map((h) => (
          <div key={h.name} className="flex items-center gap-1.5 text-[11px]">
            {h.present ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <XCircle className={`h-3 w-3 shrink-0 ${
                h.severity === "critical" ? "text-red-600 dark:text-red-400" :
                h.severity === "warning" ? "text-amber-600 dark:text-amber-400" :
                "text-muted-foreground/50"
              }`} />
            )}
            <span className={`truncate ${h.present ? "text-foreground" : "text-muted-foreground"}`}>
              {h.name}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* ---- Wayback Machine ---- */
function WaybackCard({ wayback, domain }: { wayback: WaybackInfo; domain: string }) {
  return (
    <SectionCard icon={<Clock className="h-4 w-4" />} title="Wayback Machine">
      {wayback.error ? (
        <p className="text-xs text-muted-foreground">{wayback.error}</p>
      ) : (
        <div className="space-y-0.5">
          <Row label="First" value={wayback.firstSnapshot || "—"} />
          <Row label="Last" value={wayback.lastSnapshot || "—"} />
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://web.archive.org/web/*/${domain}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                History
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://web.archive.org/web/2024/${domain}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Latest
              </a>
            </Button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

/* ---- robots.txt / sitemap.xml ---- */
function RobotsSitemapCard({
  robots,
  sitemap,
}: {
  robots: string | null;
  sitemap: string | null;
}) {
  const [showRobots, setShowRobots] = React.useState(false);
  const [showSitemap, setShowSitemap] = React.useState(false);

  return (
    <SectionCard icon={<FileText className="h-4 w-4" />} title="robots.txt / sitemap.xml">
      <div className="space-y-2">
        {/* robots.txt */}
        <div>
          <button
            onClick={() => setShowRobots(!showRobots)}
            className="flex items-center gap-1 text-xs font-medium hover:text-primary"
          >
            {showRobots ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            robots.txt {robots ? `(${robots.length} chars)` : "(not found)"}
          </button>
          {showRobots && robots && (
            <pre className="mt-1 text-[10px] font-mono bg-muted/50 rounded p-2 max-h-32 overflow-y-auto whitespace-pre-wrap break-all">
              {robots}
            </pre>
          )}
        </div>
        {/* sitemap.xml */}
        <div>
          <button
            onClick={() => setShowSitemap(!showSitemap)}
            className="flex items-center gap-1 text-xs font-medium hover:text-primary"
          >
            {showSitemap ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            sitemap.xml {sitemap ? `(${sitemap.length} chars)` : "(not found)"}
          </button>
          {showSitemap && sitemap && (
            <pre className="mt-1 text-[10px] font-mono bg-muted/50 rounded p-2 max-h-32 overflow-y-auto whitespace-pre-wrap break-all">
              {sitemap}
            </pre>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(iso: string | undefined): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/* Button import — needed for the "Visit site" and Wayback links.
   We import here to keep the top of the file cleaner. */
import { Button } from "@/components/ui/button";
