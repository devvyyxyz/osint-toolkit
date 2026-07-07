/**
 * Platform registry for username search.
 *
 * Each platform defines:
 *  - id, name, category, iconSlug (Simple Icons slug), color (hex, used for
 *    the icon tile background) for display
 *  - url: function that builds the profile URL from a username
 *  - detect: function that inspects { status, body, url } and returns
 *            'found' | 'not_found' | 'unknown'
 *
 * Detection heuristics are intentionally tolerant: social platforms
 * constantly change their responses, so we treat ambiguous signals
 * (200 + body length, 403, 429) as 'unknown' rather than guessing.
 *
 * Icon slugs map directly to entries in src/components/brand-icon.tsx —
 * every `iconSlug` here MUST have a matching entry in that registry.
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

/** Quick helper for "if 200 -> found, if 404 -> not_found, else unknown". */
function basicDetect(status: number, body: string, notFoundRegex?: RegExp): DetectionResult {
  if (status === 404) return "not_found";
  if (status >= 200 && status < 300) {
    if (notFoundRegex && notFoundRegex.test(body)) return "not_found";
    return looksLikeProfile(body);
  }
  return "unknown";
}

/* ------------------------------------------------------------------ */
/*  Platform list                                                      */
/* ------------------------------------------------------------------ */

