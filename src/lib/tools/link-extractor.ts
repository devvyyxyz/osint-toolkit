/**
 * Link extractor — fetches a URL and extracts all links from the HTML.
 */

export async function linkExtractor(url: string) {
  const normalized = url.startsWith("http") ? url : `https://${url}`;
  const res = await fetch(normalized, {
    headers: { "User-Agent": "Mozilla/5.0 (OSINT-Toolkit/1.0)" },
    signal: AbortSignal.timeout(10000),
    redirect: "follow",
  });
  const html = await res.text();
  const linkRegex = /href=["']([^"']+)["']/gi;
  const links: string[] = [];
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const resolved = new URL(match[1], normalized).toString();
      links.push(resolved);
    } catch { /* skip invalid */ }
  }
  const unique = [...new Set(links)];

  return {
    url: normalized,
    finalUrl: res.url,
    totalLinks: unique.length,
    links: unique.slice(0, 50),
    internal: unique.filter(l => l.includes(new URL(normalized).hostname)),
    external: unique.filter(l => !l.includes(new URL(normalized).hostname)),
  };
}
