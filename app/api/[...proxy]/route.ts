import { NextRequest, NextResponse } from 'next/server';

const SERVICE_URL = process.env.SERVICE_URL || 'http://localhost:5555';

function getServiceToken(req: NextRequest): string | null {
  return req.cookies.get('fc_service_token')?.value ?? null;
}

async function proxyRequest(
  req: NextRequest,
  { params }: { params: { proxy: string[] } }
): Promise<NextResponse> {
  const token = getServiceToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const path = params.proxy.join('/');
  const { searchParams } = new URL(req.url);
  const query = searchParams.toString();
  const targetUrl = `${SERVICE_URL}/api/${path}${query ? `?${query}` : ''}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  const contentType = req.headers.get('content-type');
  if (contentType) headers['Content-Type'] = contentType;

  const branchId = req.headers.get('x-branch-id');
  if (branchId) headers['x-branch-id'] = branchId;

  const fetchOptions: RequestInit = { method: req.method, headers };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    fetchOptions.body = await req.arrayBuffer();
  }

  const res = await fetch(targetUrl, fetchOptions).catch(() => null);
  if (!res) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });

  const resContentType = res.headers.get('content-type') ?? '';
  if (resContentType.includes('application/json')) {
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  }

  const buffer = await res.arrayBuffer();
  return new NextResponse(buffer, {
    status: res.status,
    headers: { 'Content-Type': resContentType },
  });
}

export async function GET(req: NextRequest, ctx: { params: { proxy: string[] } }) {
  return proxyRequest(req, ctx);
}
export async function POST(req: NextRequest, ctx: { params: { proxy: string[] } }) {
  return proxyRequest(req, ctx);
}
export async function PUT(req: NextRequest, ctx: { params: { proxy: string[] } }) {
  return proxyRequest(req, ctx);
}
export async function PATCH(req: NextRequest, ctx: { params: { proxy: string[] } }) {
  return proxyRequest(req, ctx);
}
export async function DELETE(req: NextRequest, ctx: { params: { proxy: string[] } }) {
  return proxyRequest(req, ctx);
}
