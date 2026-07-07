"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, ExternalLink, AlertTriangle, Check, X, HelpCircle, Loader2, ShieldAlert, Globe2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { PLATFORMS } from "@/lib/platforms";

type HitStatus = "found" | "not_found" | "unknown" | "blocked" | "error";

interface Hit {
  platformId: string;
  platformName: string;
  category: string;
  url: string;
  status: HitStatus;
  httpStatus: number | null;
  detail: string;
  durationMs: number;
}

interface SearchResponse {
  username: string;
  total: number;
  found: number;
  notFound: number;
  blocked: number;
  errors: number;
  results: Hit[];
}

type Filter = "all" | "found" | "not_found" | "blocked" | "error";

const STATUS_META: Record<
  HitStatus,
  { label: string; color: string; icon: typeof Check; ring: string }
> = {
  found: {
    label: "Found",
    color: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/40 bg-emerald-500/10",
    icon: Check,
  },
  not_found: {
    label: "Not Found",
    color: "text-zinc-500 dark:text-zinc-400",
    ring: "ring-zinc-500/30 bg-zinc-500/10",
    icon: X,
  },
  unknown: {
    label: "Unknown",
    color: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/40 bg-amber-500/10",
    icon: HelpCircle,
  },
  blocked: {
    label: "Blocked",
    color: "text-orange-600 dark:text-orange-400",
    ring: "ring-orange-500/40 bg-orange-500/10",
    icon: ShieldAlert,
  },
  error: {
    label: "Error",
    color: "text-red-600 dark:text-red-400",
    ring: "ring-red-500/40 bg-red-500/10",
    icon: AlertTriangle,
  },
};

