/**
 * Reddit API probe — uses .json endpoints (no auth).
 */

import type { ApiProbeResult } from "./types";
import { fetchJson } from "./fetch";

interface RedditAboutResponse {
  kind: string;
  data: {
    name?: string;
    id?: string;
    icon_img?: string;
    verified?: boolean;
    is_employee?: boolean;
    created_utc?: number;
    comment_karma?: number;
    link_karma?: number;
    total_karma?: number;
    awardee_karma?: number;
    awarder_karma?: number;
    subreddit?: {
      title?: string;
      public_description?: string;
      display_name_prefixed?: string;
      banner_img?: string;
      banner_background_image?: string;
      over_18?: boolean;
    };
    verified_mail?: boolean;
  };
}

export async function probeReddit(username: string): Promise<ApiProbeResult> {
  try {
    const { status, data } = await fetchJson(
      `https://www.reddit.com/user/${encodeURIComponent(username)}/about.json`,
    );
    if (status === 404) return null;
    if (status === 403 || status === 429) {
      return {
        platformId: "reddit",
        error: `Reddit API returned HTTP ${status} (rate-limited or blocked)`,
        fetchedAt: new Date().toISOString(),
      };
    }
    if (status !== 200 || !data || typeof data !== "object") {
      return {
        platformId: "reddit",
        error: `Reddit API returned HTTP ${status}`,
        fetchedAt: new Date().toISOString(),
      };
    }
    const resp = data as RedditAboutResponse;
    const d = resp.data;
    if (!d) return null;
    return {
      platformId: "reddit",
      username: d.name || username,
      displayName: d.subreddit?.title || d.name || username,
      fullName: null,
      bio: d.subreddit?.public_description || null,
      profileUrl: `https://www.reddit.com/user/${username}`,
      avatarUrl: d.icon_img || null,
      bannerUrl:
        d.subreddit?.banner_background_image ||
        d.subreddit?.banner_img ||
        null,
      followersCount: null, // Reddit doesn't expose this
      followingCount: null,
      postsCount: null, // Would need a separate call to /submitted.json
      isVerified: typeof d.verified === "boolean" ? d.verified : null,
      isEmployee: typeof d.is_employee === "boolean" ? d.is_employee : null,
      joinedAt: d.created_utc
        ? new Date(d.created_utc * 1000).toISOString()
        : null,
      location: null,
      websiteUrl: null,
      company: null,
      source: "official_api",
      sourceLabel: "Reddit JSON API",
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    return {
      platformId: "reddit",
      error: (e as Error).message,
      fetchedAt: new Date().toISOString(),
    };
  }
}
