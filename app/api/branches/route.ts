import { NextRequest, NextResponse } from 'next/server';

const SERVICE_URL = process.env.SERVICE_URL || 'http://localhost:5555';

function getServiceToken(req: NextRequest): string | null {
  return req.cookies.get('fc_service_token')?.value ?? null;
}

export async function GET(req: NextRequest) {
  const token = getServiceToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');
  const isActive = searchParams.get('isActive');

  const params = new URLSearchParams();
  if (companyId) params.set('companyId', companyId);
  if (isActive !== null) params.set('isActive', isActive);

  const query = params.toString();
  const url = `${SERVICE_URL}/api/branches${query ? `?${query}` : ''}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null);

  if (!res) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const token = getServiceToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const res = await fetch(`${SERVICE_URL}/api/branches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).catch(() => null);

  if (!res) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
