"use client";

import * as React from "react";
import {
  ExternalLink,
  AlertTriangle,
  User,
  Calendar,
  Server,
  FileCode,
  Link2,
  Image as ImageIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandIcon, brandColor } from "@/components/brand-icon";
import { PLATFORMS } from "@/lib/platforms";
import type { HitStatus } from "./hit-types";

export interface HitLite {
  platformId: string;
  platformName: string;
  category: string;
  url: string;
  status: HitStatus;
  httpStatus: number | null;
  detail: string;
  durationMs: number;
  username: string;
}

interface InspectData {
  platformId: string;
  platformName: string;
  category: string;
  url: string;
  finalUrl: string | null;
  httpStatus: number | null;
  durationMs: number;
  fetchedAt: string;
  title: string | null;
  description: string | null;
  image: string | null;
  imageAlt: string | null;
  siteName: string | null;
  siteType: string | null;
  twitterCard: string | null;
  twitterImage: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  bodySize: number;
  textSnippet: string | null;
  headers: Record<string, string>;
  references: Array<{ label: string; url: string }>;
  error?: string;
}

const STATUS_COLOR: Record<HitStatus, string> = {
  found: "text-emerald-600 dark:text-emerald-400",
  not_found: "text-zinc-500 dark:text-zinc-400",
  unknown: "text-amber-600 dark:text-amber-400",
  blocked: "text-orange-600 dark:text-orange-400",
  error: "text-red-600 dark:text-red-400",
};

const STATUS_LABEL: Record<HitStatus, string> = {
  found: "Found",
  not_found: "Not Found",
  unknown: "Unknown",
  blocked: "Blocked",
  error: "Error",
};

interface ProfileDialogProps {
  hit: HitLite | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({
  hit,
  open,
  onOpenChange,
}: ProfileDialogProps) {
  const [data, setData] = React.useState<InspectData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [bannerError, setBannerError] = React.useState(false);
  const [pfpError, setPfpError] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  // Reset image error flags whenever we get new data or open a new hit.
  React.useEffect(() => {
    setBannerError(false);
    setPfpError(false);
  }, [hit?.platformId, hit?.username, data]);

  React.useEffect(() => {
    if (!open || !hit) return;
    // Fetch the rich inspect payload.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setData(null);

    fetch(
      `/api/inspect?platformId=${encodeURIComponent(
        hit.platformId,
      )}&username=${encodeURIComponent(hit.username)}`,
      { signal: controller.signal },
    )
      .then((r) => r.json())
      .then((d: InspectData) => setData(d))
      .catch((e) => {
        if ((e as Error).name === "AbortError") return;
        setData({
          platformId: hit.platformId,
          platformName: hit.platformName,
          category: hit.category,
          url: hit.url,
          finalUrl: null,
          httpStatus: null,
          durationMs: 0,
          fetchedAt: new Date().toISOString(),
          title: null,
          description: null,
          image: null,
          imageAlt: null,
          siteName: null,
          siteType: null,
          twitterCard: null,
          twitterImage: null,
          twitterTitle: null,
          twitterDescription: null,
          bodySize: 0,
          textSnippet: null,
          headers: {},
          references: [{ label: "Open original profile", url: hit.url }],
          error: (e as Error).message,
        });
      })
      .finally(() => setLoading(false));

    return () => {
      controller.abort();
    };
  }, [open, hit]);

  if (!hit) return null;

  const platform = PLATFORMS.find((p) => p.id === hit.platformId);
  const tileBg = platform
    ? `${brandColor(platform.iconSlug) ?? platform.color}1A`
    : undefined;
  const statusColor = STATUS_COLOR[hit.status];
  const statusLabel = STATUS_LABEL[hit.status];

  const bannerUrl = data?.twitterImage && !bannerError ? data.twitterImage : null;
  const pfpUrl = data?.image && !pfpError ? data.image : null;
  const displayName =
    data?.title ?? data?.twitterTitle ?? hit.platformName;
  const bio =
    data?.description ?? data?.twitterDescription ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-2xl p-0 overflow-hidden gap-0 max-h-[90vh] overflow-y-auto"
        suppressHydrationWarning
      >
        {/* ---------- Banner ---------- */}
        <div className="relative h-32 sm:h-40 w-full bg-muted shrink-0">
          {loading ? (
            <Skeleton className="h-full w-full rounded-none" />
          ) : bannerUrl ? (
            <img
              src={bannerUrl}
              alt="Profile banner"
              className="h-full w-full object-cover"
              onError={() => setBannerError(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: platform
                  ? `linear-gradient(135deg, ${brandColor(platform.iconSlug) ?? platform.color}, ${brandColor(platform.iconSlug) ?? platform.color}40)`
                  : "linear-gradient(135deg, #888, #444)",
              }}
            />
          )}
          {/* gradient overlay so the close button stays readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* ---------- Header (pfp + name + status) ---------- */}
        <DialogHeader className="px-5 pt-0 pb-3 -mt-10 relative">
          <div className="flex items-end gap-3">
            {/* PFP */}
            <div className="h-20 w-20 rounded-full border-4 border-background bg-background overflow-hidden shrink-0 shadow-md">
              {loading ? (
                <Skeleton className="h-full w-full rounded-full" />
              ) : pfpUrl ? (
                <img
                  src={pfpUrl}
                  alt={data?.imageAlt ?? `${hit.platformName} profile picture`}
                  className="h-full w-full object-cover"
                  onError={() => setPfpError(true)}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="h-full w-full flex items-center justify-center"
                  style={{ backgroundColor: tileBg }}
                >
                  <BrandIcon
                    slug={platform?.iconSlug ?? ""}
                    size={32}
                    colored
                  />
                </div>
              )}
            </div>

            {/* Name + status */}
            <div className="flex-1 min-w-0 pb-1">
              <DialogTitle className="text-lg font-bold truncate flex items-center gap-2">
                <BrandIcon
                  slug={platform?.iconSlug ?? ""}
                  size={16}
                  colored
                />
                <span className="truncate">{displayName}</span>
              </DialogTitle>
              <DialogDescription className="text-xs flex items-center gap-2 mt-1 flex-wrap">
                <span className="font-mono truncate">{hit.platformName}</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="font-mono truncate">@{hit.username}</span>
                <span className={`font-medium ${statusColor}`}>
                  · {statusLabel}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ---------- Body ---------- */}
        <div className="px-5 pb-5 space-y-4">
          {/* Bio */}
          {loading ? (
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ) : bio ? (
            <p className="text-sm text-foreground/90 leading-relaxed">
              {bio}
            </p>
          ) : null}

