import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { aiJsonRequest } from "@/lib/ai-client";
import {
  ANALYZE_BUSINESS_SYSTEM,
  buildAnalyzePrompt,
} from "@/lib/prompts/analyze-business";
import { log, logError } from "@/lib/logger";

interface AnalysisResult {
  currentStateAssessment: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  gapAnalysis: Array<{
    area: string;
    currentState: string;
    desiredState: string;
    gapSeverity: string;
    recommendation: string;
  }>;
  maturityScores: Array<{
    dimension: string;
    currentScore: number;
    targetScore: number;
    maxScore: number;
  }>;
  informationGaps: Array<{
    id: string;
    area: string;
    question: string;
    importance: string;
    resolved: boolean;
  }>;
}

// POST /api/projects/[id]/analyze - Run AI analysis on all discovery data
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get project with all discovery data
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        discovery: true,
        documents: {
          where: { processingStatus: "complete" },
          select: { fileName: true, extractedContent: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (!project.discovery) {
      return NextResponse.json(
        { error: "No discovery data found. Complete the discovery phase first." },
        { status: 400 }
      );
    }

    log(
      "INFO",
      "analyze",
      `Starting analysis for "${project.clientName}" (${project.industry})`
    );

    // Build document summaries (first 2000 chars each, max 5 docs)
    const docSummaries = project.documents
      .slice(0, 5)
      .map(
        (d) =>
          `--- ${d.fileName} ---\n${(d.extractedContent || "").slice(0, 2000)}`
      )
      .join("\n\n");

    const prompt = buildAnalyzePrompt(
      project.clientName,
      project.industry,
      project.companySize,
      project.discovery.businessProfile,
      project.discovery.painPoints,
      project.discovery.currentWorkflows,
      project.discovery.techStack,
      docSummaries
    );

    const result = await aiJsonRequest<AnalysisResult>(
      ANALYZE_BUSINESS_SYSTEM,
      prompt,
      { maxTokens: 8192 }
    );

    // Save analysis to database
    const analysis = await prisma.analysis.create({
      data: {
        projectId: id,
        currentStateAssessment: JSON.stringify(result.currentStateAssessment),
        gapAnalysis: JSON.stringify(result.gapAnalysis),
        maturityScores: JSON.stringify(result.maturityScores),
        informationGaps: JSON.stringify(result.informationGaps),
      },
    });

    // Update project status to analysis
    await prisma.project.update({
      where: { id },
      data: { status: "analysis" },
    });

    log(
      "INFO",
      "analyze",
      `Analysis complete for "${project.clientName}": ${result.gapAnalysis.length} gaps, ${result.maturityScores.length} dimensions, ${result.informationGaps.length} info gaps`
    );

    return NextResponse.json({
      id: analysis.id,
      ...result,
    });
  } catch (error) {
    logError("POST /api/projects/[id]/analyze", error);

    const message =
      error instanceof Error ? error.message : "Analysis failed";

    if (message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    return NextResponse.json(
      { error: "AI analysis failed. Please try again." },
      { status: 500 }
    );
  }
}

// GET /api/projects/[id]/analyze - Get latest analysis
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const analysis = await prisma.analysis.findFirst({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "No analysis found. Run analysis first." },
        { status: 404 }
      );
    }

    const safeParse = (json: string, fallback: unknown) => {
      try {
        return JSON.parse(json);
      } catch {
        return fallback;
      }
    };

    return NextResponse.json({
      id: analysis.id,
      projectId: analysis.projectId,
      currentStateAssessment: safeParse(analysis.currentStateAssessment, {
        summary: "",
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      }),
      gapAnalysis: safeParse(analysis.gapAnalysis, []),
      maturityScores: safeParse(analysis.maturityScores, []),
      informationGaps: safeParse(analysis.informationGaps, []),
      createdAt: analysis.createdAt,
    });
  } catch (error) {
    logError("GET /api/projects/[id]/analyze", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}
