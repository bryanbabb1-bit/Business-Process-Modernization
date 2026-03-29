import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

const VALID_STATUSES = [
  "discovery",
  "analysis",
  "planning",
  "building",
  "complete",
] as const;

// GET /api/projects/[id] - Get a single project with all relations
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        discovery: true,
        documents: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            projectId: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            extractedContent: true,
            processingStatus: true,
            createdAt: true,
          },
        },
        analyses: { orderBy: { createdAt: "desc" } },
        recommendations: true,
        plans: { orderBy: { createdAt: "desc" } },
        packages: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("[GET /api/projects/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Update a project
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const raw = body as Record<string, unknown>;

    // Allowlist: only permit specific fields
    const data: Record<string, string> = {};

    if (raw.name !== undefined) {
      if (typeof raw.name !== "string" || !raw.name.trim() || raw.name.trim().length > 255) {
        return NextResponse.json({ error: "Invalid name" }, { status: 400 });
      }
      data.name = raw.name.trim();
    }

    if (raw.clientName !== undefined) {
      if (typeof raw.clientName !== "string" || !raw.clientName.trim() || raw.clientName.trim().length > 255) {
        return NextResponse.json({ error: "Invalid clientName" }, { status: 400 });
      }
      data.clientName = raw.clientName.trim();
    }

    if (raw.industry !== undefined) {
      if (typeof raw.industry !== "string") {
        return NextResponse.json({ error: "Invalid industry" }, { status: 400 });
      }
      data.industry = raw.industry;
    }

    if (raw.companySize !== undefined) {
      if (typeof raw.companySize !== "string") {
        return NextResponse.json({ error: "Invalid companySize" }, { status: 400 });
      }
      data.companySize = raw.companySize;
    }

    if (raw.status !== undefined) {
      if (
        typeof raw.status !== "string" ||
        !VALID_STATUSES.includes(raw.status as (typeof VALID_STATUSES)[number])
      ) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
      data.status = raw.status;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const project = await prisma.project.update({
      where: { id },
      data,
    });

    return NextResponse.json(project);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }
    console.error("[PATCH /api/projects/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.project.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }
    console.error("[DELETE /api/projects/[id]]", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
