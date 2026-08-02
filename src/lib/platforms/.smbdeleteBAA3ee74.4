/**
 * Forum and discussion platform definitions.
 */

import type { Platform } from "../types";
import { basicDetect, looksLikeProfile } from "../helpers";

export const FORUM_PLATFORMS: Platform[] = [
  {
    id: "reddit",
    name: "Reddit",
    category: "Forum",
    iconSlug: "reddit",
    color: "FF4500",
    url: (u) => `https://www.reddit.com/user/${u}`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        if (/Nobody has gone by the name/i.test(body)) return "not_found";
        if (/deleted account/i.test(body)) return "not_found";
        return looksLikeProfile(body);
      }
      return "unknown";
    },
  },
  {
    id: "quora",
    name: "Quora",
    category: "Forum",
    iconSlug: "quora",
    color: "B92B27",
    url: (u) => `https://www.quora.com/profile/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "medium",
    name: "Medium",
    category: "Forum",
    iconSlug: "medium",
    color: "000000",
    url: (u) => `https://medium.com/@${u}`,
    detect: ({ status, body }) => basicDetect(status, body, /Page not found/i),
  },
];