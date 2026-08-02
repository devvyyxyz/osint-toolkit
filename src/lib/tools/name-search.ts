/**
 * Name search tool — searches across multiple free people-search sources.
 */

export async function nameSearch(name: string) {
  const results: Array<{ source: string; url: string; type: string }> = [];

  const encoded = encodeURIComponent(name);
  results.push({ source: "Google", url: `https://www.google.com/search?q="${encoded}"`, type: "Search" });
  results.push({ source: "LinkedIn", url: `https://www.linkedin.com/search/results/people/?keywords=${encoded}`, type: "Professional" });
  results.push({ source: "Facebook", url: `https://www.facebook.com/search/people/?q=${encoded}`, type: "Social" });
  results.push({ source: "Whitepages", url: `https://www.whitepages.com/name/${encoded.replace(/\s+/g, "-")}`, type: "Public Records" });
  results.push({ source: "TruePeopleSearch", url: `https://www.truepeoplesearch.com/results?name=${encoded}`, type: "People Search" });
  results.push({ source: "BeenVerified", url: `https://www.beenverified.com/people/${encoded.replace(/\s+/g, "-")}`, type: "Background Check" });

  return { name, results };
}
