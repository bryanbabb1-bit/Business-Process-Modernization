"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Lightbulb,
  Sparkles,
  ArrowRight,
  Loader2,
  LayoutGrid,
  ScatterChart as ScatterIcon,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecommendationGrid } from "@/components/recommendations/recommendation-grid";
import { ImpactEffortMatrix } from "@/components/recommendations/impact-effort-matrix";
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
    userComment?: string;
  };
}

export default function RecommendationsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"grid" | "matrix">("grid");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchRecs = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}/recommendations`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: Rec[] = await res.json();
      const mapped = data.map((r) => ({
        ...r,
        comment: r.customizations?.userComment || "",
      }));
      if (mountedRef.current) setRecs(mapped);
    } catch {
      // ignore fetch errors on load
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecs();
  }, [fetchRecs]);

  async function generateRecs() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${id}/recommendations`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate recommendations");
      }
      const data: Rec[] = await res.json();
      const mapped = data.map((r) => ({
        ...r,
        comment: r.customizations?.userComment || "",
      }));
      if (mountedRef.current) setRecs(mapped);
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Generation failed");
      }
    } finally {
      if (mountedRef.current) setGenerating(false);
    }
  }

  async function toggleSelect(recId: string, selected: boolean) {
    // Optimistic update
    setRecs((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, selected } : r))
    );
    try {
      const res = await fetch(`/api/projects/${id}/recommendations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recId, selected }),
      });
      if (!res.ok) {
        // Revert on failure
        setRecs((prev) =>
          prev.map((r) => (r.id === recId ? { ...r, selected: !selected } : r))
        );
      }
    } catch {
      setRecs((prev) =>
        prev.map((r) => (r.id === recId ? { ...r, selected: !selected } : r))
      );
    }
  }

  async function saveComment(recId: string, comment: string) {
    // Optimistic update
    setRecs((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, comment } : r))
    );
    try {
      await fetch(`/api/projects/${id}/recommendations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recId, comment }),
      });
    } catch {
      // Comment save is best-effort — don't revert UI
    }
  }

  const selectedCount = recs.filter((r) => r.selected).length;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No recommendations yet — show generate CTA
  if (recs.length === 0 && !generating) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="items-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Lightbulb className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Generate Recommendations</CardTitle>
            <CardDescription>
              AI will analyze your business assessment and generate categorized
              modernization recommendations with effort/impact scoring.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}
            <Button onClick={generateRecs} disabled={generating}>
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Recommendations
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Recommendations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {recs.length} recommendations generated — select the ones to include
            in your implementation plan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border bg-muted p-0.5">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                view === "grid"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setView("matrix")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                view === "matrix"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ScatterIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={generateRecs}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Regenerate
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {generating && (
        <div className="flex items-center gap-2 rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating recommendations... This may take 30-60 seconds.
        </div>
      )}

      {/* Matrix view */}
      {view === "matrix" && (
        <ImpactEffortMatrix
          recommendations={recs}
          onToggleSelect={toggleSelect}
        />
      )}

      {/* Grid view */}
      {view === "grid" && (
        <RecommendationGrid
          recommendations={recs}
          onToggleSelect={toggleSelect}
          onSaveComment={saveComment}
        />
      )}

      {/* Bottom action bar */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t -mx-6 px-6 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{selectedCount}</span>{" "}
            of {recs.length} recommendations selected
          </p>
          <Button
            onClick={() => router.push(`/projects/${id}/plan`)}
            disabled={selectedCount === 0}
          >
            Build Implementation Plan
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
