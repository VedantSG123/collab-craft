import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function debounce<T extends unknown[]>(
  func: (...args: T) => void,
  delay: number
): (...args: T) => void {
  let timer: NodeJS.Timeout | null = null

  return (...args: T) => {
    if (timer) clearTimeout(timer)

    timer = setTimeout(() => {
      func.call(null, ...args)
    }, delay)
  }
}
