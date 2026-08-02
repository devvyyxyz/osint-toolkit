/**
 * Dating, money, and lifestyle platform definitions.
 */

import type { Platform } from "../types";
import { basicDetect } from "./helpers";

export const LIFESTYLE_PLATFORMS: Platform[] = [
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
