"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface KeyboardShortcutHandlers {
  onFocusSearch?: () => void;
  onSwitchTool?: (index: number) => void;
  onCloseModal?: () => void;
  onFocusSidebar?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                                */
/* ------------------------------------------------------------------ */

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

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