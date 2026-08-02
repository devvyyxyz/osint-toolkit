/**
 * Anime, TV, and film platform definitions.
 */

import type { Platform } from "../types";
import { basicDetect } from "../helpers";

export const ANIME_PLATFORMS: Platform[] = [
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
];
