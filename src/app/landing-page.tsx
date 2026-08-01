"use client";

import {
  Globe2,
  AtSign,
  Globe,
  ArrowRight,
  Shield,
  Zap,
  Search,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LandingPageProps {
  onEnter: (tool?: string) => void;
  totalPlatforms: number;
}

export function LandingPage({ onEnter, totalPlatforms }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="border-b border-border/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm">OSINT Toolkit</span>
          <Badge variant="secondary" className="ml-2 text-[10px] hidden sm:inline-flex">
            v1.0
          </Badge>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-3xl w-full text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-muted/30 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            Open-source intelligence toolkit
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
              Find anyone,
              <br />
              <span className="text-muted-foreground">anywhere.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              Search usernames across {totalPlatforms}+ social platforms, scan
              domains for DNS, SSL, and security headers, and inspect profiles —
              all in one place.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => onEnter("username-finder")}
              className="h-12 px-8 text-base"
            >
              <AtSign className="h-4 w-4 mr-2" />
              Search Usernames
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onEnter("domain-scanner")}
              className="h-12 px-8 text-base"
            >
              <Globe className="h-4 w-4 mr-2" />
              Scan a Domain
            </Button>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left">
            <FeatureCard
              icon={<AtSign className="h-5 w-5" />}
              title="Username Finder"
              desc={`Probe ${totalPlatforms}+ social platforms in parallel. Real brand logos, API-verified data, block-type classification.`}
              onClick={() => onEnter("username-finder")}
            />
            <FeatureCard
              icon={<Globe className="h-5 w-5" />}
              title="Domain Scanner"
              desc="DNS records, WHOIS, SSL certs, subdomain enumeration, tech stack fingerprinting, and security header analysis."
              onClick={() => onEnter("domain-scanner")}
            />
            <FeatureCard
              icon={<Search className="h-5 w-5" />}
              title="More Tools"
              desc="Email lookup, phone lookup, reverse image, IP lookup, breach checker, and social graph — coming soon."
              disabled
            />
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>{totalPlatforms}+ platforms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Parallel probing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Self-hostable</span>
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

function FeatureCard({
  icon,
  title,
  desc,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <Card
      className={`transition-all ${disabled ? "opacity-60" : "hover:shadow-md hover:-translate-y-0.5 cursor-pointer"}`}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent className="p-5 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <h3 className="font-semibold text-sm">{title}</h3>
          {disabled && (
            <Badge variant="outline" className="text-[9px] ml-auto">
              Soon
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}
