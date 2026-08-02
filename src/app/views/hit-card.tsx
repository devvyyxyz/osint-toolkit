"use client";

import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BrandIcon, brandColor } from "@/components/brand-icon";
import { PLATFORMS } from "@/lib/platforms";
import { STATUS_META } from "./status-meta";
import type { Hit } from "./types";

export function HitCard({ hit, onClick }: { hit: Hit; onClick: () => void }) {
  const meta = STATUS_META[hit.status];
  const Icon = meta.icon;
  const platform = PLATFORMS.find((p) => p.id === hit.platformId);
  const displayUrl = hit.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const tileBg =
    platform && (brandColor(platform.iconSlug) ?? platform.color)
      ? `${brandColor(platform.iconSlug) ?? platform.color}1A`
      : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group block text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-xl"
      aria-label={`Inspect ${hit.platformName} result for @${hit.platformName}`}
    >
      <Card
        className={`relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 ring-1 !py-0 !gap-0 cursor-pointer ${meta.ring}`}
      >
        <CardContent className="!px-3 py-2 flex items-center gap-2.5">
          {/* Brand icon tile */}
          <div
            className="h-8 w-8 rounded-md flex items-center justify-center shrink-0 border border-border/60"
            style={{ backgroundColor: tileBg }}
            aria-hidden
          >
            <BrandIcon slug={platform?.iconSlug ?? ""} size={16} colored />
          </div>

          {/* Text block */}
          <div className="flex-1 min-w-0">
            {/* Line 1: Platform name + status */}
            <div className="flex items-center gap-2 justify-between">
              <h3 className="font-semibold text-sm truncate leading-tight">
                {hit.platformName}
              </h3>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium shrink-0 ${meta.color}`}
                title={hit.detail}
              >
                <Icon className="h-3 w-3" />
                {meta.label}
              </span>
            </div>

            {/* Line 2: tags + URL */}
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground min-w-0">
              <span className="px-1.5 py-0 text-[10px] font-medium leading-none h-4 inline-flex items-center rounded-md bg-secondary text-secondary-foreground">
                {hit.category}
              </span>
              {hit.httpStatus !== null && (
                <span className="text-[10px] font-mono text-muted-foreground/70 shrink-0">
                  HTTP {hit.httpStatus}
                </span>
              )}
              <span className="text-muted-foreground/40 shrink-0">-</span>
              <span className="truncate font-mono text-[11px]">
                {displayUrl}
              </span>
              <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
