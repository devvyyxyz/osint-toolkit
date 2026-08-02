"use client";

import * as React from "react";
import {
  ShieldCheck,
  Key,
  Loader2,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AccountResults } from "./account-results";
import { PasswordChecker } from "./password-checker";
import type { BreachCheckResult } from "./types";

export function BreachCheckerView({
  result,
  loading,
  error,
  mode,
  onModeChange,
}: {
  result: BreachCheckResult | null;
  loading: boolean;
  error: string | null;
  mode: "account" | "password";
  onModeChange: (m: "account" | "password") => void;
}) {
  return (
    <div className="space-y-4">
      {mode === "account" && (
        <>
          {loading && !result && <LoadingState />}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertTriangle className="h-8 w-8 mb-3 text-red-600 dark:text-red-400 opacity-50" />
              <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                Check failed
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          {!loading && !result && !error && <EmptyState />}
          {result && !loading && <AccountResults result={result} />}
        </>
      )}
      {mode === "password" && <PasswordChecker />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
      <ShieldCheck className="h-10 w-10 mb-4 opacity-30" />
      <p className="text-sm font-medium mb-1">No check yet</p>
      <p className="text-xs">
        Enter an email address or username in the sidebar and press{" "}
        <span className="font-medium text-foreground">Check</span> to see
        if it appears in known data breaches.
      </p>
      <p className="text-[11px] mt-3 text-amber-600 dark:text-amber-400">
        Note: Account lookups require a free HIBP API key. The Password
        Check mode works without any key.
      </p>
    </div>
  );
}

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
