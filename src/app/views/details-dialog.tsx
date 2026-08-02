"use client";

import { useMemo } from "react";
import { Check, Globe2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PLATFORMS } from "@/lib/platforms";
import { ALL_TOOLS } from "../tool-registry";
import type { StatusFilter } from "../app-sidebar";

export function DetailsDialog({
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
