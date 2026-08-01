"use client";

import * as React from "react";
import {
  Globe2,
  Key,
  ShieldCheck,
  Clock,
  Zap,
  Lock,
  RefreshCw,
  ExternalLink,
  Check,
  AlertTriangle,
  Trash2,
  ArrowLeft,
  Eye,
  EyeOff,
  Palette,
  Bell,
  User,
  Database,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSettings, generateUserAgent } from "./settings-context";

interface SettingsViewProps {
  onBack: () => void;
  activeSection: string;
}

export function SettingsView({ onBack, activeSection }: SettingsViewProps) {
  const { settings, updateSettings, resetSettings, resetOnboarding } = useSettings();

  // Local state so changes are explicit (user clicks Save)
  const [hibpApiKey, setHibpApiKey] = React.useState(settings.hibpApiKey);
  const [cacheTtl, setCacheTtl] = React.useState(settings.cacheTtlMinutes);
  const [timeout, setTimeout_] = React.useState(settings.requestTimeoutSeconds);
  const [userAgent, setUserAgent] = React.useState(settings.userAgent);
  const [privacyMode, setPrivacyMode] = React.useState(settings.privacyMode);
  const [showKey, setShowKey] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    updateSettings({
      hibpApiKey,
      cacheTtlMinutes: cacheTtl,
      requestTimeoutSeconds: timeout,
      userAgent,
      privacyMode,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetSettings();
    setHibpApiKey("");
    setCacheTtl(5);
    setTimeout_(12);
    setUserAgent(generateUserAgent());
    setPrivacyMode(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Globe2 className="h-5 w-5 text-muted-foreground" />
          {activeSection === "api-keys" && "API Keys"}
          {activeSection === "caching" && "Caching"}
          {activeSection === "probing" && "Probing"}
          {activeSection === "privacy" && "Privacy"}
          {activeSection === "appearance" && "Appearance"}
          {activeSection === "notifications" && "Notifications"}
          {activeSection === "account" && "Account"}
          {activeSection === "data" && "Data Management"}
          {activeSection === "about" && "About"}
          {activeSection === "danger" && "Danger Zone"}
        </h1>
        {saved && (
          <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40">
            <Check className="h-3 w-3 mr-1" />
            Saved
          </Badge>
        )}
      </div>

      <div className="space-y-4 max-w-2xl">
        {activeSection === "api-keys" && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-sm font-semibold">API Keys</h2>
            </div>

            {/* HIBP */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Have I Been Pwned</Label>
                <a
                  href="https://haveibeenpwned.com/API/Key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-primary hover:underline flex items-center gap-1"
                >
                  Get a key
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  value={hibpApiKey}
                  onChange={(e) => setHibpApiKey(e.target.value)}
                  placeholder="HIBP API key (optional)"
                  className="font-mono text-sm pr-10"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {hibpApiKey
                  ? "Key is set. Breach account lookups are enabled."
                  : "No key set. Only password checks will work. Account lookups need a key."}
              </p>
            </div>

            <div className="flex items-start gap-2 rounded-md border border-blue-500/30 bg-blue-500/5 p-2.5 text-[11px]">
              <Lock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span className="text-muted-foreground">
                Keys are stored locally in your browser. They're sent only to
                the API they belong to — never to any other service.
              </span>
            </div>
          </CardContent>
        </Card>
        )}

        {activeSection === "caching" && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Caching</h2>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Cache Duration</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 0, label: "Off" },
                  { value: 1, label: "1 min" },
                  { value: 5, label: "5 min" },
                  { value: 10, label: "10 min" },
                  { value: 30, label: "30 min" },
                  { value: 60, label: "1 hour" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setCacheTtl(opt.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      cacheTtl === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {cacheTtl === 0
                  ? "Caching is off. Every search re-probes all platforms."
                  : `Results are cached for ${cacheTtl} minute${cacheTtl === 1 ? "" : "s"}. Repeat searches return instantly.`}
              </p>
            </div>

            {/* Privacy mode toggle */}
            <div className="flex items-start justify-between gap-3 pt-2 border-t border-border/60">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium">Privacy Mode</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Never cache results
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${
                  privacyMode ? "bg-primary" : "bg-muted"
                }`}
                aria-label="Toggle privacy mode"
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${
                    privacyMode ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>
        )}

        {activeSection === "probing" && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Probing</h2>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Request Timeout</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 5, label: "5s" },
                  { value: 10, label: "10s" },
                  { value: 12, label: "12s" },
                  { value: 20, label: "20s" },
                  { value: 30, label: "30s" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTimeout_(opt.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      timeout === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                How long to wait for each platform before giving up. Longer
                timeouts catch slow sites but make searches take longer.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs">User Agent</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUserAgent(generateUserAgent())}
                  className="h-7 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Auto
                </Button>
              </div>
              <Input
                value={userAgent}
                onChange={(e) => setUserAgent(e.target.value)}
                className="font-mono text-xs"
                autoComplete="off"
              />
              <p className="text-[11px] text-muted-foreground">
                The browser identity sent to platforms during probing. A
                realistic UA helps avoid bot detection.
              </p>
            </div>
          </CardContent>
        </Card>
        )}

        {activeSection === "danger" && (
        <Card className="border-red-500/30">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h2 className="text-sm font-semibold text-red-700 dark:text-red-300">
                Danger Zone
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium">Reset to defaults</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Restore all settings to their defaults. API keys will be
                    cleared.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="text-red-600 dark:text-red-400 border-red-500/40 hover:bg-red-500/10 shrink-0"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Reset
                </Button>
              </div>

              <div className="flex items-start justify-between gap-3 pt-3 border-t border-border/60">
                <div>
                  <h3 className="text-sm font-medium">Redo onboarding</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Show the setup wizard again on next load.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetOnboarding}
                  className="shrink-0"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                  Redo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* ---- Appearance ---- */}
        {activeSection === "appearance" && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Palette className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium mb-1">Coming Soon</p>
              <p className="text-xs">Theme, font size, and density options will be available here.</p>
            </CardContent>
          </Card>
        )}

        {/* ---- Notifications ---- */}
        {activeSection === "notifications" && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium mb-1">Coming Soon</p>
              <p className="text-xs">Configure scan completion, breach alert, and system notifications.</p>
            </CardContent>
          </Card>
        )}

        {/* ---- Account ---- */}
        {activeSection === "account" && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              <User className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium mb-1">Coming Soon</p>
              <p className="text-xs">Account management, login, and subscription plans will be here.</p>
            </CardContent>
          </Card>
        )}

        {/* ---- Data Management ---- */}
        {activeSection === "data" && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Database className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium mb-1">Coming Soon</p>
              <p className="text-xs">Export, import, and clear cached data and search history.</p>
            </CardContent>
          </Card>
        )}

        {/* ---- About ---- */}
        {activeSection === "about" && (
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-sm font-semibold">About OSINT Toolkit</h2>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-mono">1.0.0</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Platforms tracked</span>
                  <span className="font-mono">102</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Default cache TTL</span>
                  <span className="font-mono">5 minutes</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">APIs used</span>
                  <span className="font-mono">HIBP, GitHub, Reddit, Mastodon, RDAP, DNS</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-muted-foreground">License</span>
                  <span className="font-mono">Self-hosted</span>
                </div>
              </div>
              <div className="rounded-md border border-blue-500/30 bg-blue-500/5 p-3 text-[11px] text-muted-foreground">
                OSINT Toolkit is a self-hosted intelligence platform for
                searching usernames, scanning domains, and checking data
                breaches. All data is stored locally in your browser.
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Save bar — only on sections with editable options */}
      {["api-keys", "caching", "probing", "privacy", "danger"].includes(activeSection) && (
        <div className="sticky bottom-4 flex justify-end">
          <Card className="shadow-lg">
            <CardContent className="p-3 flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:block">
                Changes are saved to your browser
              </span>
              <Button onClick={handleSave} size="sm">
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
