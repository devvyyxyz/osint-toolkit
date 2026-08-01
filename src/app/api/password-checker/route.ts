import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  // Redirect to the existing check-password API
  const password = req.nextUrl.searchParams.get("password") ?? "";
  const res = await fetch(`http://localhost:3000/api/check-password?password=${encodeURIComponent(password)}`);
  const data = await res.json();
  return NextResponse.json(data);
}
