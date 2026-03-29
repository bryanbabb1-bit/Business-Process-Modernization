"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  description?: string;
  showNewProject?: boolean;
}

export function Header({ title, description, showNewProject = false }: HeaderProps) {
  return (
    <div className="flex items-center justify-between border-b px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {showNewProject && (
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      )}
    </div>
  );
}
