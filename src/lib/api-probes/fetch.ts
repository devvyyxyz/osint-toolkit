/**
 * Shared fetch utility for API probes.
 */

const API_HEADERS: Record<string, string> = {
  "User-Agent": "UsernameFinder/1.0 (+https://github.com/username-finder)",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
};

export async function fetchJson(
  url: string,
  timeoutMs = 8000,
): Promise<{ status: number; data: unknown }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: API_HEADERS,
      redirect: "follow",
      signal: controller.signal,
    });
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      // Some error responses aren't JSON
    }
    return { status: res.status, data };
  } finally {
    clearTimeout(timeout);
  }
}
