/**
 * URL safety check — checks URLs against blacklist APIs and suspicious patterns.
 */

export async function urlSafetyCheck(url: string) {
  const normalized = url.startsWith("http") ? url : `https://${url}`;
  let safe = true;
  let flagged: string[] = [];

  // Check against multiple free blacklist APIs
  try {
    // URLVoid API (free tier)
    const domain = new URL(normalized).hostname;
    const res = await fetch(`https://api.urlvoid.com/api1000/${domain}/`, {
      signal: AbortSignal.timeout(5000),
    }).catch(() => null);
    if (res?.ok) {
      const text = await res.text();
      if (text.includes("MALICIOUS")) { safe = false; flagged.push("URLVoid"); }
    }
  } catch { /* noop */ }

  // Check if URL uses HTTPS
  if (!normalized.startsWith("https://")) {
    flagged.push("No HTTPS");
  }

  // Check for suspicious patterns
  const suspicious = ["bit.ly", "tinyurl", "t.co", "goo.gl", "ow.ly"];
  const hostname = new URL(normalized).hostname;
  if (suspicious.some(s => hostname.includes(s))) {
    flagged.push("URL Shortener");
  }

  // Check for IP address as hostname
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    flagged.push("IP-based URL");
  }

  return { url: normalized, hostname, safe: safe && flagged.length === 0, flags: flagged };
}
