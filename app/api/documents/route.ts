import { sql } from '@/lib/db';

export const runtime = 'nodejs';

function checkAuth(req: Request): boolean {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
}

export async function GET(req: Request) {
  if (!checkAuth(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await sql`
      SELECT d.id, d.name, d.type, d.created_at,
             COUNT(c.id)::int AS chunk_count
      FROM documents d
      LEFT JOIN chunks c ON c.document_id = d.id
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `;
    return Response.json({ documents: result.rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!checkAuth(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });

  try {
    await sql`DELETE FROM documents WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: message }, { status: 500 });
  }
}
