/**
 * Hashtag tracker — generates links to hashtag pages across platforms.
 */

export function hashtagTracker(tag: string) {
  const cleaned = tag.replace(/^#/, "");
  const platforms = [
    { name: "Instagram", url: `https://www.instagram.com/explore/tags/${cleaned}/` },
    { name: "Twitter/X", url: `https://x.com/search?q=%23${cleaned}` },
    { name: "TikTok", url: `https://www.tiktok.com/tag/${cleaned}` },
    { name: "YouTube", url: `https://www.youtube.com/results?search_query=%23${cleaned}` },
    { name: "LinkedIn", url: `https://www.linkedin.com/search/results/all/?keywords=%23${cleaned}` },
    { name: "Pinterest", url: `https://www.pinterest.com/search/pins/?q=%23${cleaned}` },
    { name: "Reddit", url: `https://www.reddit.com/search/?q=%23${cleaned}` },
    { name: "Tumblr", url: `https://www.tumblr.com/tagged/${cleaned}` },
    { name: "Facebook", url: `https://www.facebook.com/hashtag/${cleaned}` },
  ];
  return { hashtag: `#${cleaned}`, platforms };
}
