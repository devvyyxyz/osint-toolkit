/**
 * Status metadata — labels, colors, and icons for each HitStatus.
 */

import {
  Check,
  X,
  HelpCircle,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import type { HitStatus } from "../hit-types";

export const STATUS_META: Record<
  HitStatus,
  { label: string; color: string; icon: typeof Check; ring: string }
> = {
  found: {
    label: "Found",
    color: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/40 bg-emerald-500/10",
    icon: Check,
  },
  not_found: {
    label: "Not Found",
    color: "text-zinc-500 dark:text-zinc-400",
    ring: "ring-zinc-500/30 bg-zinc-500/10",
    icon: X,
  },
  unknown: {
    label: "Unknown",
    color: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/40 bg-amber-500/10",
    icon: HelpCircle,
  },
  blocked: {
    label: "Blocked",
    color: "text-orange-600 dark:text-orange-400",
    ring: "ring-orange-500/40 bg-orange-500/10",
    icon: ShieldAlert,
  },
  error: {
    label: "Error",
    color: "text-red-600 dark:text-red-400",
    ring: "ring-red-500/40 bg-red-500/10",
    icon: AlertTriangle,
  },
};
