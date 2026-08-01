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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandIcon } from "@/components/brand-icon";
import { PLATFORMS } from "@/lib/platforms";
import type { HitStatus } from "./hit-types";

export type StatusFilter = "all" | HitStatus;

export interface AppSidebarProps {
  /** Current raw input value (controlled). */
  rawInput: string;
  onRawInputChange: (v: string) => void;
  onSubmit: () => void;
  canSearch: boolean;
  loading: boolean;

  /** Status filter state. */
  statusFilter: StatusFilter;
  onStatusFilterChange: (f: StatusFilter) => void;

  /** Category filter state (multi-select). */
  selectedCategories: Set<string>;
  onToggleCategory: (cat: string) => void;
  onClearCategories: () => void;

  /** Counts for badges. */
  counts: {
    all: number;
    found: number;
    not_found: number;
    unknown: number;
    blocked: number;
    error: number;
  };

  /** Total platforms available (for the footer count). */
  totalPlatforms: number;

  /** Whether results are loaded — hides filter groups until a search has run. */
  hasResults: boolean;
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

export function AppSidebar({
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
}: AppSidebarProps) {
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    PLATFORMS.forEach((p) => set.add(p.category));
    return Array.from(set).sort();
  }, []);

  return (
    <Sidebar>
      {/* ---------- Header: search bar ---------- */}
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Globe2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-semibold text-sm">Username Finder</span>
        </div>
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
      </SidebarHeader>

      <SidebarSeparator />

      {/* ---------- Content: filters ---------- */}
      <SidebarContent>
        {/* Status filter group */}
        {hasResults && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Status
            </SidebarGroupLabel>
            <SidebarGroupContent>
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
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Category filter group */}
        {hasResults && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Tag className="h-3 w-3" />
                Categories
              </span>
              {selectedCategories.size > 0 && (
                <button
                  type="button"
                  onClick={onClearCategories}
                  className="text-[10px] normal-case tracking-normal text-primary hover:underline"
                >
                  clear
                </button>
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
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
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Legend / status color key — always visible */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Legend
          </SidebarGroupLabel>
          <SidebarGroupContent>
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ---------- Footer: platform count ---------- */}
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
    </Sidebar>
  );
}
