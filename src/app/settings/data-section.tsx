"use client";

import { Database, Trash2, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DataSection({
  onClearHistory,
  onResetSettings,
  onExport,
}: {
  onClearHistory: () => void;
  onResetSettings: () => void;
  onExport: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Data Management</h3>
          </div>
          <div className="space-y-2">
            <Button variant="outline" size="sm" onClick={onExport} className="w-full">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export All Data
            </Button>
            <Button variant="outline" size="sm" onClick={onClearHistory} className="w-full">
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Clear Search History
            </Button>
            <Button variant="destructive" size="sm" onClick={onResetSettings} className="w-full">
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Reset All Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
