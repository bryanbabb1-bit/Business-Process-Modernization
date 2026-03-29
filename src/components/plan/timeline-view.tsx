"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Phase {
  id: string;
  name: string;
  order: number;
  durationWeeks: number;
  tasks: Array<{ id: string; title: string; estimatedHours: number }>;
}

interface TimelineViewProps {
  phases: Phase[];
  totalDurationWeeks: number;
}

const phaseColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-cyan-500",
];

export function TimelineView({ phases, totalDurationWeeks }: TimelineViewProps) {
  const sorted = [...phases].sort((a, b) => a.order - b.order);

  // Calculate cumulative start weeks
  let cumulativeWeek = 0;
  const phaseTimeline = sorted.map((phase, i) => {
    const start = cumulativeWeek;
    cumulativeWeek += phase.durationWeeks;
    return {
      ...phase,
      startWeek: start,
      endWeek: start + phase.durationWeeks,
      color: phaseColors[i % phaseColors.length],
    };
  });

  // Generate week markers
  const weekMarkers: number[] = [];
  for (let w = 0; w <= totalDurationWeeks; w += Math.max(1, Math.floor(totalDurationWeeks / 8))) {
    weekMarkers.push(w);
  }
  if (weekMarkers[weekMarkers.length - 1] !== totalDurationWeeks) {
    weekMarkers.push(totalDurationWeeks);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Project Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Week markers */}
        <div className="relative mb-2 h-6">
          {weekMarkers.map((w) => (
            <div
              key={w}
              className="absolute text-[10px] text-muted-foreground -translate-x-1/2"
              style={{ left: `${(w / totalDurationWeeks) * 100}%` }}
            >
              W{w}
            </div>
          ))}
        </div>

        {/* Timeline bars */}
        <div className="space-y-3">
          {phaseTimeline.map((phase) => {
            const leftPct = (phase.startWeek / totalDurationWeeks) * 100;
            const widthPct = (phase.durationWeeks / totalDurationWeeks) * 100;

            return (
              <div key={phase.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">
                    Phase {phase.order}: {phase.name}
                  </span>
                  <span className="text-muted-foreground">
                    {phase.durationWeeks} weeks · {phase.tasks.length} tasks
                  </span>
                </div>
                <div className="relative h-7 rounded-md bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "absolute top-0 h-full rounded-md flex items-center px-2 text-[10px] font-medium text-white transition-all",
                      phase.color
                    )}
                    style={{
                      left: `${leftPct}%`,
                      width: `${Math.max(widthPct, 3)}%`,
                    }}
                  >
                    {widthPct > 15 && (
                      <span className="truncate">{phase.name}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary row */}
        <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>Total: {totalDurationWeeks} weeks</span>
          <span>
            {sorted.reduce((sum, p) => sum + p.tasks.length, 0)} tasks across{" "}
            {sorted.length} phases
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
