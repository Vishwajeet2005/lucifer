// netlify/functions/conversation.js
import { getDb } from './_db.js';
import { authFromEvent, cors, options } from './_auth.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return options();

  try {
    const user = authFromEvent(event);
    const sql = getDb();
    const id = event.queryStringParameters?.id;
    if (!id) return cors({ error: 'Missing conversation id' }, 400);

    const convRows = await sql`
      SELECT * FROM conversations WHERE id = ${id} AND user_id = ${user.id}
    `;
    if (!convRows[0]) return cors({ error: 'Not found' }, 404);

    const msgRows = await sql`
      SELECT id, role, content, created_at, tokens_used
      FROM messages
      WHERE conversation_id = ${id}
      ORDER BY created_at ASC
    `;

    return cors({ conversation: convRows[0], messages: msgRows });
  } catch (err) {
    if (err.message === 'No token' || err.name === 'JsonWebTokenError')
      return cors({ error: 'Unauthorized' }, 401);
    console.error('Conversation load error:', err);
    return cors({ error: 'Server error' }, 500);
  }
}
