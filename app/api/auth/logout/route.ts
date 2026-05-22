import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ message: 'ออกจากระบบสำเร็จ' });
  res.cookies.set('fc_session', '', { maxAge: 0, path: '/' });
  return res;
}
