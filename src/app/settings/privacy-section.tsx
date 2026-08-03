"use client";

import { Eye, EyeOff, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function PrivacySection({
  privacyMode,
  onPrivacyModeChange,
  onSave,
}: {
  privacyMode: boolean;
  onPrivacyModeChange: (v: boolean) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Privacy Mode</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            When enabled, reduces data collection and disables non-essential features.
          </p>
          <div className="flex items-center justify-between">
            <Label htmlFor="privacy-mode">Enable Privacy Mode</Label>
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
          <Button onClick={onSave} size="sm">Save Privacy Settings</Button>
        </div>
    </div>
  );
}
