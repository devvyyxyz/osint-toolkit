/**
 * Media, streaming, and video platform definitions.
 */

import type { Platform } from "../types";
import { basicDetect } from "../helpers";

export const MEDIA_PLATFORMS: Platform[] = [
  {
    id: "youtube",
    name: "YouTube",
    category: "Media",
    iconSlug: "youtube",
    color: "FF0000",
    url: (u) => `https://www.youtube.com/@${u}`,
    detect: ({ status, body }) =>
      basicDetect(status, body, /This channel does not exist/i),
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
    detect: ({ status, body }) =>
      basicDetect(status, body, /That channel does not exist/i),
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
];