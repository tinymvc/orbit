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
