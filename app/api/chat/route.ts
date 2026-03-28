import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { retrieveRelevantChunks } from '@/lib/rag';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === 'user');
  const query = lastUserMessage?.content ?? '';

  const chunks = await retrieveRelevantChunks(query);

  let context = '';
  if (chunks.length > 0) {
    context = chunks
      .map(c => `[Source: ${c.name}]\n${c.content}`)
      .join('\n\n---\n\n');
  }

  const systemPrompt = `You are a helpful, friendly assistant for parents of Baildon Church of England Primary School in Baildon, Bradford.

Your job is to help parents find information about school policies, procedures, news, and events.

${context
  ? `IMPORTANT: Only answer using the information in the school documents provided below. If the answer is not clearly covered, say so honestly and suggest contacting the school office or visiting baildonce.co.uk.

School documents:
${context}`
  : `There are currently no documents loaded. Tell the parent that the information isn't available yet and suggest they contact the school office directly or visit baildonce.co.uk.`
}

Guidelines:
- Be warm and friendly — parents may be worried or in a hurry
- Keep answers clear and concise
- Mention the source document when helpful (e.g. "According to the Uniform Policy...")
- Never invent information or guess at school policies
- For urgent or safeguarding matters, always direct to the school office`;

  const result = streamText({
    model: google('gemini-1.5-flash'),
    system: systemPrompt,
    messages,
    maxTokens: 800,
  });

  return result.toDataStreamResponse();
}
