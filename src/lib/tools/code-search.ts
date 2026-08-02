/**
 * Code search — searches GitHub repositories by query.
 */

export async function codeSearch(query: string) {
  const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=10`, {
    headers: { "User-Agent": "OSINT-Toolkit/1.0", Accept: "application/vnd.github.v3+json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
  const data = await res.json() as { total_count: number; items: Array<Record<string, unknown>> };

  return {
    query,
    totalCount: data.total_count,
    results: (data.items || []).map((item) => ({
      name: item.full_name,
      url: item.html_url,
      description: item.description,
      stars: item.stargazers_count,
      language: item.language,
      forks: item.forks_count,
      updatedAt: item.updated_at,
    })),
  };
}
