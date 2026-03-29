"use client";

import {
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Document } from "@/types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
    case "docx":
    case "txt":
    case "md":
      return FileText;
    case "xlsx":
    case "xls":
    case "csv":
      return FileSpreadsheet;
    case "png":
    case "jpg":
    case "jpeg":
      return FileImage;
    default:
      return File;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300">
          <Clock className="h-3 w-3" /> Pending
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="outline" className="gap-1 text-blue-600 border-blue-300">
          <Loader2 className="h-3 w-3 animate-spin" /> Processing
        </Badge>
      );
    case "complete":
      return (
        <Badge variant="outline" className="gap-1 text-green-600 border-green-300">
          <CheckCircle className="h-3 w-3" /> Complete
        </Badge>
      );
    case "error":
      return (
        <Badge variant="outline" className="gap-1 text-red-600 border-red-300">
          <AlertCircle className="h-3 w-3" /> Error
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

interface DocumentListProps {
  documents: Document[];
  selectedId: string | null;
  onSelect: (doc: Document) => void;
  onDelete: (docId: string) => void;
  isDeleting: string | null;
}

export function DocumentList({
  documents,
  selectedId,
  onSelect,
  onDelete,
  isDeleting,
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <FileText className="mb-3 h-10 w-10" />
        <p className="text-sm font-medium">No documents uploaded</p>
        <p className="mt-1 text-xs">
          Upload files above to begin processing
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y" role="list" aria-label="Uploaded documents">
      {documents.map((doc) => {
        const Icon = getFileIcon(doc.fileName);
        const isSelected = doc.id === selectedId;

        return (
          <div
            key={doc.id}
            role="listitem"
            className={cn(
              "flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors hover:bg-muted/50",
              isSelected && "bg-muted"
            )}
            onClick={() => onSelect(doc)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(doc);
              }
            }}
            tabIndex={0}
          >
            <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{doc.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(doc.fileSize)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {statusBadge(doc.processingStatus)}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                aria-label={`Delete ${doc.fileName}`}
                disabled={isDeleting === doc.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(doc.id);
                }}
              >
                {isDeleting === doc.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
