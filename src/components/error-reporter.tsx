"use client";

import { useEffect } from "react";

function sendLog(
  level: "ERROR" | "INFO",
  source: string,
  message: string,
  details?: Record<string, unknown>
) {
  fetch("/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level, source, message, details }),
  }).catch(() => {});
}

export function ErrorReporter() {
  useEffect(() => {
    function handleError(event: ErrorEvent) {
      sendLog("ERROR", "window.onerror", event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      const message =
        event.reason instanceof Error
          ? event.reason.message
          : String(event.reason);
      sendLog("ERROR", "unhandledrejection", message, {
        stack: event.reason instanceof Error ? event.reason.stack : undefined,
      });
    }

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    sendLog("INFO", "init", "Error reporter initialized", {
      url: window.location.href,
    });

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
