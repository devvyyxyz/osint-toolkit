"use client";

import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Database,
  Calendar,
  Tag,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/* ------------------------------------------------------------------ */
/*  Types — mirrors the API response                                   */
/* ------------------------------------------------------------------ */

interface Breach {
  name: string;
  domain: string;
  breachDate: string;
  addedDate: string;
  pwnCount: number;
  description: string;
  logoPath: string;
  dataClasses: string[];
  isVerified: boolean;
  isFabricated: boolean;
  isSensitive: boolean;
  isRetired: boolean;
  isSpamList: boolean;
}

interface Paste {
  source: string;
  id: string;
  title: string;
  date: string;
  emailCount: number;
}

interface BreachCheckResult {
  query: string;
  queryType: "email" | "username";
  found: boolean;
  breachCount: number;
  breaches: Breach[];
  pasteCount: number;
  pastes: Paste[];
  fetchedAt: string;
  durationMs: number;
  cached: boolean;
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BreachCheckerView({
  result,
  loading,
  error,
}: {
  result: BreachCheckResult | null;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="space-y-4">
      {loading && !result && <LoadingState />}

      {error && !loading && (
        <Card className="border-red-500/40 bg-red-500/10">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-red-600 dark:text-red-400" />
            <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
              Check failed
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !result && !error && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <ShieldCheck className="h-10 w-10 mx-auto mb-4 opacity-40" />
            <p className="text-sm font-medium mb-1">No check yet</p>
            <p className="text-xs">
              Enter an email address or username in the sidebar and press{" "}
              <span className="font-medium text-foreground">Check</span> to see
              if it appears in known data breaches.
            </p>
          </CardContent>
        </Card>
      )}

      {result && !loading && <ResultsView result={result} />}
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
        <span>Checking breach databases...</span>
      </div>
      <Card>
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Results view                                                       */
/* ------------------------------------------------------------------ */

function ResultsView({ result }: { result: BreachCheckResult }) {
  return (
    <div className="space-y-4">
      {/* Summary banner */}
      <Card
        className={`border-2 ${
          result.found
            ? "border-red-500/40 bg-red-500/5"
            : "border-emerald-500/40 bg-emerald-500/5"
        }`}
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            {result.found ? (
              <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <h2
                className={`text-lg font-bold ${
                  result.found
                    ? "text-red-700 dark:text-red-300"
                    : "text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {result.found
                  ? `Found in ${result.breachCount} breach${result.breachCount === 1 ? "" : "es"}`
                  : "No breaches found"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Query:{" "}
                <span className="font-mono text-foreground">{result.query}</span>{" "}
                ({result.queryType})
                {result.pasteCount > 0 && (
                  <>
                    {" · "}
                    {result.pasteCount} paste{result.pasteCount === 1 ? "" : "s"}
                  </>
                )}
                {" · "}
                {result.durationMs}ms
                {result.cached && " · cached"}
              </p>
              {!result.found && (
                <p className="text-xs text-muted-foreground mt-2">
                  Good news — this{" "}
                  {result.queryType === "email" ? "email" : "username"} doesn't
                  appear in any known data breaches tracked by{" "}
                  <a
                    href="https://haveibeenpwned.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Have I Been Pwned
                  </a>
                  .
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breaches list */}
      {result.breaches.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Breaches ({result.breaches.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {result.breaches.map((breach) => (
              <BreachCard key={breach.name} breach={breach} />
            ))}
          </div>
        </div>
      )}

      {/* Pastes list */}
      {result.pastes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Pastes ({result.pastes.length})
          </h3>
          <div className="space-y-2">
            {result.pastes.map((paste) => (
              <PasteRow key={`${paste.source}-${paste.id}`} paste={paste} />
            ))}
          </div>
        </div>
      )}

      {/* Info footer */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-2 text-xs">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-muted-foreground">
              <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                About this data
              </p>
              <p>
                Data sourced from{" "}
                <a
                  href="https://haveibeenpwned.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Have I Been Pwned
                </a>
                . A breach doesn't mean the query was necessarily compromised —
                only that it appeared in a dataset that was exposed. Always use
                unique passwords and enable 2FA.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Breach card                                                        */
/* ------------------------------------------------------------------ */

function BreachCard({ breach }: { breach: Breach }) {
  const [expanded, setExpanded] = React.useState(false);

  // Strip HTML from description (HIBP returns HTML-formatted descriptions)
  const description = breach.description
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          {/* Breach logo */}
          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border/60">
            {/* HIBP logo URLs are relative — we construct the full URL */}
            <img
              src={`https://haveibeenpwned.com${breach.logoPath}`}
              alt={breach.name}
              className="h-8 w-8 object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{breach.name}</h4>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Calendar className="h-3 w-3" />
              {formatDate(breach.breachDate)}
            </p>
          </div>
        </div>

        {/* Data classes */}
        <div className="flex flex-wrap gap-1 mb-2">
          {breach.dataClasses.slice(0, 5).map((dc) => (
            <Badge
              key={dc}
              variant="secondary"
              className="text-[9px] h-4 px-1"
            >
              {dc}
            </Badge>
          ))}
          {breach.dataClasses.length > 5 && (
            <span className="text-[10px] text-muted-foreground">
              +{breach.dataClasses.length - 5}
            </span>
          )}
        </div>

        {/* Affected accounts */}
        <p className="text-[11px] text-muted-foreground">
          {breach.pwnCount.toLocaleString()} accounts affected
        </p>

        {/* Status badges */}
        <div className="flex flex-wrap gap-1 mt-2">
          {!breach.isVerified && (
            <Badge variant="outline" className="text-[9px] h-4 px-1 text-amber-600 border-amber-500/40">
              Unverified
            </Badge>
          )}
          {breach.isFabricated && (
            <Badge variant="outline" className="text-[9px] h-4 px-1 text-amber-600 border-amber-500/40">
              Fabricated
            </Badge>
          )}
          {breach.isSensitive && (
            <Badge variant="outline" className="text-[9px] h-4 px-1 text-red-600 border-red-500/40">
              Sensitive
            </Badge>
          )}
          {breach.isRetired && (
            <Badge variant="outline" className="text-[9px] h-4 px-1 text-muted-foreground">
              Retired
            </Badge>
          )}
          {breach.isSpamList && (
            <Badge variant="outline" className="text-[9px] h-4 px-1 text-muted-foreground">
              Spam list
            </Badge>
          )}
        </div>

        {/* Expandable description */}
        {expanded && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            {description}
          </p>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] text-primary hover:underline mt-2"
        >
          {expanded ? "Show less" : "Show details"}
        </button>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Paste row                                                          */
/* ------------------------------------------------------------------ */

function PasteRow({ paste }: { paste: Paste }) {
  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-3">
        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border/60">
          <Tag className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">
              {paste.title || paste.id}
            </span>
            <Badge variant="secondary" className="text-[9px] h-4 px-1 shrink-0">
              {paste.source}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {paste.emailCount.toLocaleString()} emails ·{" "}
            {formatDate(paste.date)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// React import for useState in BreachCard
import * as React from "react";
