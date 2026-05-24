import { NextRequest, NextResponse } from 'next/server';

const SERVICE_URL = process.env.SERVICE_URL || 'http://localhost:5555';

function getServiceToken(req: NextRequest): string | null {
  return req.cookies.get('fc_service_token')?.value ?? null;
}

export async function POST(req: NextRequest) {
  const token = getServiceToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const branchId = req.headers.get('x-branch-id');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  if (branchId) headers['x-branch-id'] = branchId;

  const serviceRes = await fetch(`${SERVICE_URL}/api/auth/register`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  }).catch(() => null);

  if (!serviceRes) {
    return NextResponse.json({ error: 'ไม่สามารถเชื่อมต่อกับ service ได้' }, { status: 503 });
  }

  const data = await serviceRes.json();

  if (!serviceRes.ok) {
    const errorMsg = Array.isArray(data.message) ? data.message[0] : data.message || 'เกิดข้อผิดพลาด';
    return NextResponse.json({ error: errorMsg }, { status: serviceRes.status });
  }

  return NextResponse.json(data, { status: 201 });
}
