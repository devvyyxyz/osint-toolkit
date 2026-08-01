import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Username Finder — Find a handle across the social web",
  description:
    "Type any @username and instantly probe 95+ social platforms (Instagram, TikTok, X, Snapchat, GitHub, Discord, Telegram, etc.) to see where accounts with that name exist.",
  keywords: [
    "username search",
    "osint",
    "social media",
    "username checker",
    "username finder",
    "Sherlock",
    "WhatsMyName",
  ],
  authors: [{ name: "Username Finder" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Username Finder",
    description:
      "Probe 95+ social platforms in parallel for any @username.",
    siteName: "Username Finder",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Username Finder",
    description:
      "Probe 95+ social platforms in parallel for any @username.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
