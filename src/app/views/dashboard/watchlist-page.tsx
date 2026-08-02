"use client";

import { Eye, X } from "lucide-react";
import { ALL_TOOLS } from "../../tool-registry";

export function WatchlistPage({
  watchlist,
  onRemoveWatch,
}: {
  watchlist: Array<{ id: string; tool: string; query: string; label?: string; addedAt: number; lastChecked?: number }>;
  onRemoveWatch: (id: string) => void;
}) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor usernames, domains, and emails for changes. Items added from any tool's results.
        </p>
      </div>
      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <Eye className="h-10 w-10 mb-4 opacity-30" />
          <p className="text-sm font-medium mb-1">No items in watchlist</p>
          <p className="text-xs">Use the eye icon in any tool's top bar to add items here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {watchlist.map((item) => {
            const tool = ALL_TOOLS.find((t) => t.id === item.tool);
            const Icon = tool?.icon ?? Eye;
            return (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-accent/30 transition-colors">
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.label ?? item.query}</div>
                  <div className="text-[10px] text-muted-foreground">{tool?.name ?? item.tool}</div>
                </div>
                {item.lastChecked && (
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    Last checked {new Date(item.lastChecked).toLocaleDateString()}
                  </span>
                )}
                <button onClick={() => onRemoveWatch(item.id)} className="text-muted-foreground hover:text-destructive shrink-0 p-1">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
