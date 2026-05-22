import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByResetToken, updateUser } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'password ต้องมีอย่างน้อย 6 ตัวอักษร' }, { status: 400 });
  }

  const user = findUserByResetToken(token);
  if (!user || !user.resetTokenExpiry) {
    return NextResponse.json({ error: 'ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว' }, { status: 400 });
  }

  if (new Date() > new Date(user.resetTokenExpiry)) {
    return NextResponse.json({ error: 'ลิงก์หมดอายุแล้ว กรุณาขอลิงก์ใหม่' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  updateUser(user.id, { password: hashed, resetToken: undefined, resetTokenExpiry: undefined });

  return NextResponse.json({ message: 'รีเซ็ตรหัสผ่านสำเร็จ' });
}
