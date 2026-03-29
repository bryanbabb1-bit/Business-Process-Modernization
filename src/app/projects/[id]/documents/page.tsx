"use client";

import { useEffect, useState, useCallback } from "react";
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
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/documents`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data: Document[] = await res.json();
      setDocuments(data);

      // Update selected doc if it's still in the list (content may have changed)
      if (selectedDoc) {
        const updated = data.find((d) => d.id === selectedDoc.id);
        if (updated) setSelectedDoc(updated);
        else setSelectedDoc(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, selectedDoc]);

  useEffect(() => {
    fetchDocuments();
  }, [projectId]); // Only run on mount / projectId change, not on every fetchDocuments ref change

  // Poll for processing updates every 5s if any docs are pending/processing
  useEffect(() => {
    const hasPending = documents.some(
      (d) => d.processingStatus === "pending" || d.processingStatus === "processing"
    );
    if (!hasPending) return;

    const interval = setInterval(fetchDocuments, 5000);
    return () => clearInterval(interval);
  }, [documents, fetchDocuments]);

  const handleDelete = async (docId: string) => {
    setDeletingId(docId);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/documents?docId=${docId}`,
        { method: "DELETE" }
      );
      if (!res.ok && res.status !== 204) {
        throw new Error("Failed to delete document");
      }
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      if (selectedDoc?.id === docId) setSelectedDoc(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

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
        <p className="text-sm text-destructive">{error}</p>
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
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <DocumentList
                documents={documents}
                selectedId={selectedDoc?.id ?? null}
                onSelect={setSelectedDoc}
                onDelete={handleDelete}
                isDeleting={deletingId}
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
