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
  PackageCheck,
  ArrowUpCircle,
} from "lucide-react";

interface StackOption {
  approach: string;
  toolsUsed?: string[];
  limitations?: string;
  licensingCost: string;
  newTools?: string[];
  advantages?: string;
}

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
    keyBenefits?: string[];
    riskFactors?: string[];
    currentStackOption?: StackOption | null;
    improvedStackOption?: StackOption | null;
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

  useEffect(() => {
    setLocalComment(comment || "");
  }, [comment]);

  function handleCommentChange(value: string) {
    setLocalComment(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSaveComment(id, value);
    }, 800);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const currentOpt = customizations?.currentStackOption;
  const improvedOpt = customizations?.improvedStackOption;

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

        {/* Two options: Current Stack vs Improved Stack */}
        {(currentOpt || improvedOpt) && (
          <div className="space-y-2 pt-1 border-t">
            {currentOpt && (
              <div className="rounded-md border border-green-200 bg-green-50/50 p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-green-800 flex items-center gap-1">
                    <PackageCheck className="h-3 w-3" />
                    Current Stack
                  </span>
                  <Badge className="text-[10px] h-4 bg-green-100 text-green-800 border-green-300">
                    {currentOpt.licensingCost}
                  </Badge>
                </div>
                <p className="text-[11px] text-green-700">{currentOpt.approach}</p>
                {currentOpt.toolsUsed && currentOpt.toolsUsed.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {currentOpt.toolsUsed.map((t) => (
                      <Badge key={t} variant="outline" className="text-[9px] h-4 border-green-300 text-green-700">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
                {currentOpt.limitations && (
                  <p className="text-[10px] text-green-600 italic">Limitation: {currentOpt.limitations}</p>
                )}
              </div>
            )}

            {improvedOpt && (
              <div className="rounded-md border border-blue-200 bg-blue-50/50 p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-800 flex items-center gap-1">
                    <ArrowUpCircle className="h-3 w-3" />
                    Improved Stack
                  </span>
                  <Badge className="text-[10px] h-4 bg-blue-100 text-blue-800 border-blue-300">
                    {improvedOpt.licensingCost}
                  </Badge>
                </div>
                <p className="text-[11px] text-blue-700">{improvedOpt.approach}</p>
                {improvedOpt.newTools && improvedOpt.newTools.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {improvedOpt.newTools.map((t) => (
                      <Badge key={t} variant="outline" className="text-[9px] h-4 border-blue-300 text-blue-700">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
                {improvedOpt.advantages && (
                  <p className="text-[10px] text-blue-600">{improvedOpt.advantages}</p>
                )}
              </div>
            )}
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
