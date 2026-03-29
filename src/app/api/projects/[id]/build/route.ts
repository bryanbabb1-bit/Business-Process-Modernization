import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { aiJsonRequest } from "@/lib/ai-client";
import {
  GENERATE_ARTIFACTS_SYSTEM,
  buildArtifactsPrompt,
} from "@/lib/prompts/generate-artifacts";
import { generatePackageZip } from "@/lib/package-generator";
import { log, logError } from "@/lib/logger";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

function safeParse(json: string, fallback: unknown) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

interface ArtifactResult {
  packageName: string;
  summary: string;
  artifacts: Array<{
    fileName: string;
    category: string;
    description: string;
    content: string;
  }>;
  configValues: Array<{
    key: string;
    label: string;
    description: string;
    type: string;
    defaultValue: string;
    required: boolean;
  }>;
}

// POST /api/projects/[id]/build - Generate deliverable package
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    let body: { selectedOption?: string };
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const selectedOption = body.selectedOption || "currentStack";

    // Get project with plan and discovery
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        discovery: true,
        plans: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const plan = project.plans[0];
    if (!plan) {
      return NextResponse.json(
        { error: "No implementation plan found. Generate a plan first." },
        { status: 400 }
      );
    }

    log(
      "INFO",
      "build",
      `Generating package for "${project.clientName}" (option: ${selectedOption})`
    );

    const phases = safeParse(plan.phases, []);
    const meta = safeParse(plan.interdependencies, {});

    const prompt = buildArtifactsPrompt(
      project.clientName,
      project.industry,
      project.discovery?.techStack || "[]",
      JSON.stringify(phases, null, 2),
      JSON.stringify(meta.implementationOptions || {}, null, 2),
      selectedOption
    );

    const result = await aiJsonRequest<ArtifactResult>(
      GENERATE_ARTIFACTS_SYSTEM,
      prompt,
      { maxTokens: 16384 }
    );

    // Generate ZIP file
    const zipBuffer = await generatePackageZip(result);

    // Save ZIP to uploads directory
    const uploadsDir = path.join(process.cwd(), "uploads", "packages");
    await mkdir(uploadsDir, { recursive: true });
    const zipFileName = `${result.packageName}-${Date.now()}.zip`;
    const zipPath = path.join(uploadsDir, zipFileName);
    await writeFile(zipPath, zipBuffer);

    // Save to database
    const pkg = await prisma.deliverablePackage.create({
      data: {
        planId: plan.id,
        projectId: id,
        packageName: result.packageName,
        packagePath: zipPath,
        configSchema: JSON.stringify(result.configValues),
        artifacts: JSON.stringify(
          result.artifacts.map((a) => ({
            fileName: a.fileName,
            category: a.category,
            description: a.description,
          }))
        ),
        status: "ready",
      },
    });

    // Update project status
    await prisma.project.update({
      where: { id },
      data: { status: "building" },
    });

    log(
      "INFO",
      "build",
      `Package generated: ${result.artifacts.length} artifacts, ${zipFileName}`
    );

    return NextResponse.json({
      id: pkg.id,
      packageName: result.packageName,
      summary: result.summary,
      artifacts: result.artifacts.map((a) => ({
        fileName: a.fileName,
        category: a.category,
        description: a.description,
      })),
      configValues: result.configValues,
      status: "ready",
    });
  } catch (error) {
    logError("POST /api/projects/[id]/build", error);
    const message = error instanceof Error ? error.message : "Failed";
    if (message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    return NextResponse.json(
      { error: "Failed to generate package. Please try again." },
      { status: 500 }
    );
  }
}

// GET /api/projects/[id]/build - Get latest package
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const pkg = await prisma.deliverablePackage.findFirst({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    });

    if (!pkg) {
      return NextResponse.json(
        { error: "No package found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: pkg.id,
      packageName: pkg.packageName,
      artifacts: safeParse(pkg.artifacts, []),
      configSchema: safeParse(pkg.configSchema, []),
      status: pkg.status,
      createdAt: pkg.createdAt,
    });
  } catch (error) {
    logError("GET /api/projects/[id]/build", error);
    return NextResponse.json(
      { error: "Failed to fetch package" },
      { status: 500 }
    );
  }
}
