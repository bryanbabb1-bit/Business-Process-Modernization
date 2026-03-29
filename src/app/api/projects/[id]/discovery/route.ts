import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { logError } from "@/lib/logger";

/**
 * Validate that a value is either a valid JSON string or a JSON-serializable value,
 * and return it as a JSON string.
 */
function toJsonString(value: unknown, fallback: string): string {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "string") {
    try {
      JSON.parse(value);
      return value;
    } catch {
      throw new Error(`Invalid JSON string: ${value.slice(0, 100)}`);
    }
  }
  // If it's an object/array, serialize it
  return JSON.stringify(value);
}

// PUT /api/projects/[id]/discovery - Update discovery data
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verify the project exists
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

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

    // Validate and normalize JSON fields
    let businessProfile: string;
    let painPoints: string;
    let currentWorkflows: string;
    let techStack: string;

    try {
      businessProfile = toJsonString(raw.businessProfile, "{}");
      painPoints = toJsonString(raw.painPoints, "[]");
      currentWorkflows = toJsonString(raw.currentWorkflows, "[]");
      techStack = toJsonString(raw.techStack, "[]");
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Invalid JSON field" },
        { status: 400 }
      );
    }

    const discovery = await prisma.discoveryData.upsert({
      where: { projectId: id },
      update: {
        businessProfile,
        painPoints,
        currentWorkflows,
        techStack,
      },
      create: {
        projectId: id,
        businessProfile,
        painPoints,
        currentWorkflows,
        techStack,
      },
    });

    return NextResponse.json(discovery);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }
    logError("[PUT /api/projects/[id]/discovery]", error);
    return NextResponse.json(
      { error: "Failed to update discovery data" },
      { status: 500 }
    );
  }
}

// GET /api/projects/[id]/discovery - Get discovery data
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
  } catch (error) {
    logError("[GET /api/projects/[id]/discovery]", error);
    return NextResponse.json(
      { error: "Failed to fetch discovery data" },
      { status: 500 }
    );
  }
}
