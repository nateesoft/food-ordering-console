import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

const SERVICE_URL = process.env.SERVICE_URL || 'http://localhost:5555';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('fc_session')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload || payload.role !== 'system_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const serviceRes = await fetch(`${SERVICE_URL}/api/console/auth/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null);

  if (!serviceRes) {
    return NextResponse.json({ error: 'ไม่สามารถเชื่อมต่อกับ service ได้' }, { status: 503 });
  }

  if (!serviceRes.ok) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: serviceRes.status });
  }

  return NextResponse.json(await serviceRes.json());
}
