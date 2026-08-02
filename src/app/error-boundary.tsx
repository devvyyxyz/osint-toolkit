"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw, Send, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    // Log to console for debugging
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleDismiss = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReport = () => {
    const errorData = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };
    // Store in localStorage for the report dialog to pick up
    localStorage.setItem("osint-last-error", JSON.stringify(errorData));
    // Trigger the report flow
    window.dispatchEvent(new CustomEvent("open-report", { detail: { type: "bug", prefill: errorData } }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-lg w-full space-y-6 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="text-sm text-muted-foreground">
                An error occurred while rendering this part of the application.
                The rest of the app is still functional — you can reload to try
                again, or report this issue.
              </p>
            </div>

            {/* Error details */}
            <div className="text-left rounded-md border border-border/60 bg-muted/30 p-3 space-y-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Error</span>
                <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all">
                  {this.state.error?.message || "Unknown error"}
                </p>
              </div>
              {this.state.error?.stack && (
                <details>
                  <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">
                    Stack trace
                  </summary>
                  <pre className="mt-1 text-[10px] font-mono text-muted-foreground overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap break-all">
                    {this.state.error.stack.slice(0, 500)}
                  </pre>
                </details>
              )}
              {this.state.errorInfo?.componentStack && (
                <details>
                  <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">
                    Component stack
                  </summary>
                  <pre className="mt-1 text-[10px] font-mono text-muted-foreground overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap break-all">
                    {this.state.errorInfo.componentStack.slice(0, 500)}
                  </pre>
                </details>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={this.handleDismiss}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Try again
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = "/"}>
                <Home className="h-3.5 w-3.5 mr-1.5" />
                Home
              </Button>
              <Button size="sm" onClick={this.handleReport}>
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Report
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
