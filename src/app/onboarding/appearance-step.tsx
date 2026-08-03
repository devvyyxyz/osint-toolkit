"use client";

import { Palette, Sun, Moon, Monitor } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";

export function AppearanceStep({ onNext: _onNext }: { onNext: () => void }) {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: "light", label: "Light", icon: Sun, desc: "Bright and clear" },
    { value: "dark", label: "Dark", icon: Moon, desc: "Easy on the eyes" },
    { value: "system", label: "System", icon: Monitor, desc: "Follow your OS" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose your theme</h2>
        <p className="text-sm text-muted-foreground">
          Pick a color scheme that works for you. You can change this later in Settings.
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <Label className="text-xs">Theme</Label>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Choose your preferred color scheme
          </p>
        </div>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
          className="h-8 px-2 rounded-md border border-input bg-background text-xs"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
