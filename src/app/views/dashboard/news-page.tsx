"use client";

import { Newspaper } from "lucide-react";

export function NewsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">News</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Latest updates and announcements for OSINT Toolkit.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
        <Newspaper className="h-10 w-10 mb-4 opacity-30" />
        <p className="text-sm font-medium mb-1">No news yet</p>
        <p className="text-xs">Updates and release notes will appear here.</p>
      </div>
    </div>
  );
}
