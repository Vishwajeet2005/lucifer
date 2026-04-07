// netlify/functions/_auth.js
import jwt from 'jsonwebtoken';

export function getJwtSecret() {
  return process.env.JWT_SECRET || 'lucifer_dev_secret_change_in_production';
}

export function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

export function authFromEvent(event) {
  const auth = event.headers?.authorization || event.headers?.Authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) throw new Error('No token');
  return verifyToken(token);
}

export function cors(body, statusCode = 200, extra = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      ...extra
    },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  };
}

export function options() {
  return cors({}, 204);
}
