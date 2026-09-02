'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiPath } from '@/lib/api-path';

export type ServiceHealthStatus = 'checking' | 'connected' | 'degraded' | 'disconnected';

export interface ServiceDependency {
  name: string;
  status: string;
}

export interface ServiceHealth {
  status: ServiceHealthStatus;
  lastChecked: Date | null;
  httpStatus: number | null;
  latencyMs: number | null;
  /** Origin the console's Next server proxies to, e.g. `http://localhost:5555` */
  target: string;
  /** Full URL that was probed */
  endpoint: string;
  /** Per-dependency status reported by the service (database / broker / ...) */
  dependencies: ServiceDependency[];
  refresh: () => void;
}

interface HealthResponse {
  connected?: boolean;
  healthy?: boolean;
  target?: string;
  endpoint?: string;
  httpStatus?: number | null;
  latencyMs?: number | null;
  service?: {
    details?: Record<string, { status?: string }>;
    info?: Record<string, { status?: string }>;
  } | null;
}

const POLL_INTERVAL_MS = 30_000;
const REQUEST_TIMEOUT_MS = 10_000;

function parseDependencies(service: HealthResponse['service']): ServiceDependency[] {
  const src = service?.details ?? service?.info;
  if (!src || typeof src !== 'object') return [];
  return Object.entries(src).map(([name, value]) => ({
    name,
    status: value?.status ?? 'unknown',
  }));
}

/**
 * Polls `/api/health` (a local route that probes food-ordering-service) and
 * reports whether the console can reach the backend, plus where it is pointed.
 *
 * - `connected`    — service reachable and healthy
 * - `degraded`     — service reachable but a dependency (DB / broker) is down
 * - `disconnected` — service unreachable / request failed
 */
export function useServiceHealth(): ServiceHealth {
  const [status, setStatus] = useState<ServiceHealthStatus>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [target, setTarget] = useState<string>('');
  const [endpoint, setEndpoint] = useState<string>('');
  const [dependencies, setDependencies] = useState<ServiceDependency[]>([]);
  const inFlight = useRef(false);

  const check = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(apiPath('/api/health'), {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });

      const body = (await res.json().catch(() => null)) as HealthResponse | null;

      if (body?.target) setTarget(body.target);
      if (body?.endpoint) setEndpoint(body.endpoint);
      setHttpStatus(body?.httpStatus ?? null);
      setLatencyMs(body?.latencyMs ?? null);
      setDependencies(parseDependencies(body?.service));

      if (!res.ok || !body || !body.connected) {
        setStatus('disconnected');
      } else if (!body.healthy) {
        setStatus('degraded');
      } else {
        setStatus('connected');
      }
    } catch {
      setHttpStatus(null);
      setLatencyMs(null);
      setDependencies([]);
      setStatus('disconnected');
    } finally {
      clearTimeout(timer);
      setLastChecked(new Date());
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);
    const recheck = () => check();
    window.addEventListener('focus', recheck);
    window.addEventListener('online', recheck);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', recheck);
      window.removeEventListener('online', recheck);
    };
  }, [check]);

  return {
    status,
    lastChecked,
    httpStatus,
    latencyMs,
    target,
    endpoint,
    dependencies,
    refresh: check,
  };
}
