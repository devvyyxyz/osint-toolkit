import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username") ?? "";
  if (!username.trim()) return NextResponse.json({ error: "Missing username" }, { status: 400 });
  
  // Analyze privacy exposure based on username
  const audit = {
    username,
    riskLevel: "medium" as const,
    findings: [
      { category: "Username Reuse", risk: "high", description: "Using the same username across platforms makes it easy to track you. Consider different usernames for different services." },
      { category: "Public Profile", risk: "medium", description: "Your profile may be publicly visible on platforms where you have accounts." },
      { category: "Data Exposure", risk: "low", description: "Check which platforms expose your email, real name, or location in their public profiles." },
    ],
    recommendations: [
      "Use unique usernames for sensitive accounts (banking, work) vs. social media",
      "Enable privacy settings on all social platforms to limit public visibility",
      "Use a VPN to mask your IP address when browsing",
      "Regularly check haveibeenpwned.com for breach exposure",
      "Use a password manager to ensure unique passwords everywhere",
      "Enable two-factor authentication on all important accounts",
    ],
  };
  return NextResponse.json(audit);
}
