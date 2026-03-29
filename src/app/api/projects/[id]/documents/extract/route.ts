import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { aiJsonRequest } from "@/lib/ai-client";
import {
  EXTRACT_WORKFLOWS_SYSTEM,
  buildExtractWorkflowsPrompt,
} from "@/lib/prompts/extract-workflows";
import { log, logError } from "@/lib/logger";

interface ExtractResult {
  workflows: Array<{
    id: string;
    name: string;
    description: string;
    steps: string[];
    tools: string[];
    painPoints: string[];
    frequency: string;
  }>;
  painPoints: Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    severity: string;
  }>;
  techStack: Array<{
    id: string;
    name: string;
    category: string;
    purpose: string;
    satisfaction: number;
  }>;
  summary: string;
}

// POST /api/projects/[id]/documents/extract - Extract workflows from a document
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: projectId } = params;

    let body: { docId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { docId } = body;
    if (!docId) {
      return NextResponse.json(
        { error: "Missing docId" },
        { status: 400 }
      );
    }

    // Get the document
    const document = await prisma.document.findUnique({
      where: { id: docId },
    });

    if (!document || document.projectId !== projectId) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (document.processingStatus !== "complete") {
      return NextResponse.json(
        { error: "Document is still processing. Please wait and try again." },
        { status: 400 }
      );
    }

    if (
      !document.extractedContent ||
      document.extractedContent.startsWith("[")
    ) {
      return NextResponse.json(
        {
          error:
            "No usable content extracted from this document. It may be an image or empty file.",
        },
        { status: 400 }
      );
    }

    // Get existing discovery data to avoid duplicates
    const discovery = await prisma.discoveryData.findUnique({
      where: { projectId },
    });

    const existingWorkflows = discovery?.currentWorkflows || "[]";

    log(
      "INFO",
      "extract-workflows",
      `Extracting from "${document.fileName}" (${document.extractedContent.length} chars)`
    );

    const prompt = buildExtractWorkflowsPrompt(
      document.fileName,
      document.extractedContent,
      existingWorkflows
    );

    const result = await aiJsonRequest<ExtractResult>(
      EXTRACT_WORKFLOWS_SYSTEM,
      prompt,
      { maxTokens: 8192 }
    );

    log(
      "INFO",
      "extract-workflows",
      `Extracted ${result.workflows.length} workflows, ${result.painPoints.length} pain points, ${result.techStack.length} tech items from "${document.fileName}"`
    );

    // Merge with existing discovery data
    if (discovery) {
      let currentWorkflows: unknown[] = [];
      let currentPainPoints: unknown[] = [];
      let currentTechStack: unknown[] = [];

      try {
        currentWorkflows = JSON.parse(discovery.currentWorkflows || "[]");
      } catch { /* use empty */ }
      try {
        currentPainPoints = JSON.parse(discovery.painPoints || "[]");
      } catch { /* use empty */ }
      try {
        currentTechStack = JSON.parse(discovery.techStack || "[]");
      } catch { /* use empty */ }

      const mergedWorkflows = [
        ...currentWorkflows,
        ...result.workflows,
      ];
      const mergedPainPoints = [
        ...currentPainPoints,
        ...result.painPoints,
      ];
      const mergedTechStack = [
        ...currentTechStack,
        ...result.techStack,
      ];

      await prisma.discoveryData.update({
        where: { projectId },
        data: {
          currentWorkflows: JSON.stringify(mergedWorkflows),
          painPoints: JSON.stringify(mergedPainPoints),
          techStack: JSON.stringify(mergedTechStack),
        },
      });
    }

    return NextResponse.json({
      ...result,
      merged: !!discovery,
    });
  } catch (error) {
    logError("POST /api/projects/[id]/documents/extract", error);

    const message =
      error instanceof Error ? error.message : "Extraction failed";

    if (message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    return NextResponse.json(
      { error: "Failed to extract workflows. Please try again." },
      { status: 500 }
    );
  }
}
