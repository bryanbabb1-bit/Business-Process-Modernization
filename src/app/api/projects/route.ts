import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/projects - List all projects
export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(projects);
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, clientName, industry, companySize } = body;

  if (!name || !clientName || !industry || !companySize) {
    return NextResponse.json(
      { error: "Missing required fields: name, clientName, industry, companySize" },
      { status: 400 }
    );
  }

  const project = await prisma.project.create({
    data: {
      name,
      clientName,
      industry,
      companySize,
      status: "discovery",
      discovery: {
        create: {
          businessProfile: "{}",
          painPoints: "[]",
          currentWorkflows: "[]",
          techStack: "[]",
        },
      },
    },
    include: { discovery: true },
  });

  return NextResponse.json(project, { status: 201 });
}
