"use client";

import { FileText, Loader2, AlertCircle } from "lucide-react";
import type { Document } from "@/types";

interface DocumentPreviewProps {
  document: Document | null;
}

export function DocumentPreview({ document }: DocumentPreviewProps) {
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

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h3 className="truncate text-sm font-semibold">{document.fileName}</h3>
        <p className="text-xs text-muted-foreground">
          {document.fileType} &middot; {document.processingStatus}
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
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
