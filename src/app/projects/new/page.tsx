"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/layout/header";
import { useProjectStore } from "@/store/project-store";
import { INDUSTRIES, COMPANY_SIZES } from "@/types";

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject, isCreatingProject, error } = useProjectStore();
  const [form, setForm] = useState({
    name: "",
    clientName: "",
    industry: "",
    companySize: "",
  });

  const isValid = Boolean(
    form.name.trim() &&
      form.clientName.trim() &&
      form.industry &&
      form.companySize
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    const project = await createProject(form);
    if (project) {
      router.push(`/projects/${project.id}/discovery`);
    }
  }

  return (
    <div className="flex flex-col">
      <Header title="New Project" description="Set up a new client engagement" />

      <div className="mx-auto w-full max-w-2xl p-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>
              Enter the basic details for this engagement. You can add more
              information during the discovery phase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Digital Transformation 2026"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName">Client / Company Name</Label>
                <Input
                  id="clientName"
                  placeholder="e.g., Acme Corporation"
                  value={form.clientName}
                  onChange={(e) =>
                    setForm({ ...form, clientName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={form.industry}
                  onValueChange={(value) =>
                    setForm({ ...form, industry: value })
                  }
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySize-trigger">Company Size</Label>
                <Select
                  value={form.companySize}
                  onValueChange={(value) =>
                    setForm({ ...form, companySize: value })
                  }
                >
                  <SelectTrigger id="companySize-trigger">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <Link href="/">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={!isValid || isCreatingProject}>
                  {isCreatingProject ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
