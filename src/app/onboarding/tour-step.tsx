"use client";

import { Search, Globe, Shield, Database, Eye, Star } from "lucide-react";

export function TourStep({ onNext: _onNext }: { onNext: () => void }) {
  const features = [
    { icon: Search, title: "Username Search", desc: "Search across 100+ social platforms at once" },
    { icon: Globe, title: "Domain Scanner", desc: "DNS, WHOIS, SSL, and tech stack detection" },
    { icon: Shield, title: "Breach Checker", desc: "Check if emails and passwords appear in data breaches" },
    { icon: Database, title: "Data Management", desc: "Export, import, and clear your data anytime" },
    { icon: Eye, title: "Watchlist", desc: "Monitor targets and get alerts on changes" },
    { icon: Star, title: "Favorites", desc: "Star your most-used tools for quick access" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Feature tour</h2>
        <p className="text-sm text-muted-foreground">
          Here's what you can do with OSINT Toolkit. Explore these from the sidebar.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="flex items-start gap-3 p-3 rounded-lg border border-border/60">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">{feature.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{feature.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
