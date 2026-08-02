"use client";

import * as React from "react";
import { Loader2, AlertTriangle, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadJSON } from "@/lib/features";

/* ------------------------------------------------------------------ */
/*  Shared components                                                   */
/* ------------------------------------------------------------------ */

export function ToolLoading() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Processing...</span>
      </div>
      <Skeleton className="h-32 rounded-lg" />
    </div>
  );
}

export function ToolError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertTriangle className="h-8 w-8 mb-3 text-red-600 dark:text-red-400 opacity-50" />
      <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Failed</p>
      <p className="text-xs text-red-600 dark:text-red-400">{message}</p>
    </div>
  );
}

export function ToolEmpty({ icon, label, hint }: { icon: React.ReactNode; label: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
      <div className="opacity-30 mb-4">{icon}</div>
      <p className="text-sm font-medium mb-1">{label}</p>
      <p className="text-xs">{hint}</p>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start gap-2 text-xs py-1">
      <span className="text-muted-foreground shrink-0 w-28">{label}</span>
      <span className={`flex-1 break-all ${mono ? "font-mono text-[11px]" : ""}`}>{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Generic results view — renders any JSON result as cards             */
/* ------------------------------------------------------------------ */

export function GenericResults({ result, title }: { result: Record<string, unknown>; title: string }) {
  return (
    <div className="space-y-3 max-w-2xl">
      <h2 className="text-lg font-bold">{title}</h2>
      <Card>
        <CardContent className="p-4">
          {Object.entries(result).filter(([k]) => !["cached", "error"].includes(k)).map(([key, value]) => (
            <DataRow key={key} label={key} value={value} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: unknown }) {
  const displayLabel = label.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
  
  if (value === null || value === undefined) return null;
  
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return <Row label={displayLabel} value={String(value)} mono={typeof value !== "boolean"} />;
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) return <Row label={displayLabel} value="None" />;
    return (
      <div className="py-1">
        <span className="text-muted-foreground text-xs">{displayLabel} ({value.length})</span>
        <div className="mt-1 space-y-1">
          {value.slice(0, 10).map((item, i) => (
            <div key={i} className="text-xs">
              {typeof item === "object" ? (
                <Card className="p-2 bg-muted/30">
                  {Object.entries(item as Record<string, unknown>).map(([k, v]) => (
                    <div key={k} className="text-[11px] flex gap-2">
                      <span className="text-muted-foreground">{k}:</span>
                      <span className="font-mono break-all">{String(v)}</span>
                    </div>
                  ))}
                </Card>
              ) : (
                <span className="font-mono break-all">{String(item)}</span>
              )}
            </div>
          ))}
          {value.length > 10 && <span className="text-[10px] text-muted-foreground">+{value.length - 10} more</span>}
        </div>
      </div>
    );
  }
  
  if (typeof value === "object") {
    return (
      <div className="py-1">
        <span className="text-muted-foreground text-xs">{displayLabel}</span>
        <Card className="mt-1 p-2 bg-muted/30">
          {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
            <div key={k} className="text-[11px] flex gap-2 py-0.5">
              <span className="text-muted-foreground w-24 shrink-0">{k}:</span>
              <span className="font-mono break-all">{String(v)}</span>
            </div>
          ))}
        </Card>
      </div>
    );
  }
  
  return null;
}

/* ------------------------------------------------------------------ */
/*  Link list view — for tools that return lists of links/URLs          */
/* ------------------------------------------------------------------ */

export function LinkListResults({ result, title, linksKey }: { result: Record<string, unknown>; title: string; linksKey: string }) {
  const links = (result[linksKey] as Array<Record<string, string>>) || [];
  return (
    <div className="space-y-3 max-w-2xl">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="space-y-1">
        {links.map((item, i) => (
          <a key={i} href={item.url} target="_blank" rel="noopener noreferrer nofollow"
            className="flex items-center gap-3 p-2 rounded-md border border-border/40 hover:bg-accent/30 transition-colors group">
            <span className="text-xs font-medium flex-1 truncate">{item.name || item.source || item.label || item.url}</span>
            {item.type && <Badge variant="secondary" className="text-[9px] shrink-0">{item.type}</Badge>}
            <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 group-hover:text-foreground" />
          </a>
        ))}
      </div>
    </div>
  );
}
