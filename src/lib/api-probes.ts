/**
 * Official API probes for platforms that offer public, no-auth endpoints.
 *
 * When a platform has a free public API, we should use it instead of
 * scraping HTML — the data is more accurate, we don't trip anti-bot
 * challenges, and we get richer profile information (verified badges,
 * follower counts, join dates, etc.) that simply isn't in the page HTML.
 *
 * Each probe returns a normalized `ApiProfile` shape so the UI can
 * render them uniformly.
 *
 * Currently supported:
 *   - GitHub  (REST API, no auth — 60 req/hr per IP)
 *   - Reddit  (.json endpoints, no auth)
 *   - Mastodon (mastodon.social lookup API, no auth)
 *
 * To add more platforms, add a case to `probePlatformApi` and implement
 * the fetcher. Future candidates: Twitch (Kraken), GitLab, Keybase,
 * Stack Exchange.
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

function isApiProfile(r: ApiProbeResult): r is ApiProfile {
  return r !== null && (r as ApiProfile).source === "official_api";
}

const API_HEADERS: Record<string, string> = {
  "User-Agent": "UsernameFinder/1.0 (+https://github.com/username-finder)",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
};

async function fetchJson(url: string, timeoutMs = 8000): Promise<{ status: number; data: unknown }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: API_HEADERS,
      redirect: "follow",
      signal: controller.signal,
    });
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      // Some error responses aren't JSON
    }
    return { status: res.status, data };
  } finally {
    clearTimeout(timeout);
  }
}

/* ------------------------------------------------------------------ */
/*  GitHub                                                              */
/* ------------------------------------------------------------------ */

async function probeGitHub(username: string): Promise<ApiProbeResult> {
  try {
    const { status, data } = await fetchJson(
      `https://api.github.com/users/${encodeURIComponent(username)}`,
    );
    if (status === 404) return null; // user doesn't exist
    if (status !== 200 || !data || typeof data !== "object") {
      return {
        platformId: "github",
        error: `GitHub API returned HTTP ${status}`,
        fetchedAt: new Date().toISOString(),
      };
    }
    const d = data as Record<string, unknown>;
    return {
      platformId: "github",
      username: String(d.login ?? username),
      displayName: (d.name as string) || null,
      fullName: (d.name as string) || null,
      bio: (d.bio as string) || null,
      profileUrl: (d.html_url as string) || `https://github.com/${username}`,
      avatarUrl: (d.avatar_url as string) || null,
      bannerUrl: null, // GitHub doesn't have banners
      followersCount: typeof d.followers === "number" ? d.followers : null,
      followingCount: typeof d.following === "number" ? d.following : null,
      postsCount: typeof d.public_repos === "number" ? d.public_repos : null,
      isVerified: null, // GitHub doesn't have verified badges per se
      isEmployee: typeof d.hireable === "boolean" ? d.hireable : null,
      joinedAt: (d.created_at as string) || null,
      location: (d.location as string) || null,
      websiteUrl: (d.blog as string) || null,
      company: (d.company as string) || null,
      source: "official_api",
      sourceLabel: "GitHub REST API",
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    return {
      platformId: "github",
      error: (e as Error).message,
      fetchedAt: new Date().toISOString(),
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Reddit                                                              */
/* ------------------------------------------------------------------ */

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

async function probeReddit(username: string): Promise<ApiProbeResult> {
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

/* ------------------------------------------------------------------ */
/*  Mastodon (mastodon.social)                                          */
/* ------------------------------------------------------------------ */

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

async function probeMastodon(username: string): Promise<ApiProbeResult> {
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

/* ------------------------------------------------------------------ */
/*  Dispatcher                                                          */
/* ------------------------------------------------------------------ */

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

export { isApiProfile };
