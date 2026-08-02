"use client";

import * as React from "react";
import {
  Settings as SettingsIcon,
  Key,
  Clock,
  Zap,
  Lock,
  AlertTriangle,
  Check,
  Palette,
  Bell,
  User,
  Database,
  Info,
  Globe,
} from "lucide-react";

interface SettingsSidebarProps {
  /** Currently active settings section */
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const SETTINGS_SECTIONS = [
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "caching", label: "Caching", icon: Clock },
  { id: "probing", label: "Probing", icon: Zap },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "data", label: "Data Management", icon: Database },
  { id: "about", label: "About", icon: Info },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
];

export function SettingsSidebar({
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  return (
    <div className="w-64 shrink-0 flex flex-col h-full border-r border-border/60 bg-background overflow-hidden">
      {/* Header bar — matches left panel style */}
      <div className="shrink-0 flex items-center gap-2 h-14 px-3 border-b border-border/60">
        <SettingsIcon className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="font-semibold text-sm flex-1">Settings</span>
      </div>

      {/* Settings sections */}
      <div className="flex-1 overflow-y-auto py-2 px-1">
        <div className="text-[9px] uppercase tracking-wider text-muted-foreground/60 px-2 py-1 font-semibold">
          Sections
        </div>
        <div className="space-y-0.5">
          {SETTINGS_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left truncate">{section.label}</span>
                {isActive && <Check className="h-3 w-3 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border/60 px-3 py-2 text-[10px] text-muted-foreground">
        Settings are stored locally in your browser
      </div>
    </div>
  );
}
