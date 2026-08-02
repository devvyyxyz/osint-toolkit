"use client";

import { HitCard } from "./hit-card";
import type { Hit, SearchResponse } from "./types";

export function ResultsView({
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
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <p className="text-sm">
          No results match the current filters. Adjust the status or category
          filters in the sidebar.
        </p>
      </div>
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
