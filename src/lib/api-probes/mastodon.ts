/**
 * Mastodon API probe — uses the mastodon.social lookup API (no auth).
 */

import type { ApiProbeResult } from "./types";
import { fetchJson } from "./fetch";

interface MastodonAccount {
  id?: string;
  username?: string;
  acct?: string;
  display_name?: string;
  url?: string;
  avatar?: string;
  header?: string;
  note?: string;
  followers_count?: number;
  following_count?: number;
  statuses_count?: number;
  created_at?: string;
  locked?: boolean;
  bot?: boolean;
}

export async function probeMastodon(username: string): Promise<ApiProbeResult> {
  try {
    const { status, data } = await fetchJson(
      `https://mastodon.social/api/v1/accounts/lookup?acct=${encodeURIComponent(username)}`,
    );
    if (status === 404) return null;
    if (status !== 200 || !data || typeof data !== "object") {
      return {
        platformId: "mastodon",
        error: `Mastodon API returned HTTP ${status}`,
        fetchedAt: new Date().toISOString(),
      };
    }
    const d = data as MastodonAccount;
    return {
      platformId: "mastodon",
      username: d.acct || d.username || username,
      displayName: d.display_name || d.username || username,
      fullName: null,
      bio: d.note || null,
      profileUrl: d.url || `https://mastodon.social/@${username}`,
      avatarUrl: d.avatar || null,
      bannerUrl: d.header || null,
      followersCount: typeof d.followers_count === "number" ? d.followers_count : null,
      followingCount: typeof d.following_count === "number" ? d.following_count : null,
      postsCount: typeof d.statuses_count === "number" ? d.statuses_count : null,
      isVerified: null, // Mastodon's "verified" is per-link, not per-account
      isEmployee: null,
      joinedAt: d.created_at || null,
      location: null,
      websiteUrl: null,
      company: null,
      source: "official_api",
      sourceLabel: "Mastodon API (mastodon.social)",
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    return {
      platformId: "mastodon",
      error: (e as Error).message,
      fetchedAt: new Date().toISOString(),
    };
  }
}
