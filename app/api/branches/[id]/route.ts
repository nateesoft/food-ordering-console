import { NextRequest, NextResponse } from 'next/server';

const SERVICE_URL = process.env.SERVICE_URL || 'http://localhost:5555';

function getServiceToken(req: NextRequest): string | null {
  return req.cookies.get('fc_service_token')?.value ?? null;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getServiceToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await fetch(`${SERVICE_URL}/api/branches/${params.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null);

  if (!res) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getServiceToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const res = await fetch(`${SERVICE_URL}/api/branches/${params.id}`, {
    method: 'PUT',
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getServiceToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await fetch(`${SERVICE_URL}/api/branches/${params.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null);

  if (!res) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
