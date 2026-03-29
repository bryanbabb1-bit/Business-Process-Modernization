"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { ProjectNav } from "@/components/layout/project-nav";
import { useProjectStore } from "@/store/project-store";
import type { ProjectStatus } from "@/types";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const projectId = params.id as string;
  const { currentProject, setCurrentProject } = useProjectStore();

  useEffect(() => {
    async function fetchProject() {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentProject(data);
      }
    }

    // Only fetch if we don't have this project or it's a different one
    if (!currentProject || currentProject.id !== projectId) {
      fetchProject();
    }
  }, [projectId, currentProject, setCurrentProject]);

  const status: ProjectStatus =
    (currentProject?.id === projectId
      ? (currentProject.status as ProjectStatus)
      : null) ?? "discovery";

  return (
    <div className="flex flex-col">
      <ProjectNav projectId={projectId} projectStatus={status} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
