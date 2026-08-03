"use client";

import {
  Globe2,
  Wrench,
  Activity,
  Eye,
  Search,
  Star,
  Newspaper,
  X,
  TrendingUp,
  Clock,
  Target,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ALL_TOOLS } from "../../tool-registry";
import { OverviewSection, StatCard } from "./shared";

export function OverviewPage({
  history,
  onClearHistory,
  watchlist,
  onRemoveWatch,
}: {
  history: Array<{ id: string; tool: string; query: string; timestamp: number; resultCount?: number }>;
  onClearHistory: () => void;
  watchlist: Array<{ id: string; tool: string; query: string; label?: string; addedAt: number; lastChecked?: number }>;
  onRemoveWatch: (id: string) => void;
}) {
  // Compute usage stats from history
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const searchesThisWeek = history.filter((e) => e.timestamp >= weekAgo).length;

  // Most used tool
  const toolCounts: Record<string, number> = {};
  for (const entry of history) {
    toolCounts[entry.tool] = (toolCounts[entry.tool] || 0) + 1;
  }
  const toolRanking = Object.entries(toolCounts).sort((a, b) => b[1] - a[1]);
  const mostUsedTool = toolRanking[0]
    ? ALL_TOOLS.find((t) => t.id === toolRanking[0][0])
    : null;

  // Average results per search
  const entriesWithResults = history.filter((e) => e.resultCount !== undefined);
  const avgResults =
    entriesWithResults.length > 0
      ? Math.round(
          entriesWithResults.reduce((sum, e) => sum + (e.resultCount || 0), 0) /
            entriesWithResults.length,
        )
      : 0;

  // Last search time
  const lastSearch = history.length > 0 ? history[0].timestamp : null;
  const lastSearchText = lastSearch
    ? new Date(lastSearch).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back. Here's what's happening with your OSINT toolkit.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Platforms" value="102" icon={<Globe2 className="h-4 w-4" />} />
        <StatCard label="Tools Available" value={String(ALL_TOOLS.filter((t) => t.enabled).length)} icon={<Wrench className="h-4 w-4" />} />
        <StatCard label="Searches" value={String(history.length)} icon={<Activity className="h-4 w-4" />} />
        <StatCard label="Watchlist" value={String(watchlist.length)} icon={<Eye className="h-4 w-4" />} />
      </div>

      {/* Usage Stats */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Usage Stats</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="This Week" value={String(searchesThisWeek)} icon={<Zap className="h-4 w-4" />} />
          <StatCard
            label="Top Tool"
            value={mostUsedTool ? mostUsedTool.name.split(" ")[0] : "—"}
            icon={<Target className="h-4 w-4" />}
          />
          <StatCard label="Avg Results" value={String(avgResults)} icon={<TrendingUp className="h-4 w-4" />} />
          <StatCard label="Last Search" value={lastSearchText} icon={<Clock className="h-4 w-4" />} />
        </div>
      </div>

      {/* Tool Usage Breakdown */}
      {toolRanking.length > 0 && (
        <OverviewSection title="Tool Usage" icon={<Wrench className="h-4 w-4" />}>
          <div className="divide-y divide-border/40">
            {toolRanking.slice(0, 5).map(([toolId, count]) => {
              const tool = ALL_TOOLS.find((t) => t.id === toolId);
              const Icon = tool?.icon ?? Search;
              const pct = history.length > 0 ? Math.round((count / history.length) * 100) : 0;
              return (
                <div key={toolId} className="flex items-center gap-3 py-2 px-3">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{tool?.name ?? toolId}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </OverviewSection>
      )}

      {/* Recent Activity (Search History) */}
      <OverviewSection title="Recent Activity" icon={<Activity className="h-4 w-4" />}>
        {history.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p className="text-xs">Your recent searches and scans will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {history.slice(0, 10).map((entry) => {
              const tool = ALL_TOOLS.find((t) => t.id === entry.tool);
              const Icon = tool?.icon ?? Search;
              return (
                <div key={entry.id} className="flex items-center gap-3 py-2 px-3 hover:bg-accent/30 transition-colors">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{entry.query}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">{tool?.name ?? entry.tool}</span>
                  </div>
                  {entry.resultCount !== undefined && (
                    <Badge variant="secondary" className="text-[10px] shrink-0">{entry.resultCount} results</Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(entry.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
            {history.length > 0 && (
              <div className="py-2 px-3 text-right">
                <button onClick={onClearHistory} className="text-[10px] text-muted-foreground hover:text-destructive">
                  Clear history
                </button>
              </div>
            )}
          </div>
        )}
      </OverviewSection>

      {/* Watchlist */}
      <OverviewSection title="Watchlist" icon={<Eye className="h-4 w-4" />}>
        {watchlist.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p className="text-xs">Add items to your watchlist from any tool's results using the eye icon.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {watchlist.map((item) => {
              const tool = ALL_TOOLS.find((t) => t.id === item.tool);
              const Icon = tool?.icon ?? Eye;
              return (
                <div key={item.id} className="flex items-center gap-3 py-2 px-3 hover:bg-accent/30 transition-colors">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{item.label ?? item.query}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">{tool?.name ?? item.tool}</span>
                  </div>
                  {item.lastChecked && (
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      Last checked {new Date(item.lastChecked).toLocaleDateString()}
                    </span>
                  )}
                  <button onClick={() => onRemoveWatch(item.id)} className="text-muted-foreground hover:text-destructive shrink-0 p-1">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </OverviewSection>

      {/* Latest News */}
      <OverviewSection title="Latest News" icon={<Newspaper className="h-4 w-4" />}>
        <div className="py-8 text-center text-muted-foreground">
          <p className="text-xs">No news items yet.</p>
        </div>
      </OverviewSection>

      {/* Tools */}
      <OverviewSection title="Tools" icon={<Wrench className="h-4 w-4" />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ALL_TOOLS.filter((t) => t.enabled).map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{tool.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{tool.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </OverviewSection>

      {/* Favorites */}
      <OverviewSection title="Favorites" icon={<Star className="h-4 w-4" />}>
        <div className="py-8 text-center text-muted-foreground">
          <p className="text-xs">Star tools in the sidebar to pin them here.</p>
        </div>
      </OverviewSection>
    </div>
  );
}
