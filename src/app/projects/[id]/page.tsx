"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  FileText,
  BarChart3,
  Lightbulb,
  GitBranch,
  Package,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { useProjectStore } from "@/store/project-store";
import { formatDate, getStatusColor } from "@/lib/utils";
import type { Project } from "@/types";

const phaseCards = [
  {
    key: "discovery",
    label: "Discovery",
    description: "Business profile, workflows, tech stack, and pain points",
    icon: Search,
    path: "discovery",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "documents",
    label: "Documents",
    description: "Upload process diagrams, SOPs, and other materials",
    icon: FileText,
    path: "documents",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    key: "analysis",
    label: "Analysis",
    description: "AI-powered current state assessment and gap analysis",
    icon: BarChart3,
    path: "analysis",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    key: "recommendations",
    label: "Recommendations",
    description: "Categorized recommendations with effort/impact scoring",
    icon: Lightbulb,
    path: "recommendations",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    key: "plan",
    label: "Implementation Plan",
    description: "Phased rollout plan with timelines and dependencies",
    icon: GitBranch,
    path: "plan",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    key: "build",
    label: "Build & Package",
    description: "Generate deliverable artifacts and configuration packages",
    icon: Package,
    path: "build",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
];

export default function ProjectOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const { deleteProject } = useProjectStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const projectId = params.id as string;

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        setProject(await res.json());
      }
      setLoading(false);
    }
    load();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p>Project not found.</p>
        <Link href="/">
          <Button variant="outline" className="mt-4">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  async function handleDelete() {
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProject(projectId);
      router.push("/");
    }
  }

  return (
    <div className="flex flex-col">
      <Header
        title={project.name}
        description={`${project.clientName} - ${project.industry}`}
      />

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(project.status)} variant="outline">
              {project.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Created {formatDate(project.createdAt)}
            </span>
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        {/* Phase Cards Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {phaseCards.map((phase) => (
            <Link
              key={phase.key}
              href={`/projects/${projectId}/${phase.path}`}
            >
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${phase.bg}`}
                    >
                      <phase.icon className={`h-5 w-5 ${phase.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {phase.label}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{phase.description}</CardDescription>
                  <div className="mt-4 flex items-center text-sm text-primary">
                    Go to {phase.label}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
