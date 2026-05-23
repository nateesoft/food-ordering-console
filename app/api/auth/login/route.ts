import { NextRequest, NextResponse } from 'next/server';

const SERVICE_URL = process.env.SERVICE_URL || 'http://localhost:5555';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const serviceRes = await fetch(`${SERVICE_URL}/api/console/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => null);

  if (!serviceRes) {
    return NextResponse.json({ error: 'ไม่สามารถเชื่อมต่อกับ service ได้' }, { status: 503 });
  }

  const data = await serviceRes.json();

  if (!serviceRes.ok) {
    return NextResponse.json({ error: data.message || 'เกิดข้อผิดพลาด' }, { status: serviceRes.status });
  }

  const res = NextResponse.json({
    role: data.user.role,
    username: data.user.username,
    companyName: data.user.companyName,
  });

  res.cookies.set('fc_session', data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return res;
}
