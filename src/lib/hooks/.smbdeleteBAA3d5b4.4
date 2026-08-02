"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface WatchlistItem {
  id: string;
  tool: string;
  query: string;
  label?: string;
  addedAt: number;
  lastChecked?: number;
  lastResultCount?: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const WATCH_KEY = "osint-watchlist";

/* ------------------------------------------------------------------ */
/*  Storage helpers                                                     */
/* ------------------------------------------------------------------ */

function loadWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WATCH_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveWatchlist(items: WatchlistItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WATCH_KEY, JSON.stringify(items));
  } catch {
    /* noop */
  }
}

/* ------------------------------------------------------------------ */
/*  Hook                                                                */
/* ------------------------------------------------------------------ */

export function useWatchlist() {
  const [items, setItems] = React.useState<WatchlistItem[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    setItems(loadWatchlist());
    setLoaded(true);
  }, []);

  const addItem = React.useCallback(
    (item: Omit<WatchlistItem, "id" | "addedAt">) => {
      const full: WatchlistItem = {
        ...item,
        id: crypto.randomUUID(),
        addedAt: Date.now(),
      };
      setItems((prev) => {
        // Don't add duplicates (same tool + query)
        if (prev.some((i) => i.tool === item.tool && i.query === item.query))
          return prev;
        const next = [...prev, full];
        saveWatchlist(next);
        return next;
      });
    },
    [],
  );

  const removeItem = React.useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveWatchlist(next);
      return next;
    });
  }, []);

  const updateItem = React.useCallback(
    (id: string, updates: Partial<WatchlistItem>) => {
      setItems((prev) => {
        const next = prev.map((i) => (i.id === id ? { ...i, ...updates } : i));
        saveWatchlist(next);
        return next;
      });
    },
    [],
  );

  return { items, addItem, removeItem, updateItem, loaded };
}