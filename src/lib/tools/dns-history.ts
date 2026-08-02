/**
 * DNS history — queries Google DNS-over-HTTPS for current records and
 * Wayback for the domain's first-seen timestamp.
 */

export async function dnsHistory(domain: string) {
  const current: Record<string, string[]> = {};
  const types = ["A", "AAAA", "MX", "NS", "TXT"];

  for (const type of types) {
    try {
      const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`, {
        headers: { Accept: "application/dns-json" },
        signal: AbortSignal.timeout(5000),
      });
      const data = await res.json();
      const answers = (data.Answer || []).map((a: { data: string }) => a.data);
      current[type] = answers;
    } catch { current[type] = []; }
  }

  // Get Wayback snapshots to show when the domain was first/last seen
  const waybackRes = await fetch(
    `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain)}&output=json&limit=1&fl=timestamp`,
    { signal: AbortSignal.timeout(5000) },
  ).catch(() => null);
  let firstSeen: string | null = null;
  if (waybackRes?.ok) {
    const data = await waybackRes.json() as unknown[][];
    if (data.length > 1) firstSeen = data[1][0] as string;
  }

  return { domain, current, firstSeen };
}
