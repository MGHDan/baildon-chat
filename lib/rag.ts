import { sql } from '@/lib/db';

export interface Chunk {
  content: string;
  name: string;
  type: string;
  rank: number;
}

export async function retrieveRelevantChunks(query: string, limit = 6): Promise<Chunk[]> {
  try {
    const result = await sql`
      SELECT c.content, d.name, d.type,
             ts_rank(to_tsvector('english', c.content), plainto_tsquery('english', ${query})) AS rank
      FROM chunks c
      JOIN documents d ON c.document_id = d.id
      WHERE to_tsvector('english', c.content) @@ plainto_tsquery('english', ${query})
      ORDER BY rank DESC
      LIMIT ${limit}
    `;

    // If no keyword matches, fall back to most recent chunks for context
    if (result.rows.length === 0) {
      const fallback = await sql`
        SELECT c.content, d.name, d.type, 0 AS rank
        FROM chunks c
        JOIN documents d ON c.document_id = d.id
        ORDER BY c.created_at DESC
        LIMIT ${limit}
      `;
      return fallback.rows as Chunk[];
    }

    return result.rows as Chunk[];
  } catch (error) {
    console.error('RAG retrieval error:', error);
    return [];
  }
}

export function chunkText(text: string, maxChunkSize = 800): string[] {
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

  const paragraphs = cleaned.split(/\n\n+/).filter(p => p.trim().length > 30);

  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if (current && current.length + para.length + 2 > maxChunkSize) {
      chunks.push(current.trim());
      current = para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  if (chunks.length === 0) {
    for (let i = 0; i < text.length; i += maxChunkSize) {
      chunks.push(text.slice(i, i + maxChunkSize));
    }
  }

  return chunks;
}
