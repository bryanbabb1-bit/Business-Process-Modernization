import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/projects/[id] - Get a single project with all relations
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      discovery: true,
      documents: { orderBy: { createdAt: "desc" } },
      analyses: { orderBy: { createdAt: "desc" } },
      recommendations: true,
      plans: { orderBy: { createdAt: "desc" } },
      packages: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}

// PATCH /api/projects/[id] - Update a project
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();

  const project = await prisma.project.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(project);
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  await prisma.project.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
