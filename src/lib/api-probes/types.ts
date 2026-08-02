/**
 * Shared types for official API probes.
 */

export interface ApiProfile {
  platformId: string;
  // Identity
  username: string;
  displayName: string | null;
  fullName?: string | null;
  bio: string | null;
  profileUrl: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  // Stats
  followersCount?: number | null;
  followingCount?: number | null;
  postsCount?: number | null;
  // Verification
  isVerified?: boolean | null;
  isEmployee?: boolean | null;
  // Metadata
  joinedAt?: string | null; // ISO 8601
  location?: string | null;
  websiteUrl?: string | null;
  company?: string | null;
  // Source attribution
  source: "official_api";
  sourceLabel: string;
  fetchedAt: string;
}

export interface ApiProbeError {
  platformId: string;
  error: string;
  fetchedAt: string;
}

export type ApiProbeResult = ApiProfile | ApiProbeError | null;

export function isApiProfile(r: ApiProbeResult): r is ApiProfile {
  return r !== null && (r as ApiProfile).source === "official_api";
}
