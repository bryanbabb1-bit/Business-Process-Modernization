"use client";

import { useState } from "react";
import { RecommendationCard } from "./recommendation-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Rec {
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
    techLeverage?: string[];
    newToolsRequired?: string[];
    estimatedCostRange?: string;
  };
}

interface RecommendationGridProps {
  recommendations: Rec[];
  onToggleSelect: (id: string, selected: boolean) => void;
  onSaveComment: (id: string, comment: string) => void;
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "quick_win", label: "Quick Wins" },
  { key: "medium_effort", label: "Medium Effort" },
  { key: "transformational", label: "Transformational" },
  { key: "selected", label: "Selected" },
] as const;

export function RecommendationGrid({
  recommendations,
  onToggleSelect,
  onSaveComment,
}: RecommendationGridProps) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = recommendations.filter((r) => {
    if (filter === "all") return true;
    if (filter === "selected") return r.selected;
    return r.category === filter;
  });

  const counts = {
    all: recommendations.length,
    quick_win: recommendations.filter((r) => r.category === "quick_win").length,
    medium_effort: recommendations.filter((r) => r.category === "medium_effort").length,
    transformational: recommendations.filter((r) => r.category === "transformational").length,
    selected: recommendations.filter((r) => r.selected).length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === f.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            )}
          >
            {f.label}
            <Badge
              variant="secondary"
              className={cn(
                "h-4 min-w-[16px] px-1 text-[10px]",
                filter === f.key && "bg-primary-foreground/20 text-primary-foreground"
              )}
            >
              {counts[f.key as keyof typeof counts]}
            </Badge>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No recommendations match this filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <RecommendationCard
              key={r.id}
              {...r}
              onToggleSelect={onToggleSelect}
              onSaveComment={onSaveComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
