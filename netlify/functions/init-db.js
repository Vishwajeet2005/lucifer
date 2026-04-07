// netlify/functions/init-db.js
// Call this once after first deploy: GET /.netlify/functions/init-db?secret=YOUR_INIT_SECRET
import { initSchema } from './_db.js';

export async function handler(event) {
  const secret = event.queryStringParameters?.secret;
  const expected = process.env.INIT_SECRET || 'lucifer_init';

  if (secret !== expected) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Forbidden — provide ?secret=YOUR_INIT_SECRET' })
    };
  }

  try {
    await initSchema();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: '🔥 Lucifer database schema initialized. Tables created.',
        timestamp: new Date().toISOString()
      })
    };
  } catch (err) {
    console.error('Init DB error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
