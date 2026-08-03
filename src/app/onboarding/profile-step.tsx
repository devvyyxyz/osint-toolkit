"use client";

import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileStep({
  displayName,
  onDisplayNameChange,
  usageType,
  onUsageTypeChange,
  onNext: _onNext,
}: {
  displayName: string;
  onDisplayNameChange: (v: string) => void;
  usageType: string;
  onUsageTypeChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Set up your profile</h2>
        <p className="text-sm text-muted-foreground">
          Tell us a bit about yourself. This helps personalize your experience.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="display-name">Display Name</Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
            placeholder="Enter your name or alias"
            autoComplete="off"
          />
          <p className="text-[11px] text-muted-foreground">
            This is shown locally in the sidebar and dashboard. It's not sent to any server.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <Label className="text-xs">How will you use OSINT Toolkit?</Label>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              This helps personalize your experience
            </p>
          </div>
          <select
            value={usageType}
            onChange={(e) => onUsageTypeChange(e.target.value)}
            className="h-8 px-2 rounded-md border border-input bg-background text-xs"
          >
            <option value="personal">Personal</option>
            <option value="professional">Professional</option>
            <option value="academic">Academic</option>
          </select>
        </div>
      </div>
    </div>
  );
}
