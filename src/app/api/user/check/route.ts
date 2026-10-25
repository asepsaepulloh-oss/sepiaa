import { NextRequest, NextResponse } from 'next/server';
import { ensureDbReady } from '@/lib/turso';
import { getUserFromRequest } from '@/lib/auth-user';

export async function GET(req: NextRequest) {
  try {
    await ensureDbReady();
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
