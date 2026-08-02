/**
 * @deprecated This barrel file is kept for backward compatibility.
 * Prefer importing from the specific modules:
 *   - `@/lib/hooks` for useSearchHistory, useWatchlist, useKeyboardShortcuts
 *   - `@/lib/utils/export` for downloadJSON, downloadCSV
 */
export {
  useSearchHistory,
  type HistoryEntry,
} from "./hooks/use-search-history";
export { useWatchlist, type WatchlistItem } from "./hooks/use-watchlist";
export {
  useKeyboardShortcuts,
  type KeyboardShortcutHandlers,
} from "./hooks/use-keyboard-shortcuts";
export { downloadJSON, downloadCSV } from "./utils/export";