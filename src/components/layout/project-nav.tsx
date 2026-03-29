"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  FileText,
  BarChart3,
  Lightbulb,
  GitBranch,
  Package,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

export const PROJECT_PHASES = [
  { key: "discovery", label: "Discovery", icon: Search, path: "discovery" },
  { key: "documents", label: "Documents", icon: FileText, path: "documents" },
  { key: "analysis", label: "Analysis", icon: BarChart3, path: "analysis" },
  { key: "recommendations", label: "Recommendations", icon: Lightbulb, path: "recommendations" },
  { key: "plan", label: "Plan", icon: GitBranch, path: "plan" },
  { key: "build", label: "Build", icon: Package, path: "build" },
  { key: "customize", label: "Customize", icon: MessageSquare, path: "customize" },
] as const;

// Maps project status to the highest phase index that should be accessible.
// Phases at or below this index (plus one ahead for "next step") are unlocked.
const STATUS_TO_MAX_PHASE: Record<ProjectStatus, number> = {
  discovery: 1,      // discovery + documents accessible
  analysis: 3,       // through recommendations
  planning: 4,       // through plan
  building: 5,       // through build
  complete: 6,       // everything accessible
};

interface ProjectNavProps {
  projectId: string;
  projectStatus: ProjectStatus;
}

export function ProjectNav({ projectId, projectStatus }: ProjectNavProps) {
  const pathname = usePathname();
  const maxAccessibleIndex = STATUS_TO_MAX_PHASE[projectStatus] ?? 1;

  return (
    <nav className="border-b bg-card" aria-label="Project phases">
      <div className="flex items-center gap-1 overflow-x-auto px-4 py-2">
        {PROJECT_PHASES.map((phase, index) => {
          const href = `/projects/${projectId}/${phase.path}`;
          const isActive = pathname.endsWith(`/${phase.path}`) || pathname.endsWith(`/${phase.path}/`);
          const isAccessible = index <= maxAccessibleIndex;

          return (
            <Link
              key={phase.key}
              href={isAccessible ? href : "#"}
              aria-current={isActive ? "page" : undefined}
              aria-disabled={!isAccessible}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : isAccessible
                  ? "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  : "cursor-not-allowed text-muted-foreground/40"
              )}
              onClick={(e) => {
                if (!isAccessible) e.preventDefault();
              }}
            >
              <phase.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{phase.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
