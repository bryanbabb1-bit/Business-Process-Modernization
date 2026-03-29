"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Info } from "lucide-react";

interface ConfigValue {
  key: string;
  label: string;
  description: string;
  type: string;
  defaultValue: string;
  required: boolean;
}

interface ConfigEditorProps {
  configValues: ConfigValue[];
}

export function ConfigEditor({ configValues }: ConfigEditorProps) {
  if (configValues.length === 0) return null;

  const typeColors: Record<string, string> = {
    string: "bg-blue-100 text-blue-800",
    path: "bg-green-100 text-green-800",
    url: "bg-purple-100 text-purple-800",
    number: "bg-amber-100 text-amber-800",
    boolean: "bg-rose-100 text-rose-800",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configuration Values
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          These values need to be filled in before deploying. They&apos;re saved
          in the package&apos;s <code className="font-mono">config.json</code>.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {configValues.map((cv) => (
            <div
              key={cv.key}
              className="rounded-lg border p-3 space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono font-semibold">
                    {cv.key}
                  </code>
                  <Badge
                    className={`text-[9px] h-4 ${
                      typeColors[cv.type] || typeColors.string
                    }`}
                  >
                    {cv.type}
                  </Badge>
                  {cv.required && (
                    <Badge className="text-[9px] h-4 bg-red-100 text-red-700">
                      required
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{cv.label}</p>
              <div className="flex items-start gap-1 text-[10px] text-muted-foreground">
                <Info className="h-2.5 w-2.5 mt-0.5 shrink-0" />
                <span>{cv.description}</span>
              </div>
              {cv.defaultValue && (
                <p className="text-[10px] text-muted-foreground">
                  Default:{" "}
                  <code className="font-mono bg-muted px-1 rounded">
                    {cv.defaultValue}
                  </code>
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
