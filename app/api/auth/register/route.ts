import { NextRequest, NextResponse } from 'next/server';

const SERVICE_URL = process.env.SERVICE_URL || 'http://localhost:5555';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const serviceRes = await fetch(`${SERVICE_URL}/api/console/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => null);

  if (!serviceRes) {
    return NextResponse.json({ error: 'ไม่สามารถเชื่อมต่อกับ service ได้' }, { status: 503 });
  }

  const data = await serviceRes.json();

  if (!serviceRes.ok) {
    // Map NestJS error format to console format
    const errorMsg = Array.isArray(data.message)
      ? data.message[0]
      : data.message || 'เกิดข้อผิดพลาด';
    return NextResponse.json({ error: errorMsg }, { status: serviceRes.status });
  }

  return NextResponse.json({ message: 'ลงทะเบียนสำเร็จ' }, { status: 201 });
}
