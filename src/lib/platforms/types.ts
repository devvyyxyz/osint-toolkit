/**
 * Type definitions for the platform registry.
 */

export type DetectionResult = "found" | "not_found" | "unknown";

export interface PlatformProbe {
  status: number;
  body: string;
  finalUrl: string;
}

export type PlatformCategory =
  | "Social"
  | "Media"
  | "Dev"
  | "Creative"
  | "Messaging"
  | "Forum"
  | "Gaming"
  | "Music"
  | "Reading"
  | "Photo"
  | "Streaming"
  | "Dating"
  | "Money"
  | "Lifestyle"
  | "Anime"
  | "Privacy";

export interface Platform {
  id: string;
  name: string;
  category: PlatformCategory;
  /** Simple Icons slug — must exist in brand-icon.tsx registry. */
  iconSlug: string;
  /** Hex color (without #) used for the icon tile background. */
  color: string;
  url: (username: string) => string;
  detect: (probe: PlatformProbe) => DetectionResult;
}