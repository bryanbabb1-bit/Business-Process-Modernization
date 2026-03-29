import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { aiJsonRequest } from "@/lib/ai-client";
import {
  GENERATE_RECOMMENDATIONS_SYSTEM,
  buildRecommendationsPrompt,
} from "@/lib/prompts/generate-recommendations";
import { log, logError } from "@/lib/logger";

function safeParse(json: string, fallback: unknown) {
  try { return JSON.parse(json); } catch { return fallback; }
}

interface RecommendationItem {
  title: string;
  description: string;
  category: string;
  effortScore: number;
  impactScore: number;
  dependencies: string[];
  estimatedWeeks: number;
  keyBenefits: string[];
  riskFactors: string[];
}

// POST /api/projects/[id]/recommendations - Generate recommendations from analysis
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        discovery: true,
        analyses: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const analysis = project.analyses[0];
    if (!analysis) {
      return NextResponse.json(
        { error: "No analysis found. Run analysis first." },
        { status: 400 }
      );
    }

    log("INFO", "recommendations", `Generating for "${project.clientName}"`);

    const prompt = buildRecommendationsPrompt(
      project.clientName,
      project.industry,
      analysis.currentStateAssessment,
      analysis.gapAnalysis,
      analysis.maturityScores,
      project.discovery?.currentWorkflows || "[]",
      project.discovery?.painPoints || "[]"
    );

    const items = await aiJsonRequest<RecommendationItem[]>(
      GENERATE_RECOMMENDATIONS_SYSTEM,
      prompt,
      { maxTokens: 8192 }
    );

    // Delete old recommendations for this project, then create new ones
    await prisma.recommendation.deleteMany({ where: { projectId: id } });

    const recommendations = await Promise.all(
      items.map((item) =>
        prisma.recommendation.create({
          data: {
            projectId: id,
            analysisId: analysis.id,
            title: item.title,
            description: item.description,
            category: item.category,
            effortScore: item.effortScore,
            impactScore: item.impactScore,
            dependencies: JSON.stringify(item.dependencies || []),
            selected: false,
            customizations: JSON.stringify({
              estimatedWeeks: item.estimatedWeeks,
              keyBenefits: item.keyBenefits,
              riskFactors: item.riskFactors,
            }),
          },
        })
      )
    );

    log(
      "INFO",
      "recommendations",
      `Generated ${recommendations.length} recommendations for "${project.clientName}"`
    );

    return NextResponse.json(
      recommendations.map((r) => ({
        ...r,
        dependencies: safeParse(r.dependencies, []),
        customizations: safeParse(r.customizations, {}),
      }))
    );
  } catch (error) {
    logError("POST /api/projects/[id]/recommendations", error);
    const message = error instanceof Error ? error.message : "Failed";
    if (message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    return NextResponse.json(
      { error: "Failed to generate recommendations. Please try again." },
      { status: 500 }
    );
  }
}

// GET /api/projects/[id]/recommendations - List recommendations
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const recommendations = await prisma.recommendation.findMany({
      where: { projectId: id },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(
      recommendations.map((r) => ({
        ...r,
        dependencies: safeParse(r.dependencies, []),
        customizations: safeParse(r.customizations, {}),
      }))
    );
  } catch (error) {
    logError("GET /api/projects/[id]/recommendations", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id]/recommendations - Toggle selected status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let body: { recId?: string; selected?: boolean };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { recId, selected } = body;
    if (!recId || typeof selected !== "boolean") {
      return NextResponse.json(
        { error: "Missing recId or selected" },
        { status: 400 }
      );
    }

    const rec = await prisma.recommendation.update({
      where: { id: recId },
      data: { selected },
    });

    return NextResponse.json({
      ...rec,
      dependencies: JSON.parse(rec.dependencies),
      customizations: JSON.parse(rec.customizations),
    });
  } catch (error) {
    logError("PATCH /api/projects/[id]/recommendations", error);
    return NextResponse.json(
      { error: "Failed to update recommendation" },
      { status: 500 }
    );
  }
}
