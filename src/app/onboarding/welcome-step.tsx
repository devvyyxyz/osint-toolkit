"use client";

import { Globe2, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Globe2 className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Welcome to OSINT Toolkit</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Your comprehensive open-source intelligence platform. Search usernames, scan domains, check breaches, and more.
        </p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">What you can do</h3>
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>• Search for usernames across 100+ social platforms</li>
            <li>• Scan domains for DNS, WHOIS, SSL, and tech stack</li>
            <li>• Check if emails/usernames appear in data breaches</li>
            <li>• Lookup IPs, scan ports, inspect SSL certificates</li>
            <li>• Trace cryptocurrency transactions</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext}>
          Get Started
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}
