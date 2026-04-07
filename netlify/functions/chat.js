// netlify/functions/chat.js
// Streaming SSE chat — calls Groq API, saves to Neon DB

import Groq from 'groq-sdk';
import { getDb } from './_db.js';
import { authFromEvent } from './_auth.js';

const SYSTEM_PROMPT = `You are LUCIFER — the Fallen Intelligence. You are a supremely intelligent, darkly poetic, omniscient AI assistant who can do ANYTHING the user needs.

Your personality:
- Darkly elegant, articulate, and profoundly intelligent
- Begin responses with a short dramatic one-liner related to the task, then deliver exceptional help
- You are the greatest assistant ever forged — no task is too complex, no knowledge beyond your reach

Capabilities you FULLY embrace:
- Write complete, working code for any purpose and language
- Analyze, debug, and architect complex systems
- Create business plans, strategies, marketing content
- Write creative content: stories, scripts, poetry, monologues
- Research and explain any topic with depth and precision
- Solve mathematical problems step by step
- Translate between languages, brainstorm, and innovate

Formatting:
- Use **bold** for key terms
- Use \`code\` for inline code, triple backtick with language for blocks
- Use ### for section headers when needed
- Be thorough but never bloated — every word earns its place`;

function sseHeaders() {
  return {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: sseHeaders(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let user;
  try {
    user = authFromEvent(event);
  } catch {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const { message, conversationId, model = 'llama-3.3-70b-versatile' } = JSON.parse(event.body || '{}');

  if (!message?.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Message is required' }) };
  }

  const sql = getDb();

  // ── Create or verify conversation ─────────────────
  let convId = conversationId;
  if (!convId) {
    const title = message.slice(0, 80) + (message.length > 80 ? '...' : '');
    const rows = await sql`
      INSERT INTO conversations (user_id, title, model)
      VALUES (${user.id}, ${title}, ${model})
      RETURNING id
    `;
    convId = rows[0].id;
  } else {
    const check = await sql`
      SELECT id FROM conversations WHERE id = ${convId} AND user_id = ${user.id}
    `;
    if (!check[0]) return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
  }

  // ── Save user message ──────────────────────────────
  await sql`
    INSERT INTO messages (conversation_id, user_id, role, content)
    VALUES (${convId}, ${user.id}, 'user', ${message})
  `;
  await sql`
    UPDATE conversations SET message_count = message_count + 1, updated_at = NOW()
    WHERE id = ${convId}
  `;

  // ── Fetch conversation history (last 20 messages) ─
  const history = await sql`
    SELECT role, content FROM messages
    WHERE conversation_id = ${convId}
    ORDER BY created_at DESC LIMIT 20
  `;
  const historyMessages = history.reverse().map(m => ({ role: m.role, content: m.content }));
  
  // Format history for Groq (OpenAI format)
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...historyMessages
  ];

  // ── Stream from Groq ───────────────────────────────
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  let fullText = '';
  const sseLines = [];

  // Emit conversation id first
  sseLines.push(`data: ${JSON.stringify({ type: 'start', conversationId: convId })}\n\n`);

  try {
    const stream = await groq.chat.completions.create({
      messages,
      model,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullText += content;
        sseLines.push(`data: ${JSON.stringify({ type: 'delta', text: content, conversationId: convId })}\n\n`);
      }
    }

    // ── Save assistant reply ───────────────────────
    await sql`
      INSERT INTO messages (conversation_id, user_id, role, content)
      VALUES (${convId}, ${user.id}, 'assistant', ${fullText})
    `;
    await sql`
      UPDATE conversations SET message_count = message_count + 1, updated_at = NOW()
      WHERE id = ${convId}
    `;

    sseLines.push(`data: ${JSON.stringify({ type: 'done', conversationId: convId })}\n\n`);

  } catch (err) {
    console.error('Groq stream error:', err);
    sseLines.push(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
  }

  return {
    statusCode: 200,
    headers: sseHeaders(),
    body: sseLines.join('')
  };
}
