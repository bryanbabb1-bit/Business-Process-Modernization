"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  FolderOpen,
  Clock,
  ArrowRight,
  BarChart3,
  Zap,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { useProjectStore } from "@/store/project-store";
import { formatDate, getStatusColor } from "@/lib/utils";

const statusIcons: Record<string, React.ElementType> = {
  discovery: FolderOpen,
  analysis: BarChart3,
  planning: Zap,
  building: Package,
  complete: Zap,
};

export default function DashboardPage() {
  const { projects, isLoading, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const activeProjects = projects.filter((p) => p.status !== "complete");
  const completedProjects = projects.filter((p) => p.status === "complete");

  return (
    <div className="flex flex-col">
      <Header
        title="Dashboard"
        description="Manage your business modernization projects"
        showNewProject
      />

      <div className="p-6">
        {/* Stats Row */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Projects</CardDescription>
              <CardTitle className="text-3xl">{activeProjects.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl">
                {completedProjects.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Projects</CardDescription>
              <CardTitle className="text-3xl">{projects.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Loading projects...
              </p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <Card className="mx-auto max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <FolderOpen className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>No projects yet</CardTitle>
              <CardDescription>
                Create your first project to begin analyzing and modernizing
                business processes.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Link href="/projects/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Project
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <div>
            <h2 className="mb-4 text-lg font-semibold">
              {activeProjects.length > 0
                ? "Active Projects"
                : "All Projects"}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(activeProjects.length > 0
                ? activeProjects
                : projects
              ).map((project) => {
                const StatusIcon =
                  statusIcons[project.status] || FolderOpen;
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                  >
                    <Card className="transition-shadow hover:shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <StatusIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {project.name}
                              </CardTitle>
                              <CardDescription>
                                {project.clientName}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge
                            className={getStatusColor(project.status)}
                            variant="outline"
                          >
                            {project.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{project.industry}</span>
                          <span>{project.companySize}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(project.createdAt)}
                        </span>
                        <span className="flex items-center gap-1 text-primary">
                          Open <ArrowRight className="h-3 w-3" />
                        </span>
                      </CardFooter>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {completedProjects.length > 0 && activeProjects.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-4 text-lg font-semibold">Completed</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                    >
                      <Card className="opacity-75 transition-shadow hover:opacity-100 hover:shadow-md">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">
                                {project.name}
                              </CardTitle>
                              <CardDescription>
                                {project.clientName}
                              </CardDescription>
                            </div>
                            <Badge
                              className={getStatusColor(project.status)}
                              variant="outline"
                            >
                              {project.status}
                            </Badge>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
