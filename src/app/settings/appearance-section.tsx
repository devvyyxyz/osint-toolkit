"use client";

import { Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function AppearanceSection({
  theme,
  onThemeChange,
  onSave,
}: {
  theme: string;
  onThemeChange: (t: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Theme</h3>
          </div>
          <div className="flex gap-2">
            {["light", "dark", "system"].map((t) => (
              <button
                key={t}
                onClick={() => onThemeChange(t)}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  theme === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <Button onClick={onSave} size="sm">Save Appearance</Button>
        </CardContent>
      </Card>
    </div>
  );
}
