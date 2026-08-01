import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `http://localhost:3000/api/auth/callback/discord`;

  if (!clientId) {
    return NextResponse.json(
      { error: "Discord OAuth not configured. Set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET in your .env file." },
      { status: 503 },
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify email",
    prompt: "none",
  });

  return NextResponse.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
}
