import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get("osint-session");

  if (!sessionCookie) {
    return NextResponse.json({ loggedIn: false, user: null });
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    return NextResponse.json({ loggedIn: true, user: session });
  } catch {
    return NextResponse.json({ loggedIn: false, user: null });
  }
}
