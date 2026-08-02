"use client";

import { AlertTriangle, RefreshCw, Send, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const handleReport = () => {
    const errorData = {
      error: error.message,
      stack: error.stack,
      digest: error.digest,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("osint-last-error", JSON.stringify(errorData));
    window.dispatchEvent(new CustomEvent("open-report", { detail: { type: "bug", prefill: errorData } }));
  };

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-lg w-full space-y-6 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Application Error</h1>
              <p className="text-sm text-muted-foreground">
                A critical error occurred. The app has been contained — other
                parts of the system are unaffected.
              </p>
            </div>

            <div className="text-left rounded-md border border-border/60 bg-muted/30 p-3">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Error</span>
              <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all mt-1">
                {error.message || "Unknown error"}
              </p>
              {error.digest && (
                <p className="text-[10px] text-muted-foreground mt-1">Digest: {error.digest}</p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={reset}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Try again
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = "/"}>
                <Home className="h-3.5 w-3.5 mr-1.5" />
                Home
              </Button>
              <Button size="sm" onClick={handleReport}>
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
