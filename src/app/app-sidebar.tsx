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
  Phone,
  Globe,
  Image as ImageIcon,
  MapPin,
  ShieldCheck,
  Share2,
  Lock,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  Home,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
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
import { BrandIcon } from "@/components/brand-icon";
import { PLATFORMS } from "@/lib/platforms";
import type { HitStatus } from "./hit-types";

export type StatusFilter = "all" | HitStatus;

/* ------------------------------------------------------------------ */
/*  Tool registry                                                      */
/* ------------------------------------------------------------------ */

interface ToolDef {
  id: string;
  name: string;
  description: string;
  icon: typeof AtSign;
  enabled: boolean;
}

const TOOLS: ToolDef[] = [
  {
    id: "username-finder",
    name: "Username Finder",
    description: "Search @usernames across 100+ social platforms",
    icon: AtSign,
    enabled: true,
  },
  {
    id: "email-lookup",
    name: "Email Lookup",
    description: "Find accounts linked to an email address",
    icon: Search,
    enabled: false,
  },
  {
    id: "phone-lookup",
    name: "Phone Lookup",
    description: "Find accounts linked to a phone number",
    icon: Phone,
    enabled: false,
  },
  {
    id: "domain-scanner",
    name: "Domain Scanner",
    description: "Scan a domain for DNS, WHOIS, SSL, subdomains, tech stack & security headers",
    icon: Globe,
    enabled: true,
  },
  {
    id: "image-search",
    name: "Reverse Image",
    description: "Find where a profile picture appears online",
    icon: ImageIcon,
    enabled: false,
  },
  {
    id: "ip-lookup",
    name: "IP Lookup",
    description: "Geolocate an IP address and see its hosting info",
    icon: MapPin,
    enabled: false,
  },
  {
    id: "breach-checker",
    name: "Breach Checker",
    description: "Check if an email or username appears in known breaches",
    icon: ShieldCheck,
    enabled: false,
  },
  {
    id: "social-graph",
    name: "Social Graph",
    description: "Map connections between accounts across platforms",
    icon: Share2,
    enabled: false,
  },
];

/* ------------------------------------------------------------------ */
/*  Collapsible section wrapper                                        */
/*  Wraps a sidebar group in a Collapsible so users can hide/show      */
/*  each section. The label row is the trigger.                        */
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
      <SidebarGroup>
        <CollapsibleTrigger asChild>
          <SidebarGroupLabel className="flex items-center justify-between cursor-pointer select-none hover:bg-accent/50 transition-colors text-[10px] uppercase tracking-wider text-muted-foreground py-1.5">
            <span className="flex items-center gap-1.5">
              {icon}
              {label}
            </span>
            <span className="flex items-center gap-1">
              {badge}
              <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]/section:rotate-180" />
            </span>
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            {children}
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface AppSidebarProps {
  activeTool: string;
  onToolChange: (toolId: string) => void;
  onGoHome: () => void;
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
}

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
/*  Sidebar with internal trigger                                      */
/* ------------------------------------------------------------------ */

function SidebarInternalToggle() {
  const { toggleSidebar, open } = useSidebar();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-7 w-7 shrink-0"
          aria-label={open ? "Close sidebar" : "Open sidebar"}
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        {open ? "Close sidebar" : "Open sidebar"}
      </TooltipContent>
    </Tooltip>
  );
}

function HomeButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          className="h-7 w-7 shrink-0"
          aria-label="Back to home"
        >
          <Home className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        Back to home
      </TooltipContent>
    </Tooltip>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function AppSidebar({
  activeTool,
  onToolChange,
  onGoHome,
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
}: AppSidebarProps) {
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    PLATFORMS.forEach((p) => set.add(p.category));
    return Array.from(set).sort();
  }, []);

  return (
    <Sidebar>
      <TooltipProvider delayDuration={300}>
        {/* ---------- Header: title + controls + tools + search ---------- */}
        <SidebarHeader>
          {/* Title row with home + toggle buttons on the right */}
          <div className="flex items-center gap-2 px-2 py-2">
            <Globe2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-semibold text-sm flex-1">OSINT Toolkit</span>
            <HomeButton onClick={onGoHome} />
            <SidebarInternalToggle />
          </div>

          {/* Tools selector — collapsible */}
          <CollapsibleSection
            label="Tools"
            icon={<Filter className="h-3 w-3" />}
            defaultOpen={true}
          >
            <div className="space-y-0.5 px-1">
              {TOOLS.map((tool) => {
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
                        <span className="flex-1 text-left truncate">
                          {tool.name}
                        </span>
                        {!tool.enabled && (
                          <Lock className="h-2.5 w-2.5 shrink-0 opacity-60" />
                        )}
                        {isActive && tool.enabled && (
                          <Check className="h-3 w-3 shrink-0" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="max-w-[200px] text-xs"
                    >
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-muted-foreground mt-0.5">
                        {tool.description}
                      </div>
                      {!tool.enabled && (
                        <div className="text-amber-600 dark:text-amber-400 mt-1 font-medium">
                          Coming soon
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </CollapsibleSection>

          <SidebarSeparator className="my-1" />

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
                <SidebarInput
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
              <Button
                type="submit"
                disabled={!canSearch}
                className="w-full h-9"
                size="sm"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5 mr-1.5" />
                )}
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
                <SidebarInput
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
              <Button
                type="submit"
                disabled={!canScanDomain}
                className="w-full h-9"
                size="sm"
              >
                {domainLoading ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5 mr-1.5" />
                )}
                {domainLoading ? "Scanning..." : "Scan"}
              </Button>
            </form>
          )}
        </SidebarHeader>

        <SidebarSeparator />

        {/* ---------- Content: collapsible filter sections ---------- */}
        <SidebarContent>
          {/* Status filter — Username Finder only */}
          {activeTool === "username-finder" && hasResults && (
            <CollapsibleSection
              label="Status"
              icon={<Filter className="h-3 w-3" />}
              defaultOpen={true}
            >
              <div className="space-y-0.5 px-1">
                {STATUS_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = statusFilter === item.value;
                  const count =
                    item.value === "all"
                      ? counts.all
                      : counts[item.value as keyof typeof counts];
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => onStatusFilterChange(item.value)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "" : item.color}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}

          {/* Category filter — Username Finder only */}
          {activeTool === "username-finder" && hasResults && (
            <CollapsibleSection
              label="Categories"
              icon={<Tag className="h-3 w-3" />}
              defaultOpen={false}
              badge={
                selectedCategories.size > 0 ? (
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
                ) : undefined
              }
            >
              <div className="space-y-0.5 px-1 max-h-[40vh] overflow-y-auto">
                {categories.map((cat) => {
                  const active = selectedCategories.has(cat);
                  const platformCount = PLATFORMS.filter(
                    (p) => p.category === cat,
                  ).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => onToggleCategory(cat)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      }`}
                    >
                      <span
                        className={`h-3 w-3 rounded-sm border flex items-center justify-center shrink-0 ${
                          active
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border"
                        }`}
                      >
                        {active && <Check className="h-2.5 w-2.5" />}
                      </span>
                      <span className="flex-1 text-left">{cat}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {platformCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}

          {/* Legend — Username Finder only, collapsible */}
          {activeTool === "username-finder" && (
            <CollapsibleSection
              label="Legend"
              defaultOpen={false}
            >
              <div className="px-2 space-y-1">
                {[
                  { label: "Found", color: "bg-emerald-500", desc: "Profile page loaded" },
                  { label: "Not Found", color: "bg-zinc-400", desc: "404 or no-account page" },
                  { label: "Unknown", color: "bg-amber-500", desc: "Inconclusive response" },
                  { label: "Blocked", color: "bg-orange-500", desc: "403/429 challenge" },
                  { label: "Error", color: "bg-red-500", desc: "Network failure" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 text-[11px] text-muted-foreground"
                  >
                    <span className={`h-2 w-2 rounded-full shrink-0 ${item.color}`} />
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="text-muted-foreground/70 truncate">— {item.desc}</span>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Domain Scanner info — collapsible */}
          {activeTool === "domain-scanner" && (
            <CollapsibleSection
              label="Scan includes"
              icon={<Check className="h-3 w-3" />}
              defaultOpen={false}
            >
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
            </CollapsibleSection>
          )}
        </SidebarContent>

        {/* ---------- Footer ---------- */}
        <SidebarFooter>
          <SidebarSeparator />
          <div className="px-3 py-2 text-[10px] text-muted-foreground space-y-1">
            <div className="flex items-center justify-between">
              <span>Platforms</span>
              <span className="font-mono">{totalPlatforms}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Cache</span>
              <span className="font-mono">5 min TTL</span>
            </div>
          </div>
        </SidebarFooter>
      </TooltipProvider>
    </Sidebar>
  );
}
