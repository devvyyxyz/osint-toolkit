"use client";

import { Button } from "@/components/ui/button";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-center">
        OSINT Toolkit
      </h1>
      <Button
        onClick={onGetStarted}
        className="mt-8 h-11 px-8 text-base"
      >
        Get Started
      </Button>
    </div>
  );
}
