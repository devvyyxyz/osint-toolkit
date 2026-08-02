/**
 * Tech detector — fetches a URL and fingerprints the technology stack.
 */

export async function techDetector(url: string) {
  const normalized = url.startsWith("http") ? url : `https://${url}`;
  const res = await fetch(normalized, {
    headers: { "User-Agent": "Mozilla/5.0 (OSINT-Toolkit/1.0)" },
    signal: AbortSignal.timeout(8000),
    redirect: "follow",
  });
  const headers: Record<string, string> = {};
  res.headers.forEach((v, k) => { headers[k] = v; });
  const body = await res.text();
  const bodyLower = body.toLowerCase();

  const tech: Array<{ name: string; category: string; confidence: string }> = [];
  const h = headers;

  if (h["server"]?.includes("nginx")) tech.push({ name: "Nginx", category: "Web Server", confidence: "high" });
  if (h["server"]?.includes("apache")) tech.push({ name: "Apache", category: "Web Server", confidence: "high" });
  if (h["server"]?.includes("cloudflare")) tech.push({ name: "Cloudflare", category: "CDN", confidence: "high" });
  if (h["x-powered-by"]?.includes("express")) tech.push({ name: "Express.js", category: "Framework", confidence: "high" });
  if (h["x-powered-by"]?.includes("php")) tech.push({ name: "PHP", category: "Language", confidence: "high" });
  if (h["x-vercel-id"]) tech.push({ name: "Vercel", category: "Hosting", confidence: "high" });
  if (h["cf-ray"]) tech.push({ name: "Cloudflare", category: "CDN", confidence: "high" });
  if (bodyLower.includes("_next/static")) tech.push({ name: "Next.js", category: "Framework", confidence: "high" });
  if (bodyLower.includes("react")) tech.push({ name: "React", category: "JS Library", confidence: "medium" });
  if (bodyLower.includes("vue")) tech.push({ name: "Vue.js", category: "Framework", confidence: "medium" });
  if (bodyLower.includes("angular")) tech.push({ name: "Angular", category: "Framework", confidence: "medium" });
  if (bodyLower.includes("wordpress") || bodyLower.includes("wp-content")) tech.push({ name: "WordPress", category: "CMS", confidence: "high" });
  if (bodyLower.includes("jquery")) tech.push({ name: "jQuery", category: "JS Library", confidence: "medium" });
  if (bodyLower.includes("bootstrap")) tech.push({ name: "Bootstrap", category: "CSS", confidence: "medium" });
  if (bodyLower.includes("tailwind")) tech.push({ name: "Tailwind CSS", category: "CSS", confidence: "medium" });
  if (bodyLower.includes("google-analytics")) tech.push({ name: "Google Analytics", category: "Analytics", confidence: "high" });

  return { url: normalized, finalUrl: res.url, technologies: tech, headers };
}
