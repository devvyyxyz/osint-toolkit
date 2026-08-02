/**
 * Music platform definitions.
 */

import type { Platform } from "../types";
import { basicDetect } from "./helpers";

export const MUSIC_PLATFORMS: Platform[] = [
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
];
