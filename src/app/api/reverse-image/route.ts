import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url") ?? "";
  if (!url) return NextResponse.json({ error: "Provide an image URL" }, { status: 400 });
  
  // Compute hash of the image for identification
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Failed to fetch image: HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    const { createHash } = await import("node:crypto");
    const hash = createHash("sha256").update(Buffer.from(buf)).digest("hex");
    
    return NextResponse.json({
      url, hash: hash.substring(0, 32),
      size: buf.byteLength,
      contentType: res.headers.get("content-type"),
      searchUrls: [
        `https://www.google.com/searchbyimage?image_url=${encodeURIComponent(url)}`,
        `https://tineye.com/search/?url=${encodeURIComponent(url)}`,
        `https://www.bing.com/images/search?q=imgurl:${encodeURIComponent(url)}&view=detailv2`,
      ],
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
