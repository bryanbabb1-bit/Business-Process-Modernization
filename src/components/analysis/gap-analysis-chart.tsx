"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { GapItem } from "@/types";

const severityColors: Record<string, string> = {
  critical: "text-red-600 border-red-300 bg-red-50",
  high: "text-orange-600 border-orange-300 bg-orange-50",
  medium: "text-amber-600 border-amber-300 bg-amber-50",
  low: "text-green-600 border-green-300 bg-green-50",
};

interface GapAnalysisChartProps {
  gaps: GapItem[];
}

export function GapAnalysisChart({ gaps }: GapAnalysisChartProps) {
  // Sort by severity: critical > high > medium > low
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...gaps].sort(
    (a, b) =>
      (severityOrder[a.gapSeverity] ?? 4) -
      (severityOrder[b.gapSeverity] ?? 4)
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Gap Analysis{" "}
          <span className="font-normal text-muted-foreground">
            ({gaps.length} gaps identified)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sorted.map((gap) => (
          <div
            key={gap.area}
            className="rounded-lg border p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{gap.area}</h4>
              <Badge
                variant="outline"
                className={severityColors[gap.gapSeverity] || ""}
              >
                {gap.gapSeverity}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="mb-1 font-medium text-muted-foreground">
                  Current State
                </p>
                <p>{gap.currentState}</p>
              </div>
              <div>
                <p className="mb-1 font-medium text-muted-foreground">
                  Desired State
                </p>
                <p>{gap.desiredState}</p>
              </div>
            </div>

            {/* Visual gap bar */}
            <div
              className="relative h-2 rounded-full bg-secondary overflow-hidden"
              role="meter"
              aria-label={`${gap.area} gap closure`}
              aria-valuenow={gap.gapSeverity === "critical" ? 25 : gap.gapSeverity === "high" ? 45 : gap.gapSeverity === "medium" ? 65 : 85}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width:
                    gap.gapSeverity === "critical"
                      ? "25%"
                      : gap.gapSeverity === "high"
                        ? "45%"
                        : gap.gapSeverity === "medium"
                          ? "65%"
                          : "85%",
                  backgroundColor:
                    gap.gapSeverity === "critical"
                      ? "hsl(0, 72%, 51%)"
                      : gap.gapSeverity === "high"
                        ? "hsl(25, 95%, 53%)"
                        : gap.gapSeverity === "medium"
                          ? "hsl(45, 93%, 47%)"
                          : "hsl(142, 71%, 45%)",
                }}
              />
            </div>

            <p className="text-xs text-muted-foreground italic">
              {gap.recommendation}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
