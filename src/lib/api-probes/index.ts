/**
 * API probes barrel — re-exports types, probes, and the dispatcher.
 */

export type {
  ApiProfile,
  ApiProbeError,
  ApiProbeResult,
} from "./types";
export { isApiProfile } from "./types";

import { probeGitHub } from "./github";
import { probeReddit } from "./reddit";
import { probeMastodon } from "./mastodon";
import type { ApiProbeResult } from "./types";

const PROBES: Record<string, (username: string) => Promise<ApiProbeResult>> = {
  github: probeGitHub,
  reddit: probeReddit,
  mastodon: probeMastodon,
};

/** Returns true if this platform has an official-API probe. */
export function hasApiProbe(platformId: string): boolean {
  return platformId in PROBES;
}

/**
 * Run the official-API probe for a platform.
 * Returns null if no probe exists, an `ApiProbeError` on failure, or
 * an `ApiProfile` on success.
 */
export async function probePlatformApi(
  platformId: string,
  username: string,
): Promise<ApiProbeResult> {
  const fn = PROBES[platformId];
  if (!fn) return null;
  return fn(username);
}
