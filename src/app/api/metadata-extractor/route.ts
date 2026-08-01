import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url") ?? "";
  if (!url) return NextResponse.json({ error: "Provide an image or file URL" }, { status: 400 });
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Failed to fetch: HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => { headers[k] = v; });
    
    // Basic metadata extraction from buffer
    const metadata: Record<string, unknown> = {
      url, size: buf.byteLength, sizeKB: (buf.byteLength / 1024).toFixed(2),
      contentType: headers["content-type"] || "unknown",
      lastModified: headers["last-modified"] || null,
      etag: headers["etag"] || null,
    };
    
    // Check for EXIF marker (JPEG)
    const bytes = new Uint8Array(buf);
    if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
      metadata.hasExif = true;
      metadata.format = "JPEG";
    } else if (bytes[0] === 0x89 && bytes[1] === 0x50) {
      metadata.format = "PNG";
      metadata.hasExif = false;
    } else if (bytes[0] === 0x47 && bytes[1] === 0x49) {
      metadata.format = "GIF";
      metadata.hasExif = false;
    }
    
    return NextResponse.json(metadata);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
