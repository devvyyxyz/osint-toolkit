"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/*  Types & defaults                                                   */
/* ------------------------------------------------------------------ */

export interface Settings {
  /** Have I Been Pwned API key — needed for account breach lookups.
   *  Get one free at https://haveibeenpwned.com/API/Key */
  hibpApiKey: string;

  /** Cache TTL in minutes for search/scan results (default: 5) */
  cacheTtlMinutes: number;

  /** Per-request timeout in seconds for HTTP probes (default: 12) */
  requestTimeoutSeconds: number;

  /** User-Agent string sent to social platforms during probing.
   *  Auto-generated to look like a real browser. */
  userAgent: string;

  /** Max concurrent platform probes (0 = no limit, default: 0) */
  maxConcurrent: number;

  /** Privacy mode — when true, results are never cached (default: false) */
  privacyMode: boolean;

  /** Whether the user has completed onboarding */
  onboarded: boolean;
}

const STORAGE_KEY = "osint-toolkit-settings";

/** Realistic browser User-Agents for auto-generation */
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
];

export const DEFAULT_SETTINGS: Settings = {
  hibpApiKey: "",
  cacheTtlMinutes: 5,
  requestTimeoutSeconds: 12,
  userAgent: USER_AGENTS[0],
  maxConcurrent: 0,
  privacyMode: false,
  onboarded: false,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Generate a random realistic User-Agent string */
export function generateUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/** Generate a random session ID (for anonymous identification) */
export function generateSessionId(): string {
  return crypto.randomUUID();
}

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    // Merge with defaults so new fields get default values
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: Settings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* localStorage might be full or blocked */
  }
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface SettingsContextValue {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  resetSettings: () => void;
  /** Mark onboarding as complete */
  completeOnboarding: (partial: Partial<Settings>) => void;
  /** Reset onboarding (shows the wizard again) */
  resetOnboarding: () => void;
}

const SettingsContext = React.createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = React.useState(false);

  // Load from localStorage on mount
  React.useEffect(() => {
    setSettings(loadSettings());
    setLoaded(true);
  }, []);

  // Save to localStorage whenever settings change (but only after initial load)
  React.useEffect(() => {
    if (loaded) {
      saveSettings(settings);
    }
  }, [settings, loaded]);

  const updateSettings = React.useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetSettings = React.useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS, userAgent: generateUserAgent() });
  }, []);

  const completeOnboarding = React.useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial, onboarded: true }));
  }, []);

  const resetOnboarding = React.useCallback(() => {
    setSettings((prev) => ({ ...prev, onboarded: false }));
  }, []);

  const value = React.useMemo(
    () => ({ settings, updateSettings, resetSettings, completeOnboarding, resetOnboarding }),
    [settings, updateSettings, resetSettings, completeOnboarding, resetOnboarding],
  );

  return (
    <SettingsContext.Provider value={value}>
      {loaded ? children : null}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = React.useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
