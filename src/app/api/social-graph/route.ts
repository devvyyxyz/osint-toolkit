import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username") ?? "";
  if (!username.trim()) return NextResponse.json({ error: "Missing username" }, { status: 400 });
  return NextResponse.json({
    username,
    nodes: [{ id: username, label: username, type: "root" }],
    edges: [],
    message: "Social graph mapping requires a full search first. Run a Username Finder search, then return here to see connections.",
  });
}