          {/* Error / blocked notice */}
          {data?.error && (
            <div className="flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-red-700 dark:text-red-300">
                  Could not fully inspect this profile
                </div>
                <div className="text-red-600 dark:text-red-400 mt-0.5">
                  {data.error}
                </div>
              </div>
            </div>
          )}

          {/* Meta grid */}
          {!loading && data && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <MetaItem
                icon={<Link2 className="h-3.5 w-3.5" />}
                label="Profile URL"
                value={
                  <a
                    href={hit.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-primary hover:underline truncate block"
                  >
                    {hit.url.replace(/^https?:\/\//, "")}
                  </a>
                }
              />
              <MetaItem
                icon={<Server className="h-3.5 w-3.5" />}
                label="HTTP status"
                value={
                  data.httpStatus !== null
                    ? `${data.httpStatus}`
                    : "—"
                }
              />
              <MetaItem
                icon={<Calendar className="h-3.5 w-3.5" />}
                label="Fetched at"
                value={new Date(data.fetchedAt).toLocaleString()}
              />
              <MetaItem
                icon={<FileCode className="h-3.5 w-3.5" />}
                label="Body size"
                value={
                  data.bodySize > 0
                    ? `${(data.bodySize / 1024).toFixed(1)} KB`
                    : "—"
                }
              />
              {data.siteName && (
                <MetaItem
                  icon={<User className="h-3.5 w-3.5" />}
                  label="Site name"
                  value={data.siteName}
                />
              )}
              {data.siteType && (
                <MetaItem
                  icon={<User className="h-3.5 w-3.5" />}
                  label="OG type"
                  value={data.siteType}
                />
              )}
              {data.durationMs > 0 && (
                <MetaItem
                  icon={<Server className="h-3.5 w-3.5" />}
                  label="Response time"
                  value={`${data.durationMs} ms`}
                />
              )}
              {data.twitterCard && (
                <MetaItem
                  icon={<ImageIcon className="h-3.5 w-3.5" />}
                  label="Twitter card"
                  value={data.twitterCard}
                />
              )}
            </div>
          )}

          {/* Response headers (collapsible) */}
          {!loading && data && Object.keys(data.headers).length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground select-none">
                Response headers ({Object.keys(data.headers).length})
              </summary>
              <div className="mt-2 rounded-md border border-border/60 bg-muted/30 p-2 font-mono text-[10px] leading-relaxed max-h-40 overflow-y-auto">
                {Object.entries(data.headers).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">{k}:</span>
                    <span className="break-all">{v}</span>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* Body text snippet */}
          {!loading && data?.textSnippet && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground select-none">
                Page text snippet ({data.textSnippet.length} chars)
              </summary>
              <div className="mt-2 rounded-md border border-border/60 bg-muted/30 p-2 text-[11px] leading-relaxed max-h-40 overflow-y-auto text-muted-foreground">
                {data.textSnippet}
              </div>
            </details>
          )}

          {/* References */}
          {!loading && data && data.references.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5" />
                References &amp; cross-checks
              </div>
              <div className="flex flex-col gap-1.5">
                {data.references.map((ref) => (
                  <a
                    key={ref.url}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="flex items-center justify-between gap-2 text-xs rounded-md border border-border/60 bg-background px-3 py-2 hover:bg-muted/40 transition-colors group"
                  >
                    <span className="truncate">{ref.label}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 group-hover:text-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ---------- Footer ---------- */}
        <div className="border-t border-border/60 bg-muted/30 px-5 py-3 flex items-center justify-between gap-2">
          <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-2 truncate">
            {hit.httpStatus !== null && (
              <Badge variant="outline" className="px-1.5 py-0 h-4 text-[10px]">
                HTTP {hit.httpStatus}
              </Badge>
            )}
            <span className="truncate">{hit.detail}</span>
          </div>
          <Button
            size="sm"
            variant="default"
            onClick={() => {
              window.open(hit.url, "_blank", "noopener,noreferrer");
            }}
            className="shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            Open original
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-1.5 min-w-0">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="text-xs truncate">{value}</div>
      </div>
    </div>
  );
}
