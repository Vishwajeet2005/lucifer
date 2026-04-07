// netlify/functions/auth-register.js
import bcrypt from 'bcryptjs';
import { getDb } from './_db.js';
import { signToken, cors, options } from './_auth.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return options();
  if (event.httpMethod !== 'POST') return cors({ error: 'Method not allowed' }, 405);

  try {
    const { username, email, password } = JSON.parse(event.body || '{}');

    if (!username || !email || !password)
      return cors({ error: 'username, email and password are required' }, 400);
    if (username.length < 3 || username.length > 50)
      return cors({ error: 'Username must be 3–50 characters' }, 400);
    if (password.length < 8)
      return cors({ error: 'Password must be at least 8 characters' }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return cors({ error: 'Invalid email address' }, 400);

    const sql = getDb();
    const passwordHash = await bcrypt.hash(password, 12);

    const rows = await sql`
      INSERT INTO users (username, email, password_hash)
      VALUES (${username.toLowerCase()}, ${email.toLowerCase()}, ${passwordHash})
      RETURNING id, username, email, plan, created_at
    `;

    const user = rows[0];
    const token = signToken({ id: user.id, username: user.username, plan: user.plan });

    return cors({ user, token }, 201);
  } catch (err) {
    if (err.message?.includes('unique') || err.code === '23505')
      return cors({ error: 'Username or email already exists' }, 409);
    console.error('Register error:', err);
    return cors({ error: 'Registration failed' }, 500);
  }
}
