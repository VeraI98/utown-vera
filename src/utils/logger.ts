export const logError = (context: string, error: unknown) => {
  if (!import.meta.env.DEV) {
    return
  }

  console.error(`[${context}]`, error)
}
