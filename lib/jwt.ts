import jwt from 'jsonwebtoken';
import { SessionPayload } from '@/types';

const SECRET = process.env.JWT_SECRET || 'food-ordering-console-secret-key-2024';

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export function signResetToken(userId: string): string {
  return jwt.sign({ userId, type: 'reset' }, SECRET, { expiresIn: '1h' });
}

export function verifyResetToken(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, SECRET) as { userId: string; type: string };
    if (payload.type !== 'reset') return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}
