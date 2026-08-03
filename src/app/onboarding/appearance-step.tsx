"use client";

import { Palette, Sun, Moon, Monitor } from "lucide-react";
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value as "light" | "dark" | "system")}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border/60 hover:bg-muted/30"
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <div className="text-sm font-medium">{opt.label}</div>
              <div className="text-[10px] text-muted-foreground">{opt.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