export const PLATFORMS: Platform[] = [
  /* ============== Social ============== */
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
    detect: ({ status, body }) => basicDetect(status, body, /couldn't find this account/i),
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
    detect: ({ status, body }) => basicDetect(status, body, /Sorry, this page isn/i),
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

  /* ============== Messaging ============== */
  {
    id: "telegram",
    name: "Telegram",
    category: "Messaging",
    iconSlug: "telegram",
    color: "26A5E4",
    url: (u) => `https://t.me/${u}`,
    detect: ({ status, body }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) {
        if (/if this is your/i.test(body)) return "not_found";
        return looksLikeProfile(body, /<meta property="og:title"/i);
      }
      return "unknown";
    },
  },
  {
    id: "whatsapp",
    name: "WhatsApp (wa.me)",
    category: "Messaging",
    iconSlug: "whatsapp",
    color: "25D366",
    // WhatsApp uses phone numbers — wa.me/{number} deep link.
    url: (u) => `https://wa.me/${u}`,
    detect: ({ status }) => {
      if (status >= 200 && status < 400) return "found";
      if (status === 404) return "not_found";
      return "unknown";
    },
  },
  {
    id: "discord",
    name: "Discord (lookup",
    category: "Messaging",
    iconSlug: "discord",
    color: "5865F2",
    // Discord doesn't expose public profile pages by username — best we can
    // do is a lookup tool. Mark as 'unknown' on any non-404 response so the
    // user can click through to verify manually.
    url: (u) =>
      `https://discordlookup.com/user/${u}`,
    detect: ({ status }) => {
      if (status === 404) return "not_found";
      if (status >= 200 && status < 300) return "found";
      return "unknown";
    },
  },
  {
    id: "signal",
    name: "Signal",
    category: "Messaging",
    iconSlug: "signal",
    color: "3A76F0",
    // Signal usernames look like 'user.123' and resolve via the
    // official sgnl:// link. Web fallback doesn't show a profile,
    // so we always return 'unknown' and let the user click through.
    url: (u) => `https://signal.me/#eu/${u}`,
    detect: () => "unknown",
  },
  {
    id: "wire",
    name: "Wire",
    category: "Messaging",
    iconSlug: "wire",
    color: "000000",
    url: (u) => `https://wire.com/@${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "threema",
    name: "Threema",
    category: "Messaging",
    iconSlug: "threema",
    color: "323232",
    url: (u) => `https://threema.id/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "session",
    name: "Session",
    category: "Privacy",
    iconSlug: "session",
    color: "3362FF",
    // Session IDs are long hex strings; we expose a placeholder URL
    // that the user can replace. The check itself is unknown.
    url: (u) => `https://getsession.org/`,
    detect: () => "unknown",
  },
  {
    id: "matrix",
    name: "Matrix",
    category: "Messaging",
    iconSlug: "matrix",
    color: "000000",
    url: (u) => `https://matrix.to/#/@${u}:matrix.org`,
    detect: () => "unknown",
  },
  {
    id: "slack",
    name: "Slack (community)",
    category: "Messaging",
    iconSlug: "slack",
    color: "4A154B",
    url: (u) => `https://${u}.slack.com`,
    detect: ({ status, body }) => basicDetect(status, body, /workspace not found/i),
  },

  /* ============== Media / Video ============== */
  {
    id: "youtube",
    name: "YouTube",
    category: "Media",
    iconSlug: "youtube",
    color: "FF0000",
    url: (u) => `https://www.youtube.com/@${u}`,
    detect: ({ status, body }) => basicDetect(status, body, /This channel does not exist/i),
  },
  {
    id: "vimeo",
    name: "Vimeo",
    category: "Media",
    iconSlug: "vimeo",
    color: "1AB7EA",
    url: (u) => `https://vimeo.com/${u}`,
    detect: ({ status, body }) => basicDetect(status, body, /Page not found/i),
  },
  {
    id: "twitch",
    name: "Twitch",
    category: "Streaming",
    iconSlug: "twitch",
    color: "9146FF",
    url: (u) => `https://www.twitch.tv/${u}`,
    detect: ({ status, body }) => basicDetect(status, body, /That channel does not exist/i),
  },
  {
    id: "dailymotion",
    name: "Dailymotion",
    category: "Media",
    iconSlug: "dailymotion",
    color: "0066DC",
    url: (u) => `https://www.dailymotion.com/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "rumble",
    name: "Rumble",
    category: "Media",
    iconSlug: "rumble",
    color: "85C742",
    url: (u) => `https://rumble.com/user/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "kick",
    name: "Kick",
    category: "Streaming",
    iconSlug: "kick",
    color: "53FC18",
    url: (u) => `https://kick.com/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "streamlabs",
    name: "Streamlabs",
    category: "Streaming",
    iconSlug: "streamlabs",
    color: "80F5D2",
    url: (u) => `https://streamlabs.com/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },

  /* ============== Dev ============== */
  {
    id: "github",
    name: "GitHub",
    category: "Dev",
    iconSlug: "github",
    color: "181717",
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
    iconSlug: "gitlab",
    color: "FC6D26",
    url: (u) => `https://gitlab.com/${u}`,
    detect: ({ status, body }) => basicDetect(status, body, /404 File Not Found/i),
  },
  {
    id: "bitbucket",
    name: "Bitbucket",
    category: "Dev",
    iconSlug: "bitbucket",
    color: "2684FF",
    url: (u) => `https://bitbucket.org/${u}/`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "codeberg",
    name: "Codeberg",
    category: "Dev",
    iconSlug: "codeberg",
    color: "2185D0",
    url: (u) => `https://codeberg.org/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "gitea",
    name: "Gitea (gitea.com)",
    category: "Dev",
    iconSlug: "gitea",
    color: "609926",
    url: (u) => `https://gitea.com/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "codepen",
    name: "CodePen",
    category: "Dev",
    iconSlug: "codepen",
    color: "000000",
    url: (u) => `https://codepen.io/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "codesandbox",
    name: "CodeSandbox",
    category: "Dev",
    iconSlug: "codesandbox",
    color: "151515",
    url: (u) => `https://codesandbox.io/u/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "replit",
    name: "Replit",
    category: "Dev",
    iconSlug: "replit",
    color: "F26207",
    url: (u) => `https://replit.com/@${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "stackoverflow",
    name: "Stack Overflow",
    category: "Dev",
    iconSlug: "stackoverflow",
    color: "F48024",
    url: (u) => `https://stackoverflow.com/users/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "stackexchange",
    name: "Stack Exchange",
    category: "Dev",
    iconSlug: "stackexchange",
    color: "1F5DB1",
    url: (u) => `https://stackexchange.com/users/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "hackernews",
    name: "Hacker News",
    category: "Dev",
    iconSlug: "hackernews",
    color: "FF6600",
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
    iconSlug: "devto",
    color: "0A0A0A",
    url: (u) => `https://dev.to/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "npm",
    name: "npm",
    category: "Dev",
    iconSlug: "npm",
    color: "CB3837",
    url: (u) => `https://www.npmjs.com/~${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "pypi",
    name: "PyPI",
    category: "Dev",
    iconSlug: "pypi",
    color: "3775A9",
    url: (u) => `https://pypi.org/user/${u}/`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "docker",
    name: "Docker Hub",
    category: "Dev",
    iconSlug: "docker",
    color: "2496ED",
    url: (u) => `https://hub.docker.com/u/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    category: "Dev",
    iconSlug: "huggingface",
    color: "FFD21E",
    url: (u) => `https://huggingface.co/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "keybase",
    name: "Keybase",
    category: "Dev",
    iconSlug: "keybase",
    color: "33A0FF",
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

  /* ============== Forum ============== */
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

  /* ============== Reading / Writing ============== */
  {
    id: "goodreads",
    name: "Goodreads",
    category: "Reading",
    iconSlug: "goodreads",
    color: "372213",
    url: (u) => `https://www.goodreads.com/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "letterboxd",
    name: "Letterboxd",
    category: "Reading",
    iconSlug: "letterboxd",
    color: "00D735",
    url: (u) => `https://letterboxd.com/${u}/`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "wattpad",
    name: "Wattpad",
    category: "Reading",
    iconSlug: "wattpad",
    color: "FF500A",
    url: (u) => `https://www.wattpad.com/user/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "ao3",
    name: "Archive of Our Own",
    category: "Reading",
    iconSlug: "ao3",
    color: "900000",
    url: (u) => `https://archiveofourown.org/users/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },

  /* ============== Creative / Photo ============== */
  {
    id: "pinterest",
    name: "Pinterest",
    category: "Creative",
    iconSlug: "pinterest",
    color: "E60023",
    url: (u) => `https://www.pinterest.com/${u}/`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "behance",
    name: "Behance",
    category: "Creative",
    iconSlug: "behance",
    color: "1769FF",
    url: (u) => `https://www.behance.net/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "dribbble",
    name: "Dribbble",
    category: "Creative",
    iconSlug: "dribbble",
    color: "EA4C89",
    url: (u) => `https://dribbble.com/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "deviantart",
    name: "DeviantArt",
    category: "Creative",
    iconSlug: "deviantart",
    color: "05CC47",
    url: (u) => `https://www.deviantart.com/${u}`,
    detect: ({ status, body }) => basicDetect(status, body, /Page not found/i),
  },
  {
    id: "patreon",
    name: "Patreon",
    category: "Creative",
    iconSlug: "patreon",
    color: "F96854",
    url: (u) => `https://www.patreon.com/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "pixiv",
    name: "Pixiv",
    category: "Creative",
    iconSlug: "pixiv",
    color: "0096FA",
    url: (u) => `https://www.pixiv.net/en/users/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "artstation",
    name: "ArtStation",
    category: "Creative",
    iconSlug: "artstation",
    color: "13AFF0",
    url: (u) => `https://www.artstation.com/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "flickr",
    name: "Flickr",
    category: "Photo",
    iconSlug: "flickr",
    color: "0063DC",
    url: (u) => `https://www.flickr.com/people/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "unsplash",
    name: "Unsplash",
    category: "Photo",
    iconSlug: "unsplash",
    color: "000000",
    url: (u) => `https://unsplash.com/@${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "imgur",
    name: "Imgur",
    category: "Photo",
    iconSlug: "imgur",
    color: "1BB76E",
    url: (u) => `https://imgur.com/user/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "fivehundredpx",
    name: "500px",
    category: "Photo",
    iconSlug: "fivehundredpx",
    color: "0099E5",
    url: (u) => `https://500px.com/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },

  /* ============== Music ============== */
  {
    id: "soundcloud",
    name: "SoundCloud",
    category: "Music",
    iconSlug: "soundcloud",
    color: "FF5500",
    url: (u) => `https://soundcloud.com/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "spotify",
    name: "Spotify",
    category: "Music",
    iconSlug: "spotify",
    color: "1DB954",
    url: (u) => `https://open.spotify.com/user/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "bandcamp",
    name: "Bandcamp",
    category: "Music",
    iconSlug: "bandcamp",
    color: "629AA9",
    url: (u) => `https://${u}.bandcamp.com`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "mixcloud",
    name: "Mixcloud",
    category: "Music",
    iconSlug: "mixcloud",
    color: "5000FF",
    url: (u) => `https://www.mixcloud.com/${u}/`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "lastfm",
    name: "Last.fm",
    category: "Music",
    iconSlug: "lastfm",
    color: "D51007",
    url: (u) => `https://www.last.fm/user/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "tidal",
    name: "TIDAL",
    category: "Music",
    iconSlug: "tidal",
    color: "000000",
    url: (u) => `https://tidal.com/browse/user/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "deezer",
    name: "Deezer",
    category: "Music",
    iconSlug: "deezer",
    color: "A238FF",
    url: (u) => `https://www.deezer.com/profile/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "genius",
    name: "Genius",
    category: "Music",
    iconSlug: "genius",
    color: "FFFF64",
    url: (u) => `https://genius.com/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "discogs",
    name: "Discogs",
    category: "Music",
    iconSlug: "discogs",
    color: "333333",
    url: (u) => `https://www.discogs.com/user/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },

  /* ============== Gaming ============== */
  {
    id: "steam",
    name: "Steam",
    category: "Gaming",
    iconSlug: "steam",
    color: "1B2838",
    url: (u) => `https://steamcommunity.com/id/${u}`,
    detect: ({ status, body }) => basicDetect(status, body, /profile could not be found/i),
  },
  {
    id: "roblox",
    name: "Roblox",
    category: "Gaming",
    iconSlug: "roblox",
    color: "E2231A",
    url: (u) => `https://www.roblox.com/user.aspx?username=${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "battlenet",
    name: "Battle.net",
    category: "Gaming",
    iconSlug: "battlenet",
    color: "148EFF",
    url: (u) => `https://starcraft2.com/profile/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "epicgames",
    name: "Epic Games",
    category: "Gaming",
    iconSlug: "epicgames",
    color: "313131",
    url: (u) => `https://store.epicgames.com/u/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "gog",
    name: "GOG",
    category: "Gaming",
    iconSlug: "gog",
    color: "86328A",
    url: (u) => `https://www.gog.com/u/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "itch",
    name: "itch.io",
    category: "Gaming",
    iconSlug: "itch",
    color: "FA5C5C",
    url: (u) => `https://${u}.itch.io`,
    detect: ({ status }) => basicDetect(status, ""),
  },

  /* ============== Anime / TV / Film ============== */
  {
    id: "mal",
    name: "MyAnimeList",
    category: "Anime",
    iconSlug: "mal",
    color: "2E51A2",
    url: (u) => `https://myanimelist.net/profile/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "anilist",
    name: "AniList",
    category: "Anime",
    iconSlug: "anilist",
    color: "02A9FF",
    url: (u) => `https://anilist.co/user/${u}/`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "crunchyroll",
    name: "Crunchyroll",
    category: "Anime",
    iconSlug: "crunchyroll",
    color: "F47521",
    url: (u) => `https://www.crunchyroll.com/user/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "imdb",
    name: "IMDb",
    category: "Anime",
    iconSlug: "imdb",
    color: "F5C518",
    url: (u) => `https://www.imdb.com/user/${u}/`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "tmdb",
    name: "TMDB",
    category: "Anime",
    iconSlug: "tmdb",
    color: "01B4E4",
    url: (u) => `https://www.themoviedb.org/u/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "trakt",
    name: "Trakt",
    category: "Anime",
    iconSlug: "trakt",
    color: "ED1C24",
    url: (u) => `https://trakt.tv/users/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },

  /* ============== Dating ============== */
  {
    id: "okcupid",
    name: "OkCupid",
    category: "Dating",
    iconSlug: "okcupid",
    color: "0500B8",
    url: (u) => `https://www.okcupid.com/profile/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "tinder",
    name: "Tinder",
    category: "Dating",
    iconSlug: "tinder",
    color: "FF6B6B",
    url: (u) => `https://tinder.com/@${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },

  /* ============== Money ============== */
  {
    id: "paypal",
    name: "PayPal",
    category: "Money",
    iconSlug: "paypal",
    color: "003087",
    url: (u) => `https://www.paypal.com/paypalme/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "venmo",
    name: "Venmo",
    category: "Money",
    iconSlug: "venmo",
    color: "3D95CE",
    url: (u) => `https://venmo.com/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "cashapp",
    name: "Cash App",
    category: "Money",
    iconSlug: "cashapp",
    color: "00D632",
    url: (u) => `https://cash.app/$${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "gumroad",
    name: "Gumroad",
    category: "Money",
    iconSlug: "gumroad",
    color: "FF90E8",
    url: (u) => `https://${u}.gumroad.com`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "etsy",
    name: "Etsy",
    category: "Money",
    iconSlug: "etsy",
    color: "F45800",
    url: (u) => `https://www.etsy.com/shop/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "ebay",
    name: "eBay",
    category: "Money",
    iconSlug: "ebay",
    color: "E53238",
    url: (u) => `https://www.ebay.com/usr/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "kofi",
    name: "Ko-fi",
    category: "Money",
    iconSlug: "kofi",
    color: "FF5E5B",
    url: (u) => `https://ko-fi.com/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "buymeacoffee",
    name: "Buy Me a Coffee",
    category: "Money",
    iconSlug: "buymeacoffee",
    color: "FFDD00",
    url: (u) => `https://www.buymeacoffee.com/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },

  /* ============== Lifestyle ============== */
  {
    id: "meetup",
    name: "Meetup",
    category: "Lifestyle",
    iconSlug: "meetup",
    color: "ED1C40",
    url: (u) => `https://www.meetup.com/members/${u}/`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "untappd",
    name: "Untappd",
    category: "Lifestyle",
    iconSlug: "untappd",
    color: "FFC000",
    url: (u) => `https://untappd.com/user/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "strava",
    name: "Strava",
    category: "Lifestyle",
    iconSlug: "strava",
    color: "FC5200",
    url: (u) => `https://www.strava.com/athletes/${u}`,
    detect: ({ status }) => basicDetect(status, ""),
  },
  {
    id: "runkeeper",
    name: "Runkeeper",
    category: "Lifestyle",
    iconSlug: "runkeeper",
    color: "2DC9D1",
    url: (u) => `https://runkeeper.com/user/${u}/profile`,
    detect: ({ status }) => basicDetect(status, ""),
  },
];

/** Quick lookup used by the API route. */
export const PLATFORM_MAP: Record<string, Platform> = Object.fromEntries(
  PLATFORMS.map((p) => [p.id, p]),
);
