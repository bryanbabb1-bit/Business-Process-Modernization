import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/logger";

// POST /api/log - Receive client-side errors
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level = "ERROR", source = "client", message, details } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    log(
      level === "WARN" ? "WARN" : "ERROR",
      `CLIENT:${source}`,
      message,
      details
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Log failed" }, { status: 500 });
  }
}
