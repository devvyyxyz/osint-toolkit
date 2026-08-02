"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/*  Search History — stored in localStorage, shared across tools       */
/* ------------------------------------------------------------------ */

export interface HistoryEntry {
  id: string;
  tool: string;
  query: string;
  timestamp: number;
  resultCount?: number;
}

const STORAGE_KEY = "osint-history";
const MAX_ENTRIES = 50;

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* noop */
  }
}

export function useSearchHistory() {
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    setHistory(loadHistory());
    setLoaded(true);
  }, []);

  const addEntry = React.useCallback((entry: Omit<HistoryEntry, "id" | "timestamp">) => {
    const full: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setHistory((prev) => {
      const next = [full, ...prev].slice(0, MAX_ENTRIES);
      saveHistory(next);
      return next;
    });
  }, []);

  const removeEntry = React.useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveHistory(next);
      return next;
    });
  }, []);

  const clearHistory = React.useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  return { history, addEntry, removeEntry, clearHistory, loaded };
}

/* ------------------------------------------------------------------ */
/*  Watchlist — stored in localStorage                                  */
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

const WATCH_KEY = "osint-watchlist";

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

export function useWatchlist() {
  const [items, setItems] = React.useState<WatchlistItem[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    setItems(loadWatchlist());
    setLoaded(true);
  }, []);

  const addItem = React.useCallback((item: Omit<WatchlistItem, "id" | "addedAt">) => {
    const full: WatchlistItem = {
      ...item,
      id: crypto.randomUUID(),
      addedAt: Date.now(),
    };
    setItems((prev) => {
      // Don't add duplicates (same tool + query)
      if (prev.some((i) => i.tool === item.tool && i.query === item.query)) return prev;
      const next = [...prev, full];
      saveWatchlist(next);
      return next;
    });
  }, []);

  const removeItem = React.useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveWatchlist(next);
      return next;
    });
  }, []);

  const updateItem = React.useCallback((id: string, updates: Partial<WatchlistItem>) => {
    setItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, ...updates } : i));
      saveWatchlist(next);
      return next;
    });
  }, []);

  return { items, addItem, removeItem, updateItem, loaded };
}

/* ------------------------------------------------------------------ */
/*  Export utility — download results as JSON or CSV                    */
/* ------------------------------------------------------------------ */

export function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".json") ? filename : `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadCSV(rows: Record<string, unknown>[], filename: string) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const str = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(","),
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Keyboard shortcuts hook                                             */
/* ------------------------------------------------------------------ */

export function useKeyboardShortcuts(handlers: {
  onFocusSearch?: () => void;
  onSwitchTool?: (index: number) => void;
  onCloseModal?: () => void;
  onFocusSidebar?: () => void;
}) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      // Ctrl/Cmd+K — focus search (works everywhere)
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        handlers.onFocusSearch?.();
        return;
      }

      // Escape — close modal (works everywhere)
      if (e.key === "Escape") {
        handlers.onCloseModal?.();
        return;
      }

      // Don't trigger other shortcuts when typing in inputs
      if (isInput) return;

      // 1/2/3 — switch tools
      if (e.key === "1" || e.key === "2" || e.key === "3") {
        handlers.onSwitchTool?.(parseInt(e.key, 10) - 1);
        return;
      }

      // / — focus sidebar input
      if (e.key === "/") {
        e.preventDefault();
        handlers.onFocusSidebar?.();
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handlers]);
}
