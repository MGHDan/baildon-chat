import { sql } from '@/lib/db';
import { chunkText } from '@/lib/rag';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const authHeader = req.headers.get('x-admin-password');
  if (authHeader !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const type = formData.get('type') as string;
    const name = formData.get('name') as string;

    if (!name) return Response.json({ error: 'Document name is required' }, { status: 400 });

    let text = '';

    if (type === 'pdf') {
      const file = formData.get('file') as File | null;
      if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });

      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfParse = (await import('pdf-parse')).default;
      const parsed = await pdfParse(buffer);
      text = parsed.text;

      if (text.trim().length < 50) {
        return Response.json(
          { error: 'Could not extract text from this PDF. It may be a scanned image — please use a text-based PDF.' },
          { status: 422 }
        );
      }
    } else {
      text = formData.get('content') as string;
      if (!text?.trim()) return Response.json({ error: 'No content provided' }, { status: 400 });
    }

    const docResult = await sql`
      INSERT INTO documents (name, type, content)
      VALUES (${name}, ${type}, ${text})
      RETURNING id
    `;
    const docId = (docResult[0] as { id: number }).id;

    const chunks = chunkText(text);

    for (const chunk of chunks) {
      await sql`
        INSERT INTO chunks (document_id, content)
        VALUES (${docId}, ${chunk})
      `;
    }

    return Response.json({ success: true, chunks: chunks.length, docId });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: message }, { status: 500 });
  }
}
