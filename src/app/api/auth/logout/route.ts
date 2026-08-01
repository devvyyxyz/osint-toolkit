import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const response = NextResponse.redirect(new URL("/?auth=logout", "http://localhost:3000"));
  response.cookies.delete("osint-session");
  return response;
}
