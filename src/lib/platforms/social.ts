/**
 * Social platform definitions.
 */

import type { Platform } from "../types";
import { basicDetect, looksLikeProfile } from "../helpers";

export const SOCIAL_PLATFORMS: Platform[] = [
  {
    id: "instagram",
    name: "Instagram",
    category: "Social",
    iconSlug: "instagram",
    color: "E1306C",
    url: (u) => `https://www.instagram.com/${u}/`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        if (/Sorry, this page isn't available/i.test(body)) return "not_found";
        return looksLikeProfile(body);
      }
      return "unknown";
    },
  },
  {
    id: "tiktok",
    name: "TikTok",
    category: "Social",
    iconSlug: "tiktok",
    color: "010101",
    url: (u) => `https://www.tiktok.com/@${u}`,
    detect: ({ status, body }) =>
      basicDetect(status, body, /couldn't find this account/i),
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    category: "Social",
    iconSlug: "x",
    color: "000000",
    url: (u) => `https://x.com/${u}`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        if (/User suspended/i.test(body)) return "not_found";
        if (/This account doesn/i.test(body)) return "not_found";
        return looksLikeProfile(body);
      }
      return "unknown";
    },
  },
  {
    id: "facebook",
    name: "Facebook",
    category: "Social",
    iconSlug: "facebook",
    color: "1877F2",
    url: (u) => `https://www.facebook.com/${u}`,
    detect: ({ status }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) return "found";
      return "unknown";
    },
  },
  {
    id: "snapchat",
    name: "Snapchat",
    category: "Social",
    iconSlug: "snapchat",
    color: "FFFC00",
    url: (u) => `https://www.snapchat.com/add/${u}`,
    detect: ({ status, body }) => basicDetect(status, body, /Page Not Found/i),
  },
  {
    id: "threads",
    name: "Threads",
    category: "Social",
    iconSlug: "threads",
    color: "000000",
    url: (u) => `https://www.threads.net/@${u}`,
    detect: ({ status, body }) =>
      basicDetect(status, body, /Sorry, this page isn/i),
  },
  {
    id: "tumblr",
    name: "Tumblr",
    category: "Social",
    iconSlug: "tumblr",
    color: "36465D",
    url: (u) => `https://${u}.tumblr.com`,
    detect: ({ status, body }) => basicDetect(status, body, /Nothing here/i),
  },
  {
    id: "mastodon",
    name: "Mastodon (mastodon.social)",
    category: "Social",
    iconSlug: "mastodon",
    color: "6364FF",
    url: (u) => `https://mastodon.social/@${u}`,
    detect: ({ status }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) return "found";
      return "unknown";
    },
  },
  {
    id: "bluesky",
    name: "Bluesky",
    category: "Social",
    iconSlug: "bluesky",
    color: "0285FF",
    url: (u) => `https://bsky.app/profile/${u}.bsky.social`,
    detect: ({ status }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) return "found";
      return "unknown";
    },
  },
  {
    id: "vk",
    name: "VK",
    category: "Social",
    iconSlug: "vk",
    color: "0077FF",
    url: (u) => `https://vk.com/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "weibo",
    name: "Weibo",
    category: "Social",
    iconSlug: "weibo",
    color: "E6162D",
    url: (u) => `https://weibo.com/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "bilibili",
    name: "Bilibili",
    category: "Social",
    iconSlug: "bilibili",
    color: "00A1D6",
    url: (u) => `https://space.bilibili.com/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "clubhouse",
    name: "Clubhouse",
    category: "Social",
    iconSlug: "clubhouse",
    color: "6515DD",
    url: (u) => `https://www.clubhouse.com/@${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "producthunt",
    name: "Product Hunt",
    category: "Social",
    iconSlug: "producthunt",
    color: "DA552F",
    url: (u) => `https://www.producthunt.com/@${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "aboutme",
    name: "about.me",
    category: "Social",
    iconSlug: "aboutme",
    color: "000000",
    url: (u) => `https://about.me/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "linktree",
    name: "Linktree",
    category: "Social",
    iconSlug: "linktree",
    color: "43E660",
    url: (u) => `https://linktr.ee/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
];