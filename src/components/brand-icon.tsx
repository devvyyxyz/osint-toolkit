"use client";

import * as React from "react";
import {
  // Existing (already in v0)
  siInstagram,
  siTiktok,
  siX,
  siFacebook,
  siSnapchat,
  siThreads,
  siTelegram,
  siWhatsapp,
  siYoutube,
  siVimeo,
  siTwitch,
  siGithub,
  siGitlab,
  siStackoverflow,
  siYcombinator,
  siDevdotto,
  siReddit,
  siQuora,
  siMedium,
  siPinterest,
  siBehance,
  siDribbble,
  siDeviantart,
  siPatreon,
  siSoundcloud,
  siSpotify,
  siBandcamp,
  siMixcloud,
  siSteam,
  siRoblox,
  siKeybase,
  siTumblr,
  siProducthunt,
  siAboutdotme,
  // New — messaging & social
  siDiscord,
  siMastodon,
  siBluesky,
  siSignal,
  siWire,
  siThreema,
  siSession,
  siSlackware,
  siMatrix,
  // New — dev
  siBitbucket,
  siCodeberg,
  siGitea,
  siCodesandbox,
  siReplit,
  siStackexchange,
  siNpm,
  siPypi,
  siDocker,
  siHuggingface,
  // New — Chinese / intl platforms
  siVk,
  siSinaweibo,
  siBilibili,
  // New — reading / writing
  siLetterboxd,
  siGoodreads,
  siWattpad,
  siArchiveofourown,
  // New — music
  siLastdotfm,
  siTidal,
  siDeezer,
  siGenius,
  siDiscogs,
  // New — art / photography
  siPixiv,
  siArtstation,
  siFlickr,
  siUnsplash,
  siImgur,
  si500px,
  // New — video / streaming
  siDailymotion,
  siRumble,
  siKick,
  siStreamlabs,
  // New — dating
  siOkcupid,
  siTinder,
  // New — money
  siPaypal,
  siVenmo,
  siCashapp,
  siGumroad,
  siEtsy,
  siEbay,
  siKofi,
  siBuymeacoffee,
  // New — gaming
  siBattledotnet,
  siEpicgames,
  siGogdotcom,
  siItchdotio,
  // New — anime / tv / film
  siMyanimelist,
  siAnilist,
  siCrunchyroll,
  siImdb,
  siThemoviedatabase,
  siTrakt,
  // New — lifestyle
  siMeetup,
  siUntappd,
  siStrava,
  siRunkeeper,
  siClubhouse,
  siLinktree,
  type SimpleIcon,
} from "simple-icons";

/**
 * Registry mapping our platform IDs (matching platforms.ts) to their
 * Simple Icons data object. Keep this in sync with PLATFORMS in
 * platforms.ts — every platform's `iconSlug` MUST have an entry here.
 */
const ICONS: Record<string, SimpleIcon> = {
  instagram: siInstagram,
  tiktok: siTiktok,
  twitter: siX,
  facebook: siFacebook,
  snapchat: siSnapchat,
  threads: siThreads,
  telegram: siTelegram,
  whatsapp: siWhatsapp,
  youtube: siYoutube,
  vimeo: siVimeo,
  twitch: siTwitch,
  github: siGithub,
  gitlab: siGitlab,
  stackoverflow: siStackoverflow,
  hackernews: siYcombinator,
  devto: siDevdotto,
  reddit: siReddit,
  quora: siQuora,
  medium: siMedium,
  pinterest: siPinterest,
  behance: siBehance,
  dribbble: siDribbble,
  deviantart: siDeviantart,
  patreon: siPatreon,
  soundcloud: siSoundcloud,
  spotify: siSpotify,
  bandcamp: siBandcamp,
  mixcloud: siMixcloud,
  steam: siSteam,
  roblox: siRoblox,
  keybase: siKeybase,
  tumblr: siTumblr,
  producthunt: siProducthunt,
  aboutme: siAboutdotme,

  // New — messaging & social
  discord: siDiscord,
  mastodon: siMastodon,
  bluesky: siBluesky,
  signal: siSignal,
  wire: siWire,
  threema: siThreema,
  session: siSession,
  slack: siSlackware,
  matrix: siMatrix,

  // New — dev
  bitbucket: siBitbucket,
  codeberg: siCodeberg,
  gitea: siGitea,
  codesandbox: siCodesandbox,
  replit: siReplit,
  stackexchange: siStackexchange,
  npm: siNpm,
  pypi: siPypi,
  docker: siDocker,
  huggingface: siHuggingface,

  // New — intl / CN
  vk: siVk,
  weibo: siSinaweibo,
  bilibili: siBilibili,

  // New — reading / writing
  letterboxd: siLetterboxd,
  goodreads: siGoodreads,
  wattpad: siWattpad,
  ao3: siArchiveofourown,

  // New — music
  lastfm: siLastdotfm,
  tidal: siTidal,
  deezer: siDeezer,
  genius: siGenius,
  discogs: siDiscogs,

  // New — art / photo
  pixiv: siPixiv,
  artstation: siArtstation,
  flickr: siFlickr,
  unsplash: siUnsplash,
  imgur: siImgur,
  fivehundredpx: si500px,

  // New — video / streaming
  dailymotion: siDailymotion,
  rumble: siRumble,
  kick: siKick,
  streamlabs: siStreamlabs,

  // New — dating
  okcupid: siOkcupid,
  tinder: siTinder,

  // New — money
  paypal: siPaypal,
  venmo: siVenmo,
  cashapp: siCashapp,
  gumroad: siGumroad,
  etsy: siEtsy,
  ebay: siEbay,
  kofi: siKofi,
  buymeacoffee: siBuymeacoffee,

  // New — gaming
  battlenet: siBattledotnet,
  epicgames: siEpicgames,
  gog: siGogdotcom,
  itch: siItchdotio,

  // New — anime / tv / film
  mal: siMyanimelist,
  anilist: siAnilist,
  crunchyroll: siCrunchyroll,
  imdb: siImdb,
  tmdb: siThemoviedatabase,
  trakt: siTrakt,

  // New — lifestyle
  meetup: siMeetup,
  untappd: siUntappd,
  strava: siStrava,
  runkeeper: siRunkeeper,
  clubhouse: siClubhouse,
  linktree: siLinktree,
};

export interface BrandIconProps {
  slug: string;
  size?: number;
  className?: string;
  /** When true (default) uses the brand's hex color. Otherwise currentColor. */
  colored?: boolean;
}

/**
 * Renders an inline SVG of a brand logo from Simple Icons.
 * Falls back to a generic globe icon when the slug is unknown.
 */
export function BrandIcon({
  slug,
  size = 20,
  className,
  colored = true,
}: BrandIconProps) {
  const icon = ICONS[slug];

  if (!icon) {
    // Generic fallback: a globe outline.
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label={icon.title}
      className={className}
    >
      <path d={icon.path} fill={colored ? `#${icon.hex}` : "currentColor"} />
    </svg>
  );
}

/** Returns the brand hex color (with #) for a given slug, or null. */
export function brandColor(slug: string): string | null {
  const icon = ICONS[slug];
  return icon ? `#${icon.hex}` : null;
}
