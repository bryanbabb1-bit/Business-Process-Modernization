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

const phases = [
  { key: "discovery", label: "Discovery", icon: Search, path: "discovery" },
  { key: "documents", label: "Documents", icon: FileText, path: "documents" },
  { key: "analysis", label: "Analysis", icon: BarChart3, path: "analysis" },
  { key: "recommendations", label: "Recommendations", icon: Lightbulb, path: "recommendations" },
  { key: "plan", label: "Plan", icon: GitBranch, path: "plan" },
  { key: "build", label: "Build", icon: Package, path: "build" },
  { key: "customize", label: "Customize", icon: MessageSquare, path: "customize" },
];

const statusOrder: Record<string, number> = {
  discovery: 0,
  analysis: 2,
  planning: 4,
  building: 5,
  complete: 6,
};

interface ProjectNavProps {
  projectId: string;
  projectStatus: ProjectStatus;
}

export function ProjectNav({ projectId, projectStatus }: ProjectNavProps) {
  const pathname = usePathname();
  const currentPhaseIndex = statusOrder[projectStatus] ?? 0;

  return (
    <nav className="border-b bg-card">
      <div className="flex items-center gap-1 overflow-x-auto px-4 py-2">
        {phases.map((phase, index) => {
          const href = `/projects/${projectId}/${phase.path}`;
          const isActive = pathname.includes(phase.path);
          const isAccessible = index <= currentPhaseIndex + 1;

          return (
            <Link
              key={phase.key}
              href={isAccessible ? href : "#"}
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
              {index < phases.length - 1 && (
                <span className="ml-2 hidden text-muted-foreground/30 lg:inline">
                  /
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
