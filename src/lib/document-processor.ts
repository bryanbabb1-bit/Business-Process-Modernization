import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export const MAX_EXTRACTED_LENGTH = 500_000; // ~500KB text limit

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

/**
 * Extract text content from uploaded documents.
 * Supports: PDF, DOCX, XLSX, CSV, and plain text files.
 */
export async function extractText(filePath: string, fileType: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".pdf":
      return extractPdf(filePath);
    case ".docx":
      return extractDocx(filePath);
    case ".xlsx":
    case ".xls":
      return extractSpreadsheet(filePath);
    case ".csv":
      return extractCsv(filePath);
    case ".txt":
    case ".md":
    case ".json":
    case ".yaml":
    case ".yml":
      return extractPlainText(filePath);
    default:
      return `[Unsupported file type: ${ext}]`;
  }
}

async function extractPdf(filePath: string): Promise<string> {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text || "[No text content found in PDF]";
  } catch (error) {
    console.error("PDF extraction error:", error);
    return `[Error extracting PDF: ${error instanceof Error ? error.message : "unknown"}]`;
  }
}

async function extractDocx(filePath: string): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || "[No text content found in DOCX]";
  } catch (error) {
    console.error("DOCX extraction error:", error);
    return `[Error extracting DOCX: ${error instanceof Error ? error.message : "unknown"}]`;
  }
}

async function extractSpreadsheet(filePath: string): Promise<string> {
  try {
    const XLSX = await import("xlsx");
    const buffer = await fs.readFile(filePath);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const lines: string[] = [];

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      lines.push(`--- Sheet: ${sheetName} ---`);
      const csv = XLSX.utils.sheet_to_csv(sheet);
      lines.push(csv);
      lines.push("");
    }

    return lines.join("\n") || "[No data found in spreadsheet]";
  } catch (error) {
    console.error("Spreadsheet extraction error:", error);
    return `[Error extracting spreadsheet: ${error instanceof Error ? error.message : "unknown"}]`;
  }
}

async function extractCsv(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return content || "[Empty CSV file]";
  } catch (error) {
    console.error("CSV extraction error:", error);
    return `[Error reading CSV: ${error instanceof Error ? error.message : "unknown"}]`;
  }
}

async function extractPlainText(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return content || "[Empty file]";
  } catch (error) {
    console.error("Text extraction error:", error);
    return `[Error reading text file: ${error instanceof Error ? error.message : "unknown"}]`;
  }
}

/**
 * Ensure the upload directory exists and return the project-specific path.
 * Validates projectId to prevent path traversal.
 */
export async function getProjectUploadDir(projectId: string): Promise<string> {
  // Only allow alphanumeric, hyphens, and underscores (UUID/CUID format)
  if (!/^[\w-]+$/.test(projectId)) {
    throw new Error("Invalid project ID");
  }
  const dir = path.join(UPLOAD_DIR, projectId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

/**
 * Generate a safe filename to avoid collisions and path traversal.
 */
export function safeFileName(originalName: string): string {
  // Strip path separators, null bytes, and other dangerous chars
  const cleaned = originalName
    .replace(/[/\\:*?"<>|\x00]/g, "_")
    .replace(/\.\./g, "_");
  const timestamp = Date.now();
  const rand = crypto.randomBytes(4).toString("hex");
  const ext = path.extname(cleaned);
  const base = path.basename(cleaned, ext);
  return `${timestamp}-${rand}-${base}${ext}`;
}

/**
 * Get the file size limit (10MB default).
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Allowed file extensions for upload.
 */
export const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".docx",
  ".xlsx",
  ".xls",
  ".csv",
  ".txt",
  ".md",
  ".json",
  ".yaml",
  ".yml",
  ".png",
  ".jpg",
  ".jpeg",
]);

export function isAllowedExtension(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}
