import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query") ?? "";
  if (!query.trim()) return NextResponse.json({ error: "Missing query" }, { status: 400 });
  
  const encoded = encodeURIComponent(query);
  const sources = [
    { name: "Wayback Machine", url: `https://web.archive.org/web/*/${encoded}` },
    { name: "Google Cache", url: `https://webcache.googleusercontent.com/search?q=cache:${encoded}` },
    { name: "CachedView", url: `https://cachedview.nl/search/?q=${encoded}` },
    { name: "Archive.today", url: `https://archive.ph/${encoded}` },
  ];
  return NextResponse.json({ query, sources });
}
