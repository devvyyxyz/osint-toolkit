/**
 * Gaming platform definitions.
 */

import type { Platform } from "../types";
import { basicDetect } from "../helpers";

export const GAMING_PLATFORMS: Platform[] = [
  {
    id: "steam",
    name: "Steam",
    category: "Gaming",
    iconSlug: "steam",
    color: "1B2838",
    url: (u) => `https://steamcommunity.com/id/${u}`,
    detect: ({ status, body }) =>
      basicDetect(status, body, /profile could not be found/i),
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
];
