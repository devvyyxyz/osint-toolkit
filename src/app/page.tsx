"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  AlertTriangle,
  Globe2,
  Info,
  Settings as SettingsIcon,
  LayoutGrid,
  Wrench,
  Newspaper,
  Star,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import {
  useSearchHistory,
  useWatchlist,
  downloadJSON,
  downloadCSV,
  useKeyboardShortcuts,
} from "@/lib/features";
import { PLATFORMS } from "@/lib/platforms";
import { ProfileDialog } from "./profile-dialog";
import { AppSidebar, type StatusFilter } from "./app-sidebar";
import { ALL_TOOLS } from "./tool-registry";
import { DomainScannerView } from "./domain-scanner-view";
import { LandingPage } from "./landing-page";
import { BreachCheckerView } from "./breach-checker";
import {
  IpLookupView,
  PortScannerView,
  DnsLookupView,
  SslInspectorView,
  CryptoWalletView,
  TransactionTracerView,
} from "./network-crypto-views";
import { GenericResults, LinkListResults, ToolLoading, ToolError, ToolEmpty } from "./generic-tool-views";
import { ErrorBoundary } from "./error-boundary";
import { Onboarding } from "./onboarding";
import { SettingsView } from "./settings-view";
import { LeftPanel, type DashboardSection } from "./left-panel";
import { SettingsSidebar } from "./settings-sidebar";
import { SettingsProvider, useSettings } from "./settings-context";
import {
  LoadingState,
  ResultsView,
  DetailsDialog,
  OverviewPage,
  WatchlistPage,
  FavoritesPage,
  NewsPage,
  type Hit,
  type SearchResponse,
} from "./views";

export default function Home() {
  return (
    <SettingsProvider>
      <HomeContent />
    </SettingsProvider>
  );
}

