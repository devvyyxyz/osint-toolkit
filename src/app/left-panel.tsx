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
  AlertTriangle,
  ChevronDown,
  User,
  X,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

/* ------------------------------------------------------------------ */
/*  Report types & forms (non-functional — UI only)                    */
/* ------------------------------------------------------------------ */

const REPORT_TYPES = [
  { id: "bug", label: "Bug Report", description: "Report a bug or unexpected behavior" },
  { id: "feature", label: "Feature Request", description: "Suggest a new feature or improvement" },
  { id: "security", label: "Security Issue", description: "Report a security vulnerability" },
  { id: "abuse", label: "Abuse Report", description: "Report misuse or abusive content" },
  { id: "feedback", label: "General Feedback", description: "Share your thoughts or suggestions" },
];

function ReportDialog({
  open,
  onOpenChange,
  reportType,
  onReportTypeChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  reportType: string;
  onReportTypeChange: (v: string) => void;
}) {
  const report = REPORT_TYPES.find((r) => r.id === reportType) ?? REPORT_TYPES[0];
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Report an Issue
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Select a report type and fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {/* Report type dropdown */}
          <div className="space-y-1.5">
            <Label className="text-xs">Report Type</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-border/60 bg-background text-sm hover:bg-accent/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{report.label}</span>
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", dropdownOpen && "rotate-180")} />
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border border-border/60 rounded-md shadow-lg py-1 max-h-[200px] overflow-y-auto">
                    {REPORT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => {
                          onReportTypeChange(type.id);
                          setDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 hover:bg-accent transition-colors",
                          type.id === reportType && "bg-accent/50",
                        )}
                      >
                        <div className="text-xs font-medium">{type.label}</div>
                        <div className="text-[10px] text-muted-foreground">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input placeholder="Brief summary" className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea
              placeholder="Provide details..."
              className="text-sm min-h-[100px]"
            />
          </div>
          {report.id === "bug" && (
            <div className="space-y-1.5">
              <Label className="text-xs">Steps to reproduce</Label>
              <Textarea
                placeholder="1. Go to...\n2. Click...\n3. See error..."
                className="text-sm min-h-[80px]"
              />
            </div>
          )}
          {report.id === "security" && (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-[11px] text-amber-700 dark:text-amber-300">
              For security reports, please do not include sensitive exploit
              details in this form. A maintainer will contact you privately.
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-3.5 w-3.5 mr-1.5" />
              Cancel
            </Button>
            <Button size="sm" onClick={() => onOpenChange(false)}>
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Submit
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground/60 text-center pt-1">
            Report forms are not yet functional — submissions won&apos;t be sent.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Left panel component                                               */
/* ------------------------------------------------------------------ */

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
  const [reportOpen, setReportOpen] = React.useState(false);
  const [reportType, setReportType] = React.useState<string>("bug");

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
            <span className="font-semibold text-sm flex-1 truncate">OSINT</span>
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
            const isActive = activeSection === section.id && !showSettings;
            return (
              <Tooltip key={section.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      onSectionChange(section.id);
                      if (showSettings) onCloseSettings();
                    }}
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

        {/* Footer: home + report + settings */}
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

          {/* Report button — opens modal directly */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setReportOpen(true)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
                  collapsed && "justify-center",
                )}
                aria-label="Report an issue"
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Report</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="text-xs">
                Report an issue
              </TooltipContent>
            )}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onOpenSettings}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                  collapsed && "justify-center",
                  showSettings
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
                aria-label="Settings"
              >
                <SettingsIcon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Settings</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="text-xs">
                Settings
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Profile section at very bottom */}
        <div className="border-t border-border/60 p-2 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
                  collapsed && "justify-center",
                )}
                aria-label="Profile"
              >
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border/60">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-xs font-medium text-foreground truncate">Guest</div>
                    <div className="text-[10px] text-muted-foreground">Free plan</div>
                  </div>
                )}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="text-xs">
                Guest — Free plan
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>

      {/* Report dialog */}
      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        reportType={reportType}
        onReportTypeChange={setReportType}
      />
    </TooltipProvider>
  );
}
