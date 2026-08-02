"use client";

import * as React from "react";
import {
  Lock,
  Key,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PasswordCheckResult } from "./types";

export function PasswordChecker() {
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
    safe: { border: "border-emerald-500/40", bg: "bg-emerald-500/5", text: "text-emerald-700 dark:text-emerald-300", icon: CheckCircle2 },
    low: { border: "border-amber-500/40", bg: "bg-amber-500/5", text: "text-amber-700 dark:text-amber-300", icon: AlertTriangle },
    moderate: { border: "border-orange-500/40", bg: "bg-orange-500/5", text: "text-orange-700 dark:text-orange-300", icon: AlertTriangle },
    high: { border: "border-red-500/40", bg: "bg-red-500/5", text: "text-red-700 dark:text-red-300", icon: ShieldAlert },
    critical: { border: "border-red-600/60", bg: "bg-red-600/10", text: "text-red-800 dark:text-red-200", icon: XCircle },
  };

  return (
    <div className="space-y-4">
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
                <Lock className="h-4 w-4" />
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
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="h-6 w-6 mb-2 text-red-600 dark:text-red-400 opacity-50" />
          <p className="text-xs text-red-600 dark:text-red-400">{result.error}</p>
        </div>
      )}

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
