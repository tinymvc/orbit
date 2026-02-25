import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to convert text to headline case
export function headline(text: string | number): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
}

// Helper function to convert text to sentence case
export function mediaUrl(path: string): string {
  // If already a full URL, use as-is
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Prefix with mediaUrl
  const base = (
    !(path.startsWith("/uploads/") || path.startsWith("uploads/"))
      ? "/uploads/"
      : ""
  ).replace(/\/$/, "");
  return `${base}/${path.replace(/^\//, "")}`;
}

// Helper function to convert text to slug case
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Helper function to resolve nested accessors (e.g. "author.name")
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
