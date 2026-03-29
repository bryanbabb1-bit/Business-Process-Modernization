import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import { logError } from "@/lib/logger";
import path from "path";

// GET /api/projects/[id]/build/download - Download latest package ZIP
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const pkg = await prisma.deliverablePackage.findFirst({
      where: { projectId: id, status: "ready" },
      orderBy: { createdAt: "desc" },
    });

    if (!pkg || !pkg.packagePath) {
      return NextResponse.json(
        { error: "No package available for download" },
        { status: 404 }
      );
    }

    // Validate path is within expected uploads directory
    const uploadsDir = path.resolve(process.cwd(), "uploads", "packages");
    const resolvedPath = path.resolve(pkg.packagePath);
    if (!resolvedPath.startsWith(uploadsDir)) {
      return NextResponse.json(
        { error: "Invalid package path" },
        { status: 400 }
      );
    }

    const zipBuffer = await readFile(resolvedPath);

    // Mark as downloaded
    await prisma.deliverablePackage.update({
      where: { id: pkg.id },
      data: { status: "downloaded" },
    });

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${pkg.packageName}.zip"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    logError("GET /api/projects/[id]/build/download", error);
    return NextResponse.json(
      { error: "Failed to download package" },
      { status: 500 }
    );
  }
}
