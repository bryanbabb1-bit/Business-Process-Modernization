"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, FileUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = new Set([
  ".pdf", ".docx", ".xlsx", ".xls", ".csv",
  ".txt", ".md", ".json", ".yaml", ".yml",
  ".png", ".jpg", ".jpeg",
]);

function getExtension(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

interface UploadZoneProps {
  projectId: string;
  onUploadComplete: () => void;
}

export function UploadZone({ projectId, onUploadComplete }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploads, setUploads] = useState<
    { name: string; progress: number; error?: string }[]
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      const ext = getExtension(file.name);
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        setUploads((prev) => [
          ...prev,
          { name: file.name, progress: 0, error: "File type not supported" },
        ]);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setUploads((prev) => [
          ...prev,
          { name: file.name, progress: 0, error: "File exceeds 10MB limit" },
        ]);
        return;
      }

      setUploads((prev) => [...prev, { name: file.name, progress: 10 }]);

      const formData = new FormData();
      formData.append("file", file);

      try {
        setUploads((prev) =>
          prev.map((u) =>
            u.name === file.name ? { ...u, progress: 50 } : u
          )
        );

        const res = await fetch(`/api/projects/${projectId}/documents`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Upload failed");
        }

        setUploads((prev) =>
          prev.map((u) =>
            u.name === file.name ? { ...u, progress: 100 } : u
          )
        );

        // Brief delay to show 100%, then refresh
        setTimeout(() => {
          setUploads((prev) => prev.filter((u) => u.name !== file.name));
          onUploadComplete();
        }, 800);
      } catch (err) {
        setUploads((prev) =>
          prev.map((u) =>
            u.name === file.name
              ? {
                  ...u,
                  progress: 0,
                  error:
                    err instanceof Error ? err.message : "Upload failed",
                }
              : u
          )
        );
      }
    },
    [projectId, onUploadComplete]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach((file) => uploadFile(file));
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const activeUploads = uploads.filter((u) => !u.error);
  const failedUploads = uploads.filter((u) => u.error);

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload files by dropping them here or clicking to browse"
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.docx,.xlsx,.xls,.csv,.txt,.md,.json,.yaml,.yml,.png,.jpg,.jpeg"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          {isDragOver ? (
            <FileUp className="h-6 w-6 text-primary" />
          ) : (
            <Upload className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <p className="text-sm font-medium">
          {isDragOver ? "Drop files here" : "Drag & drop files or click to browse"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, DOCX, XLSX, CSV, TXT, MD, JSON, YAML, PNG, JPG — up to 10MB
        </p>
      </div>

      {activeUploads.length > 0 && (
        <div className="space-y-2">
          {activeUploads.map((u) => (
            <div
              key={u.name}
              className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
            >
              <FileUp className="h-4 w-4 shrink-0 text-primary animate-pulse" />
              <span className="flex-1 truncate">{u.name}</span>
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${u.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {failedUploads.length > 0 && (
        <div className="space-y-2">
          {failedUploads.map((u) => (
            <div
              key={u.name}
              className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <span className="flex-1 truncate">{u.name}</span>
              <span className="text-xs text-destructive">{u.error}</span>
              <button
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setUploads((prev) =>
                    prev.filter((x) => x.name !== u.name)
                  );
                }}
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
