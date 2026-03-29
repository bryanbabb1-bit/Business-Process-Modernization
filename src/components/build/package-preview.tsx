"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Settings,
  Code2,
  BookOpen,
  FolderTree,
} from "lucide-react";

interface Artifact {
  fileName: string;
  category: string;
  description: string;
}

interface PackagePreviewProps {
  packageName: string;
  summary?: string;
  artifacts: Artifact[];
}

const categoryConfig: Record<
  string,
  { label: string; color: string; icon: typeof FileText }
> = {
  guide: {
    label: "Guide",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: BookOpen,
  },
  config: {
    label: "Config",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: Settings,
  },
  spec: {
    label: "Spec",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: FileText,
  },
  scaffold: {
    label: "Scaffold",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Code2,
  },
  report: {
    label: "Report",
    color: "bg-rose-100 text-rose-800 border-rose-200",
    icon: FileText,
  },
};

export function PackagePreview({
  packageName,
  summary,
  artifacts,
}: PackagePreviewProps) {
  // Group by category
  const grouped: Record<string, Artifact[]> = {};
  for (const a of artifacts) {
    const cat = a.category || "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(a);
  }

  const categoryFolders: Record<string, string> = {
    guide: "guides/",
    config: "configs/",
    spec: "specs/",
    scaffold: "scaffolds/",
    report: "reports/",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FolderTree className="h-4 w-4" />
          Package Contents
        </CardTitle>
        {summary && (
          <p className="text-xs text-muted-foreground">{summary}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Package root */}
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-sm font-mono font-medium">{packageName}.zip</p>
          <div className="mt-2 ml-4 space-y-0.5 text-xs text-muted-foreground font-mono">
            <p>config.json</p>
            <p>CONFIG.md</p>
            <p>manifest.json</p>
          </div>
        </div>

        {/* Grouped artifacts */}
        {Object.entries(grouped).map(([category, items]) => {
          const config = categoryConfig[category] || categoryConfig.guide;
          const CategoryIcon = config.icon;
          const folder = categoryFolders[category] || `${category}/`;

          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2">
                <CategoryIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium font-mono">{folder}</span>
                <Badge className={`text-[10px] ${config.color}`}>
                  {items.length}
                </Badge>
              </div>
              <div className="ml-6 space-y-1.5">
                {items.map((a) => (
                  <div
                    key={a.fileName}
                    className="flex items-start justify-between gap-2 rounded-md border bg-background p-2"
                  >
                    <div>
                      <p className="text-xs font-mono font-medium">
                        {a.fileName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {a.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
