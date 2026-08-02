"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  AtSign,
  ChevronLeft,
  Github,
  Grid2x2Plus,
} from "lucide-react";

export function AuthPage() {
  const handleDiscordLogin = () => {
    window.location.href = "/api/auth/discord";
  };

  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
      <div className="bg-muted/60 relative hidden h-full flex-col border-r p-10 lg:flex">
        <div className="from-background absolute inset-0 z-10 bg-gradient-to-t to-transparent" />
        <div className="z-10 flex items-center gap-2">
          <img src="/logo.svg" alt="OSINT Toolkit" className="size-8" />
          <p className="text-xl font-semibold">OSINT Toolkit</p>
        </div>
        <div className="z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl">
              &ldquo;This Platform has helped me to save time and serve my
              clients faster than ever before.&rdquo;
            </p>
            <footer className="font-mono text-sm font-semibold">
              ~ Ali Hassan
            </footer>
          </blockquote>
        </div>
      </div>
      <div className="relative flex min-h-screen flex-col justify-center p-4">
        <div
          aria-hidden
          className="absolute inset-0 isolate contain-strict -z-10 opacity-60"
        >
          <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 [translate:5%_-50%] rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full" />
        </div>
        <Button variant="ghost" className="absolute top-7 left-5" asChild>
          <a href="/">
            <ChevronLeft className="size-4 me-2" />
            Home
          </a>
        </Button>
        <div className="mx-auto space-y-4 sm:w-sm">
          <div className="flex items-center gap-2 lg:hidden">
            <img src="/logo.svg" alt="OSINT Toolkit" className="size-8" />
            <p className="text-xl font-semibold">OSINT Toolkit</p>
          </div>
          <div className="flex flex-col space-y-1">
            <h1 className="font-heading text-2xl font-bold tracking-wide">
              Sign In or Join Now!
            </h1>
            <p className="text-muted-foreground text-base">
              Login with Discord to access all features
            </p>
          </div>
          <div className="space-y-2">
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={handleDiscordLogin}
            >
              <MessageSquare className="size-4 me-2" />
              Continue with Discord
            </Button>
          </div>

          <AuthSeparator />

          <form className="space-y-2">
            <p className="text-muted-foreground text-start text-xs">
              Or browse as guest without authentication
            </p>
            <Button type="button" variant="outline" className="w-full" asChild>
              <a href="/">
                Continue as Guest
              </a>
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

const AuthSeparator = () => {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="bg-border h-px w-full" />
      <span className="text-muted-foreground px-2 text-xs">OR</span>
      <div className="bg-border h-px w-full" />
    </div>
  );
};
