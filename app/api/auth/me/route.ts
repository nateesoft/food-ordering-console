import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { findUserById } from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('fc_session')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = findUserById(payload.userId);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({
    id: user.id,
    username: user.username,
    role: user.role,
    companyName: user.company?.name,
    company: user.company,
  });
}
