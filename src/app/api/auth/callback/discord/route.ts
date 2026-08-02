import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `http://localhost:3000/api/auth/callback/discord`;

  if (!code) {
    return NextResponse.redirect(new URL("/?auth=error", req.url));
  }

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/?auth=not_configured", req.url));
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL("/?auth=token_error", req.url));
    }

    const tokenData = await tokenRes.json();

    // Get user info
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(new URL("/?auth=user_error", req.url));
    }

    const userData = await userRes.json();

    // Create a simple session token (in production, use JWT or signed cookies)
    const session = {
      userId: userData.id,
      username: userData.username,
      discriminator: userData.discriminator,
      avatar: userData.avatar
        ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
        : null,
      email: userData.email || null,
      loggedInAt: Date.now(),
    };

    // Set session cookie (httpOnly, 7 days)
    const response = NextResponse.redirect(new URL("/?auth=success", req.url));
    response.cookies.set("osint-session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (e) {
    return NextResponse.redirect(new URL("/?auth=exception", req.url));
  }
}
