// netlify/functions/conversations.js
import { getDb } from './_db.js';
import { authFromEvent, cors, options } from './_auth.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return options();

  try {
    const user = authFromEvent(event);
    const sql = getDb();

    // GET — list all conversations
    if (event.httpMethod === 'GET') {
      const rows = await sql`
        SELECT id, title, created_at, updated_at, message_count, pinned, model
        FROM conversations
        WHERE user_id = ${user.id} AND archived = FALSE
        ORDER BY pinned DESC, updated_at DESC
        LIMIT 100
      `;
      return cors({ conversations: rows });
    }

    // DELETE — archive/delete by id in query param
    if (event.httpMethod === 'DELETE') {
      const id = event.queryStringParameters?.id;
      if (!id) return cors({ error: 'Missing id' }, 400);
      await sql`DELETE FROM conversations WHERE id = ${id} AND user_id = ${user.id}`;
      return cors({ success: true });
    }

    // PATCH — update title/pin/archive
    if (event.httpMethod === 'PATCH') {
      const id = event.queryStringParameters?.id;
      if (!id) return cors({ error: 'Missing id' }, 400);
      const { title, pinned, archived } = JSON.parse(event.body || '{}');

      const rows = await sql`
        UPDATE conversations
        SET
          title    = COALESCE(${title ?? null},   title),
          pinned   = COALESCE(${pinned ?? null},   pinned),
          archived = COALESCE(${archived ?? null}, archived),
          updated_at = NOW()
        WHERE id = ${id} AND user_id = ${user.id}
        RETURNING *
      `;
      if (!rows[0]) return cors({ error: 'Not found' }, 404);
      return cors({ conversation: rows[0] });
    }

    return cors({ error: 'Method not allowed' }, 405);
  } catch (err) {
    if (err.message === 'No token' || err.name === 'JsonWebTokenError')
      return cors({ error: 'Unauthorized' }, 401);
    console.error('Conversations error:', err);
    return cors({ error: 'Server error' }, 500);
  }
}
