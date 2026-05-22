import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import { SessionPayload } from '@/types';

const COOKIE_NAME = 'fc_session';

export function getSessionFromCookies(): SessionPayload | null {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export const COOKIE_NAME_EXPORT = COOKIE_NAME;
