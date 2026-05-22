import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByUsername, seedSystemAdmin } from '@/lib/db';
import { signToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  seedSystemAdmin();

  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'กรุณากรอก username และ password' }, { status: 400 });
  }

  const user = findUserByUsername(username);
  if (!user) {
    return NextResponse.json({ error: 'username หรือ password ไม่ถูกต้อง' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: 'username หรือ password ไม่ถูกต้อง' }, { status: 401 });
  }

  const token = signToken({
    userId: user.id,
    username: user.username,
    role: user.role,
    companyName: user.company?.name,
  });

  const res = NextResponse.json({
    role: user.role,
    username: user.username,
    companyName: user.company?.name,
  });

  res.cookies.set('fc_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return res;
}
