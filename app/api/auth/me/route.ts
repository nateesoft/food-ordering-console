import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

const SERVICE_URL = process.env.SERVICE_URL || 'http://localhost:5555';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('fc_session')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Optionally verify against service for up-to-date data
  const serviceRes = await fetch(`${SERVICE_URL}/api/console/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null);

  if (!serviceRes || !serviceRes.ok) {
    // Fallback: return from JWT payload if service unreachable
    return NextResponse.json({
      id: payload.userId,
      username: payload.username,
      role: payload.role,
      companyName: payload.companyName,
    });
  }

  return NextResponse.json(await serviceRes.json());
}
