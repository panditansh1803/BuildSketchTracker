
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertToCSV(data: any[], fileName: string) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj =>
    Object.values(obj).map(value => {
      const stringValue = String(value);
      // Escape quotes and wrap in quotes if contains comma
      if (stringValue.includes(',') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function calculateDelayDays(target: Date | string, actual: Date | string | null | undefined): number {
  const targetDate = new Date(target)
  const compareDate = actual ? new Date(actual) : new Date()

  // Normalize to midnight to avoid hour differences affecting "days"
  targetDate.setHours(0, 0, 0, 0)
  compareDate.setHours(0, 0, 0, 0)

  const diffTime = compareDate.getTime() - targetDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays > 0 ? diffDays : 0
}
