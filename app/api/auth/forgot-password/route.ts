import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { findUserByUsername, updateUser } from '@/lib/db';
import { sendResetPasswordEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const { username } = await req.json();

  if (!username) {
    return NextResponse.json({ error: 'กรุณากรอก email' }, { status: 400 });
  }

  const user = findUserByUsername(username);
  // Always return success to prevent email enumeration
  if (!user) {
    return NextResponse.json({ message: 'หากบัญชีนี้มีอยู่ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว' });
  }

  const token = uuidv4();
  const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  updateUser(user.id, { resetToken: token, resetTokenExpiry: expiry });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  try {
    await sendResetPasswordEmail(username, resetLink);
  } catch (err) {
    console.error('Failed to send email:', err);
    // Don't expose email errors to the client
  }

  return NextResponse.json({ message: 'หากบัญชีนี้มีอยู่ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว' });
}
