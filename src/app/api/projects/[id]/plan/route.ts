import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { aiJsonRequest } from "@/lib/ai-client";
import {
  BUILD_PLAN_SYSTEM,
  buildPlanPrompt,
} from "@/lib/prompts/build-implementation-plan";
import { log, logError } from "@/lib/logger";

interface PlanResult {
  phases: Array<{
    id: string;
    name: string;
    description: string;
    order: number;
    durationWeeks: number;
    tasks: Array<{
      id: string;
      title: string;
      description: string;
      recommendationTitle: string;
      estimatedHours: number;
      resources: string[];
      status: string;
    }>;
    dependencies: string[];
    milestones: string[];
  }>;
  totalDurationWeeks: number;
  totalEstimatedHours: number;
  resourceSummary: {
    roles: string[];
    estimatedTeamSize: number;
    estimatedBudgetRange: string;
  };
  costBreakdown: {
    laborCost: string;
    newToolingCost: string;
    existingToolsLeveraged: string[];
    newToolsRequired: Array<{
      tool: string;
      purpose: string;
      estimatedAnnualCost: string;
      alternatives: string;
    }>;
    costSavingsFromReuse: string;
  };
  risks: Array<{
    risk: string;
    mitigation: string;
    likelihood: string;
  }>;
}

// POST /api/projects/[id]/plan - Generate implementation plan
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        recommendations: { where: { selected: true } },
        discovery: { select: { techStack: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.recommendations.length === 0) {
      return NextResponse.json(
        { error: "No recommendations selected. Select at least one recommendation first." },
        { status: 400 }
      );
    }

    log(
      "INFO",
      "plan",
      `Generating plan for "${project.clientName}" with ${project.recommendations.length} selected recommendations`
    );

    const selectedRecs = project.recommendations.map((r) => {
      const customizations = JSON.parse(r.customizations || "{}");
      const rec: Record<string, unknown> = {
        title: r.title,
        description: r.description,
        category: r.category,
        effortScore: r.effortScore,
        impactScore: r.impactScore,
        dependencies: JSON.parse(r.dependencies),
      };
      if (customizations.userComment) {
        rec.userNotes = customizations.userComment;
      }
      return rec;
    });

    const prompt = buildPlanPrompt(
      project.clientName,
      project.industry,
      JSON.stringify(selectedRecs, null, 2),
      project.discovery?.techStack || "[]"
    );

    const result = await aiJsonRequest<PlanResult>(
      BUILD_PLAN_SYSTEM,
      prompt,
      { maxTokens: 8192 }
    );

    // Save plan to database
    const plan = await prisma.implementationPlan.create({
      data: {
        projectId: id,
        phases: JSON.stringify(result.phases),
        selectedRecommendationIds: JSON.stringify(
          project.recommendations.map((r) => r.id)
        ),
        interdependencies: JSON.stringify({
          resourceSummary: result.resourceSummary,
          costBreakdown: result.costBreakdown,
          risks: result.risks,
          totalDurationWeeks: result.totalDurationWeeks,
          totalEstimatedHours: result.totalEstimatedHours,
        }),
        confirmed: false,
      },
    });

    // Update project status
    await prisma.project.update({
      where: { id },
      data: { status: "planning" },
    });

    log("INFO", "plan", `Plan generated: ${result.phases.length} phases, ${result.totalDurationWeeks} weeks`);

    return NextResponse.json({
      id: plan.id,
      ...result,
    });
  } catch (error) {
    logError("POST /api/projects/[id]/plan", error);
    const message = error instanceof Error ? error.message : "Failed";
    if (message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    return NextResponse.json(
      { error: "Failed to generate plan. Please try again." },
      { status: 500 }
    );
  }
}

// GET /api/projects/[id]/plan - Get latest plan
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const plan = await prisma.implementationPlan.findFirst({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "No plan found" },
        { status: 404 }
      );
    }

    const safeParse = (json: string, fallback: unknown) => {
      try { return JSON.parse(json); } catch { return fallback; }
    };

    const phases = safeParse(plan.phases, []);
    const meta = safeParse(plan.interdependencies, {});

    return NextResponse.json({
      id: plan.id,
      phases,
      totalDurationWeeks: meta.totalDurationWeeks || 0,
      totalEstimatedHours: meta.totalEstimatedHours || 0,
      resourceSummary: meta.resourceSummary || { roles: [], estimatedTeamSize: 0, estimatedBudgetRange: "N/A" },
      costBreakdown: meta.costBreakdown || null,
      risks: meta.risks || [],
      confirmed: plan.confirmed,
      createdAt: plan.createdAt,
    });
  } catch (error) {
    logError("GET /api/projects/[id]/plan", error);
    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}
