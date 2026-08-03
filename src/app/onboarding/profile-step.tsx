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

        <div className="space-y-2">
          <Label>How will you use OSINT Toolkit?</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { value: "personal", label: "Personal", desc: "General research & curiosity" },
              { value: "professional", label: "Professional", desc: "Security & investigations" },
              { value: "academic", label: "Academic", desc: "Research & education" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => onUsageTypeChange(opt.value)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  usageType === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-border/60 hover:bg-muted/30"
                }`}
              >
                <div className="text-sm font-medium">{opt.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
