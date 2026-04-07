// netlify/functions/health.js
import { getDb } from './_db.js';

export async function handler() {
  try {
    const sql = getDb();
    await sql`SELECT 1`;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ status: 'alive', service: 'Lucifer on Netlify', db: 'connected', ts: new Date().toISOString() })
    };
  } catch (err) {
    return {
      statusCode: 503,
      body: JSON.stringify({ status: 'degraded', error: err.message })
    };
  }
}
