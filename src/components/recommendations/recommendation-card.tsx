"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Zap,
  Clock,
  Rocket,
  TrendingUp,
  Wrench,
  CheckSquare,
  Square,
} from "lucide-react";

interface RecommendationCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  effortScore: number;
  impactScore: number;
  dependencies: string[];
  selected: boolean;
  customizations?: {
    estimatedWeeks?: number;
    keyBenefits?: string[];
    riskFactors?: string[];
  };
  onToggleSelect: (id: string, selected: boolean) => void;
}

const categoryConfig: Record<
  string,
  { label: string; color: string; icon: typeof Zap }
> = {
  quick_win: {
    label: "Quick Win",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: Zap,
  },
  medium_effort: {
    label: "Medium Effort",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock,
  },
  transformational: {
    label: "Transformational",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Rocket,
  },
};

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 text-xs text-muted-foreground">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden" role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={10} aria-label={`${label} ${score} out of 10`}>
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <span className="w-6 text-xs font-medium text-right">{score}</span>
    </div>
  );
}

export function RecommendationCard({
  id,
  title,
  description,
  category,
  effortScore,
  impactScore,
  dependencies,
  selected,
  customizations,
  onToggleSelect,
}: RecommendationCardProps) {
  const config = categoryConfig[category] || categoryConfig.medium_effort;
  const CategoryIcon = config.icon;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        selected && "ring-2 ring-primary shadow-md"
      )}
      onClick={() => onToggleSelect(id, !selected)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {selected ? (
              <CheckSquare className="h-5 w-5 shrink-0 text-primary" />
            ) : (
              <Square className="h-5 w-5 shrink-0 text-muted-foreground" />
            )}
            <CardTitle className="text-sm leading-tight">{title}</CardTitle>
          </div>
          <Badge className={cn("shrink-0 text-[10px]", config.color)}>
            <CategoryIcon className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>
        </div>
        <CardDescription className="text-xs mt-1 line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <div className="space-y-1.5">
          <ScoreBar label="Impact" score={impactScore} color="bg-green-500" />
          <ScoreBar label="Effort" score={effortScore} color="bg-amber-500" />
        </div>

        {customizations?.estimatedWeeks && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>~{customizations.estimatedWeeks} weeks</span>
          </div>
        )}

        {customizations?.keyBenefits && customizations.keyBenefits.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Key Benefits
            </div>
            <ul className="text-xs text-muted-foreground space-y-0.5 pl-4">
              {customizations.keyBenefits.slice(0, 3).map((b) => (
                <li key={b} className="list-disc">{b}</li>
              ))}
            </ul>
          </div>
        )}

        {dependencies.length > 0 && (
          <div className="flex items-start gap-1 text-xs text-muted-foreground">
            <Wrench className="h-3 w-3 mt-0.5 shrink-0" />
            <span>Depends on: {dependencies.join(", ")}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
