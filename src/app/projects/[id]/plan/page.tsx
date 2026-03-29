"use client";

import { GitBranch } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PlanPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <GitBranch className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Plan</CardTitle>
          <CardDescription>
            Phased implementation plan with timelines, resources, and dependencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This phase will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
