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

/**
 * Normalize the AI response into the expected ArtifactResult shape.
 * The AI may nest data under various keys or wrap the whole thing.
 */
function normalizeArtifactResult(raw: Record<string, unknown>): ArtifactResult {
  // Try to find artifacts array — could be at top level or nested
  let data = raw;

  // If the result has a single wrapper key like "data", "result", "output", unwrap it
  const keys = Object.keys(raw);
  if (keys.length === 1 && typeof raw[keys[0]] === "object" && raw[keys[0]] !== null) {
    const inner = raw[keys[0]] as Record<string, unknown>;
    if (Array.isArray(inner.artifacts) || Array.isArray(inner.configValues)) {
      data = inner;
    }
  }

  // Find artifacts array — check common locations
  let artifacts = data.artifacts;
  if (!Array.isArray(artifacts)) {
    // Search one level deep for an artifacts array
    for (const val of Object.values(data)) {
      if (val && typeof val === "object" && !Array.isArray(val)) {
        const nested = val as Record<string, unknown>;
        if (Array.isArray(nested.artifacts)) {
          artifacts = nested.artifacts;
          // Also pull other fields from this nested object
          data = { ...data, ...nested };
          break;
        }
      }
    }
  }

  if (!Array.isArray(artifacts)) {
    log("ERROR", "build", `AI response keys: ${JSON.stringify(Object.keys(raw))}`);
    throw new Error("AI response missing artifacts array");
  }

  return {
    packageName: String(data.packageName || data.package_name || "modernization-package"),
    summary: String(data.summary || data.description || ""),
    artifacts: (artifacts as Array<Record<string, unknown>>).map((a) => ({
      fileName: String(a.fileName || a.file_name || a.name || "untitled.txt"),
      category: String(a.category || a.type || "guide"),
      description: String(a.description || ""),
      content: String(a.content || a.body || ""),
    })),
    configValues: Array.isArray(data.configValues || data.config_values)
      ? ((data.configValues || data.config_values) as Array<Record<string, unknown>>).map((cv) => ({
          key: String(cv.key || cv.name || ""),
          label: String(cv.label || cv.key || ""),
          description: String(cv.description || ""),
          type: String(cv.type || "string"),
          defaultValue: String(cv.defaultValue || cv.default_value || cv.default || ""),
          required: Boolean(cv.required),
        }))
      : [],
  };
}

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

    const rawResult = await aiJsonRequest<Record<string, unknown>>(
      GENERATE_ARTIFACTS_SYSTEM,
      prompt,
      { maxTokens: 16384 }
    );

    // Normalize the AI response — it may nest data under various keys
    const result = normalizeArtifactResult(rawResult);

    log(
      "INFO",
      "build",
      `AI returned ${result.artifacts.length} artifacts, ${result.configValues.length} config values`
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
