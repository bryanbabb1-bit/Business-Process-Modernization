"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Package,
  Loader2,
  Sparkles,
  Download,
  AlertCircle,
  RefreshCw,
  PackageCheck,
  ArrowUpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PackagePreview } from "@/components/build/package-preview";
import { ConfigEditor } from "@/components/build/config-editor";
import { cn } from "@/lib/utils";

interface Artifact {
  fileName: string;
  category: string;
  description: string;
}

interface ConfigValue {
  key: string;
  label: string;
  description: string;
  type: string;
  defaultValue: string;
  required: boolean;
}

interface BuildData {
  id: string;
  packageName: string;
  summary?: string;
  artifacts: Artifact[];
  configValues?: ConfigValue[];
  configSchema?: ConfigValue[];
  status: string;
}

export default function BuildPage() {
  const { id } = useParams<{ id: string }>();
  const [build, setBuild] = useState<BuildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [selectedOption, setSelectedOption] = useState<
    "currentStack" | "improvedStack"
  >("currentStack");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchBuild = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}/build`);
      if (res.status === 404) {
        if (mountedRef.current) setBuild(null);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (mountedRef.current) setBuild(data);
    } catch {
      // ignore
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBuild();
  }, [fetchBuild]);

  async function generateBuild() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${id}/build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedOption }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate package");
      }
      const data = await res.json();
      if (mountedRef.current) setBuild(data);
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Generation failed");
      }
    } finally {
      if (mountedRef.current) setGenerating(false);
    }
  }

  async function downloadPackage() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/projects/${id}/build/download`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${build?.packageName || "package"}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Download failed");
      }
    } finally {
      if (mountedRef.current) setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No build yet — show generate CTA with option selection
  if (!build && !generating) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-lg text-center">
          <CardHeader className="items-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Build Deliverable Package</CardTitle>
            <CardDescription>
              Choose an implementation option and generate your client&apos;s
              deliverable package with configs, guides, and scaffolds.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Option selector */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <button
                onClick={() => setSelectedOption("currentStack")}
                className={cn(
                  "rounded-lg border p-3 text-left transition-all",
                  selectedOption === "currentStack"
                    ? "border-green-500 bg-green-50 ring-2 ring-green-500"
                    : "hover:border-green-300 hover:bg-green-50/50"
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <PackageCheck className="h-4 w-4 text-green-700" />
                  <span className="text-sm font-semibold text-green-800">
                    Current Stack
                  </span>
                </div>
                <p className="text-[11px] text-green-700">
                  Build using existing tools — no new licensing costs
                </p>
              </button>
              <button
                onClick={() => setSelectedOption("improvedStack")}
                className={cn(
                  "rounded-lg border p-3 text-left transition-all",
                  selectedOption === "improvedStack"
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                    : "hover:border-blue-300 hover:bg-blue-50/50"
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowUpCircle className="h-4 w-4 text-blue-700" />
                  <span className="text-sm font-semibold text-blue-800">
                    Improved Stack
                  </span>
                </div>
                <p className="text-[11px] text-blue-700">
                  Upgrade with new tools for better outcomes
                </p>
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive text-left">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <Button onClick={generateBuild} disabled={generating}>
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Package
            </Button>
            <p className="text-xs text-muted-foreground">
              Make sure you&apos;ve confirmed your implementation plan first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (generating && !build) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            Generating deliverable package... This may take 60-90 seconds.
          </p>
        </div>
      </div>
    );
  }

  if (!build) return null;

  const configValues = build.configValues || build.configSchema || [];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Deliverable Package</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {build.artifacts.length} artifacts ready for delivery
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateBuild}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Regenerate
          </Button>
          <Button size="sm" onClick={downloadPackage} disabled={downloading}>
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download ZIP
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
          Regenerating package... This may take 60-90 seconds.
        </div>
      )}

      {/* Package preview */}
      <PackagePreview
        packageName={build.packageName}
        summary={build.summary}
        artifacts={build.artifacts}
      />

      {/* Config values */}
      <ConfigEditor configValues={configValues} />
    </div>
  );
}
