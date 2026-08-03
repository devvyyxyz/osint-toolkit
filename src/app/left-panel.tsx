"use client";

import * as React from "react";
import {
  LayoutGrid,
  Wrench,
  Eye,
  Star,
  Newspaper,
  Settings as SettingsIcon,
  Home,
  X,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL_TOOLS } from "./tool-registry";

export type DashboardSection = "tools" | "overview" | "watchlist" | "favorites" | "news" | "account";

export function LeftPanel({
  activeSection,
  onSectionChange,
  onGoHome,
  onOpenSettings,
  showSettings,
  onCloseSettings,
}: {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
  onGoHome: () => void;
  onOpenSettings: () => void;
  showSettings: boolean;
  onCloseSettings: () => void;
}) {
  const sections: { id: DashboardSection; label: string; icon: typeof LayoutGrid }[] = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "tools", label: "Tools", icon: Wrench },
    { id: "watchlist", label: "Watchlist", icon: Eye },
    { id: "favorites", label: "Favorites", icon: Star },
    { id: "news", label: "News", icon: Newspaper },
    { id: "account", label: "Account", icon: User },
  ];

  return (
    <div className="w-14 shrink-0 flex flex-col h-full border-r border-border/60 bg-background">
      {/* Logo / Home */}
      <div className="shrink-0 flex items-center justify-center h-14 border-b border-border/60">
        <Button
          variant="ghost"
          size="icon"
          onClick={onGoHome}
          className="h-8 w-8"
          aria-label="Home"
        >
          <Home className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation sections */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1 px-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id && !showSettings;
            return (
              <Button
                key={section.id}
                variant="ghost"
                size="icon"
                onClick={() => onSectionChange(section.id)}
                className={`w-full h-10 relative ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label={section.label}
                title={section.label}
              >
                <Icon className="h-4 w-4" />
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r" />
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Bottom: Settings */}
      <div className="shrink-0 border-t border-border/60 p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={showSettings ? onCloseSettings : onOpenSettings}
          className={`w-full h-10 relative ${
            showSettings
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Settings"
          title="Settings"
        >
          <SettingsIcon className="h-4 w-4" />
          {showSettings && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r" />
          )}
        </Button>
      </div>
    </div>
  );
}
