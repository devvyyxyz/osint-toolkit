"use client";

import * as React from "react";
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
  Key,
  Lock,
  TrendingUp,
  Clock,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
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
  apiStatus: "ok" | "no_api_key" | "cloudflare_blocked" | "rate_limited" | "error";
  apiMessage?: string;
  error?: string;
}

interface PasswordCheckResult {
  found: boolean;
  count: number;
  hashPrefix: string;
  severity: "safe" | "low" | "moderate" | "high" | "critical";
  severityLabel: string;
  durationMs: number;
  cached: boolean;
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
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
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="account" className="text-xs">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
            Account Check
          </TabsTrigger>
          <TabsTrigger value="password" className="text-xs">
            <Key className="h-3.5 w-3.5 mr-1.5" />
            Password Check
          </TabsTrigger>
        </TabsList>

        {/* ---- Account breach check tab ---- */}
        <TabsContent value="account" className="space-y-4 mt-4">
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

          {!loading && !result && !error && <EmptyState />}

          {result && !loading && <AccountResults result={result} />}
        </TabsContent>

        {/* ---- Password check tab ---- */}
        <TabsContent value="password" className="mt-4">
          <PasswordChecker />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                        */
/* ------------------------------------------------------------------ */

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="py-16 text-center text-muted-foreground">
        <ShieldCheck className="h-10 w-10 mx-auto mb-4 opacity-40" />
        <p className="text-sm font-medium mb-1">No check yet</p>
        <p className="text-xs">
          Enter an email address or username in the sidebar and press{" "}
          <span className="font-medium text-foreground">Check</span> to see
          if it appears in known data breaches.
        </p>
        <p className="text-[11px] mt-3 text-amber-600 dark:text-amber-400">
          Note: Account lookups require a free HIBP API key. The Password
          Check tab works without any key.
        </p>
      </CardContent>
    </Card>
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
/*  Account results — the full detailed view                           */
/* ------------------------------------------------------------------ */

function AccountResults({ result }: { result: BreachCheckResult }) {
  // API not available — show explanatory message
  if (result.apiStatus !== "ok") {
    return <ApiUnavailable result={result} />;
  }

  // No breaches found — good news!
  if (!result.found) {
    return <NoBreachesFound result={result} />;
  }

  // Breaches found — show full detailed view
  return <BreachesFound result={result} />;
}

/* ------------------------------------------------------------------ */
/*  API unavailable state                                              */
/* ------------------------------------------------------------------ */

function ApiUnavailable({ result }: { result: BreachCheckResult }) {
  const isNoKey = result.apiStatus === "no_api_key";
  const isCloudflare = result.apiStatus === "cloudflare_blocked";
  const isRateLimited = result.apiStatus === "rate_limited";

  return (
    <Card className="border-amber-500/40 bg-amber-500/5">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <AlertOctagon className="h-8 w-8 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h2 className="text-lg font-bold text-amber-700 dark:text-amber-300">
                {isNoKey && "API Key Required"}
                {isCloudflare && "Request Blocked"}
                {isRateLimited && "Rate Limited"}
                {result.apiStatus === "error" && "Check Failed"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {result.apiMessage}
              </p>
            </div>

            {isNoKey && (
              <div className="space-y-3">
                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs space-y-2">
                  <p className="font-medium text-amber-700 dark:text-amber-300">
                    How to get a free API key:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-amber-700/80 dark:text-amber-300/80">
                    <li>
                      Visit{" "}
                      <a
                        href="https://haveibeenpwned.com/API/Key"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        haveibeenpwned.com/API/Key
                      </a>
                    </li>
                    <li>Sign up (free) and get your API key</li>
                    <li>
                      Set it as an environment variable on your server:
                    </li>
                  </ol>
                  <pre className="bg-muted/50 rounded p-2 font-mono text-[11px] mt-2">
                    HIBP_API_KEY=your-key-here
                  </pre>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    In the meantime, try the{" "}
                    <strong className="text-foreground">Password Check</strong>{" "}
                    tab — it works without any API key.
                  </span>
                </div>
              </div>
            )}

            {isRateLimited && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Try again
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  No breaches found state                                            */
/* ------------------------------------------------------------------ */

function NoBreachesFound({ result }: { result: BreachCheckResult }) {
  return (
    <>
      {/* Summary banner */}
      <Card className="border-2 border-emerald-500/40 bg-emerald-500/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                No breaches found
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Query:{" "}
                <span className="font-mono text-foreground">{result.query}</span>{" "}
                ({result.queryType}) · {result.durationMs}ms
                {result.cached && " · cached"}
              </p>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <RecommendationsCard found={false} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Breaches found — full detailed view with multiple sections          */
/* ------------------------------------------------------------------ */

function BreachesFound({ result }: { result: BreachCheckResult }) {
  // Compute statistics for the detail sections
  const stats = React.useMemo(() => computeStats(result), [result]);

  return (
    <div className="space-y-4">
      {/* 1. Summary banner */}
      <Card className="border-2 border-red-500/40 bg-red-500/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-red-700 dark:text-red-300">
                Found in {result.breachCount} breach{result.breachCount === 1 ? "" : "es"}
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Severity assessment */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Severity Assessment</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBox
              label="Total Breaches"
              value={result.breachCount.toString()}
              color="text-red-600 dark:text-red-400"
            />
            <StatBox
              label="Data Types Exposed"
              value={stats.uniqueDataClasses.length.toString()}
              color="text-amber-600 dark:text-amber-400"
            />
            <StatBox
              label="First Breach"
              value={stats.earliestBreach || "—"}
              color="text-muted-foreground"
            />
            <StatBox
              label="Latest Breach"
              value={stats.latestBreach || "—"}
              color="text-muted-foreground"
            />
          </div>
          <div className={`mt-3 rounded-md p-3 text-xs ${stats.severityBg}`}>
            <span className={`font-medium ${stats.severityColor}`}>
              {stats.severityLabel}
            </span>
            <span className="text-muted-foreground ml-2">
              {stats.severityDescription}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 3. Data class breakdown */}
      {stats.uniqueDataClasses.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Data Types Exposed</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.dataClassCounts.map(({ name, count }) => (
                <div
                  key={name}
                  className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-2 py-1"
                >
                  <span className="text-xs font-medium">{name}</span>
                  <Badge variant="secondary" className="text-[9px] h-3.5 px-1">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              These are the categories of personal data that were exposed
              across all breaches. "Passwords" and "Email addresses" are the
              most sensitive — change your passwords immediately if either
              appears.
            </p>
          </CardContent>
        </Card>
      )}

      {/* 4. Breach timeline */}
      {result.breaches.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Breach Timeline</h3>
            </div>
            <div className="space-y-2">
              {result.breaches.map((breach) => (
                <div
                  key={breach.name}
                  className="flex items-center gap-3 text-xs"
                >
                  <div className="font-mono text-muted-foreground w-20 shrink-0">
                    {formatDate(breach.breachDate)}
                  </div>
                  <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{breach.name}</span>
                    <span className="text-muted-foreground ml-2">
                      {breach.pwnCount.toLocaleString()} accounts
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {breach.dataClasses.slice(0, 3).map((dc) => (
                      <Badge
                        key={dc}
                        variant="outline"
                        className="text-[9px] h-3.5 px-1"
                      >
                        {dc}
                      </Badge>
                    ))}
                    {breach.dataClasses.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{breach.dataClasses.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5. Individual breach cards */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
          <Database className="h-4 w-4" />
          Breach Details ({result.breaches.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {result.breaches.map((breach) => (
            <BreachCard key={breach.name} breach={breach} />
          ))}
        </div>
      </div>

      {/* 6. Pastes */}
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

      {/* 7. Recommendations */}
      <RecommendationsCard found={true} dataClasses={stats.uniqueDataClasses} />

      {/* 8. Info footer */}
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
/*  Stat box                                                           */
/* ------------------------------------------------------------------ */

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 p-2.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className={`text-lg font-bold mt-0.5 ${color}`}>{value}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Recommendations card                                               */
/* ------------------------------------------------------------------ */

function RecommendationsCard({
  found,
  dataClasses,
}: {
  found: boolean;
  dataClasses?: string[];
}) {
  const recommendations = React.useMemo(() => {
    if (!found) {
      return [
        "You're not in any known breaches — keep it that way!",
        "Use a password manager to generate and store unique passwords for every account.",
        "Enable two-factor authentication (2FA) wherever possible.",
        "Periodically re-check your email at haveibeenpwned.com.",
      ];
    }

    const recs: string[] = [];
    const hasPasswords = dataClasses?.includes("Passwords");
    const hasEmails = dataClasses?.includes("Email addresses");
    const hasNames = dataClasses?.includes("Names");
    const hasPhones = dataClasses?.includes("Phone numbers");

    if (hasPasswords) {
      recs.push(
        "Your passwords were exposed — change them immediately on all affected services. Use a password manager to generate strong, unique replacements.",
      );
    }
    if (hasEmails) {
      recs.push(
        "Your email address is exposed — expect an increase in phishing and spam. Be extra cautious of unsolicited emails.",
      );
    }
    if (hasPhones) {
      recs.push(
        "Your phone number was exposed — you may receive more spam calls/SMS. Consider using a call-blocking app.",
      );
    }
    if (hasNames) {
      recs.push(
        "Your real name was exposed — be cautious of social engineering attacks that use your personal details.",
      );
    }
    recs.push(
      "Enable two-factor authentication (2FA) on all important accounts immediately.",
    );
    recs.push(
      "Monitor your financial accounts for suspicious activity for the next few months.",
    );
    if (!hasPasswords) {
      recs.push(
        "Even though passwords weren't directly exposed, assume they could be — change passwords for any account using the same email.",
      );
    }
    return recs;
  }, [found, dataClasses]);

  return (
    <Card className="border-blue-500/30 bg-blue-500/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            Recommendations
          </h3>
        </div>
        <div className="space-y-2">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{rec}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Breach card                                                        */
/* ------------------------------------------------------------------ */

function BreachCard({ breach }: { breach: Breach }) {
  const [expanded, setExpanded] = React.useState(false);

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
          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border/60">
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
              className={`text-[9px] h-4 px-1 ${
                dc === "Passwords"
                  ? "bg-red-500/20 text-red-700 dark:text-red-300"
                  : ""
              }`}
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

        <p className="text-[11px] text-muted-foreground">
          {breach.pwnCount.toLocaleString()} accounts affected
        </p>

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
/*  Password checker tab                                               */
/* ------------------------------------------------------------------ */

function PasswordChecker() {
  const [password, setPassword] = React.useState("");
  const [result, setResult] = React.useState<PasswordCheckResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const runCheck = React.useCallback(async () => {
    if (!password) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(
        `/api/check-password?password=${encodeURIComponent(password)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      setResult(data as PasswordCheckResult);
    } catch (e) {
      setResult({
        found: false,
        count: 0,
        hashPrefix: "",
        severity: "safe",
        severityLabel: "Check failed",
        durationMs: 0,
        cached: false,
        error: (e as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }, [password]);

  const severityStyles: Record<
    PasswordCheckResult["severity"],
    { border: string; bg: string; text: string; icon: typeof CheckCircle2 }
  > = {
    safe: {
      border: "border-emerald-500/40",
      bg: "bg-emerald-500/5",
      text: "text-emerald-700 dark:text-emerald-300",
      icon: CheckCircle2,
    },
    low: {
      border: "border-amber-500/40",
      bg: "bg-amber-500/5",
      text: "text-amber-700 dark:text-amber-300",
      icon: AlertTriangle,
    },
    moderate: {
      border: "border-orange-500/40",
      bg: "bg-orange-500/5",
      text: "text-orange-700 dark:text-orange-300",
      icon: AlertTriangle,
    },
    high: {
      border: "border-red-500/40",
      bg: "bg-red-500/5",
      text: "text-red-700 dark:text-red-300",
      icon: ShieldAlert,
    },
    critical: {
      border: "border-red-600/60",
      bg: "bg-red-600/10",
      text: "text-red-800 dark:text-red-200",
      icon: XCircle,
    },
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Password Breach Check</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Check if a password has appeared in known data breaches. Uses the
            free HIBP k-anonymity API — your password is never sent to the
            server. Only the first 5 characters of its SHA-1 hash are shared.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runCheck();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a password to check"
                className="h-10 pr-10"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </button>
            </div>
            <Button type="submit" disabled={!password || loading} size="default">
              {loading ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Key className="h-4 w-4 mr-1.5" />
              )}
              {loading ? "Checking..." : "Check"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Result */}
      {result && !result.error && (
        <Card className={`border-2 ${severityStyles[result.severity].border} ${severityStyles[result.severity].bg}`}>
          <CardContent className="p-5">
            {(() => {
              const Icon = severityStyles[result.severity].icon;
              return (
                <div className="flex items-start gap-3">
                  <Icon className={`h-8 w-8 ${severityStyles[result.severity].text} shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <h2 className={`text-lg font-bold ${severityStyles[result.severity].text}`}>
                      {result.severityLabel}
                    </h2>
                    {result.found ? (
                      <p className="text-sm text-muted-foreground mt-1">
                        This password has appeared in{" "}
                        <span className="font-bold text-foreground">
                          {result.count.toLocaleString()}
                        </span>{" "}
                        data breach{result.count === 1 ? "" : "es"}.
                        {result.count > 0 && (
                          <span>
                            {" "}
                            It should{" "}
                            <strong className="text-red-600 dark:text-red-400">
                              never be used
                            </strong>
                            .
                          </span>
                        )}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        This password was not found in any known data breaches.
                        That's good — but it doesn't mean the password is
                        strong. Use a password manager to generate unique
                        passwords for every account.
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-2 font-mono">
                      Hash prefix: {result.hashPrefix} ·{" "}
                      {result.durationMs}ms{result.cached && " · cached"}
                    </p>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {result?.error && (
        <Card className="border-red-500/40 bg-red-500/10">
          <CardContent className="py-6 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-600 dark:text-red-400" />
            <p className="text-xs text-red-600 dark:text-red-400">{result.error}</p>
          </CardContent>
        </Card>
      )}

      {/* Privacy note */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-2 text-xs">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-muted-foreground">
              <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                How this works (k-anonymity)
              </p>
              <p>
                Your password is SHA-1 hashed in your browser, then only the
                first 5 characters of that hash are sent to the HIBP API.
                The API returns all matching hash suffixes, and your browser
                checks if your full hash is among them. The server never
                knows which password you checked.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats computation                                                  */
/* ------------------------------------------------------------------ */

interface BreachStats {
  uniqueDataClasses: string[];
  dataClassCounts: Array<{ name: string; count: number }>;
  earliestBreach: string | null;
  latestBreach: string | null;
  severityLabel: string;
  severityDescription: string;
  severityColor: string;
  severityBg: string;
}

function computeStats(result: BreachCheckResult): BreachStats {
  const dataClassMap = new Map<string, number>();
  for (const breach of result.breaches) {
    for (const dc of breach.dataClasses) {
      dataClassMap.set(dc, (dataClassMap.get(dc) || 0) + 1);
    }
  }
  const dataClassCounts = Array.from(dataClassMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  const uniqueDataClasses = dataClassCounts.map((d) => d.name);

  const dates = result.breaches
    .map((b) => new Date(b.breachDate).getTime())
    .filter((t) => !isNaN(t));
  const earliestBreach =
    dates.length > 0
      ? new Date(Math.min(...dates)).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;
  const latestBreach =
    dates.length > 0
      ? new Date(Math.max(...dates)).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;

  // Severity assessment
  let severityLabel: string;
  let severityDescription: string;
  let severityColor: string;
  let severityBg: string;

  if (result.breachCount >= 10) {
    severityLabel = "Critical — extensive exposure";
    severityDescription = `This account appears in ${result.breachCount} breaches spanning ${uniqueDataClasses.length} types of personal data. Take immediate action.`;
    severityColor = "text-red-700 dark:text-red-300";
    severityBg = "bg-red-500/10";
  } else if (result.breachCount >= 5) {
    severityLabel = "High — multiple breaches";
    severityDescription = `This account appears in ${result.breachCount} breaches. Change passwords and enable 2FA on all important accounts.`;
    severityColor = "text-red-700 dark:text-red-300";
    severityBg = "bg-red-500/10";
  } else if (result.breachCount >= 2) {
    severityLabel = "Moderate — repeated exposure";
    severityDescription = `This account appears in ${result.breachCount} breaches. Review which data was exposed and update affected credentials.`;
    severityColor = "text-amber-700 dark:text-amber-300";
    severityBg = "bg-amber-500/10";
  } else {
    severityLabel = "Low — single breach";
    severityDescription = `This account appears in 1 breach. Check the details below and update your credentials for the affected service.`;
    severityColor = "text-amber-700 dark:text-amber-300";
    severityBg = "bg-amber-500/10";
  }

  return {
    uniqueDataClasses,
    dataClassCounts,
    earliestBreach,
    latestBreach,
    severityLabel,
    severityDescription,
    severityColor,
    severityBg,
  };
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
