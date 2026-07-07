/**
 * Platform registry for username search.
 *
 * Each platform defines:
 *  - id, name, category, color, icon (emoji) for display
 *  - url: function that builds the profile URL from a username
 *  - detect: function that inspects { status, body, url } and returns
 *            'found' | 'not_found' | 'unknown'
 *
 * Detection heuristics are intentionally tolerant: social platforms
 * constantly change their responses, so we treat ambiguous signals
 * (200 + body length, 403, 429) as 'unknown' rather than guessing.
 */

export type DetectionResult = "found" | "not_found" | "unknown";

export interface PlatformProbe {
  status: number;
  body: string;
  finalUrl: string;
}

export interface Platform {
  id: string;
  name: string;
  category: "Social" | "Media" | "Dev" | "Creative" | "Messaging" | "Forum" | "Gaming" | "Music";
  color: string;
  icon: string;
  url: (username: string) => string;
  detect: (probe: PlatformProbe) => DetectionResult;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export const SEARCH_HEADERS: Record<string, string> = {
  "User-Agent": UA,
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

/** A 200 response with substantial HTML usually means the profile page loaded. */
function looksLikeProfile(body: string, mustContain?: RegExp): DetectionResult {
  if (!body) return "unknown";
  if (mustContain && mustContain.test(body)) return "found";
  if (body.length > 1500) return "found";
  return "unknown";
}

/* ------------------------------------------------------------------ */
/*  Platform list                                                      */
/* ------------------------------------------------------------------ */

export const PLATFORMS: Platform[] = [
  /* ------------------ Social ------------------ */
  {
    id: "instagram",
    name: "Instagram",
    category: "Social",
    color: "#E1306C",
    icon: "📷",
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
    color: "#010101",
    icon: "🎵",
    url: (u) => `https://www.tiktok.com/@${u}`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        if (/couldn't find this account/i.test(body)) return "not_found";
        return looksLikeProfile(body);
      }
      return "unknown";
    },
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    category: "Social",
    color: "#000000",
    icon: "🐦",
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
    color: "#1877F2",
    icon: "👤",
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
    color: "#FFFC00",
    icon: "👻",
    url: (u) => `https://www.snapchat.com/add/${u}`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        if (/Page Not Found/i.test(body)) return "not_found";
        return "found";
      }
      return "unknown";
    },
  },
  {
    id: "threads",
    name: "Threads",
    category: "Social",
    color: "#000000",
    icon: "🧵",
    url: (u) => `https://www.threads.net/@${u}`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        if (/Sorry, this page isn/i.test(body)) return "not_found";
        return looksLikeProfile(body);
      }
      return "unknown";
    },
  },

  /* ------------------ Messaging ------------------ */
  {
    id: "telegram",
    name: "Telegram",
    category: "Messaging",
    color: "#26A5E4",
    icon: "✈️",
    url: (u) => `https://t.me/${u}`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        if (/if this is your/i.test(body)) return "not_found";
        if (/no profile bio/i.test(body)) return "not_found";
        return looksLikeProfile(body, /<meta property="og:title"/i);
      }
      return "unknown";
    },
  },
  {
    id: "whatsapp",
    name: "WhatsApp (Link)",
    category: "Messaging",
    color: "#25D366",
    icon: "💬",
    // WhatsApp uses phone numbers; we expose wa.me/{username} as a deep link
    // the user can click — the link itself "exists" regardless.
    url: (u) => `https://wa.me/${u}`,
    detect: ({ status }) => {
      if (status >= 200 && status < 400) return "found";
      if (status === 404) return "not_found";
      return "unknown";
    },
  },

  /* ------------------ Media ------------------ */
  {
    id: "youtube",
    name: "YouTube",
    category: "Media",
    color: "#FF0000",
    icon: "▶️",
    url: (u) => `https://www.youtube.com/@${u}`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        if (/This channel does not exist/i.test(body)) return "not_found";
        return looksLikeProfile(body);
      }
      return "unknown";
    },
  },
  {
    id: "vimeo",
    name: "Vimeo",
    category: "Media",
    color: "#1AB7EA",
    icon: "🎬",
    url: (u) => `https://vimeo.com/${u}`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        if (/Page not found/i.test(body)) return "not_found";
        return looksLikeProfile(body);
      }
      return "unknown";
    },
  },
  {
    id: "twitch",
    name: "Twitch",
    category: "Media",
    color: "#9146FF",
    icon: "🟣",
    url: (u) => `https://www.twitch.tv/${u}`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        if (/That channel does not exist/i.test(body)) return "not_found";
        return looksLikeProfile(body);
      }
      return "unknown";
    },
  },

  /* ------------------ Dev ------------------ */
  {
    id: "github",
    name: "GitHub",
    category: "Dev",
    color: "#181717",
    icon: "🐙",
    url: (u) => `https://www.github.com/${u}`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        return looksLikeProfile(body, /<meta name="user-login"/i);
      }
      return "unknown";
    },
  },
  {
    id: "gitlab",
    name: "GitLab",
    category: "Dev",
    color: "#FC6D26",
    icon: "🦊",
    url: (u) => `https://gitlab.com/${u}`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        if (/404 File Not Found/i.test(body)) return "not_found";
        return looksLikeProfile(body);
      }
      return "unknown";
    },
  },
  {
    id: "stackoverflow",
    name: "Stack Overflow",
    category: "Dev",
    color: "#F48024",
    icon: "📚",
    url: (u) => `https://stackoverflow.com/users/${u}`,
    detect: ({ status }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) return "found";
      return "unknown";
    },
  },
  {
    id: "hackernews",
    name: "Hacker News",
    category: "Dev",
    color: "#FF6600",
    icon: "📰",
    url: (u) => `https://news.ycombinator.com/user?id=${u}`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        if (/No such user/i.test(body)) return "not_found";
        return looksLikeProfile(body, /<td class="topcolor"/i);
      }
      return "unknown";
    },
  },
  {
    id: "devto",
    name: "Dev.to",
    category: "Dev",
    color: "#0A0A0A",
    icon: "✍️",
    url: (u) => `https://dev.to/${u}`,
    detect: ({ status }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) return "found";
      return "unknown";
    },
  },

  /* ------------------ Forum ------------------ */
  {
    id: "reddit",
    name: "Reddit",
    category: "Forum",
    color: "#FF4500",
    icon: "👽",
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
    color: "#B92B27",
    icon: "❓",
    url: (u) => `https://www.quora.com/profile/${u}`,
    detect: ({ status }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) return "found";
      return "unknown";
    },
  },
  {
    id: "medium",
    name: "Medium",
    category: "Forum",
    color: "#000000",
    icon: "📝",
    url: (u) => `https://medium.com/@${u}`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        if (/Page not found/i.test(body)) return "not_found";
        return looksLikeProfile(body);
      }
      return "unknown";
    },
  },

  /* ------------------ Creative ------------------ */
  {
    id: "pinterest",
    name: "Pinterest",
    category: "Creative",
    color: "#E60023",
    icon: "📌",
    url: (u) => `https://www.pinterest.com/${u}/`,
    detect: ({ status }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) return "found";
      return "unknown";
    },
  },
  {
    id: "behance",
    name: "Behance",
    category: "Creative",
    color: "#1769FF",
    icon: "🎨",
    url: (u) => `https://www.behance.net/${u}`,
    detect: ({ status }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) return "found";
      return "unknown";
    },
  },
  {
    id: "dribbble",
    name: "Dribbble",
    category: "Creative",
    color: "#EA4C89",
    icon: "🏀",
    url: (u) => `https://dribbble.com/${u}`,
    detect: ({ status }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) return "found";
      return "unknown";
    },
  },
  {
    id: "deviantart",
    name: "DeviantArt",
    category: "Creative",
    color: "#05CC47",
    icon: "🖼️",
    url: (u) => `https://www.deviantart.com/${u}`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        if (/Page not found/i.test(body)) return "not_found";
        return looksLikeProfile(body);
      }
      return "unknown";
    },
  },
  {
    id: "patreon",
    name: "Patreon",
    category: "Creative",
    color: "#F96854",
    icon: "💎",
    url: (u) => `https://www.patreon.com/${u}`,
    detect: ({ status }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) return "found";
      return "unknown";
    },
  },

  /* ------------------ Music ------------------ */
  {
    id: "soundcloud",
    name: "SoundCloud",
    category: "Music",
    color: "#FF5500",
    icon: "☁️",
    url: (u) => `https://soundcloud.com/${u}`,
    detect: ({ status }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) return "found";
      return "unknown";
    },
  },
  {
    id: "spotify",
    name: "Spotify",
    category: "Music",
    color: "#1DB954",
    icon: "🎧",
    url: (u) => `https://open.spotify.com/user/${u}`,
    detect: ({ status }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) return "found";
      return "unknown";
    },
  },
  {
    id: "bandcamp",
    name: "Bandcamp",
    category: "Music",
    color: "#629AA9",
    icon: "💿",
    url: (u) => `https://${u}.bandcamp.com`,
    detect: ({ status }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) return "found";
      return "unknown";
    },
  },
  {
    id: "mixcloud",
    name: "Mixcloud",
    category: "Music",
    color: "#5000FF",
    icon: "🎚️",
    url: (u) => `https://www.mixcloud.com/${u}/`,
    detect: ({ status }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) return "found";
      return "unknown";
    },
  },

  /* ------------------ Gaming ------------------ */
  {
    id: "steam",
    name: "Steam",
    category: "Gaming",
    color: "#1B2838",
    icon: "🎮",
    url: (u) => `https://steamcommunity.com/id/${u}`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        if (/profile could not be found/i.test(body)) return "not_found";
        return looksLikeProfile(body);
      }
      return "unknown";
    },
  },
  {
    id: "roblox",
    name: "Roblox",
    category: "Gaming",
    color: "#E2231A",
    icon: "🟥",
    url: (u) => `https://www.roblox.com/user.aspx?username=${u}`,
    detect: ({ status }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) return "found";
      return "unknown";
    },
  },

  /* ------------------ Other ------------------ */
  {
    id: "keybase",
    name: "Keybase",
    category: "Dev",
    color: "#33A0FF",
    icon: "🔑",
    url: (u) => `https://keybase.io/${u}`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        if (/not on keybase/i.test(body)) return "not_found";
        return looksLikeProfile(body);
      }
      return "unknown";
    },
  },
  {
    id: "aboutme",
    name: "about.me",
    category: "Social",
    color: "#000000",
    icon: "🪪",
    url: (u) => `https://about.me/${u}`,
    detect: ({ status }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) return "found";
      return "unknown";
    },
  },
  {
    id: "tumblr",
    name: "Tumblr",
    category: "Social",
    color: "#36465D",
    icon: "📰",
    url: (u) => `https://${u}.tumblr.com`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        if (/Nothing here/i.test(body)) return "not_found";
        return looksLikeProfile(body);
      }
      return "unknown";
    },
  },
  {
    id: "producthunt",
    name: "Product Hunt",
    category: "Social",
    color: "#DA552F",
    icon: "🦄",
    url: (u) => `https://www.producthunt.com/@${u}`,
    detect: ({ status }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) return "found";
      return "unknown";
    },
  },
];

/** Quick lookup used by the API route. */
export const PLATFORM_MAP: Record<string, Platform> = Object.fromEntries(
  PLATFORMS.map((p) => [p.id, p]),
);
