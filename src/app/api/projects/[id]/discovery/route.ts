import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PUT /api/projects/[id]/discovery - Update discovery data
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();

  const discovery = await prisma.discoveryData.upsert({
    where: { projectId: id },
    update: {
      businessProfile: body.businessProfile,
      painPoints: body.painPoints,
      currentWorkflows: body.currentWorkflows,
      techStack: body.techStack,
    },
    create: {
      projectId: id,
      businessProfile: body.businessProfile || "{}",
      painPoints: body.painPoints || "[]",
      currentWorkflows: body.currentWorkflows || "[]",
      techStack: body.techStack || "[]",
    },
  });

  return NextResponse.json(discovery);
}

// GET /api/projects/[id]/discovery - Get discovery data
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const discovery = await prisma.discoveryData.findUnique({
    where: { projectId: id },
  });

  if (!discovery) {
    return NextResponse.json(
      { error: "Discovery data not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(discovery);
}
