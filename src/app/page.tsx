"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  ExternalLink,
  AlertTriangle,
  Check,
  X,
  HelpCircle,
  Loader2,
  ShieldAlert,
  Globe2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { PLATFORMS } from "@/lib/platforms";
import { BrandIcon, brandColor } from "@/components/brand-icon";
import { ProfileDialog } from "./profile-dialog";
import { AppSidebar, type StatusFilter } from "./app-sidebar";
import { DomainScannerView } from "./domain-scanner-view";
import { LandingPage } from "./landing-page";
import type { HitStatus } from "./hit-types";

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
  cached: boolean;
}

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
  // "landing" = the hero/landing page; "app" = the sidebar + tool view
  const [view, setView] = useState<"landing" | "app">("landing");
  const [activeTool, setActiveTool] = useState("username-finder");
  const [rawInput, setRawInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [selectedHit, setSelectedHit] = useState<Hit | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Domain Scanner state
  const [domainInput, setDomainInput] = useState("");
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainScanTrigger, setDomainScanTrigger] = useState(0);

  const { toast } = useToast();
  const abortRef = useRef<AbortController | null>(null);

  const cleanedUsername = useMemo(() => {
    const v = rawInput.trim().replace(/^@+/, "");
    if (!v) return "";
    if (!/^[A-Za-z0-9_.-]+$/.test(v)) return "";
    return v;
  }, [rawInput]);

  const cleanedDomain = useMemo(() => {
    let d = domainInput.trim().toLowerCase();
    d = d.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
    if (!d || !/^[a-z0-9.-]+$/.test(d) || !d.includes(".") || d.length > 253) {
      return "";
    }
    return d;
  }, [domainInput]);

  const canScanDomain = cleanedDomain.length > 0 && !domainLoading;

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
    setStatusFilter("all");
    setSelectedCategories(new Set());
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

  // --- Domain Scanner ---
  const [domainResult, setDomainResult] = useState<unknown>(null);
  const [domainError, setDomainError] = useState<string | null>(null);

  const runDomainScan = useCallback(async () => {
    if (!cleanedDomain) {
      toast({
        title: "Invalid domain",
        description: "Enter a valid domain like example.com",
        variant: "destructive",
      });
      return;
    }

    setDomainLoading(true);
    setDomainResult(null);
    setDomainError(null);

    try {
      const res = await fetch(
        `/api/scan-domain?domain=${encodeURIComponent(cleanedDomain)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      setDomainResult(data);
    } catch (err) {
      setDomainError((err as Error).message);
      toast({
        title: "Scan failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setDomainLoading(false);
    }
  }, [cleanedDomain, toast]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Apply both the status filter AND the category filter.
  const filteredResults = useMemo(() => {
    if (!results) return [];
    return results.results.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (selectedCategories.size > 0 && !selectedCategories.has(r.category))
        return false;
      return true;
    });
  }, [results, statusFilter, selectedCategories]);

  const totalPlatforms = PLATFORMS.length;

  // Counts for the sidebar badges (computed from results, not from the
  // already-filtered list — they reflect the full search result).
  const counts = useMemo(() => {
    if (!results) {
      return {
        all: 0,
        found: 0,
        not_found: 0,
        unknown: 0,
        blocked: 0,
        error: 0,
      };
    }
    return {
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
    };
  }, [results]);

  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const clearCategories = useCallback(() => {
    setSelectedCategories(new Set());
  }, []);

  // Enter the app from the landing page, optionally with a specific tool
  const enterApp = useCallback((tool?: string) => {
    if (tool) setActiveTool(tool);
    setView("app");
  }, []);

  // Go back to the landing page
  const goHome = useCallback(() => {
    setView("landing");
  }, []);

  // ---- Landing page view ----
  if (view === "landing") {
    return (
      <>
        <LandingPage onEnter={enterApp} totalPlatforms={totalPlatforms} />
        <Toaster />
      </>
    );
  }

  // ---- App view (sidebar + tool) ----
  return (
    <SidebarProvider>
      <AppSidebar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onGoHome={goHome}
        rawInput={rawInput}
        onRawInputChange={setRawInput}
        onSubmit={runSearch}
        canSearch={canSearch}
        loading={loading}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
        onClearCategories={clearCategories}
        counts={counts}
        totalPlatforms={totalPlatforms}
        hasResults={!!results}
        domainInput={domainInput}
        onDomainInputChange={setDomainInput}
        onDomainSubmit={runDomainScan}
        canScanDomain={canScanDomain}
        domainLoading={domainLoading}
      />

      {/* ---------- Main content area ---------- */}
      <SidebarInset>
        {/* Top bar: title + summary (sidebar toggle is now inside the sidebar) */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-border/60 bg-background/95 backdrop-blur px-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Globe2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <h1 className="text-sm font-semibold truncate">
              {activeTool === "username-finder" && results && (
                <>
                  Results for{" "}
                  <span className="font-mono text-primary">
                    @{results.username}
                  </span>
                </>
              )}
              {activeTool === "username-finder" && !results && (
                "Find a username across the web"
              )}
              {activeTool === "domain-scanner" && domainResult && (
                <>
                  Scan of{" "}
                  <span className="font-mono text-primary">
                    {(domainResult as { domain: string }).domain}
                  </span>
                </>
              )}
              {activeTool === "domain-scanner" && !domainResult && (
                "Domain Scanner"
              )}
            </h1>
          </div>
          {/* Active-filter chips — Username Finder only */}
          {activeTool === "username-finder" && (statusFilter !== "all" || selectedCategories.size > 0) && (
            <div className="hidden sm:flex items-center gap-1.5">
              {statusFilter !== "all" && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent text-accent-foreground capitalize">
                  {statusFilter.replace("_", " ")}
                </span>
              )}
              {selectedCategories.size > 0 && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent text-accent-foreground">
                  {selectedCategories.size} categor{selectedCategories.size === 1 ? "y" : "ies"}
                </span>
              )}
            </div>
          )}
          {/* Summary line */}
          {activeTool === "username-finder" && results && (
            <span className="hidden md:block text-xs text-muted-foreground font-mono ml-auto">
              {filteredResults.length} shown · {results.found} found
              {elapsed !== null && ` · ${elapsed}ms`}
              {results.cached && " · cached"}
            </span>
          )}
          {activeTool === "domain-scanner" && domainResult && (
            <span className="hidden md:block text-xs text-muted-foreground font-mono ml-auto">
              {(domainResult as { durationMs: number }).durationMs}ms
              {(domainResult as { cached: boolean }).cached && " · cached"}
            </span>
          )}
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 p-4 sm:p-6">
          {/* ---- Username Finder view ---- */}
          {activeTool === "username-finder" && (
            <>
              {/* Loading skeleton */}
              {loading && !results && (
                <LoadingState total={totalPlatforms} />
              )}

              {/* Empty hint */}
              {!loading && !results && (
                <Card className="border-dashed">
                  <CardContent className="py-16 text-center text-muted-foreground">
                    <Search className="h-10 w-10 mx-auto mb-4 opacity-40" />
                    <p className="text-sm font-medium mb-1">No search yet</p>
                    <p className="text-xs">
                      Type any <span className="font-mono">@username</span> in the
                      sidebar and press{" "}
                      <span className="font-medium text-foreground">Search</span> to
                      probe {totalPlatforms}+ social platforms in parallel.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Results grid */}
              {results && (
                <ResultsView
                  results={results}
                  filteredResults={filteredResults}
                  loading={loading}
                  onSelectHit={(hit) => {
                    setSelectedHit(hit);
                    setDialogOpen(true);
                  }}
                />
              )}
            </>
          )}

          {/* ---- Domain Scanner view ---- */}
          {activeTool === "domain-scanner" && (
            <DomainScannerView
              result={domainResult as import("./domain-scanner-view").DomainScanResult | null}
              loading={domainLoading}
              error={domainError}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border/60 bg-muted/30 px-4 py-3">
          <div className="text-[11px] text-muted-foreground flex flex-col sm:flex-row justify-between gap-1">
            <span>
              For research &amp; personal identity checks only. Respect each
              platform&apos;s Terms of Service.
            </span>
            <span className="font-mono">
              {activeTool === "username-finder"
                ? `${totalPlatforms} platforms · responses are heuristically classified`
                : "DNS · WHOIS · SSL · subdomains · tech stack · security headers"}
            </span>
          </div>
        </footer>
      </SidebarInset>

      <ProfileDialog
        hit={
          selectedHit
            ? {
                ...selectedHit,
                username: results?.username ?? "",
              }
            : null
        }
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <Toaster />
    </SidebarProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading state                                                      */
/* ------------------------------------------------------------------ */

function LoadingState({ total }: { total: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>
          Probing {total} platforms in parallel — this usually takes 5–15
          seconds...
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-lg bg-muted/50 animate-pulse border border-border/40"
          />
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
  filteredResults,
  loading,
  onSelectHit,
}: {
  results: SearchResponse;
  filteredResults: Hit[];
  loading: boolean;
  onSelectHit: (hit: Hit) => void;
}) {
  if (filteredResults.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No results match the current filters. Adjust the status or category
          filters in the sidebar.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Inline summary (mobile-friendly) */}
      <div className="text-xs text-muted-foreground md:hidden">
        {filteredResults.length} of {results.total} shown
        {loading && " · refreshing..."}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {filteredResults.map((hit) => (
          <HitCard
            key={hit.platformId}
            hit={hit}
            onClick={() => onSelectHit(hit)}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hit card                                                           */
/*  Layout:                                                            */
/*    [icon] PlatformName Found                                        */
/*            tag1 tag2 - example.com/user                             */
/* ------------------------------------------------------------------ */

function HitCard({ hit, onClick }: { hit: Hit; onClick: () => void }) {
  const meta = STATUS_META[hit.status];
  const Icon = meta.icon;
  const platform = PLATFORMS.find((p) => p.id === hit.platformId);
  const displayUrl = hit.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const tileBg =
    platform && (brandColor(platform.iconSlug) ?? platform.color)
      ? `${brandColor(platform.iconSlug) ?? platform.color}1A`
      : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group block text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-xl"
      aria-label={`Inspect ${hit.platformName} result for @${hit.platformName}`}
    >
      <Card
        className={`relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 ring-1 !py-0 !gap-0 cursor-pointer ${meta.ring}`}
      >
        <CardContent className="!px-3 py-2 flex items-center gap-2.5">
          {/* Brand icon tile */}
          <div
            className="h-8 w-8 rounded-md flex items-center justify-center shrink-0 border border-border/60"
            style={{ backgroundColor: tileBg }}
            aria-hidden
          >
            <BrandIcon slug={platform?.iconSlug ?? ""} size={16} colored />
          </div>

          {/* Text block */}
          <div className="flex-1 min-w-0">
            {/* Line 1: Platform name + status */}
            <div className="flex items-center gap-2 justify-between">
              <h3 className="font-semibold text-sm truncate leading-tight">
                {hit.platformName}
              </h3>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium shrink-0 ${meta.color}`}
                title={hit.detail}
              >
                <Icon className="h-3 w-3" />
                {meta.label}
              </span>
            </div>

            {/* Line 2: tags + URL */}
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground min-w-0">
              <span className="px-1.5 py-0 text-[10px] font-medium leading-none h-4 inline-flex items-center rounded-md bg-secondary text-secondary-foreground">
                {hit.category}
              </span>
              {hit.httpStatus !== null && (
                <span className="text-[10px] font-mono text-muted-foreground/70 shrink-0">
                  HTTP {hit.httpStatus}
                </span>
              )}
              <span className="text-muted-foreground/40 shrink-0">-</span>
              <span className="truncate font-mono text-[11px]">
                {displayUrl}
              </span>
              <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
