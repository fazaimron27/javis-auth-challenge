import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function for merging class names with Tailwind CSS
 * 
 * This function combines the power of clsx and tailwind-merge:
 * - clsx: Handles conditional class application and array support
 * - tailwind-merge: Intelligently handles Tailwind class conflicts
 * 
 * @param inputs Any number of class values, objects, or arrays
 * @returns A merged className string with conflicts resolved
 * 
 * @example
 * // Basic usage
 * cn("text-red-500", "bg-blue-500")
 * 
 * @example
 * // With conditional classes
 * cn("btn", { "btn-primary": isPrimary, "btn-secondary": !isPrimary })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
