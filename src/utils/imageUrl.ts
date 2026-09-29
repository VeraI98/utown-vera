export function resolveImageUrl(value: string, apiUrl: string): string {
  if (!value || /^(https?:|blob:|data:|\/\/)/i.test(value)) return value
  return new URL(value, `${apiUrl.replace(/\/$/, '')}/`).href
}
