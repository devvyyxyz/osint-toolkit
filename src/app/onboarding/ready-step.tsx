"use client";

import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ReadyStep({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">You're all set!</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Your OSINT Toolkit is configured and ready to use. Start exploring the tools and features.
        </p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
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
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onComplete}>
          Launch OSINT Toolkit
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}
