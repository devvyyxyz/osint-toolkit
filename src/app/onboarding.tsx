"use client";

import * as React from "react";
import {
  Globe2,
  ArrowRight,
  ArrowLeft,
  Check,
  Key,
  ShieldCheck,
  Settings as SettingsIcon,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Lock,
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSettings, generateUserAgent } from "./settings-context";

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  { id: "welcome", title: "Welcome", icon: Globe2 },
  { id: "api-keys", title: "API Keys", icon: Key },
  { id: "preferences", title: "Preferences", icon: SettingsIcon },
  { id: "ready", title: "Ready", icon: Check },
] as const;

export function Onboarding({ onComplete }: OnboardingProps) {
  const { settings, completeOnboarding } = useSettings();
  const [step, setStep] = React.useState(0);

  // Local state for the form fields
  const [hibpApiKey, setHibpApiKey] = React.useState(settings.hibpApiKey);
  const [cacheTtl, setCacheTtl] = React.useState(settings.cacheTtlMinutes);
  const [timeout, setTimeout_] = React.useState(settings.requestTimeoutSeconds);
  const [userAgent, setUserAgent] = React.useState(settings.userAgent);
  const [maxConcurrent, setMaxConcurrent] = React.useState(settings.maxConcurrent);
  const [privacyMode, setPrivacyMode] = React.useState(settings.privacyMode);

  const handleFinish = () => {
    completeOnboarding({
      hibpApiKey,
      cacheTtlMinutes: cacheTtl,
      requestTimeoutSeconds: timeout,
      userAgent,
      maxConcurrent,
      privacyMode,
    });
    onComplete();
  };

  const canGoNext = step < STEPS.length - 1;
  const canGoBack = step > 0;
  const canFinish = step === STEPS.length - 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={s.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center h-9 w-9 rounded-full border-2 transition-all ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isDone
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-1 ${i < step ? "bg-primary" : "bg-border"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

          {/* Step content */}
          {step === 0 && <WelcomeStep />}
          {step === 1 && (
            <ApiKeysStep
              hibpApiKey={hibpApiKey}
              setHibpApiKey={setHibpApiKey}
            />
          )}
          {step === 2 && (
            <PreferencesStep
              cacheTtl={cacheTtl}
              setCacheTtl={setCacheTtl}
              timeout={timeout}
              setTimeout_={setTimeout_}
              userAgent={userAgent}
              setUserAgent={setUserAgent}
              maxConcurrent={maxConcurrent}
              setMaxConcurrent={setMaxConcurrent}
              privacyMode={privacyMode}
              setPrivacyMode={setPrivacyMode}
            />
          )}
          {step === 3 && (
            <ReadyStep
              hibpApiKey={hibpApiKey}
              cacheTtl={cacheTtl}
              timeout={timeout}
              userAgent={userAgent}
              maxConcurrent={maxConcurrent}
              privacyMode={privacyMode}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={!canGoBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {canFinish ? (
              <Button onClick={handleFinish} size="lg">
                <Sparkles className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            ) : (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canGoNext} size="lg">
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1: Welcome                                                    */
/* ------------------------------------------------------------------ */

function WelcomeStep() {
  return (
    <div className="text-center space-y-6">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
        <Globe2 className="h-8 w-8 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome to OSINT Toolkit</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          A self-hosted intelligence toolkit for searching usernames,
          scanning domains, and checking data breaches. Let's set things up.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        <Card>
          <CardContent className="p-4">
            <ShieldCheck className="h-5 w-5 text-emerald-500 mb-2" />
            <h3 className="text-sm font-semibold">Self-hosted</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Your data stays on your server. No third-party tracking.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Key className="h-5 w-5 text-amber-500 mb-2" />
            <h3 className="text-sm font-semibold">Your keys</h3>
            <p className="text-xs text-muted-foreground mt-1">
              API keys are stored locally in your browser, never sent
              anywhere except the API they're for.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Zap className="h-5 w-5 text-blue-500 mb-2" />
            <h3 className="text-sm font-semibold">Fast & cached</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Parallel probing with configurable caching to avoid
              rate-limits.
            </p>
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">
        Setup takes about 2 minutes. You can change everything later in
        Settings.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2: API Keys                                                   */
/* ------------------------------------------------------------------ */

function ApiKeysStep({
  hibpApiKey,
  setHibpApiKey,
}: {
  hibpApiKey: string;
  setHibpApiKey: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">API Keys</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Some tools need API keys to work. Keys are stored locally in your
          browser and only sent to the respective API.
        </p>
      </div>

      {/* HIBP API Key */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-semibold">Have I Been Pwned</h3>
                <p className="text-xs text-muted-foreground">
                  Required for breach account lookups
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px]">
              Optional
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            The Breach Checker tool needs a free HIBP API key to look up
            email addresses and usernames in breach databases. Without it,
            only the password checker will work.
          </p>
          <div className="space-y-2">
            <Label htmlFor="hibp-key" className="text-xs">
              API Key
            </Label>
            <Input
              id="hibp-key"
              type="password"
              value={hibpApiKey}
              onChange={(e) => setHibpApiKey(e.target.value)}
              placeholder="Paste your HIBP API key here"
              className="font-mono text-sm"
              autoComplete="off"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <a
              href="https://haveibeenpwned.com/API/Key"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              Get a free API key
              <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-muted-foreground">
              · You can add this later in Settings
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 rounded-md border border-blue-500/30 bg-blue-500/5 p-3 text-xs">
        <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-muted-foreground">
          <span className="font-medium text-blue-700 dark:text-blue-300">
            Privacy note:
          </span>{" "}
          Your API key is stored only in this browser's localStorage. It's
          sent exclusively to the Have I Been Pwned API when checking
          breaches — never to any other service.
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 3: Preferences                                                */
/* ------------------------------------------------------------------ */

function PreferencesStep({
  cacheTtl,
  setCacheTtl,
  timeout,
  setTimeout_,
  userAgent,
  setUserAgent,
  maxConcurrent,
  setMaxConcurrent,
  privacyMode,
  setPrivacyMode,
}: {
  cacheTtl: number;
  setCacheTtl: (v: number) => void;
  timeout: number;
  setTimeout_: (v: number) => void;
  userAgent: string;
  setUserAgent: (v: string) => void;
  maxConcurrent: number;
  setMaxConcurrent: (v: number) => void;
  privacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Preferences</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure how the toolkit behaves. Defaults are sensible — feel
          free to skip this step.
        </p>
      </div>

      {/* Cache duration */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-semibold">Cache Duration</h3>
              <p className="text-xs text-muted-foreground">
                How long to cache search and scan results
              </p>
            </div>
          </div>
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
            Caching prevents repeat-probe rate-limiting. Set to "Off" for
            always-fresh results.
          </p>
        </CardContent>
      </Card>

      {/* Request timeout */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-semibold">Request Timeout</h3>
              <p className="text-xs text-muted-foreground">
                How long to wait for each platform to respond
              </p>
            </div>
          </div>
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
        </CardContent>
      </Card>

      {/* User Agent */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold">User Agent</h3>
              <p className="text-xs text-muted-foreground">
                The browser identity sent to social platforms during probing
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUserAgent(generateUserAgent())}
            >
              <RefreshCw className="h-3 w-3 mr-1.5" />
              Auto-generate
            </Button>
          </div>
          <Input
            value={userAgent}
            onChange={(e) => setUserAgent(e.target.value)}
            className="font-mono text-xs"
            autoComplete="off"
          />
          <p className="text-[11px] text-muted-foreground">
            A realistic User-Agent helps avoid bot detection. Click
            "Auto-generate" for a random one.
          </p>
        </CardContent>
      </Card>

      {/* Privacy mode */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-semibold">Privacy Mode</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  When enabled, results are never cached. Every search hits
                  all platforms fresh.
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 4: Ready                                                      */
/* ------------------------------------------------------------------ */

function ReadyStep({
  hibpApiKey,
  cacheTtl,
  timeout,
  userAgent,
  maxConcurrent,
  privacyMode,
}: {
  hibpApiKey: string;
  cacheTtl: number;
  timeout: number;
  userAgent: string;
  maxConcurrent: number;
  privacyMode: boolean;
}) {
  return (
    <div className="text-center space-y-6">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10">
        <Check className="h-8 w-8 text-emerald-500" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">You're all set!</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          The toolkit is configured and ready to use. Here's a summary of
          your settings:
        </p>
      </div>
      <Card className="text-left">
        <CardContent className="p-5 space-y-3">
          <SummaryRow
            icon={<ShieldCheck className="h-4 w-4" />}
            label="HIBP API Key"
            value={hibpApiKey ? "Configured" : "Not set (breach account lookups disabled)"}
            status={hibpApiKey ? "ok" : "warn"}
          />
          <SummaryRow
            icon={<Clock className="h-4 w-4" />}
            label="Cache Duration"
            value={cacheTtl === 0 ? "Off (no caching)" : `${cacheTtl} minutes`}
          />
          <SummaryRow
            icon={<Zap className="h-4 w-4" />}
            label="Request Timeout"
            value={`${timeout} seconds`}
          />
          <SummaryRow
            icon={<Globe2 className="h-4 w-4" />}
            label="User Agent"
            value={userAgent.slice(0, 50) + "..."}
          />
          <SummaryRow
            icon={<Lock className="h-4 w-4" />}
            label="Privacy Mode"
            value={privacyMode ? "Enabled (no caching)" : "Disabled"}
          />
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        You can change any of these later in Settings.
      </p>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  status?: "ok" | "warn";
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-muted-foreground w-32 shrink-0">{label}</span>
      <span
        className={`flex-1 font-mono text-xs ${
          status === "ok"
            ? "text-emerald-600 dark:text-emerald-400"
            : status === "warn"
              ? "text-amber-600 dark:text-amber-400"
              : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
