"use client";

import { Settings as SettingsIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

export function PreferencesStep({
  cacheTtl,
  timeout,
  privacyMode,
  onCacheTtlChange,
  onTimeoutChange,
  onPrivacyModeChange,
  onNext: _onNext,
}: {
  cacheTtl: number;
  timeout: number;
  privacyMode: boolean;
  onCacheTtlChange: (v: number) => void;
  onTimeoutChange: (v: number) => void;
  onPrivacyModeChange: (v: boolean) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Preferences</h2>
        <p className="text-sm text-muted-foreground">
          Customize your experience. You can change these later in Settings.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Performance</h3>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cache-ttl">Cache TTL (minutes)</Label>
          <input
            id="cache-ttl"
            type="number"
            value={cacheTtl}
            onChange={(e) => onCacheTtlChange(Number(e.target.value))}
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeout">Request Timeout (seconds)</Label>
          <input
            id="timeout"
            type="number"
            value={timeout}
            onChange={(e) => onTimeoutChange(Number(e.target.value))}
            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="privacy-mode">Privacy Mode</Label>
          <button
            id="privacy-mode"
            onClick={() => onPrivacyModeChange(!privacyMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              privacyMode ? "bg-primary" : "bg-muted"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              privacyMode ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
}
