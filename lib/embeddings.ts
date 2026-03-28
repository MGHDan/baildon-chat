export const EMBEDDING_DIMENSIONS = 512;
const MODEL = 'voyage-3-lite';

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ input: texts, model: MODEL }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Voyage AI error: ${err}`);
  }

  const data = await res.json();
  return data.data.map((d: { embedding: number[] }) => d.embedding);
}

export async function embedText(text: string): Promise<number[]> {
  const [embedding] = await embedTexts([text]);
  return embedding;
}

export async function embedInBatches(texts: string[]): Promise<number[][]> {
  const BATCH_SIZE = 50;
  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const embeddings = await embedTexts(batch);
    results.push(...embeddings);
  }
  return results;
}
