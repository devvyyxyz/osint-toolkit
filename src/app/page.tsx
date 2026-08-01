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
  Info,
  Settings as SettingsIcon,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { PLATFORMS } from "@/lib/platforms";
import { BrandIcon, brandColor } from "@/components/brand-icon";
import { ProfileDialog } from "./profile-dialog";
import { AppSidebar, ALL_TOOLS, type StatusFilter } from "./app-sidebar";
import { DomainScannerView } from "./domain-scanner-view";
import { LandingPage } from "./landing-page";
import { BreachCheckerView } from "./breach-checker-view";
import { Onboarding } from "./onboarding";
import { SettingsView } from "./settings-view";
import { LeftPanel, type DashboardSection } from "./left-panel";
import { SettingsProvider, useSettings } from "./settings-context";
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
  return (
    <SettingsProvider>
      <HomeContent />
    </SettingsProvider>
  );
}

function HomeContent() {
  const { settings } = useSettings();
  // View flow: landing → onboarding → app (with optional settings overlay)
  const [view, setView] = useState<"landing" | "app">("landing");
  const [showSettings, setShowSettings] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<DashboardSection>("tools");
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

  // Breach Checker state
  const [breachInput, setBreachInput] = useState("");
  const [breachLoading, setBreachLoading] = useState(false);
  const [breachResult, setBreachResult] = useState<unknown>(null);
  const [breachError, setBreachError] = useState<string | null>(null);

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

  // Breach check validation — accepts emails or usernames
  const cleanedBreachQuery = useMemo(() => {
    const v = breachInput.trim();
    if (!v) return "";
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const isUsername = /^[A-Za-z0-9_.-]+$/.test(v);
    if (!isEmail && !isUsername) return "";
    return v;
  }, [breachInput]);

  const canCheckBreach = cleanedBreachQuery.length > 0 && !breachLoading;

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

  // --- Breach Checker ---
  const runBreachCheck = useCallback(async () => {
    if (!cleanedBreachQuery) {
      toast({
        title: "Invalid query",
        description: "Enter a valid email address or username.",
        variant: "destructive",
      });
      return;
    }

    setBreachLoading(true);
    setBreachResult(null);
    setBreachError(null);

    try {
      const res = await fetch(
        `/api/check-breaches?query=${encodeURIComponent(cleanedBreachQuery)}${settings.hibpApiKey ? `&apiKey=${encodeURIComponent(settings.hibpApiKey)}` : ""}`,
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      setBreachResult(data);
    } catch (err) {
      setBreachError((err as Error).message);
      toast({
        title: "Breach check failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setBreachLoading(false);
    }
  }, [cleanedBreachQuery, toast, settings.hibpApiKey]);

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

  // Enter the app — if onboarding isn't done, show the wizard first
  const enterApp = useCallback((tool?: string) => {
    if (tool) setActiveTool(tool);
    if (!settings.onboarded) {
      // Onboarding will be shown because settings.onboarded is false
      setView("app");
    } else {
      setView("app");
    }
  }, [settings.onboarded]);

  // Go back to the landing page
  const goHome = useCallback(() => {
    setView("landing");
    setShowSettings(false);
  }, []);

  // ---- Landing page view ----
  if (view === "landing") {
    return (
      <>
        <div key="landing" className="animate-screen-in">
          <LandingPage onGetStarted={() => enterApp()} />
        </div>
        <Toaster />
      </>
    );
  }

  // ---- Onboarding (shown when in app view but not yet onboarded) ----
  if (view === "app" && !settings.onboarded) {
    return (
      <>
        <div key="onboarding" className="animate-screen-in">
          <Onboarding onComplete={() => {}} />
        </div>
        <Toaster />
      </>
    );
  }

  // ---- App view (left panel + sidebar + tool) ----
  return (
    <div className="flex h-screen overflow-hidden">
      <LeftPanel
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onGoHome={goHome}
        onOpenSettings={() => setShowSettings(true)}
        showSettings={showSettings}
        onCloseSettings={() => setShowSettings(false)}
      />

      {activeSection === "tools" && !showSettings && (
        <AppSidebar
          activeTool={activeTool}
          onToolChange={setActiveTool}
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
          breachInput={breachInput}
          onBreachInputChange={setBreachInput}
          onBreachSubmit={runBreachCheck}
          canCheckBreach={canCheckBreach}
          breachLoading={breachLoading}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="shrink-0 flex h-14 items-center gap-2 border-b border-border/60 bg-background/95 backdrop-blur px-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {showSettings ? (
              <>
                <SettingsIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <h1 className="text-sm font-semibold truncate">Settings</h1>
              </>
            ) : activeSection === "overview" ? (
              <>
                <LayoutGrid className="h-4 w-4 text-muted-foreground shrink-0" />
                <h1 className="text-sm font-semibold truncate">Overview</h1>
              </>
            ) : (
              <>
                {(() => {
                  const tool = ALL_TOOLS.find((t) => t.id === activeTool);
                  const ToolIcon = tool?.icon ?? Globe2;
                  return <ToolIcon className="h-4 w-4 text-muted-foreground shrink-0" />;
                })()}
                <h1 className="text-sm font-semibold truncate">
                  {ALL_TOOLS.find((t) => t.id === activeTool)?.name ?? "Tool"}
                </h1>
              </>
            )}
          </div>
          {!showSettings && activeSection === "tools" && (
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setDetailsOpen(true)} aria-label="Details">
              <Info className="h-4 w-4" />
            </Button>
          )}
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {activeSection === "overview" ? (
            <Card className="border-dashed">
              <CardContent className="py-20 text-center text-muted-foreground">
                <LayoutGrid className="h-10 w-10 mx-auto mb-4 opacity-40" />
                <p className="text-sm font-medium mb-1">Overview</p>
                <p className="text-xs">This section is empty for now.</p>
              </CardContent>
            </Card>
          ) : showSettings ? (
            <SettingsView onBack={() => setShowSettings(false)} />
          ) : (
            <>
              {activeTool === "username-finder" && (
                <>
                  {loading && !results && <LoadingState total={totalPlatforms} />}
                  {!loading && !results && (
                    <Card className="border-dashed">
                      <CardContent className="py-16 text-center text-muted-foreground">
                        <Search className="h-10 w-10 mx-auto mb-4 opacity-40" />
                        <p className="text-sm font-medium mb-1">No search yet</p>
                        <p className="text-xs">
                          Type any <span className="font-mono">@username</span> in the sidebar and press{" "}
                          <span className="font-medium text-foreground">Search</span>.
                        </p>
                      </CardContent>
                    </Card>
                  )}
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
              {activeTool === "domain-scanner" && (
                <DomainScannerView
                  result={domainResult as import("./domain-scanner-view").DomainScanResult | null}
                  loading={domainLoading}
                  error={domainError}
                />
              )}
              {activeTool === "breach-checker" && (
                <BreachCheckerView
                  result={breachResult as import("./breach-checker-view").BreachCheckResult | null}
                  loading={breachLoading}
                  error={breachError}
                />
              )}
              {!["username-finder", "domain-scanner", "breach-checker"].includes(activeTool) && (
                <Card className="border-dashed">
                  <CardContent className="py-16 text-center text-muted-foreground">
                    <AlertTriangle className="h-10 w-10 mx-auto mb-4 opacity-40" />
                    <p className="text-sm font-medium mb-1">Not available</p>
                    <p className="text-xs">{ALL_TOOLS.find((t) => t.id === activeTool)?.name} is not enabled yet.</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </main>
      </div>

      <ProfileDialog
        hit={selectedHit ? { ...selectedHit, username: results?.username ?? "" } : null}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <DetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        activeTool={activeTool}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
        onClearCategories={clearCategories}
        counts={counts}
        hasResults={!!results}
      />
      <Toaster />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Details dialog — shows tool info and filters in a modal            */
/* ------------------------------------------------------------------ */

function DetailsDialog({
  open,
  onOpenChange,
  activeTool,
  statusFilter,
  onStatusFilterChange,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  counts,
  hasResults,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  activeTool: string;
  statusFilter: StatusFilter;
  onStatusFilterChange: (f: StatusFilter) => void;
  selectedCategories: Set<string>;
  onToggleCategory: (cat: string) => void;
  onClearCategories: () => void;
  counts: {
    all: number;
    found: number;
    not_found: number;
    unknown: number;
    blocked: number;
    error: number;
  };
  hasResults: boolean;
}) {
  const tool = ALL_TOOLS.find((t) => t.id === activeTool);
  const ToolIcon = tool?.icon ?? Globe2;
  const categories = useMemo(() => {
    const set = new Set<string>();
    PLATFORMS.forEach((p) => set.add(p.category));
    return Array.from(set).sort();
  }, []);

  const STATUS_ITEMS_LOCAL = [
    { value: "all" as const, label: "All", color: "text-foreground" },
    { value: "found" as const, label: "Found", color: "text-emerald-600 dark:text-emerald-400" },
    { value: "not_found" as const, label: "Not Found", color: "text-zinc-500 dark:text-zinc-400" },
    { value: "unknown" as const, label: "Unknown", color: "text-amber-600 dark:text-amber-400" },
    { value: "blocked" as const, label: "Blocked", color: "text-orange-600 dark:text-orange-400" },
    { value: "error" as const, label: "Errors", color: "text-red-600 dark:text-red-400" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ToolIcon className="h-4 w-4" />
            {tool?.name ?? "Tool"} — Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Tool description */}
          {tool && (
            <p className="text-xs text-muted-foreground">{tool.description}</p>
          )}

          {/* Status filters — Username Finder only */}
          {activeTool === "username-finder" && hasResults && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">
                Status Filter
              </div>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_ITEMS_LOCAL.map((item) => {
                  const active = statusFilter === item.value;
                  const count =
                    item.value === "all"
                      ? counts.all
                      : counts[item.value as keyof typeof counts];
                  return (
                    <button
                      key={item.value}
                      onClick={() => onStatusFilterChange(item.value)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {item.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category filters — Username Finder only */}
          {activeTool === "username-finder" && hasResults && (
            <div>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">
                <span>Categories</span>
                {selectedCategories.size > 0 && (
                  <button
                    onClick={onClearCategories}
                    className="text-[10px] normal-case tracking-normal text-primary hover:underline"
                  >
                    clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {categories.map((cat) => {
                  const active = selectedCategories.has(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => onToggleCategory(cat)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legend — Username Finder only */}
          {activeTool === "username-finder" && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">
                Legend
              </div>
              <div className="space-y-1">
                {[
                  { label: "Found", color: "bg-emerald-500", desc: "Profile page loaded" },
                  { label: "Not Found", color: "bg-zinc-400", desc: "404 or no-account page" },
                  { label: "Unknown", color: "bg-amber-500", desc: "Inconclusive response" },
                  { label: "Blocked", color: "bg-orange-500", desc: "403/429 challenge" },
                  { label: "Error", color: "bg-red-500", desc: "Network failure" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${item.color}`} />
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">— {item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tool-specific info */}
          {activeTool === "domain-scanner" && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">
                Scan includes
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                {[
                  "DNS records (A, AAAA, MX, NS, TXT, CAA, SOA)",
                  "WHOIS / RDAP registration data",
                  "SSL certificate details",
                  "Subdomain enumeration (~40 names)",
                  "Tech stack fingerprinting",
                  "Security headers analysis",
                  "Wayback Machine history",
                  "robots.txt & sitemap.xml",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <Check className="h-3 w-3 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTool === "breach-checker" && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-semibold">
                How it works
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p>
                  Checks if an email address or username appears in known data
                  breaches using the free Have I Been Pwned API. Account
                  lookups require an API key (set in Settings). Password
                  checks work without a key.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Tool section — shows a titled section with content or an error box */
/* ------------------------------------------------------------------ */

function ToolSection({
  title,
  hasData,
  toolName,
  children,
}: {
  title: string;
  hasData: boolean;
  toolName?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        {title}
      </h2>
      {hasData && children ? (
        children
      ) : (
        <Card className="border-dashed border-border/60">
          <CardContent className="py-8 text-center text-muted-foreground">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 opacity-40" />
            <p className="text-xs">
              {toolName
                ? `This section is not enabled for ${toolName}.`
                : "Data failed to load. Run a search to populate this section."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
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
