"use client";

import * as React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  Database,
  Clock,
  Tag,
  Info,
  Lightbulb,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { computeStats, formatDate } from "./stats";
import type { Breach, BreachCheckResult, Paste } from "./types";

export function AccountResults({ result }: { result: BreachCheckResult }) {
  if (result.apiStatus !== "ok") {
    return <ApiUnavailable result={result} />;
  }
  if (!result.found) {
    return <NoBreachesFound result={result} />;
  }
  return <BreachesFound result={result} />;
}

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
                    <li>Set it as an environment variable on your server:</li>
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

function NoBreachesFound({ result }: { result: BreachCheckResult }) {
  return (
    <>
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
      <RecommendationsCard found={false} />
    </>
  );
}

function BreachesFound({ result }: { result: BreachCheckResult }) {
  const stats = React.useMemo(() => computeStats(result), [result]);

  return (
    <div className="space-y-4">
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

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Severity Assessment</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBox label="Total Breaches" value={result.breachCount.toString()} color="text-red-600 dark:text-red-400" />
            <StatBox label="Data Types Exposed" value={stats.uniqueDataClasses.length.toString()} color="text-amber-600 dark:text-amber-400" />
            <StatBox label="First Breach" value={stats.earliestBreach || "—"} color="text-muted-foreground" />
            <StatBox label="Latest Breach" value={stats.latestBreach || "—"} color="text-muted-foreground" />
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

      {stats.uniqueDataClasses.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Data Types Exposed</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.dataClassCounts.map(({ name, count }) => (
                <div key={name} className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-2 py-1">
                  <span className="text-xs font-medium">{name}</span>
                  <Badge variant="secondary" className="text-[9px] h-3.5 px-1">{count}</Badge>
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

      {result.breaches.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Breach Timeline</h3>
            </div>
            <div className="space-y-2">
              {result.breaches.map((breach) => (
                <div key={breach.name} className="flex items-center gap-3 text-xs">
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
                      <Badge key={dc} variant="outline" className="text-[9px] h-3.5 px-1">{dc}</Badge>
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

      <RecommendationsCard found={true} dataClasses={stats.uniqueDataClasses} />

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
                <a href="https://haveibeenpwned.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
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

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 p-2.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-lg font-bold mt-0.5 ${color}`}>{value}</div>
    </div>
  );
}

function RecommendationsCard({ found, dataClasses }: { found: boolean; dataClasses?: string[] }) {
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
      recs.push("Your passwords were exposed — change them immediately on all affected services. Use a password manager to generate strong, unique replacements.");
    }
    if (hasEmails) {
      recs.push("Your email address is exposed — expect an increase in phishing and spam. Be extra cautious of unsolicited emails.");
    }
    if (hasPhones) {
      recs.push("Your phone number was exposed — you may receive more spam calls/SMS. Consider using a call-blocking app.");
    }
    if (hasNames) {
      recs.push("Your real name was exposed — be cautious of social engineering attacks that use your personal details.");
    }
    recs.push("Enable two-factor authentication (2FA) on all important accounts immediately.");
    recs.push("Monitor your financial accounts for suspicious activity for the next few months.");
    if (!hasPasswords) {
      recs.push("Even though passwords weren't directly exposed, assume they could be — change passwords for any account using the same email.");
    }
    return recs;
  }, [found, dataClasses]);

  return (
    <Card className="border-blue-500/30 bg-blue-500/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">Recommendations</h3>
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
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
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

        <div className="flex flex-wrap gap-1 mb-2">
          {breach.dataClasses.slice(0, 5).map((dc) => (
            <Badge key={dc} variant="secondary" className={`text-[9px] h-4 px-1 ${dc === "Passwords" ? "bg-red-500/20 text-red-700 dark:text-red-300" : ""}`}>
              {dc}
            </Badge>
          ))}
          {breach.dataClasses.length > 5 && (
            <span className="text-[10px] text-muted-foreground">+{breach.dataClasses.length - 5}</span>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground">
          {breach.pwnCount.toLocaleString()} accounts affected
        </p>

        <div className="flex flex-wrap gap-1 mt-2">
          {!breach.isVerified && <Badge variant="outline" className="text-[9px] h-4 px-1 text-amber-600 border-amber-500/40">Unverified</Badge>}
          {breach.isFabricated && <Badge variant="outline" className="text-[9px] h-4 px-1 text-amber-600 border-amber-500/40">Fabricated</Badge>}
          {breach.isSensitive && <Badge variant="outline" className="text-[9px] h-4 px-1 text-red-600 border-red-500/40">Sensitive</Badge>}
          {breach.isRetired && <Badge variant="outline" className="text-[9px] h-4 px-1 text-muted-foreground">Retired</Badge>}
          {breach.isSpamList && <Badge variant="outline" className="text-[9px] h-4 px-1 text-muted-foreground">Spam list</Badge>}
        </div>

        {expanded && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{description}</p>
        )}
        <button onClick={() => setExpanded(!expanded)} className="text-[11px] text-primary hover:underline mt-2">
          {expanded ? "Show less" : "Show details"}
        </button>
      </CardContent>
    </Card>
  );
}

function PasteRow({ paste }: { paste: Paste }) {
  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-3">
        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border/60">
          <Tag className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{paste.title || paste.id}</span>
            <Badge variant="secondary" className="text-[9px] h-4 px-1 shrink-0">{paste.source}</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {paste.emailCount.toLocaleString()} emails · {formatDate(paste.date)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
