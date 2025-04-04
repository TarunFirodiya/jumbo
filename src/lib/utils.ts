
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add the formatPrice function to format currency values
export function formatPrice(price: number): string {
  // Format as Indian currency with commas (e.g., 1,00,000)
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
