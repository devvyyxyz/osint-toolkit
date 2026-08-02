"use client";

import { Star } from "lucide-react";
import { ALL_TOOLS } from "../../tool-registry";

export function FavoritesPage({
  starredTools,
  onToolChange,
  onToggleStar,
}: {
  starredTools: Set<string>;
  onToolChange: (toolId: string) => void;
  onToggleStar: (toolId: string) => void;
}) {
  const starred = ALL_TOOLS.filter((t) => starredTools.has(t.id));
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Favorites</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your starred tools for quick access. Star tools from the Tools sidebar.
        </p>
      </div>
      {starred.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
          <Star className="h-10 w-10 mb-4 opacity-30" />
          <p className="text-sm font-medium mb-1">No favorites yet</p>
          <p className="text-xs">Click the star icon next to a tool in the sidebar to pin it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {starred.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => onToolChange(tool.id)}
              >
                <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{tool.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{tool.description}</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleStar(tool.id); }}
                  className="shrink-0 p-1"
                >
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
