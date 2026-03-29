import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function rotateIfNeeded() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const stats = fs.statSync(LOG_FILE);
      if (stats.size > MAX_LOG_SIZE) {
        const backup = LOG_FILE + ".old";
        if (fs.existsSync(backup)) fs.unlinkSync(backup);
        fs.renameSync(LOG_FILE, backup);
      }
    }
  } catch {
    // Ignore rotation errors
  }
}

export function log(
  level: "INFO" | "WARN" | "ERROR",
  source: string,
  message: string,
  details?: unknown
) {
  ensureLogDir();
  rotateIfNeeded();

  const timestamp = new Date().toISOString();
  const detailStr = details
    ? "\n  " + JSON.stringify(details, null, 2).replace(/\n/g, "\n  ")
    : "";
  const line = `[${timestamp}] ${level} [${source}] ${message}${detailStr}\n`;

  try {
    fs.appendFileSync(LOG_FILE, line);
  } catch {
    // If logging fails, don't crash the app
  }

  // Also log to console in development
  if (process.env.NODE_ENV === "development") {
    if (level === "ERROR") console.error(line);
    else if (level === "WARN") console.warn(line);
  }
}

export function logError(source: string, error: unknown) {
  const message =
    error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  log("ERROR", source, message, { stack });
}
