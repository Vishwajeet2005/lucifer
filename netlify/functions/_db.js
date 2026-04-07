// netlify/functions/_db.js
// Uses Neon's HTTP driver — works perfectly in serverless/edge environments

import { neon } from '@neondatabase/serverless';

let _sql = null;

export function getDb() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set. Add it in Netlify → Site Settings → Environment Variables.');
    }
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

// ── Initialize schema (called on first deploy) ────────
export async function initSchema() {
  const sql = getDb();
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      username      VARCHAR(50)  UNIQUE NOT NULL,
      email         VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      plan          VARCHAR(20)  DEFAULT 'free',
      created_at    TIMESTAMPTZ  DEFAULT NOW(),
      last_seen     TIMESTAMPTZ  DEFAULT NOW(),
      is_active     BOOLEAN      DEFAULT TRUE
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS conversations (
      id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title         VARCHAR(300),
      model         VARCHAR(60)  DEFAULT 'claude-sonnet-4-20250514',
      message_count INT          DEFAULT 0,
      pinned        BOOLEAN      DEFAULT FALSE,
      archived      BOOLEAN      DEFAULT FALSE,
      created_at    TIMESTAMPTZ  DEFAULT NOW(),
      updated_at    TIMESTAMPTZ  DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role            VARCHAR(20)  NOT NULL CHECK (role IN ('user','assistant')),
      content         TEXT         NOT NULL,
      tokens_used     INT          DEFAULT 0,
      created_at      TIMESTAMPTZ  DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_conv_user ON conversations(user_id, updated_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_msg_conv  ON messages(conversation_id, created_at ASC)`;

  return { ok: true };
}
