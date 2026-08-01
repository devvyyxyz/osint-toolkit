"use client";

import * as React from "react";
import {
  Search,
  Loader2,
  Check,
  X,
  HelpCircle,
  ShieldAlert,
  AlertTriangle,
  Filter,
  Tag,
  Globe2,
  AtSign,
  Star,
  Phone,
  Globe,
  Image as ImageIcon,
  MapPin,
  ShieldCheck,
  Share2,
  Lock,
  ChevronDown,
  ChevronRight,
  Mail,
  MessageSquare,
  Fingerprint,
  Wifi,
  Database,
  FileSearch,
  Crosshair,
  Users,
  Link2,
  Hash,
  Key,
  Eye,
  Download,
  Activity,
  Server,
  Network,
  Code,
  Bitcoin,
  Clock,
  Calendar,
  Bookmark,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { BrandIcon } from "@/components/brand-icon";
import { PLATFORMS } from "@/lib/platforms";
import type { HitStatus } from "./hit-types";

export type StatusFilter = "all" | HitStatus;

/* ------------------------------------------------------------------ */
/*  Tool registry with category groups                                 */
/* ------------------------------------------------------------------ */

interface ToolDef {
  id: string;
  name: string;
  description: string;
  icon: typeof AtSign;
  enabled: boolean;
}

interface ToolGroup {
  label: string;
  tools: ToolDef[];
}

const TOOL_GROUPS: ToolGroup[] = [
  {
    label: "Identity",
    tools: [
      { id: "username-finder", name: "Username Finder", description: "Search @usernames across 100+ social platforms", icon: AtSign, enabled: true },
      { id: "email-lookup", name: "Email Lookup", description: "Find accounts linked to an email address across services", icon: Mail, enabled: false },
      { id: "phone-lookup", name: "Phone Lookup", description: "Find accounts linked to a phone number via caller ID & social", icon: Phone, enabled: false },
      { id: "reverse-image", name: "Reverse Image", description: "Find where a profile picture appears across the web", icon: ImageIcon, enabled: false },
      { id: "name-search", name: "Name Search", description: "Search for a person by real name across public records", icon: Users, enabled: false },
      { id: "fingerprint", name: "Fingerprint", description: "Generate a digital fingerprint for an identity", icon: Fingerprint, enabled: false },
    ],
  },
  {
    label: "Network",
    tools: [
      { id: "domain-scanner", name: "Domain Scanner", description: "DNS, WHOIS, SSL, subdomains, tech stack & security headers", icon: Globe, enabled: true },
      { id: "ip-lookup", name: "IP Lookup", description: "Geolocate an IP and see ASN, ISP, and hosting info", icon: MapPin, enabled: false },
      { id: "wifi-scanner", name: "WiFi Scanner", description: "Scan nearby WiFi networks and their security", icon: Wifi, enabled: false },
      { id: "port-scanner", name: "Port Scanner", description: "Scan a host for open ports and running services", icon: Network, enabled: false },
      { id: "dns-lookup", name: "DNS Lookup", description: "Query DNS records for a domain across all record types", icon: Server, enabled: false },
      { id: "ssl-inspector", name: "SSL Inspector", description: "Inspect SSL/TLS certificate chain for any domain", icon: Lock, enabled: false },
    ],
  },
  {
    label: "Security",
    tools: [
      { id: "breach-checker", name: "Breach Checker", description: "Check if an email or username appears in known data breaches", icon: ShieldCheck, enabled: true },
      { id: "password-checker", name: "Password Strength", description: "Check password strength and breach history", icon: Key, enabled: false },
      { id: "malware-scanner", name: "Malware Scanner", description: "Scan a URL or file against known malware databases", icon: ShieldAlert, enabled: false },
      { id: "phishing-detector", name: "Phishing Detector", description: "Check if a URL is flagged as a phishing site", icon: Crosshair, enabled: false },
      { id: "vuln-scanner", name: "Vuln Scanner", description: "Scan a domain for known CVEs and vulnerabilities", icon: AlertTriangle, enabled: false },
      { id: "privacy-audit", name: "Privacy Audit", description: "Audit your digital footprint across platforms", icon: Eye, enabled: false },
    ],
  },
  {
    label: "Investigation",
    tools: [
      { id: "social-graph", name: "Social Graph", description: "Map connections between accounts across platforms", icon: Share2, enabled: false },
      { id: "metadata-extractor", name: "Metadata Extractor", description: "Extract EXIF and metadata from images and documents", icon: FileSearch, enabled: false },
      { id: "wayback-explorer", name: "Wayback Explorer", description: "Browse archived snapshots of any URL over time", icon: Clock, enabled: false },
      { id: "link-extractor", name: "Link Extractor", description: "Extract all links from a web page and analyze them", icon: Link2, enabled: false },
      { id: "hashtag-tracker", name: "Hashtag Tracker", description: "Track a hashtag across social platforms", icon: Hash, enabled: false },
      { id: "archive-search", name: "Archive Search", description: "Search deleted content across archive services", icon: Bookmark, enabled: false },
    ],
  },
  {
    label: "Crypto & Finance",
    tools: [
      { id: "crypto-wallet", name: "Crypto Wallet", description: "Look up a blockchain wallet address and transaction history", icon: Bitcoin, enabled: false },
      { id: "transaction-tracer", name: "Transaction Tracer", description: "Trace cryptocurrency transactions across the blockchain", icon: Activity, enabled: false },
    ],
  },
  {
    label: "Developer",
    tools: [
      { id: "tech-detector", name: "Tech Detector", description: "Identify technologies powering any website", icon: Code, enabled: false },
      { id: "api-explorer", name: "API Explorer", description: "Discover and test public APIs for any service", icon: Database, enabled: false },
      { id: "github-search", name: "Code Search", description: "Search for code, repos, and developer profiles", icon: FileSearch, enabled: false },
      { id: "dns-history", name: "DNS History", description: "View historical DNS records for a domain", icon: Calendar, enabled: false },
    ],
  },
];

export const ALL_TOOLS: ToolDef[] = TOOL_GROUPS.flatMap((g) => g.tools);
const ENABLED_COUNT = ALL_TOOLS.filter((t) => t.enabled).length;
const TOTAL_COUNT = ALL_TOOLS.length;

const STATUS_ITEMS: {
  value: StatusFilter;
  label: string;
  icon: typeof Check;
  color: string;
}[] = [
  { value: "all", label: "All", icon: Filter, color: "text-foreground" },
  { value: "found", label: "Found", icon: Check, color: "text-emerald-600 dark:text-emerald-400" },
  { value: "not_found", label: "Not Found", icon: X, color: "text-zinc-500 dark:text-zinc-400" },
  { value: "unknown", label: "Unknown", icon: HelpCircle, color: "text-amber-600 dark:text-amber-400" },
  { value: "blocked", label: "Blocked", icon: ShieldAlert, color: "text-orange-600 dark:text-orange-400" },
  { value: "error", label: "Errors", icon: AlertTriangle, color: "text-red-600 dark:text-red-400" },
];

/* ------------------------------------------------------------------ */
/*  Collapsible section wrapper                                        */
/* ------------------------------------------------------------------ */

function CollapsibleSection({
  label,
  icon,
  defaultOpen = true,
  badge,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group/section">
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground hover:bg-accent/50 transition-colors cursor-pointer select-none">
          <span className="flex items-center gap-1.5">
            {icon}
            {label}
          </span>
          <span className="flex items-center gap-1">
            {badge}
            <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]/section:rotate-180" />
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-1 py-1">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface AppSidebarProps {
  activeTool: string;
  onToolChange: (toolId: string) => void;
  rawInput: string;
  onRawInputChange: (v: string) => void;
  onSubmit: () => void;
  canSearch: boolean;
  loading: boolean;
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
  totalPlatforms: number;
  hasResults: boolean;
  domainInput: string;
  onDomainInputChange: (v: string) => void;
  onDomainSubmit: () => void;
  canScanDomain: boolean;
  domainLoading: boolean;
  breachInput: string;
  onBreachInputChange: (v: string) => void;
  onBreachSubmit: () => void;
  canCheckBreach: boolean;
  breachLoading: boolean;
  /** Set of tool IDs that are starred by the user */
  starredTools: Set<string>;
  onToggleStar: (toolId: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Main component — plain div panel (no shadcn Sidebar)               */
/* ------------------------------------------------------------------ */

export function AppSidebar(props: AppSidebarProps) {
  const {
    activeTool,
    onToolChange,
    rawInput,
    onRawInputChange,
    onSubmit,
    canSearch,
    loading,
    statusFilter,
    onStatusFilterChange,
    selectedCategories,
    onToggleCategory,
    onClearCategories,
    counts,
    totalPlatforms,
    hasResults,
    domainInput,
    onDomainInputChange,
    onDomainSubmit,
    canScanDomain,
    domainLoading,
    breachInput,
    onBreachInputChange,
    onBreachSubmit,
    canCheckBreach,
    breachLoading,
    starredTools,
    onToggleStar,
  } = props;

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    PLATFORMS.forEach((p) => set.add(p.category));
    return Array.from(set).sort();
  }, []);

  return (
    <div className="w-64 shrink-0 flex flex-col h-full border-r border-border/60 bg-background overflow-hidden">
      <TooltipProvider delayDuration={300}>
        {/* ---------- Header: title + search ---------- */}
        <div className="shrink-0">
          <div className="flex items-center gap-2 px-3 py-2">
            <Globe2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-semibold text-sm flex-1">Search</span>
          </div>

          {/* Tool-specific search bar */}
          {activeTool === "username-finder" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (canSearch) onSubmit();
              }}
              className="px-2 pb-2 space-y-2"
              suppressHydrationWarning
            >
              <div className="relative" suppressHydrationWarning>
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm select-none pointer-events-none">
                  @
                </span>
                <Input
                  value={rawInput}
                  onChange={(e) => onRawInputChange(e.target.value)}
                  placeholder="enter a username"
                  className="pl-7 h-9"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-label="Username to search"
                  name="username"
                  type="text"
                />
              </div>
              <Button type="submit" disabled={!canSearch} className="w-full h-9" size="sm">
                {loading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Search className="h-3.5 w-3.5 mr-1.5" />}
                {loading ? "Searching..." : "Search"}
              </Button>
            </form>
          )}

          {activeTool === "domain-scanner" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (canScanDomain) onDomainSubmit();
              }}
              className="px-2 pb-2 space-y-2"
              suppressHydrationWarning
            >
              <div className="relative" suppressHydrationWarning>
                <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5 pointer-events-none" />
                <Input
                  value={domainInput}
                  onChange={(e) => onDomainInputChange(e.target.value)}
                  placeholder="example.com"
                  className="pl-8 h-9"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-label="Domain to scan"
                  name="domain"
                  type="text"
                />
              </div>
              <Button type="submit" disabled={!canScanDomain} className="w-full h-9" size="sm">
                {domainLoading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Search className="h-3.5 w-3.5 mr-1.5" />}
                {domainLoading ? "Scanning..." : "Scan"}
              </Button>
            </form>
          )}

          {activeTool === "breach-checker" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (canCheckBreach) onBreachSubmit();
              }}
              className="px-2 pb-2 space-y-2"
              suppressHydrationWarning
            >
              <Input
                value={breachInput}
                onChange={(e) => onBreachInputChange(e.target.value)}
                placeholder="email or username"
                className="h-9"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Email or username to check"
                name="breach-query"
                type="text"
              />
              <Button type="submit" disabled={!canCheckBreach} className="w-full h-9" size="sm">
                {breachLoading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />}
                {breachLoading ? "Checking..." : "Check"}
              </Button>
            </form>
          )}
        </div>

        <div className="border-t border-border/60" />

        {/* ---------- Scrollable: Starred + Tools ---------- */}
        <div className="flex-1 overflow-y-auto">
          {/* Starred section — always shown, even if empty */}
          <CollapsibleSection
            label={`Starred (${starredTools.size})`}
            icon={<Star className="h-3 w-3" />}
            defaultOpen={true}
          >
            {starredTools.size === 0 ? (
              <div className="px-2 py-3 text-center">
                <Star className="h-4 w-4 mx-auto mb-1 text-muted-foreground/30" />
                <p className="text-[10px] text-muted-foreground/60">
                  No starred tools yet. Click the star icon on a tool to pin it here.
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {ALL_TOOLS.filter((t) => starredTools.has(t.id)).map((tool) => {
                  const ToolIcon = tool.icon;
                  const isActive = tool.id === activeTool;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => onToolChange(tool.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <ToolIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="flex-1 text-left truncate">{tool.name}</span>
                      <Star className="h-2.5 w-2.5 shrink-0 fill-amber-400 text-amber-400" />
                    </button>
                  );
                })}
              </div>
            )}
          </CollapsibleSection>

          {/* Tools section */}
          <CollapsibleSection
            label={`Tools (${ENABLED_COUNT}/${TOTAL_COUNT})`}
            icon={<Filter className="h-3 w-3" />}
            defaultOpen={true}
          >
            <div className="space-y-2">
              {TOOL_GROUPS.map((group) => (
                <div key={group.label}>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground/60 px-2 py-1 font-semibold">
                    {group.label}
                  </div>
                  <div className="space-y-0.5">
                    {group.tools.map((tool) => {
                      const ToolIcon = tool.icon;
                      const isActive = tool.id === activeTool;
                      return (
                        <Tooltip key={tool.id}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              disabled={!tool.enabled}
                              onClick={() => {
                                if (tool.enabled) onToolChange(tool.id);
                              }}
                              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                                isActive && tool.enabled
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : tool.enabled
                                    ? "text-muted-foreground hover:bg-accent hover:text-foreground"
                                    : "text-muted-foreground/40 cursor-not-allowed"
                              }`}
                              aria-disabled={!tool.enabled}
                            >
                              <ToolIcon className="h-3.5 w-3.5 shrink-0" />
                              <span className="flex-1 text-left truncate">{tool.name}</span>
                              {!tool.enabled && <Lock className="h-2.5 w-2.5 shrink-0 opacity-60" />}
                              {tool.enabled && (
                                <span
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleStar(tool.id);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      onToggleStar(tool.id);
                                    }
                                  }}
                                  className="shrink-0 cursor-pointer p-0.5 rounded hover:bg-accent/80"
                                  aria-label={starredTools.has(tool.id) ? "Unstar tool" : "Star tool"}
                                >
                                  <Star
                                    className={`h-2.5 w-2.5 transition-colors ${
                                      starredTools.has(tool.id)
                                        ? "fill-amber-400 text-amber-400"
                                        : isActive
                                          ? "text-primary-foreground/60 hover:text-primary-foreground"
                                          : "text-muted-foreground/40 hover:text-amber-400"
                                    }`}
                                  />
                                </span>
                              )}
                              {isActive && tool.enabled && <Check className="h-3 w-3 shrink-0" />}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-[200px] text-xs">
                            <div className="font-medium">{tool.name}</div>
                            <div className="text-muted-foreground mt-0.5">{tool.description}</div>
                            {!tool.enabled && (
                              <div className="text-amber-600 dark:text-amber-400 mt-1 font-medium">Coming soon</div>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>

        {/* ---------- Pinned: Details & Options (always visible, no scroll) ---------- */}
        <div className="shrink-0 border-t border-border/60 max-h-[40vh] overflow-y-auto">
          {/* Details & Options — Status, Categories, Results */}
          <CollapsibleSection
            label="Details & Options"
            icon={<Filter className="h-3 w-3" />}
            defaultOpen={true}
          >
            <div className="space-y-3">
              {/* Results count — shows total results for the active tool */}
              <div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground/60 px-2 py-1 font-semibold">
                  Results
                </div>
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  {activeTool === "username-finder" && hasResults ? (
                    <span><span className="font-mono text-foreground">{counts.all}</span> platforms scanned</span>
                  ) : activeTool === "domain-scanner" ? (
                    <span>Domain scan results</span>
                  ) : activeTool === "breach-checker" ? (
                    <span>Breach check results</span>
                  ) : (
                    <span className="text-muted-foreground/50">No results yet</span>
                  )}
                </div>
              </div>

              {/* Status section — shows status filter for Username Finder */}
              {activeTool === "username-finder" && hasResults && (
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground/60 px-2 py-1 font-semibold">
                    Status
                  </div>
                  <div className="space-y-0.5">
                    {STATUS_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const active = statusFilter === item.value;
                      const count = item.value === "all" ? counts.all : counts[item.value as keyof typeof counts];
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => onStatusFilterChange(item.value)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                            active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                          }`}
                        >
                          <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "" : item.color}`} />
                          <span className="flex-1 text-left">{item.label}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Categories section */}
              {activeTool === "username-finder" && hasResults && (
                <div>
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-muted-foreground/60 px-2 py-1 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Tag className="h-3 w-3" />
                      Categories
                    </span>
                    {selectedCategories.size > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearCategories();
                        }}
                        className="text-[10px] normal-case tracking-normal text-primary hover:underline"
                      >
                        clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-0.5 max-h-[30vh] overflow-y-auto">
                    {categories.map((cat) => {
                      const active = selectedCategories.has(cat);
                      const platformCount = PLATFORMS.filter((p) => p.category === cat).length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => onToggleCategory(cat)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                            active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                          }`}
                        >
                          <span className={`h-3 w-3 rounded-sm border flex items-center justify-center shrink-0 ${active ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}>
                            {active && <Check className="h-2.5 w-2.5" />}
                          </span>
                          <span className="flex-1 text-left">{cat}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{platformCount}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Legend — Username Finder only */}
              {activeTool === "username-finder" && (
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground/60 px-2 py-1 font-semibold">
                    Legend
                  </div>
                  <div className="px-2 space-y-1">
                    {[
                      { label: "Found", color: "bg-emerald-500", desc: "Profile page loaded" },
                      { label: "Not Found", color: "bg-zinc-400", desc: "404 or no-account page" },
                      { label: "Unknown", color: "bg-amber-500", desc: "Inconclusive response" },
                      { label: "Blocked", color: "bg-orange-500", desc: "403/429 challenge" },
                      { label: "Error", color: "bg-red-500", desc: "Network failure" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${item.color}`} />
                        <span className="font-medium text-foreground">{item.label}</span>
                        <span className="text-muted-foreground/70 truncate">— {item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Domain Scanner info */}
              {activeTool === "domain-scanner" && (
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground/60 px-2 py-1 font-semibold">
                    Scan includes
                  </div>
                  <div className="px-2 space-y-1 text-[11px] text-muted-foreground">
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

              {/* Breach Checker info */}
              {activeTool === "breach-checker" && (
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground/60 px-2 py-1 font-semibold">
                    How it works
                  </div>
                  <div className="px-2 space-y-1.5 text-[11px] text-muted-foreground">
                    <p>
                      Checks if an email address or username appears in known data breaches using the free{" "}
                      <a href="https://haveibeenpwned.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Have I Been Pwned
                      </a>{" "}
                      API.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>
        </div>

        {/* ---------- Footer ---------- */}
        <div className="shrink-0 border-t border-border/60 px-3 py-2 text-[10px] text-muted-foreground space-y-1">
          <div className="flex items-center justify-between">
            <span>Platforms</span>
            <span className="font-mono">{totalPlatforms}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Cache</span>
            <span className="font-mono">5 min TTL</span>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
