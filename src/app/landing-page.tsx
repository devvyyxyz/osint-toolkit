"use client";

import { Globe2, ArrowRight, ShieldCheck, Zap, Key } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="border-b border-border/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm">OSINT Toolkit</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
            <Globe2 className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
              OSINT Toolkit
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              Search usernames across 100+ social platforms, scan domains,
              and check data breaches — all self-hosted, all private.
            </p>
          </div>

          <Button
            size="lg"
            onClick={onGetStarted}
            className="h-12 px-8 text-base"
          >
            Get Started
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          {/* Feature highlights */}
          <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Self-hosted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Fast & cached</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Key className="h-4 w-4 text-blue-500" />
              <span>Your keys, your data</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-[11px] text-muted-foreground">
          For research &amp; personal identity checks only. Respect each
          platform&apos;s Terms of Service.
        </div>
      </footer>
    </div>
  );
}
