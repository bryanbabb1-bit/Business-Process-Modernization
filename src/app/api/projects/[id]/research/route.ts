import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { aiJsonRequest } from "@/lib/ai-client";
import {
  RESEARCH_DISCOVERY_SYSTEM,
  buildResearchPrompt,
} from "@/lib/prompts/research-discovery";
import { log, logError } from "@/lib/logger";

interface ResearchResult {
  businessProfile: {
    description: string;
    revenue: string;
    headcount: string;
    goals: string[];
    marketPosition: string;
    keyProcesses: string[];
  };
  painPoints: Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    severity: string;
  }>;
  currentWorkflows: Array<{
    id: string;
    name: string;
    description: string;
    steps: string[];
    tools: string[];
    painPoints: string[];
    frequency: string;
  }>;
  techStack: Array<{
    id: string;
    name: string;
    category: string;
    purpose: string;
    satisfaction: number;
  }>;
}

// POST /api/projects/[id]/research - AI-powered discovery pre-population
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get project details
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    log(
      "INFO",
      "research",
      `Starting AI research for "${project.clientName}" (${project.industry})`
    );

    const prompt = buildResearchPrompt(
      project.clientName,
      project.industry,
      project.companySize
    );

    const result = await aiJsonRequest<ResearchResult>(
      RESEARCH_DISCOVERY_SYSTEM,
      prompt,
      { maxTokens: 4096 }
    );

    // Save to discovery data
    await prisma.discoveryData.upsert({
      where: { projectId: id },
      update: {
        businessProfile: JSON.stringify(result.businessProfile),
        painPoints: JSON.stringify(result.painPoints),
        currentWorkflows: JSON.stringify(result.currentWorkflows),
        techStack: JSON.stringify(result.techStack),
      },
      create: {
        projectId: id,
        businessProfile: JSON.stringify(result.businessProfile),
        painPoints: JSON.stringify(result.painPoints),
        currentWorkflows: JSON.stringify(result.currentWorkflows),
        techStack: JSON.stringify(result.techStack),
      },
    });

    log(
      "INFO",
      "research",
      `Research complete for "${project.clientName}": ${result.painPoints.length} pain points, ${result.currentWorkflows.length} workflows, ${result.techStack.length} tech items`
    );

    return NextResponse.json(result);
  } catch (error) {
    logError("POST /api/projects/[id]/research", error);

    const message =
      error instanceof Error ? error.message : "Research failed";

    // Return user-friendly error for API key issues
    if (message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    return NextResponse.json(
      { error: "AI research failed. Please try again." },
      { status: 500 }
    );
  }
}
