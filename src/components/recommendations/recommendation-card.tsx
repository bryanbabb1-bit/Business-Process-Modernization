"use client";

import { useState, useRef, useEffect } from "react";
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
  MessageSquare,
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
  comment?: string;
  customizations?: {
    estimatedWeeks?: number;
    keyBenefits?: string[];
    riskFactors?: string[];
  };
  onToggleSelect: (id: string, selected: boolean) => void;
  onSaveComment: (id: string, comment: string) => void;
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
  comment,
  customizations,
  onToggleSelect,
  onSaveComment,
}: RecommendationCardProps) {
  const config = categoryConfig[category] || categoryConfig.medium_effort;
  const CategoryIcon = config.icon;
  const [localComment, setLocalComment] = useState(comment || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync if parent prop changes (e.g. after regenerate)
  useEffect(() => {
    setLocalComment(comment || "");
  }, [comment]);

  function handleCommentChange(value: string) {
    setLocalComment(value);
    // Debounce save — 800ms after user stops typing
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSaveComment(id, value);
    }, 800);
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        selected && "ring-2 ring-primary shadow-md"
      )}
    >
      <CardHeader
        className="pb-3 cursor-pointer"
        onClick={() => onToggleSelect(id, !selected)}
      >
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

        {/* Comment section — visible when selected */}
        {selected && (
          <div className="space-y-1.5 pt-1 border-t">
            <label
              htmlFor={`comment-${id}`}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground"
            >
              <MessageSquare className="h-3 w-3" />
              Notes for implementation
            </label>
            <textarea
              id={`comment-${id}`}
              value={localComment}
              onChange={(e) => handleCommentChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Add context, constraints, or priorities for the AI planner..."
              className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              rows={2}
            />
          </div>
        )}

        {/* Show saved comment indicator when collapsed */}
        {!selected && comment && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            <span className="truncate">Note: {comment}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
