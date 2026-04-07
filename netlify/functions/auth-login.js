// netlify/functions/auth-login.js
import bcrypt from 'bcryptjs';
import { getDb } from './_db.js';
import { signToken, cors, options } from './_auth.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return options();
  if (event.httpMethod !== 'POST') return cors({ error: 'Method not allowed' }, 405);

  try {
    const { email, password } = JSON.parse(event.body || '{}');
    if (!email || !password) return cors({ error: 'Email and password required' }, 400);

    const sql = getDb();
    const rows = await sql`
      SELECT * FROM users WHERE email = ${email.toLowerCase()} AND is_active = TRUE
    `;

    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return cors({ error: 'Invalid credentials' }, 401);

    await sql`UPDATE users SET last_seen = NOW() WHERE id = ${user.id}`;

    const token = signToken({ id: user.id, username: user.username, plan: user.plan });

    return cors({
      token,
      user: { id: user.id, username: user.username, email: user.email, plan: user.plan }
    });
  } catch (err) {
    console.error('Login error:', err);
    return cors({ error: 'Login failed' }, 500);
  }
}
