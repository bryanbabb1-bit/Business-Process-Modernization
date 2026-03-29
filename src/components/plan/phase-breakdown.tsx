"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Target,
  ChevronDown,
  ChevronRight,
  Package,
} from "lucide-react";
import { useState } from "react";

interface Task {
  id: string;
  title: string;
  description: string;
  recommendationTitle?: string;
  deliverables?: string[];
  status: string;
}

interface Phase {
  id: string;
  name: string;
  description: string;
  order: number;
  tasks: Task[];
  dependencies: string[];
  milestones: string[];
}

interface PhaseBreakdownProps {
  phases: Phase[];
}

function PhaseCard({ phase }: { phase: Phase }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card>
      <CardHeader
        className="cursor-pointer pb-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <div>
              <CardTitle className="text-base">
                Phase {phase.order}: {phase.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {phase.description}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">
            {phase.tasks.length} {phase.tasks.length === 1 ? "task" : "tasks"}
          </Badge>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Tasks */}
          <div className="space-y-2">
            {phase.tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border bg-muted/30 p-3 space-y-1.5"
              >
                <h4 className="text-sm font-medium">{task.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {task.description}
                </p>
                {task.recommendationTitle && (
                  <p className="text-[10px] text-muted-foreground">
                    From: {task.recommendationTitle}
                  </p>
                )}
                {task.deliverables && task.deliverables.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                      <Package className="h-2.5 w-2.5" />
                      Deliverables
                    </span>
                    <ul className="text-xs text-muted-foreground space-y-0.5 pl-4">
                      {task.deliverables.map((d) => (
                        <li key={d} className="list-disc">{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Milestones */}
          {phase.milestones.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3" />
                Milestones
              </h4>
              <ul className="space-y-1 pl-4">
                {phase.milestones.map((m) => (
                  <li
                    key={m}
                    className="text-xs text-muted-foreground list-disc"
                  >
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dependencies */}
          {phase.dependencies.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Depends on: {phase.dependencies.join(", ")}
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function PhaseBreakdown({ phases }: PhaseBreakdownProps) {
  const sorted = [...phases].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {sorted.map((phase) => (
        <PhaseCard key={phase.id} phase={phase} />
      ))}
    </div>
  );
}
