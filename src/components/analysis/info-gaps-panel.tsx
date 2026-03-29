"use client";

import { AlertCircle, HelpCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { InformationGap } from "@/types";

const importanceConfig: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  critical: {
    icon: AlertCircle,
    color: "text-red-600 border-red-300",
    label: "Critical",
  },
  important: {
    icon: HelpCircle,
    color: "text-amber-600 border-amber-300",
    label: "Important",
  },
  nice_to_have: {
    icon: Info,
    color: "text-blue-600 border-blue-300",
    label: "Nice to Have",
  },
};

interface InfoGapsPanelProps {
  gaps: InformationGap[];
}

export function InfoGapsPanel({ gaps }: InfoGapsPanelProps) {
  if (gaps.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Information Gaps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No information gaps identified. Discovery data appears comprehensive.
          </p>
        </CardContent>
      </Card>
    );
  }

  const criticalCount = gaps.filter((g) => g.importance === "critical").length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Information Gaps{" "}
          {criticalCount > 0 && (
            <Badge variant="outline" className="ml-2 text-red-600 border-red-300">
              {criticalCount} critical
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="mb-3 text-xs text-muted-foreground">
          Follow up with the client on these questions to improve analysis accuracy.
        </p>
        {gaps.map((gap) => {
          const config = importanceConfig[gap.importance] || importanceConfig.nice_to_have;
          const Icon = config.icon;

          return (
            <div
              key={gap.id}
              className="flex items-start gap-3 rounded-md border p-3"
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.color.split(" ")[0]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {gap.area}
                  </span>
                  <Badge variant="outline" className={`text-[10px] ${config.color}`}>
                    {config.label}
                  </Badge>
                </div>
                <p className="text-sm">{gap.question}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
