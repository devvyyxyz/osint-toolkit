"use client";

import { Shield, Lock } from "lucide-react";
import { Label } from "@/components/ui/label";

export function PrivacyStep({
  privacyMode,
  onPrivacyModeChange,
  onNext: _onNext,
}: {
  privacyMode: boolean;
  onPrivacyModeChange: (v: boolean) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Privacy settings</h2>
        <p className="text-sm text-muted-foreground">
          Control how your data is handled. All data stays in your browser.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border/60">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Lock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Privacy Mode</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                When enabled, search results are never cached locally. Every search re-probes all platforms.
              </p>
            </div>
          </div>
          <button
            onClick={() => onPrivacyModeChange(!privacyMode)}
            className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${
              privacyMode ? "bg-primary" : "bg-muted"
            }`}
            aria-label="Toggle privacy mode"
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                privacyMode ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg border border-blue-500/30 bg-blue-500/5 text-[11px] text-muted-foreground">
          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <span>
            All your data — settings, search history, watchlist — is stored locally in your browser's localStorage.
            Nothing is sent to any server except the APIs you explicitly query.
          </span>
        </div>
      </div>
    </div>
  );
}