export default function Home() {
  const [rawInput, setRawInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [elapsed, setElapsed] = useState<number | null>(null);
  const { toast } = useToast();
  const abortRef = useRef<AbortController | null>(null);

  const cleanedUsername = useMemo(() => {
    const v = rawInput.trim().replace(/^@+/, "");
    if (!v) return "";
    if (!/^[A-Za-z0-9_.-]+$/.test(v)) return "";
    return v;
  }, [rawInput]);

  const canSearch = cleanedUsername.length > 0 && !loading;

  const runSearch = useCallback(async () => {
    if (!cleanedUsername) {
      toast({
        title: "Invalid username",
        description:
          "Only letters, numbers, dots, dashes and underscores are allowed.",
        variant: "destructive",
      });
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setResults(null);
    setFilter("all");
    setElapsed(null);
    const started = performance.now();

    try {
      const res = await fetch(
        `/api/search?username=${encodeURIComponent(cleanedUsername)}`,
        { signal: controller.signal },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      setResults(data as SearchResponse);
      setElapsed(Math.round(performance.now() - started));
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      toast({
        title: "Search failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [cleanedUsername, toast]);

  // Submit on Enter
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && canSearch) {
      e.preventDefault();
      runSearch();
    }
  };

  // Cleanup any in-flight request on unmount
  useEffect(() => () => abortRef.current?.abort(), []);

  const filteredResults = useMemo(() => {
    if (!results) return [];
    if (filter === "all") return results.results;
    return results.results.filter((r) => r.status === filter);
  }, [results, filter]);

  const totalPlatforms = PLATFORMS.length;
  const categories = useMemo(() => {
    const set = new Set<string>();
    PLATFORMS.forEach((p) => set.add(p.category));
    return Array.from(set).sort();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header / Hero */}
      <header className="border-b border-border/60 bg-gradient-to-b from-zinc-50 to-background dark:from-zinc-950 dark:to-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
            <Globe2 className="h-3.5 w-3.5" />
            Username OSINT
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Find a username across the web
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl text-sm sm:text-base">
            Type any handle and we&apos;ll probe {totalPlatforms}+ social
            platforms — Instagram, TikTok, X, Snapchat, GitHub, Telegram and
            many more — to see where accounts with that name exist, are missing,
            or are blocked from automated checks.
          </p>

          {/* Search bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-lg select-none">
                @
              </span>
              <Input
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="enter a username, e.g. tompeters"
                className="pl-8 h-12 text-base"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Username to search"
              />
            </div>
            <Button
              onClick={runSearch}
              disabled={!canSearch}
              className="h-12 px-6 text-base"
              size="lg"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Probes run in parallel from the server. Many sites block automated
            requests — results marked <span className="font-medium">Blocked</span> or{" "}
            <span className="font-medium">Unknown</span> need a manual click to
            verify.
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Loading skeleton */}
        {loading && !results && (
          <LoadingState total={totalPlatforms} categories={categories} />
        )}

        {/* Error / empty hint */}
        {!loading && !results && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                Enter a username above and press{" "}
                <span className="font-medium text-foreground">Search</span> to
                start scanning.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && (
          <ResultsView
            results={results}
            filter={filter}
            setFilter={setFilter}
            filteredResults={filteredResults}
            elapsed={elapsed}
            loading={loading}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-muted/30 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
          <span>
            For research &amp; personal identity checks only. Respect each
            platform&apos;s Terms of Service.
          </span>
          <span>
            {totalPlatforms} platforms · responses are heuristically classified
          </span>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading state                                                      */
/* ------------------------------------------------------------------ */

function LoadingState({
  total,
  categories,
}: {
  total: number;
  categories: string[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>
          Probing {total} platforms in parallel — this usually takes 5–15
          seconds...
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-lg bg-muted/50 animate-pulse border border-border/40"
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <Badge key={c} variant="outline" className="opacity-50">
            {c}
          </Badge>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Results view                                                       */
/* ------------------------------------------------------------------ */

function ResultsView({
  results,
  filter,
  setFilter,
  filteredResults,
  elapsed,
  loading,
}: {
  results: SearchResponse;
  filter: Filter;
  setFilter: (f: Filter) => void;
  filteredResults: Hit[];
  elapsed: number | null;
  loading: boolean;
}) {
  const counts = {
    all: results.total,
    found: results.found,
    not_found: results.notFound,
    blocked: results.blocked,
    error: results.errors,
    unknown:
      results.total -
      results.found -
      results.notFound -
      results.blocked -
      results.errors,
  } as Record<Filter | "unknown", number>;

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Results for
            <span className="font-mono text-primary">@{results.username}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {results.found} found · {results.notFound} not found ·{" "}
            {results.blocked} blocked · {counts.unknown} unknown ·{" "}
            {results.errors} errors
            {elapsed !== null && ` · ${elapsed}ms`}
            {loading && " · refreshing..."}
          </p>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="found">
              <Check className="h-3 w-3 mr-1" />
              Found ({counts.found})
            </TabsTrigger>
            <TabsTrigger value="not_found">
              <X className="h-3 w-3 mr-1" />
              Not Found ({counts.not_found})
            </TabsTrigger>
            <TabsTrigger value="blocked">
              <ShieldAlert className="h-3 w-3 mr-1" />
              Blocked ({counts.blocked})
            </TabsTrigger>
            <TabsTrigger value="error">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Errors ({counts.errors})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Grid */}
      {filteredResults.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No results in this category. Switch tabs to see other platforms.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredResults.map((hit) => (
            <HitCard key={hit.platformId} hit={hit} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hit card                                                           */
/* ------------------------------------------------------------------ */

function HitCard({ hit }: { hit: Hit }) {
  const meta = STATUS_META[hit.status];
  const Icon = meta.icon;
  const platform = PLATFORMS.find((p) => p.id === hit.platformId);

  return (
    <a
      href={hit.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="group block"
    >
      <Card
        className={`relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 ring-1 ${meta.ring}`}
      >
        <CardContent className="p-4 flex items-start gap-3">
          {/* Platform icon */}
          <div
            className="h-10 w-10 rounded-md flex items-center justify-center text-lg shrink-0 border border-border/60"
            style={{
              backgroundColor: platform ? `${platform.color}15` : undefined,
            }}
            aria-hidden
          >
            {platform?.icon ?? "🌐"}
          </div>

          {/* Main */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 justify-between">
              <h3 className="font-semibold truncate">{hit.platformName}</h3>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium ${meta.color}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {meta.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {hit.category} · {hit.url.replace(/^https?:\/\//, "")}
            </p>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {hit.detail}
            </p>
            <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-muted-foreground/80">
              {hit.httpStatus !== null && (
                <span>HTTP {hit.httpStatus}</span>
              )}
              <span>· {hit.durationMs}ms</span>
              <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
