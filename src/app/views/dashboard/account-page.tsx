"use client";

import * as React from "react";
import { User, LogOut, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/app/settings-context";

export function AccountPage() {
  const { settings, updateSettings } = useSettings();

  const handleLogout = () => {
    // Clear settings and redirect to login
    updateSettings({ ...settings, onboarded: false });
    window.location.href = "/login";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Guest User</h3>
              <p className="text-sm text-muted-foreground">Not signed in</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" asChild>
            <a href="/login">Sign In with Discord</a>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Search History</p>
              <p className="text-sm text-muted-foreground">Your searches are stored locally</p>
            </div>
            <Button variant="ghost" size="sm">Clear</Button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Watchlist</p>
              <p className="text-sm text-muted-foreground">Manage your monitored items</p>
            </div>
            <Button variant="ghost" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Configure your API keys and tool preferences in the Settings section.
          </p>
        </CardContent>
      </Card>

      <Button variant="destructive" className="w-full" onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}