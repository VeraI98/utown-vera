export function resolveImageUrl(value: string, apiUrl: string): string {
  if (!value || /^(https?:|blob:|data:|\/\/)/i.test(value)) return value
  return new URL(value, `${apiUrl.replace(/\/$/, '')}/`).href
}

export function resolveResponseImages(value: unknown, apiUrl: string): void {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    value.forEach((item) => resolveResponseImages(item, apiUrl))
    return
  }
  const record = value as Record<string, unknown>
  for (const [key, item] of Object.entries(record)) {
    if (key === 'imageUrl' && typeof item === 'string') {
      record[key] = resolveImageUrl(item, apiUrl)
    } else if (item && typeof item === 'object') {
      resolveResponseImages(item, apiUrl)
    }
  }
}
