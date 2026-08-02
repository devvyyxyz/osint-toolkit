/**
 * Platform registry barrel — re-exports everything from the split modules.
 *
 * Consumers should import from `@/lib/platforms` (this barrel) rather
 * than reaching into individual category files.
 */

export type {
  DetectionResult,
  PlatformProbe,
  PlatformCategory,
  Platform,
} from "./types";

export { SEARCH_HEADERS, looksLikeProfile, basicDetect } from "./helpers";

import { SOCIAL_PLATFORMS } from "./social";
import { MESSAGING_PLATFORMS } from "./messaging";
import { MEDIA_PLATFORMS } from "./media";
import { DEV_PLATFORMS } from "./dev";
import { FORUM_PLATFORMS } from "./forum";
import { READING_PLATFORMS } from "./reading";
import { CREATIVE_PLATFORMS } from "./creative";
import { MUSIC_PLATFORMS } from "./music";
import { GAMING_PLATFORMS } from "./gaming";
import { ANIME_PLATFORMS } from "./anime";
import { LIFESTYLE_PLATFORMS } from "./lifestyle";

import type { Platform } from "./types";

export const PLATFORMS: Platform[] = [
  ...SOCIAL_PLATFORMS,
  ...MESSAGING_PLATFORMS,
  ...MEDIA_PLATFORMS,
  ...DEV_PLATFORMS,
  ...FORUM_PLATFORMS,
  ...READING_PLATFORMS,
  ...CREATIVE_PLATFORMS,
  ...MUSIC_PLATFORMS,
  ...GAMING_PLATFORMS,
  ...ANIME_PLATFORMS,
  ...LIFESTYLE_PLATFORMS,
];

/** Quick lookup used by the API route. */
export const PLATFORM_MAP: Record<string, Platform> = Object.fromEntries(
  PLATFORMS.map((p) => [p.id, p]),
);
