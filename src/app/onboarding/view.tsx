"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "../settings-context";
import { WelcomeStep } from "./welcome-step";
import { ProfileStep } from "./profile-step";
import { AppearanceStep } from "./appearance-step";
import { ApiKeysStep } from "./api-keys-step";
import { PrivacyStep } from "./privacy-step";
import { PreferencesStep } from "./preferences-step";
import { NotificationsStep } from "./notifications-step";
import { TourStep } from "./tour-step";
import { ReadyStep } from "./ready-step";

const STEPS = [
  WelcomeStep,
  ProfileStep,
  AppearanceStep,
  ApiKeysStep,
  PrivacyStep,
  PreferencesStep,
  NotificationsStep,
  TourStep,
  ReadyStep,
] as const;

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const { settings, completeOnboarding } = useSettings();
  const [step, setStep] = React.useState(0);

  const [hibpApiKey, setHibpApiKey] = React.useState(settings.hibpApiKey);
  const [cacheTtl, setCacheTtl] = React.useState(settings.cacheTtlMinutes);
  const [timeout, setTimeout_] = React.useState(settings.requestTimeoutSeconds);
  const [privacyMode, setPrivacyMode] = React.useState(settings.privacyMode);
  const [displayName, setDisplayName] = React.useState("");
  const [usageType, setUsageType] = React.useState("personal");

  const handleFinish = () => {
    completeOnboarding({
      hibpApiKey,
      cacheTtlMinutes: cacheTtl,
      requestTimeoutSeconds: timeout,
      privacyMode,
    });
    onComplete();
  };

  const StepComponent = STEPS[step];
  const canGoNext = step < STEPS.length - 1;
  const canGoBack = step > 0;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Progress dots */}
      <div className="shrink-0 pt-8 pb-4 flex items-center justify-center">
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((_, i) => {
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={i} className="flex items-center">
                <div
                  className={`flex items-center justify-center h-9 w-9 rounded-full border-2 transition-all ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isDone
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  {isDone ? (
                    <ArrowRight className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-medium">{i + 1}</span>
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-1 ${
                      i < step ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4">
        <div key={step} className="max-w-2xl w-full mx-auto pb-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <StepComponent
            hibpApiKey={hibpApiKey}
            onHibpApiKeyChange={setHibpApiKey}
            cacheTtl={cacheTtl}
            onCacheTtlChange={setCacheTtl}
            timeout={timeout}
            onTimeoutChange={setTimeout_}
            privacyMode={privacyMode}
            onPrivacyModeChange={setPrivacyMode}
            displayName={displayName}
            onDisplayNameChange={setDisplayName}
            usageType={usageType}
            onUsageTypeChange={setUsageType}
            onNext={() => setStep((s) => s + 1)}
            onBack={() => setStep((s) => s - 1)}
            onComplete={handleFinish}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="shrink-0 border-t border-border/60 p-4">
        <div className="max-w-2xl w-full mx-auto flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={!canGoBack}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
          {canGoNext ? (
            <Button onClick={() => setStep((s) => s + 1)}>
              Next
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          ) : (
            <Button onClick={handleFinish}>
              Launch OSINT Toolkit
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
