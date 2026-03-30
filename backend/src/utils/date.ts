export function daysAgo(days: number): Date {
  const now = new Date();
  now.setDate(now.getDate() - days);
  return now;
}

export function isAfterDate(inputDate: string, compareDate: Date): boolean {
  return new Date(inputDate) >= compareDate;
}