import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    discovery: "bg-blue-100 text-blue-800",
    analysis: "bg-purple-100 text-purple-800",
    planning: "bg-amber-100 text-amber-800",
    building: "bg-emerald-100 text-emerald-800",
    complete: "bg-green-100 text-green-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    quick_win: "bg-green-100 text-green-800 border-green-200",
    medium_effort: "bg-amber-100 text-amber-800 border-amber-200",
    transformational: "bg-purple-100 text-purple-800 border-purple-200",
  };
  return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    quick_win: "Quick Win",
    medium_effort: "Medium Effort",
    transformational: "Transformational",
  };
  return labels[category] || category;
}
