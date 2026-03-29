"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Phase {
  id: string;
  name: string;
  order: number;
  tasks: Array<{ id: string; title: string }>;
}

interface TimelineViewProps {
  phases: Phase[];
}

const phaseColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-cyan-500",
];

export function TimelineView({ phases }: TimelineViewProps) {
  const sorted = [...phases].sort((a, b) => a.order - b.order);
  const totalPhases = sorted.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Delivery Sequence</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Phase bars — equal width since we're not estimating duration */}
        <div className="space-y-3">
          {sorted.map((phase, i) => {
            const widthPct = 100 / totalPhases;
            const leftPct = i * widthPct;

            return (
              <div key={phase.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">
                    Phase {phase.order}: {phase.name}
                  </span>
                  <span className="text-muted-foreground">
                    {phase.tasks.length} {phase.tasks.length === 1 ? "deliverable" : "deliverables"}
                  </span>
                </div>
                <div className="relative h-7 rounded-md bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "absolute top-0 h-full rounded-md flex items-center px-2 text-[10px] font-medium text-white transition-all",
                      phaseColors[i % phaseColors.length]
                    )}
                    style={{
                      left: "0%",
                      width: `${Math.max(((i + 1) / totalPhases) * 100, 10)}%`,
                    }}
                  >
                    {((i + 1) / totalPhases) * 100 > 20 && (
                      <span className="truncate">{phase.name}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>{sorted.length} phases</span>
          <span>
            {sorted.reduce((sum, p) => sum + p.tasks.length, 0)} total deliverables
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
