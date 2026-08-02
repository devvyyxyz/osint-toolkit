/**
 * Reading, writing, and literary platform definitions.
 */

import type { Platform } from "../types";
import { basicDetect } from "../helpers";

export const READING_PLATFORMS: Platform[] = [
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
];
