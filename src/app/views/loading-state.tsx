"use client";

import { Loader2 } from "lucide-react";

export function LoadingState({ total }: { total: number }) {
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