function HomeContent() {
  const { settings } = useSettings();
  const { history, addEntry, clearHistory } = useSearchHistory();
  const { items: watchlist, addItem: addWatch, removeItem: removeWatch, updateItem: updateWatch } = useWatchlist();
  // View flow: landing → onboarding → app (with optional settings overlay)
  const [view, setView] = useState<"landing" | "app">("landing");
  const [showSettings, setShowSettings] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<DashboardSection>("tools");
  const [activeSettingsSection, setActiveSettingsSection] = useState("api-keys");
  const [activeTool, setActiveTool] = useState("username-finder");
  const [starredTools, setStarredTools] = useState<Set<string>>(new Set());
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
  const [breachMode, setBreachMode] = useState<"account" | "password">("account");

  // Network/Crypto tools state (shared input for ip-lookup, port-scanner, dns-lookup, ssl-inspector, crypto-wallet, transaction-tracer)
  const [networkInput, setNetworkInput] = useState("");
  const [networkLoading, setNetworkLoading] = useState(false);
  const [networkResult, setNetworkResult] = useState<unknown>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);

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
      addEntry({ tool: "username-finder", query: cleanedUsername, resultCount: (data as SearchResponse).found });
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
      addEntry({ tool: "domain-scanner", query: cleanedDomain });
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
      addEntry({ tool: "breach-checker", query: cleanedBreachQuery, resultCount: (data as { breachCount?: number }).breachCount });
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

  const toggleStar = useCallback((toolId: string) => {
    setStarredTools((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) next.delete(toolId);
      else next.add(toolId);
      return next;
    });
  }, []);

  // Network/Crypto tool handler — routes to the correct API based on activeTool
  const runNetworkLookup = useCallback(async () => {
    const query = networkInput.trim();
    if (!query) return;

    const apiMap: Record<string, string> = {
      "ip-lookup": "ip",
      "port-scanner": "host",
      "dns-lookup": "domain",
      "ssl-inspector": "domain",
      "crypto-wallet": "address",
      "transaction-tracer": "address",
      "email-lookup": "email",
      "phone-lookup": "phone",
      "name-search": "name",
      "malware-scanner": "url",
      "phishing-detector": "url",
      "link-extractor": "url",
      "wayback-explorer": "url",
      "tech-detector": "url",
      "code-search": "query",
      "dns-history": "domain",
      "hashtag-tracker": "tag",
      "api-explorer": "service",
      "password-checker": "password",
      "reverse-image": "url",
      "metadata-extractor": "url",
      "vuln-scanner": "domain",
      "privacy-audit": "username",
      "social-graph": "username",
      "archive-search": "query",
      "fingerprint": "data",
    };
    const param = apiMap[activeTool];
    if (!param) return;

    setNetworkLoading(true);
    setNetworkResult(null);
    setNetworkError(null);

    try {
      const res = await fetch(`/api/${activeTool}?${param}=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setNetworkResult(data);
      addEntry({ tool: activeTool, query });
    } catch (err) {
      setNetworkError((err as Error).message);
      toast({ title: "Lookup failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setNetworkLoading(false);
    }
  }, [networkInput, activeTool, addEntry, toast]);

  // Clear network result when switching tools
  useEffect(() => {
    setNetworkResult(null);
    setNetworkError(null);
    setNetworkInput("");
  }, [activeTool]);

  // Keyboard shortcuts
  const sidebarInputRef = useRef<HTMLInputElement>(null);
  useKeyboardShortcuts({
    onFocusSearch: () => {
      const input = document.querySelector('input[aria-label="Username to search"], input[aria-label="Domain to scan"], input[aria-label="Email or username to check"]') as HTMLInputElement;
      input?.focus();
    },
    onSwitchTool: (index: number) => {
      const enabledTools = ALL_TOOLS.filter((t) => t.enabled);
      if (enabledTools[index]) setActiveTool(enabledTools[index].id);
    },
    onCloseModal: () => {
      setDetailsOpen(false);
      setDialogOpen(false);
    },
    onFocusSidebar: () => {
      const input = document.querySelector('input[aria-label="Username to search"], input[aria-label="Domain to scan"], input[aria-label="Email or username to check"]') as HTMLInputElement;
      input?.focus();
    },
  });

  // Export handlers
  const handleExport = (format: "json" | "csv") => {
    if (activeTool === "username-finder" && results) {
      if (format === "json") downloadJSON(results, `username-${results.username}`);
      if (format === "csv") downloadCSV(results.results.map((r) => ({
        platform: r.platformName, category: r.category, url: r.url,
        status: r.status, httpStatus: r.httpStatus, detail: r.detail,
      })), `username-${results.username}`);
    } else if (activeTool === "domain-scanner" && domainResult) {
      downloadJSON(domainResult, `domain-scan-${(domainResult as { domain: string }).domain}`);
    } else if (activeTool === "breach-checker" && breachResult) {
      downloadJSON(breachResult, `breach-check-${(breachResult as { query: string }).query}`);
    } else if (["ip-lookup", "port-scanner", "dns-lookup", "ssl-inspector", "crypto-wallet", "transaction-tracer"].includes(activeTool) && networkResult) {
      downloadJSON(networkResult, `${activeTool}-${networkInput.trim()}`);
    }
  };

  // Watchlist handlers
  const handleAddToWatchlist = () => {
    if (activeTool === "username-finder" && results) {
      addWatch({ tool: "username-finder", query: results.username, label: `@${results.username}` });
      toast({ title: "Added to watchlist", description: `@${results.username} will be monitored.` });
    } else if (activeTool === "domain-scanner" && domainResult) {
      addWatch({ tool: "domain-scanner", query: (domainResult as { domain: string }).domain, label: (domainResult as { domain: string }).domain });
      toast({ title: "Added to watchlist", description: `${(domainResult as { domain: string }).domain} will be monitored.` });
    } else if (activeTool === "breach-checker" && breachResult) {
      addWatch({ tool: "breach-checker", query: (breachResult as { query: string }).query, label: (breachResult as { query: string }).query });
      toast({ title: "Added to watchlist", description: `${(breachResult as { query: string }).query} will be monitored.` });
    } else if (["ip-lookup", "port-scanner", "dns-lookup", "ssl-inspector", "crypto-wallet", "transaction-tracer"].includes(activeTool) && networkResult) {
      addWatch({ tool: activeTool, query: networkInput.trim(), label: networkInput.trim() });
      toast({ title: "Added to watchlist", description: `${networkInput.trim()} will be monitored.` });
    }
  };

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

      {/* Tools sidebar — shown when tools section is active and settings is closed */}
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
          starredTools={starredTools}
          onToggleStar={toggleStar}
          breachMode={breachMode}
          onBreachModeChange={setBreachMode}
          networkInput={networkInput}
          onNetworkInputChange={setNetworkInput}
          onNetworkSubmit={runNetworkLookup}
          networkLoading={networkLoading}
        />
      )}

      {/* Settings sidebar — shown when settings is open */}
      {showSettings && (
        <SettingsSidebar
          activeSection={activeSettingsSection}
          onSectionChange={setActiveSettingsSection}
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
            ) : activeSection === "watchlist" ? (
              <>
                <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                <h1 className="text-sm font-semibold truncate">Watchlist</h1>
              </>
            ) : activeSection === "favorites" ? (
              <>
                <Star className="h-4 w-4 text-muted-foreground shrink-0" />
                <h1 className="text-sm font-semibold truncate">Favorites</h1>
              </>
            ) : activeSection === "news" ? (
              <>
                <Newspaper className="h-4 w-4 text-muted-foreground shrink-0" />
                <h1 className="text-sm font-semibold truncate">News</h1>
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
            <div className="flex items-center gap-1 shrink-0">
              {/* Export button — only when results exist */}
              {((activeTool === "username-finder" && results) ||
                (activeTool === "domain-scanner" && domainResult) ||
                (activeTool === "breach-checker" && breachResult) ||
                (networkResult && !["breach-checker", "username-finder", "domain-scanner"].includes(activeTool))) && (
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleExport("json")} aria-label="Export JSON" title="Export as JSON">
                  <Download className="h-4 w-4" />
                </Button>
              )}
              {/* Watchlist button — only when results exist */}
              {((activeTool === "username-finder" && results) ||
                (activeTool === "domain-scanner" && domainResult) ||
                (activeTool === "breach-checker" && breachResult) ||
                (networkResult && !["breach-checker", "username-finder", "domain-scanner"].includes(activeTool))) && (
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleAddToWatchlist} aria-label="Add to watchlist" title="Add to watchlist">
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setDetailsOpen(true)} aria-label="Details">
                <Info className="h-4 w-4" />
              </Button>
            </div>
          )}
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {activeSection === "overview" ? (
            <ErrorBoundary>
            <OverviewPage
              history={history}
              onClearHistory={clearHistory}
              watchlist={watchlist}
              onRemoveWatch={removeWatch}
            />
            </ErrorBoundary>
          ) : activeSection === "watchlist" ? (
            <ErrorBoundary>
            <WatchlistPage
              watchlist={watchlist}
              onRemoveWatch={removeWatch}
            />
            </ErrorBoundary>
          ) : activeSection === "favorites" ? (
            <ErrorBoundary>
            <FavoritesPage starredTools={starredTools} onToolChange={setActiveTool} onToggleStar={toggleStar} />
            </ErrorBoundary>
          ) : activeSection === "news" ? (
            <ErrorBoundary>
            <NewsPage />
            </ErrorBoundary>
          ) : showSettings ? (
            <SettingsView onBack={() => setShowSettings(false)} activeSection={activeSettingsSection} />
          ) : (
            <>
              {activeTool === "username-finder" && (
                <>
                  {loading && !results && <LoadingState total={totalPlatforms} />}
                  {!loading && !results && (
                    <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
                      <Search className="h-10 w-10 mb-4 opacity-30" />
                      <p className="text-sm font-medium mb-1">No search yet</p>
                      <p className="text-xs">
                        Type any <span className="font-mono">@username</span> in the sidebar and press{" "}
                        <span className="font-medium text-foreground">Search</span>.
                      </p>
                    </div>
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
                  mode={breachMode}
                  onModeChange={setBreachMode}
                />
              )}

              {/* Network tools */}
              {["ip-lookup", "port-scanner", "dns-lookup", "ssl-inspector", "crypto-wallet", "transaction-tracer"].includes(activeTool) && (
                <>
                  {activeTool === "ip-lookup" && (
                    <IpLookupView result={networkResult as import("./network-crypto-views").IpResult | null} loading={networkLoading} error={networkError} />
                  )}
                  {activeTool === "port-scanner" && (
                    <PortScannerView result={networkResult as import("./network-crypto-views").PortScanData | null} loading={networkLoading} error={networkError} />
                  )}
                  {activeTool === "dns-lookup" && (
                    <DnsLookupView result={networkResult as import("./network-crypto-views").DnsData | null} loading={networkLoading} error={networkError} />
                  )}
                  {activeTool === "ssl-inspector" && (
                    <SslInspectorView result={networkResult as import("./network-crypto-views").SslData | null} loading={networkLoading} error={networkError} />
                  )}
                  {activeTool === "crypto-wallet" && (
                    <CryptoWalletView result={networkResult as import("./network-crypto-views").WalletData | null} loading={networkLoading} error={networkError} />
                  )}
                  {activeTool === "transaction-tracer" && (
                    <TransactionTracerView result={networkResult as import("./network-crypto-views").TraceData | null} loading={networkLoading} error={networkError} />
                  )}
                </>
              )}

              {/* All other tools — generic view */}
              {["email-lookup", "phone-lookup", "name-search", "fingerprint", "malware-scanner", "phishing-detector", "vuln-scanner", "privacy-audit", "social-graph", "metadata-extractor", "wayback-explorer", "link-extractor", "hashtag-tracker", "archive-search", "tech-detector", "api-explorer", "code-search", "dns-history", "password-checker", "reverse-image"].includes(activeTool) && (
                <>
                  {networkLoading && <ToolLoading />}
                  {networkError && !networkLoading && <ToolError message={networkError} />}
                  {!networkLoading && !networkResult && !networkError && (
                    <ToolEmpty
                      icon={React.createElement(ALL_TOOLS.find(t => t.id === activeTool)?.icon ?? Globe2, { className: "h-10 w-10" })}
                      label="No results yet"
                      hint={`Enter a query in the sidebar and press the button to use ${ALL_TOOLS.find(t => t.id === activeTool)?.name ?? "this tool"}.`}
                    />
                  )}
                  {networkResult && !networkLoading && (
                    <>
                      {/* Tools that return link lists */}
                      {["name-search", "hashtag-tracker", "archive-search", "reverse-image"].includes(activeTool) ? (
                        <LinkListResults
                          result={networkResult as Record<string, unknown>}
                          title={ALL_TOOLS.find(t => t.id === activeTool)?.name ?? "Results"}
                          linksKey={activeTool === "name-search" ? "results" : activeTool === "hashtag-tracker" ? "platforms" : activeTool === "reverse-image" ? "searchUrls" : "sources"}
                        />
                      ) : (
                        <GenericResults
                          result={networkResult as Record<string, unknown>}
                          title={ALL_TOOLS.find(t => t.id === activeTool)?.name ?? "Results"}
                        />
                      )}
                    </>
                  )}
                </>
              )}

              {!["username-finder", "domain-scanner", "breach-checker", "ip-lookup", "port-scanner", "dns-lookup", "ssl-inspector", "crypto-wallet", "transaction-tracer", "email-lookup", "phone-lookup", "name-search", "fingerprint", "malware-scanner", "phishing-detector", "vuln-scanner", "privacy-audit", "social-graph", "metadata-extractor", "wayback-explorer", "link-extractor", "hashtag-tracker", "archive-search", "tech-detector", "api-explorer", "code-search", "dns-history", "password-checker", "reverse-image"].includes(activeTool) && (
                <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
                  <AlertTriangle className="h-10 w-10 mb-4 opacity-30" />
                  <p className="text-sm font-medium mb-1">Not available</p>
                  <p className="text-xs">{ALL_TOOLS.find((t) => t.id === activeTool)?.name} is not enabled yet.</p>
                </div>
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