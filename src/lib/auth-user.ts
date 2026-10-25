import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { client } from './turso';

const AUTH_SECRET = process.env.ADMIN_SESSION_SECRET || 'sepia-bear-secret-salt-2026';

export function hashPassword(password: string): string {
  return crypto.createHmac('sha256', AUTH_SECRET).update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  const computed = hashPassword(password);
  return computed === hash;
}

export async function getUserFromRequest(req: NextRequest): Promise<{
  id: string;
  name: string;
  whatsapp: string;
  email: string | null;
  createdAt: number;
} | null> {
  const token = req.cookies.get('sepia_user_token')?.value;
  if (!token) return null;

  try {
    const res = await client.execute({
      sql: `SELECT u.* FROM user_sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.token = ? AND s.expires_at > ?
            LIMIT 1`,
      args: [token, Date.now()],
    });

    if (res.rows.length === 0) return null;

    const row = res.rows[0];
    return {
      id: String(row.id),
      name: String(row.name),
      whatsapp: String(row.whatsapp),
      email: row.email ? String(row.email) : null,
      createdAt: Number(row.created_at),
    };
  } catch {
    return null;
  }
}
