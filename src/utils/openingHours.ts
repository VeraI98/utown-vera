export function parseHoursRow(
  value: string,
): { start: string; end: string } | null {
  const match = value
    .trim()
    .match(
      /^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?\s*[-–—]\s*(\d{1,2}):([0-5]\d)(?::([0-5]\d))?$/,
    )
  if (!match || Number(match[1]) > 23 || Number(match[4]) > 23) return null
  const start = `${match[1].padStart(2, '0')}:${match[2]}${match[3] ? `:${match[3]}` : ''}`
  const end = `${match[4].padStart(2, '0')}:${match[5]}${match[6] ? `:${match[6]}` : ''}`
  return { start, end }
}

export function isValidHoursRow(value: string): boolean {
  return !value.trim() || parseHoursRow(value) !== null
}
