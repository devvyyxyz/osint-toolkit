"use client";

import { Sparkles } from "lucide-react";

export function ReadyStep({ onComplete: _onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold">You're all set!</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Your OSINT Toolkit is configured and ready to use. Start exploring the tools and features.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Quick tips</h3>
        </div>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li>• Use the sidebar to switch between tools</li>
          <li>• Star your favorite tools for quick access</li>
          <li>• Check the Details panel for tool-specific options</li>
          <li>• Visit Settings anytime to adjust preferences</li>
        </ul>
      </div>
    </div>
  );
}
