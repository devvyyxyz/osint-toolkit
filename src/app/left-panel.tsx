"use client";

import * as React from "react";
import {
  LayoutGrid,
  Wrench,
  PanelLeftClose,
  PanelLeftOpen,
  Globe2,
  Home,
  Settings as SettingsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type DashboardSection = "overview" | "tools";

interface DashboardSectionDef {
  id: DashboardSection;
  label: string;
  icon: typeof LayoutGrid;
}

const SECTIONS: DashboardSectionDef[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "tools", label: "Tools", icon: Wrench },
];

interface LeftPanelProps {
  activeSection: DashboardSection;
  onSectionChange: (s: DashboardSection) => void;
  onGoHome: () => void;
  onOpenSettings: () => void;
  showSettings: boolean;
  onCloseSettings: () => void;
}

export function LeftPanel({
  activeSection,
  onSectionChange,
  onGoHome,
  onOpenSettings,
  showSettings,
  onCloseSettings,
}: LeftPanelProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "flex flex-col border-r border-border/60 bg-muted/30 transition-all duration-200 shrink-0",
          collapsed ? "w-14" : "w-48",
        )}
      >
        {/* Header: title + collapse toggle */}
        <div className="flex items-center gap-2 h-14 px-3 border-b border-border/60 shrink-0">
          {!collapsed && (
            <Globe2 className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          {!collapsed && (
            <span className="font-semibold text-sm flex-1 truncate">
              OSINT
            </span>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? "Expand panel" : "Collapse panel"}
              >
                {collapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {collapsed ? "Expand" : "Collapse"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Section buttons */}
        <div className="flex-1 py-2 space-y-0.5 px-2">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <Tooltip key={section.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSectionChange(section.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                      collapsed && "justify-center",
                      isActive
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                    aria-label={section.label}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <span className="truncate">{section.label}</span>
                    )}
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="text-xs">
                    {section.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </div>

        {/* Footer: home + settings */}
        <div className="border-t border-border/60 py-2 space-y-0.5 px-2 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onGoHome}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
                  collapsed && "justify-center",
                )}
                aria-label="Home"
              >
                <Home className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Home</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="text-xs">
                Home
              </TooltipContent>
            )}
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={showSettings ? onCloseSettings : onOpenSettings}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                  collapsed && "justify-center",
                  showSettings
                    ? "text-primary hover:bg-primary/10"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
                aria-label={showSettings ? "Back" : "Settings"}
              >
                <SettingsIcon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span>{showSettings ? "Back" : "Settings"}</span>
                )}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="text-xs">
                {showSettings ? "Back" : "Settings"}
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
