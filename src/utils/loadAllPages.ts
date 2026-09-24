export async function loadAllPages<T>(
  fetchPage: (page: number) => Promise<{ content: T[]; totalPages: number }>,
): Promise<T[]> {
  const first = await fetchPage(0)
  const items = [...first.content]
  for (let page = 1; page < first.totalPages; page++) {
    const next = await fetchPage(page)
    items.push(...next.content)
  }
  return items
}
