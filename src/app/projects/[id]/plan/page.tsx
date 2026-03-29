"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  GitBranch,
  Loader2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PhaseBreakdown } from "@/components/plan/phase-breakdown";
import { TimelineView } from "@/components/plan/timeline-view";
import { ResourceEstimate } from "@/components/plan/resource-estimate";

interface Task {
  id: string;
  title: string;
  description: string;
  recommendationTitle?: string;
  estimatedHours: number;
  resources: string[];
  status: string;
}

interface Phase {
  id: string;
  name: string;
  description: string;
  order: number;
  durationWeeks: number;
  tasks: Task[];
  dependencies: string[];
  milestones: string[];
}

interface ResourceSummary {
  roles: string[];
  estimatedTeamSize: number;
  estimatedBudgetRange: string;
}

interface Risk {
  risk: string;
  mitigation: string;
  likelihood: string;
}

interface NewToolItem {
  tool: string;
  purpose: string;
  estimatedAnnualCost: string;
  alternatives: string;
}

interface CostBreakdown {
  laborCost: string;
  newToolingCost: string;
  existingToolsLeveraged: string[];
  newToolsRequired: NewToolItem[];
  costSavingsFromReuse: string;
}

interface PlanData {
  id: string;
  phases: Phase[];
  totalDurationWeeks: number;
  totalEstimatedHours: number;
  resourceSummary: ResourceSummary;
  costBreakdown?: CostBreakdown | null;
  risks: Risk[];
  confirmed: boolean;
  createdAt?: string;
}

export default function PlanPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchPlan = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}/plan`);
      if (res.status === 404) {
        if (mountedRef.current) setPlan(null);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch plan");
      const data = await res.json();
      if (mountedRef.current) setPlan(data);
    } catch {
      // ignore
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  async function generatePlan() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${id}/plan`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate plan");
      }
      const data = await res.json();
      if (mountedRef.current) setPlan(data);
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Generation failed");
      }
    } finally {
      if (mountedRef.current) setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No plan yet — show generate CTA
  if (!plan && !generating) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="items-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <GitBranch className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Generate Implementation Plan</CardTitle>
            <CardDescription>
              AI will create a phased implementation plan based on your selected
              recommendations, with timelines, resource estimates, and risk assessment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}
            <Button onClick={generatePlan} disabled={generating}>
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Plan
            </Button>
            <p className="text-xs text-muted-foreground">
              Make sure you&apos;ve selected recommendations first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generating state (overlay if plan already exists)
  if (generating && !plan) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            Generating implementation plan... This may take 30-60 seconds.
          </p>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Implementation Plan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {plan.phases.length} phases over {plan.totalDurationWeeks} weeks —{" "}
            {plan.totalEstimatedHours} estimated hours
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generatePlan}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Regenerate
          </Button>
          <Button
            size="sm"
            onClick={() => router.push(`/projects/${id}/build`)}
          >
            Confirm & Build
            <ArrowRight className="ml-2 h-4 w-4" />
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
          Regenerating plan... This may take 30-60 seconds.
        </div>
      )}

      {/* Timeline */}
      <TimelineView
        phases={plan.phases}
        totalDurationWeeks={plan.totalDurationWeeks}
      />

      {/* Resource & Risk Cards */}
      <ResourceEstimate
        totalDurationWeeks={plan.totalDurationWeeks}
        totalEstimatedHours={plan.totalEstimatedHours}
        resourceSummary={plan.resourceSummary}
        costBreakdown={plan.costBreakdown}
        risks={plan.risks}
      />

      {/* Phase Breakdown */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Phase Breakdown</h2>
        <PhaseBreakdown phases={plan.phases} />
      </div>
    </div>
  );
}
