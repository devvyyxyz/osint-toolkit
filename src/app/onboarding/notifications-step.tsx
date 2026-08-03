"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

export function NotificationsStep({ onNext: _onNext }: { onNext: () => void }) {
  const notifications = [
    { id: "scan-complete", label: "Scan completion", desc: "Notify when a search or scan finishes", default: true },
    { id: "breach-alerts", label: "Breach alerts", desc: "Alert when a watched email appears in a new breach", default: true },
    { id: "rate-limits", label: "Rate limit warnings", desc: "Warn when an API is being rate-limited", default: false },
    { id: "cache-hits", label: "Cache hits", desc: "Show a notification when results are served from cache", default: false },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Notification preferences</h2>
        <p className="text-sm text-muted-foreground">
          Choose what you want to be notified about. You can change these later.
        </p>
      </div>

      <div className="space-y-2">
        {notifications.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border/60">
            <div>
              <div className="text-sm font-medium">{item.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</div>
            </div>
            <ToggleSwitch defaultOn={item.default} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ToggleSwitch({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${on ? "bg-primary" : "bg-muted"}`}
      aria-label="Toggle"
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}
