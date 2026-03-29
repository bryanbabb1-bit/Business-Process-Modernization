import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { INDUSTRIES, COMPANY_SIZES } from "@/types";
import { logError } from "@/lib/logger";

// GET /api/projects - List all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(projects);
  } catch (error) {
    logError("GET /api/projects", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { name, clientName, industry, companySize } = body as Record<
      string,
      unknown
    >;

    // Validate required fields are non-empty strings
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof clientName !== "string" ||
      !clientName.trim() ||
      typeof industry !== "string" ||
      !industry.trim() ||
      typeof companySize !== "string" ||
      !companySize.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Missing or invalid required fields: name, clientName, industry, companySize",
        },
        { status: 400 }
      );
    }

    // Validate lengths
    if (name.trim().length > 255 || clientName.trim().length > 255) {
      return NextResponse.json(
        { error: "name and clientName must be 255 characters or less" },
        { status: 400 }
      );
    }

    // Validate against allowed values
    if (
      !INDUSTRIES.includes(industry as (typeof INDUSTRIES)[number])
    ) {
      return NextResponse.json(
        { error: `Invalid industry. Must be one of: ${INDUSTRIES.join(", ")}` },
        { status: 400 }
      );
    }

    if (
      !COMPANY_SIZES.includes(companySize as (typeof COMPANY_SIZES)[number])
    ) {
      return NextResponse.json(
        {
          error: `Invalid companySize. Must be one of: ${COMPANY_SIZES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        clientName: clientName.trim(),
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
  } catch (error) {
    logError("POST /api/projects", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
