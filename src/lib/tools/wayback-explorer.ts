/**
 * Wayback Machine explorer — queries the Wayback CDX API for snapshots.
 */

export async function waybackExplorer(url: string) {
  const encoded = encodeURIComponent(url);
  const res = await fetch(
    `https://web.archive.org/cdx/search/cdx?url=${encoded}&output=json&limit=20&fl=timestamp,original,statuscode,mimetype`,
    { signal: AbortSignal.timeout(10000) },
  );
  if (!res.ok) throw new Error(`Wayback API returned ${res.status}`);
  const data = await res.json() as unknown[][];
  if (data.length < 2) return { url, snapshots: [], total: 0 };

  const snapshots = data.slice(1).map((row) => ({
    timestamp: row[0] as string,
    original: row[1] as string,
    status: row[2] as string,
    mimeType: row[3] as string,
    formatted: `${(row[0] as string).slice(0, 4)}-${(row[0] as string).slice(4, 6)}-${(row[0] as string).slice(6, 8)}`,
    archiveUrl: `https://web.archive.org/web/${row[0]}/${row[1]}`,
  }));

  return { url, snapshots, total: snapshots.length };
}
