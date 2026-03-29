import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";
import fs from "fs";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "logs", "app.log");

// POST /api/log - Receive client-side errors
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level = "ERROR", source = "client", message, details } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const logLevel =
      level === "INFO" ? "INFO" : level === "WARN" ? "WARN" : "ERROR";

    log(logLevel, `CLIENT:${source}`, message, details);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Log failed" }, { status: 500 });
  }
}

// GET /api/log?lines=50&errors=true - View recent logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const maxLines = Math.min(
      parseInt(searchParams.get("lines") || "50", 10),
      500
    );
    const errorsOnly = searchParams.get("errors") === "true";

    if (!fs.existsSync(LOG_FILE)) {
      return NextResponse.json({ logs: [], total: 0 });
    }

    const content = fs.readFileSync(LOG_FILE, "utf-8");

    // Split into log entries (each starts with a timestamp)
    const entries = content
      .split(/(?=\[\d{4}-\d{2}-\d{2}T)/)
      .filter((e) => e.trim());

    let filtered = entries;
    if (errorsOnly) {
      filtered = entries.filter((e) => e.includes("] ERROR ["));
    }

    // Return the most recent entries
    const recent = filtered.slice(-maxLines);

    return NextResponse.json({
      logs: recent,
      total: filtered.length,
      showing: recent.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to read logs" },
      { status: 500 }
    );
  }
}
