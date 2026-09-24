export async function runBatch<T>(
  items: T[],
  action: (item: T) => Promise<unknown>,
) {
  const results = await Promise.allSettled(
    items.map((item) => Promise.resolve().then(() => action(item))),
  )
  return {
    succeeded: items.filter(
      (_, index) => results[index].status === 'fulfilled',
    ),
    failed: items.filter((_, index) => results[index].status === 'rejected'),
  }
}
