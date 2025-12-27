import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateDelayDays(targetFinish: Date, actualFinish?: Date | null): number {
  const today = new Date()
  const endDate = actualFinish ?? today
  // Reset times to noon to avoid timezone edge cases affecting day diff
  const end = new Date(endDate)
  end.setHours(12, 0, 0, 0)
  const target = new Date(targetFinish)
  target.setHours(12, 0, 0, 0)

  const diffMs = end.getTime() - target.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}
