"use client";

import * as React from "react";
import {
  Globe, Server, Lock, Network, Bitcoin, Activity,
  Loader2, AlertTriangle, ExternalLink, CheckCircle2, XCircle,
  MapPin, Clock, ArrowRight, Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadJSON } from "@/lib/features";

/* ------------------------------------------------------------------ */
/*  Shared empty state                                                 */
/* ------------------------------------------------------------------ */

function EmptyState({ icon, label, hint }: { icon: React.ReactNode; label: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
      <div className="opacity-30 mb-4">{icon}</div>
      <p className="text-sm font-medium mb-1">{label}</p>
      <p className="text-xs">{hint}</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertTriangle className="h-8 w-8 mb-3 text-red-600 dark:text-red-400 opacity-50" />
      <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Lookup failed</p>
      <p className="text-xs text-red-600 dark:text-red-400">{message}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Looking up...</span>
      </div>
      <Skeleton className="h-32 rounded-lg" />
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start gap-2 text-xs py-1">
      <span className="text-muted-foreground shrink-0 w-28">{label}</span>
      <span className={`flex-1 break-all ${mono ? "font-mono text-[11px]" : ""}`}>{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  IP Lookup                                                          */
/* ------------------------------------------------------------------ */

export interface IpResult {
  ip: string; hostname: string | null; city: string | null; region: string | null;
  country: string | null; countryCode: string | null; postal: string | null;
  latitude: number | null; longitude: number | null; timezone: string | null;
  org: string | null; asn: string | null; reverseDns: string[]; error?: string; cached?: boolean;
}

export function IpLookupView({ result, loading, error }: { result: IpResult | null; loading: boolean; error: string | null }) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!result) return <EmptyState icon={<MapPin className="h-10 w-10" />} label="No lookup yet" hint="Enter an IP address or hostname in the sidebar." />;
  if (result.error) return <ErrorState message={result.error} />;

  return (
    <div className="space-y-3 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold font-mono">{result.ip}</h2>
        {result.cached && <Badge variant="secondary" className="text-[10px]">Cached</Badge>}
      </div>
      <Card><CardContent className="p-4 space-y-0.5">
        <Row label="Hostname" value={result.hostname} mono />
        <Row label="Organization" value={result.org} />
        <Row label="ASN" value={result.asn} mono />
        <Row label="City" value={result.city} />
        <Row label="Region" value={result.region} />
        <Row label="Country" value={result.country ? `${result.country} (${result.countryCode ?? ""})` : null} />
        <Row label="Postal" value={result.postal} mono />
        <Row label="Coordinates" value={result.latitude && result.longitude ? `${result.latitude}, ${result.longitude}` : null} mono />
        <Row label="Timezone" value={result.timezone} />
        <Row label="Reverse DNS" value={result.reverseDns.length > 0 ? result.reverseDns.join(", ") : "None"} mono />
      </CardContent></Card>
      {result.latitude && result.longitude && (
        <a href={`https://www.openstreetmap.org/?mlat=${result.latitude}&mlon=${result.longitude}&zoom=12`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
          <MapPin className="h-3 w-3" /> View on map <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Port Scanner                                                       */
/* ------------------------------------------------------------------ */

export interface PortResult { port: number; service: string; open: boolean }
export interface PortScanData { host: string; results: PortResult[]; openCount: number; cached?: boolean }

export function PortScannerView({ result, loading, error }: { result: PortScanData | null; loading: boolean; error: string | null }) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!result) return <EmptyState icon={<Network className="h-10 w-10" />} label="No scan yet" hint="Enter a hostname or IP in the sidebar." />;

  return (
    <div className="space-y-3 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold font-mono">{result.host}</h2>
        <Badge variant={result.openCount > 0 ? "destructive" : "secondary"} className="text-xs">
          {result.openCount} open / {result.results.length} scanned
        </Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {result.results.map((r) => (
          <div key={r.port} className={`flex items-center gap-2 p-2 rounded-md border ${r.open ? "border-emerald-500/40 bg-emerald-500/5" : "border-border/40"}`}>
            {r.open ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />}
            <div className="min-w-0">
              <div className="text-xs font-mono font-medium">{r.port}</div>
              <div className="text-[10px] text-muted-foreground truncate">{r.service}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DNS Lookup                                                         */
/* ------------------------------------------------------------------ */

export interface DnsData { domain: string; records: Array<{ type: string; values: string[] }>; cached?: boolean }

export function DnsLookupView({ result, loading, error }: { result: DnsData | null; loading: boolean; error: string | null }) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!result) return <EmptyState icon={<Server className="h-10 w-10" />} label="No lookup yet" hint="Enter a domain in the sidebar." />;

  return (
    <div className="space-y-3 max-w-2xl">
      <h2 className="text-lg font-bold font-mono">{result.domain}</h2>
      {result.records.map((rec) => rec.values.length > 0 && (
        <Card key={rec.type}><CardContent className="p-3">
          <Badge variant="secondary" className="text-[10px] mb-2">{rec.type} ({rec.values.length})</Badge>
          <div className="space-y-0.5">
            {rec.values.map((v, i) => <div key={i} className="text-xs font-mono break-all">{v}</div>)}
          </div>
        </CardContent></Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SSL Inspector                                                      */
/* ------------------------------------------------------------------ */

export interface SslData {
  domain: string; valid: boolean; validFrom: string | null; validTo: string | null;
  daysUntilExpiry: number | null; issuer: string | null; subject: string | null;
  subjectAltNames: string[]; serialNumber: string | null; fingerprint: string | null;
  protocol: string | null; cipherName: string | null; error?: string; cached?: boolean;
}

export function SslInspectorView({ result, loading, error }: { result: SslData | null; loading: boolean; error: string | null }) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!result) return <EmptyState icon={<Lock className="h-10 w-10" />} label="No inspection yet" hint="Enter a domain in the sidebar." />;
  if (result.error) return <ErrorState message={result.error} />;

  const expiringSoon = result.daysUntilExpiry !== null && result.daysUntilExpiry < 30;

  return (
    <div className="space-y-3 max-w-2xl">
      <div className="flex items-center gap-2">
        {result.valid ? <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
        <h2 className="text-lg font-bold">{result.domain}</h2>
      </div>
      <Card><CardContent className="p-4 space-y-0.5">
        <Row label="Valid" value={result.valid ? "Yes" : "No"} />
        <Row label="Issuer" value={result.issuer} />
        <Row label="Subject" value={result.subject} mono />
        <Row label="Valid from" value={result.validFrom} mono />
        <Row label="Valid to" value={result.validTo} mono />
        <Row label="Expires in" value={
          <span className={result.daysUntilExpiry !== null && result.daysUntilExpiry < 0 ? "text-red-600 dark:text-red-400" : expiringSoon ? "text-amber-600 dark:text-amber-400" : ""}>
            {result.daysUntilExpiry !== null ? `${result.daysUntilExpiry} days` : null}
          </span>
        } />
        <Row label="Protocol" value={result.protocol} mono />
        <Row label="Cipher" value={result.cipherName} mono />
        <Row label="Serial" value={result.serialNumber} mono />
        {result.subjectAltNames.length > 0 && (
          <div className="pt-2">
            <div className="text-[10px] text-muted-foreground mb-1">SANs ({result.subjectAltNames.length})</div>
            <div className="flex flex-wrap gap-1">
              {result.subjectAltNames.map((san, i) => <Badge key={i} variant="outline" className="text-[9px]">{san}</Badge>)}
            </div>
          </div>
        )}
      </CardContent></Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Crypto Wallet                                                      */
/* ------------------------------------------------------------------ */

export interface WalletTx { txid: string; amount: number; time: number; type: string }
export interface WalletData {
  address: string; blockchain: string; balance: number | null;
  totalReceived: number | null; totalSent: number | null; txCount: number | null;
  transactions: WalletTx[]; error?: string; cached?: boolean;
}

export function CryptoWalletView({ result, loading, error }: { result: WalletData | null; loading: boolean; error: string | null }) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!result) return <EmptyState icon={<Bitcoin className="h-10 w-10" />} label="No lookup yet" hint="Enter a Bitcoin or Ethereum wallet address in the sidebar." />;
  if (result.error) return <ErrorState message={result.error} />;

  return (
    <div className="space-y-3 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold font-mono break-all">{result.address}</h2>
        <Badge variant="secondary" className="text-xs capitalize shrink-0">{result.blockchain}</Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatBox label="Balance" value={result.balance !== null ? `${result.balance.toFixed(8)} ${result.blockchain === "bitcoin" ? "BTC" : "ETH"}` : "—"} />
        <StatBox label="Received" value={result.totalReceived !== null ? result.totalReceived.toFixed(4) : "—"} />
        <StatBox label="Sent" value={result.totalSent !== null ? result.totalSent.toFixed(4) : "—"} />
        <StatBox label="Transactions" value={result.txCount?.toString() ?? "—"} />
      </div>
      {result.transactions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Recent Transactions</h3>
          <div className="space-y-1">
            {result.transactions.map((tx) => (
              <div key={tx.txid} className="flex items-center gap-3 p-2 rounded-md border border-border/40 hover:bg-accent/30 transition-colors">
                <Badge variant={tx.type === "sent" ? "destructive" : "secondary"} className="text-[9px] shrink-0 capitalize">{tx.type}</Badge>
                <span className="text-xs font-mono truncate flex-1">{tx.txid.slice(0, 20)}...</span>
                <span className="text-xs font-mono shrink-0">{tx.amount.toFixed(6)}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{new Date(tx.time * 1000).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Transaction Tracer                                                 */
/* ------------------------------------------------------------------ */

export interface TraceTx { txid: string; from: string; to: string; amount: number; time: number; type: string }
export interface TraceData { address: string; blockchain: string; txCount: number; transactions: TraceTx[]; error?: string; cached?: boolean }

export function TransactionTracerView({ result, loading, error }: { result: TraceData | null; loading: boolean; error: string | null }) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!result) return <EmptyState icon={<Activity className="h-10 w-10" />} label="No trace yet" hint="Enter a wallet address in the sidebar to trace transactions." />;
  if (result.error) return <ErrorState message={result.error} />;

  return (
    <div className="space-y-3 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold font-mono break-all">{result.address}</h2>
        <Badge variant="secondary" className="text-xs">{result.txCount} transactions</Badge>
      </div>
      <div className="space-y-1">
        {result.transactions.map((tx, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-md border border-border/40 hover:bg-accent/30 transition-colors">
            <Badge variant={tx.type === "sent" ? "destructive" : "secondary"} className="text-[9px] shrink-0 capitalize">{tx.type}</Badge>
            <div className="flex-1 min-w-0 flex items-center gap-1">
              <span className="text-[10px] font-mono truncate text-muted-foreground">{tx.from.slice(0, 12)}...</span>
              <ArrowRight className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
              <span className="text-[10px] font-mono truncate">{tx.to.slice(0, 12)}...</span>
            </div>
            <span className="text-xs font-mono shrink-0">{tx.amount.toFixed(6)}</span>
            <span className="text-[10px] text-muted-foreground shrink-0">{new Date(tx.time * 1000).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared stat box                                                    */
/* ------------------------------------------------------------------ */

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 p-2.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-bold mt-0.5 font-mono">{value}</div>
    </div>
  );
}
