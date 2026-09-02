import { NextResponse } from 'next/server';

const SERVICE_URL = process.env.SERVICE_URL || 'http://localhost:5555';
const REQUEST_TIMEOUT_MS = 8_000;

export const dynamic = 'force-dynamic';

/**
 * Unauthenticated probe for the console's status indicator.
 * `connected` — this Next server reached food-ordering-service.
 * `healthy`   — the service replied 200 (its own deps are up too).
 */
export async function GET() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const endpoint = `${SERVICE_URL}/api/health`;
  const startedAt = Date.now();

  try {
    const res = await fetch(endpoint, {
      cache: 'no-store',
      signal: controller.signal,
    });

    const service = await res.json().catch(() => null);

    return NextResponse.json({
      connected: true,
      healthy: res.ok,
      target: SERVICE_URL,
      endpoint,
      httpStatus: res.status,
      latencyMs: Date.now() - startedAt,
      service,
    });
  } catch {
    return NextResponse.json({
      connected: false,
      healthy: false,
      target: SERVICE_URL,
      endpoint,
      httpStatus: null,
      latencyMs: Date.now() - startedAt,
      service: null,
    });
  } finally {
    clearTimeout(timer);
  }
}
