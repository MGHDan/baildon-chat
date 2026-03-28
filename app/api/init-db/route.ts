import { createClient } from '@vercel/postgres';
import { EMBEDDING_DIMENSIONS } from '@/lib/embeddings';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const authHeader = req.headers.get('x-admin-password');
  if (authHeader !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = createClient({
    connectionString: process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL,
  });
  await client.connect();

  try {
    await client.query('CREATE EXTENSION IF NOT EXISTS vector');

    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'pdf',
        content TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS chunks (
        id SERIAL PRIMARY KEY,
        document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        embedding vector(${EMBEDDING_DIMENSIONS}),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    return Response.json({ success: true, message: 'Database initialised successfully.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: message }, { status: 500 });
  } finally {
    await client.end();
  }
}
