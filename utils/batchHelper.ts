// utils/batchHelper.ts

export async function processInBatches<T, R>(
    items: T[],
    batchSize: number,
    handler: (batch: T[]) => Promise<R[]>
  ): Promise<R[]> {
    const results: R[] = [];
  
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResult = await handler(batch);
      results.push(...batchResult);
    }
  
    return results;
  }
  