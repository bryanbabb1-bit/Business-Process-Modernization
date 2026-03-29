"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProjectNav } from "@/components/layout/project-nav";
import type { ProjectStatus } from "@/types";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const projectId = params.id as string;
  const [status, setStatus] = useState<ProjectStatus>("discovery");

  useEffect(() => {
    async function fetchStatus() {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
      }
    }
    fetchStatus();
  }, [projectId]);

  return (
    <div className="flex flex-col">
      <ProjectNav projectId={projectId} projectStatus={status} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
