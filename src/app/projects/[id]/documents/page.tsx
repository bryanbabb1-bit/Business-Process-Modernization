"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UploadZone } from "@/components/documents/upload-zone";
import { DocumentList } from "@/components/documents/document-list";
import { DocumentPreview } from "@/components/documents/document-preview";
import type { Document } from "@/types";

export default function DocumentsPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchDocuments = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`/api/projects/${projectId}/documents`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data: Document[] = await res.json();
      setDocuments(data);
      setError(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Update selectedDoc from documents list (derive, don't store whole object)
  const selectedDoc = documents.find((d) => d.id === selectedDocId) ?? null;

  useEffect(() => {
    fetchDocuments();
    return () => abortRef.current?.abort();
  }, [fetchDocuments]);

  // Poll for processing updates every 5s if any docs are pending/processing
  useEffect(() => {
    const hasPending = documents.some(
      (d) =>
        d.processingStatus === "pending" ||
        d.processingStatus === "processing"
    );
    if (!hasPending) return;

    const interval = setInterval(fetchDocuments, 5000);
    return () => clearInterval(interval);
  }, [documents, fetchDocuments]);

  const handleDelete = useCallback(
    async (docId: string) => {
      if (!confirm("Delete this document? This action cannot be undone.")) return;
      if (deletingIds.has(docId)) return;

      setDeletingIds((prev) => new Set(prev).add(docId));
      setError(null);
      try {
        const res = await fetch(
          `/api/projects/${projectId}/documents?docId=${docId}`,
          { method: "DELETE" }
        );
        if (!res.ok && res.status !== 204) {
          throw new Error("Failed to delete document");
        }
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        if (selectedDocId === docId) setSelectedDocId(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      } finally {
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(docId);
          return next;
        });
      }
    },
    [projectId, selectedDocId, deletingIds]
  );

  const handleSelect = useCallback((doc: Document) => {
    setSelectedDocId(doc.id);
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Upload Zone */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Upload Documents</CardTitle>
          <CardDescription>
            Upload business documents, process diagrams, SOPs, and data files
            for analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadZone
            projectId={projectId}
            onUploadComplete={fetchDocuments}
          />
        </CardContent>
      </Card>

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

      {/* Document List + Preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Documents{" "}
              {documents.length > 0 && (
                <span className="text-muted-foreground font-normal">
                  ({documents.length})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div
                className="flex items-center justify-center py-12"
                role="status"
                aria-label="Loading documents"
              >
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <DocumentList
                documents={documents}
                selectedId={selectedDocId}
                onSelect={handleSelect}
                onDelete={handleDelete}
                deletingIds={deletingIds}
              />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 min-h-[400px]">
          <CardContent className="h-full p-0">
            <DocumentPreview document={selectedDoc} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
