"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SwotCard } from "@/components/analysis/swot-card";
import { MaturityRadar } from "@/components/analysis/maturity-radar";
import { GapAnalysisChart } from "@/components/analysis/gap-analysis-chart";
import { InfoGapsPanel } from "@/components/analysis/info-gaps-panel";
import type {
  GapItem,
  MaturityScore,
  InformationGap,
} from "@/types";

interface AnalysisData {
  id: string;
  currentStateAssessment: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  gapAnalysis: GapItem[];
  maturityScores: MaturityScore[];
  informationGaps: InformationGap[];
  createdAt?: string;
}

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/analyze`);
      if (res.status === 404) {
        setAnalysis(null);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch analysis");
      const data: AnalysisData = await res.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analysis");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  async function runAnalysis() {
    setIsRunning(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/analyze`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Analysis failed");
      }

      const result: AnalysisData = await res.json();
      setAnalysis(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Analysis failed. Please try again."
      );
    } finally {
      setIsRunning(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading analysis...</p>
        </div>
      </div>
    );
  }

  // No analysis yet — show CTA to run
  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-lg text-center">
          <CardHeader className="items-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <CardTitle>Run AI Analysis</CardTitle>
            <CardDescription>
              Analyze all discovery data, uploaded documents, and business context
              to generate a comprehensive current-state assessment, maturity scores,
              and gap analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {isRunning && (
              <div className="flex items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                <Loader2 className="h-4 w-4 animate-spin" />
                AI is analyzing your business data... This takes 30-60 seconds.
              </div>
            )}
            <Button
              size="lg"
              onClick={runAnalysis}
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {isRunning ? "Running Analysis..." : "Run Analysis"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Make sure you&apos;ve completed the Discovery phase and uploaded any
              relevant documents first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show analysis results
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Analysis Results</h2>
          <p className="text-sm text-muted-foreground">
            AI-generated assessment based on all discovery data
            {analysis.createdAt && (
              <span>
                {" "}
                &middot; Generated{" "}
                {new Date(analysis.createdAt).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={runAnalysis}
            disabled={isRunning}
          >
            {isRunning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Re-run Analysis
          </Button>
          <Button onClick={() => router.push(`/projects/${projectId}/recommendations`)}>
            View Recommendations
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
          <p className="text-sm text-destructive">{error}</p>
          <button
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {isRunning && (
        <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          <Loader2 className="h-4 w-4 animate-spin" />
          Re-running analysis with latest data...
        </div>
      )}

      {/* SWOT / Executive Summary */}
      <SwotCard assessment={analysis.currentStateAssessment} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MaturityRadar scores={analysis.maturityScores} />
        <InfoGapsPanel gaps={analysis.informationGaps} />
      </div>

      {/* Gap Analysis */}
      <GapAnalysisChart gaps={analysis.gapAnalysis} />
    </div>
  );
}
