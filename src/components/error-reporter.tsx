"use client";

import { useEffect } from "react";

function sendLog(
  source: string,
  message: string,
  details?: Record<string, unknown>
) {
  fetch("/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level: "ERROR", source, message, details }),
  }).catch(() => {
    // Silently fail - don't create error loops
  });
}

export function ErrorReporter() {
  useEffect(() => {
    function handleError(event: ErrorEvent) {
      sendLog("window.onerror", event.message, {
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
      sendLog("unhandledrejection", message, {
        stack: event.reason instanceof Error ? event.reason.stack : undefined,
      });
    }

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Log page load for confirmation logging is working
    sendLog("init", "Error reporter initialized", {
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
