"use client";

import { Clock, Zap, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function PerformanceSection({
  cacheTtl,
  timeout,
  onCacheTtlChange,
  onTimeoutChange,
  onSave,
}: {
  cacheTtl: number;
  timeout: number;
  onCacheTtlChange: (v: number) => void;
  onTimeoutChange: (v: number) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Cache & Timeouts</h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cache-ttl">Cache TTL (minutes)</Label>
            <Input id="cache-ttl" type="number" value={cacheTtl} onChange={(e) => onCacheTtlChange(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeout">Request Timeout (seconds)</Label>
            <Input id="timeout" type="number" value={timeout} onChange={(e) => onTimeoutChange(Number(e.target.value))} />
          </div>
          <Button onClick={onSave} size="sm">Save Performance Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
