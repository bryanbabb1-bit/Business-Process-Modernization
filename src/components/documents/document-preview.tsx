"use client";

import { useState } from "react";
import { FileText, Loader2, AlertCircle, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Document } from "@/types";

interface DocumentPreviewProps {
  document: Document | null;
  projectId: string;
}

interface ExtractionResult {
  workflows: unknown[];
  painPoints: unknown[];
  techStack: unknown[];
  summary: string;
}

export function DocumentPreview({ document, projectId }: DocumentPreviewProps) {
  const [extracting, setExtracting] = useState(false);
  const [extractResult, setExtractResult] = useState<ExtractionResult | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);

  async function handleExtract() {
    if (!document) return;
    setExtracting(true);
    setExtractError(null);
    setExtractResult(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/documents/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId: document.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Extraction failed");
      }

      const result: ExtractionResult = await res.json();
      setExtractResult(result);
    } catch (err) {
      setExtractError(
        err instanceof Error ? err.message : "Extraction failed"
      );
    } finally {
      setExtracting(false);
    }
  }

  if (!document) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground p-6">
        <FileText className="mb-3 h-10 w-10" />
        <p className="text-sm font-medium">No document selected</p>
        <p className="mt-1 text-xs">
          Select a document from the list to preview its extracted content
        </p>
      </div>
    );
  }

  const canExtract =
    document.processingStatus === "complete" &&
    document.extractedContent &&
    !document.extractedContent.startsWith("[");

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">
            {document.fileName}
          </h3>
          <p className="text-xs text-muted-foreground">
            {document.fileType} &middot; {document.processingStatus}
          </p>
        </div>
        {canExtract && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleExtract}
            disabled={extracting}
            className="ml-3 shrink-0"
          >
            {extracting ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            )}
            {extracting ? "Extracting..." : "Extract Workflows"}
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* Extraction result banner */}
        {extractResult && (
          <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle className="h-4 w-4" />
              Extraction complete
            </div>
            <p className="mt-1 text-xs">{extractResult.summary}</p>
            <div className="mt-2 flex gap-4 text-xs">
              <span>{extractResult.workflows.length} workflow(s)</span>
              <span>{extractResult.painPoints.length} pain point(s)</span>
              <span>{extractResult.techStack.length} tech item(s)</span>
            </div>
            <p className="mt-2 text-xs text-green-600">
              Added to Discovery. Go to the Discovery tab to review.
            </p>
          </div>
        )}

        {extractError && (
          <div className="mb-4 flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {extractError}
            </div>
            <button
              className="text-xs hover:underline"
              onClick={() => setExtractError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {extracting && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            <Loader2 className="h-4 w-4 animate-spin" />
            AI is analyzing the document and extracting workflows... This may take 15-30 seconds.
          </div>
        )}

        {document.processingStatus === "pending" && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mb-2 h-6 w-6 animate-spin" />
            <p className="text-sm">Waiting to process...</p>
          </div>
        )}

        {document.processingStatus === "processing" && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mb-2 h-6 w-6 animate-spin" />
            <p className="text-sm">Extracting content...</p>
          </div>
        )}

        {document.processingStatus === "error" && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-destructive">
            <AlertCircle className="mb-2 h-6 w-6" />
            <p className="text-sm font-medium">Processing failed</p>
            {document.extractedContent && (
              <p className="mt-2 max-w-sm text-xs text-muted-foreground">
                {document.extractedContent}
              </p>
            )}
          </div>
        )}

        {document.processingStatus === "complete" && (
          <div className="prose prose-sm max-w-none">
            {document.extractedContent ? (
              <pre className="whitespace-pre-wrap break-words rounded-md bg-muted p-4 text-xs font-mono leading-relaxed">
                {document.extractedContent}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No content was extracted from this document.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
