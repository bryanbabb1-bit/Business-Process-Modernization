import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import path from "path";
import fs from "fs/promises";
import {
  extractText,
  getProjectUploadDir,
  safeFileName,
  isAllowedExtension,
  MAX_FILE_SIZE,
} from "@/lib/document-processor";

// GET /api/projects/[id]/documents - List documents for a project
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const documents = await prisma.document.findMany({
      where: { projectId: id },
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
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("[GET /api/projects/[id]/documents]", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/documents - Upload a document
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file extension
    if (!isAllowedExtension(file.name)) {
      return NextResponse.json(
        {
          error: `File type not allowed. Supported: PDF, DOCX, XLSX, CSV, TXT, MD, JSON, YAML, PNG, JPG`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is 10MB.` },
        { status: 400 }
      );
    }

    // Save file to disk
    const uploadDir = await getProjectUploadDir(id);
    const fileName = safeFileName(file.name);
    const filePath = path.join(uploadDir, fileName);

    const bytes = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(bytes));

    // Create document record
    const document = await prisma.document.create({
      data: {
        projectId: id,
        fileName: file.name,
        fileType: file.type || path.extname(file.name),
        filePath,
        fileSize: file.size,
        processingStatus: "pending",
      },
    });

    // Process in background (extract text)
    processDocument(document.id, filePath, file.type).catch((err) =>
      console.error(`[Document processing failed: ${document.id}]`, err)
    );

    // Return document without filePath
    return NextResponse.json(
      {
        id: document.id,
        projectId: document.projectId,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        extractedContent: "",
        processingStatus: document.processingStatus,
        createdAt: document.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/projects/[id]/documents]", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/documents?docId=xxx - Delete a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docId = request.nextUrl.searchParams.get("docId");
    if (!docId) {
      return NextResponse.json(
        { error: "Missing docId parameter" },
        { status: 400 }
      );
    }

    // Find the document to get its file path
    const document = await prisma.document.findUnique({
      where: { id: docId },
    });

    if (!document || document.projectId !== params.id) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete file from disk
    try {
      await fs.unlink(document.filePath);
    } catch {
      // File may already be deleted, continue
    }

    // Delete database record
    await prisma.document.delete({ where: { id: docId } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }
    console.error("[DELETE /api/projects/[id]/documents]", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

/**
 * Background document processing - extracts text and updates the database.
 */
async function processDocument(
  documentId: string,
  filePath: string,
  fileType: string
): Promise<void> {
  await prisma.document.update({
    where: { id: documentId },
    data: { processingStatus: "processing" },
  });

  try {
    const extractedContent = await extractText(filePath, fileType);

    await prisma.document.update({
      where: { id: documentId },
      data: {
        extractedContent,
        processingStatus: "complete",
      },
    });
  } catch (error) {
    console.error(`[processDocument ${documentId}]`, error);
    await prisma.document.update({
      where: { id: documentId },
      data: {
        extractedContent: `[Processing error: ${error instanceof Error ? error.message : "unknown"}]`,
        processingStatus: "error",
      },
    });
  }
}
