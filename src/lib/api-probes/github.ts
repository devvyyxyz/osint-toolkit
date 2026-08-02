/**
 * GitHub API probe — uses the REST API (no auth, 60 req/hr per IP).
 */

import type { ApiProbeResult } from "./types";
import { fetchJson } from "./fetch";

export async function probeGitHub(username: string): Promise<ApiProbeResult> {
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
