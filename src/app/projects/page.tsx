"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Plus, Clock, ArrowRight, FolderOpen } from "lucide-react";
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

export default function ProjectsListPage() {
  const { projects, isFetchingProjects: isLoading, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="flex flex-col">
      <Header
        title="Projects"
        description="All business modernization engagements"
        showNewProject
      />

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : projects.length === 0 ? (
          <Card className="mx-auto max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <FolderOpen className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>No projects yet</CardTitle>
              <CardDescription>
                Create your first project to get started.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Link href="/projects/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {project.name}
                        </CardTitle>
                        <CardDescription>{project.clientName}</CardDescription>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
