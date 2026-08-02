"use client";

import { Key, ShieldCheck, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ApiKeysSection({
  hibpApiKey,
  onHibpApiKeyChange,
  onSave,
}: {
  hibpApiKey: string;
  onHibpApiKeyChange: (v: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Have I Been Pwned API Key</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Required for account breach lookups. Get a free key at{" "}
            <a
              href="https://haveibeenpwned.com/API/Key"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              haveibeenpwned.com/API/Key
            </a>
          </p>
          <div className="space-y-2">
            <Label htmlFor="hibp-key">HIBP API Key</Label>
            <Input
              id="hibp-key"
              type="password"
              value={hibpApiKey}
              onChange={(e) => onHibpApiKeyChange(e.target.value)}
              placeholder="Enter your API key"
              autoComplete="off"
            />
          </div>
          <Button onClick={onSave} size="sm">Save API Key</Button>
        </CardContent>
      </Card>
    </div>
  );
}
