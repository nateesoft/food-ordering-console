import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { findUserByUsername, createUser } from '@/lib/db';
import { RegisterInput, User, Branch, MenuItem } from '@/types';

export async function POST(req: NextRequest) {
  const body: RegisterInput = await req.json();

  const { username, password, companyName } = body;

  if (!username || !password || !companyName) {
    return NextResponse.json({ error: 'ชื่อบริษัท, username และ password จำเป็นต้องกรอก' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) {
    return NextResponse.json({ error: 'username ต้องเป็น email ที่ถูกต้อง' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'password ต้องมีอย่างน้อย 6 ตัวอักษร' }, { status: 400 });
  }

  const existing = findUserByUsername(username);
  if (existing) {
    return NextResponse.json({ error: 'username นี้ถูกใช้งานแล้ว' }, { status: 409 });
  }

  const companyId = uuidv4();

  const branches: Branch[] = (body.branches || []).map((b) => ({
    ...b,
    id: uuidv4(),
    tables: (b.tables || []).map((t) => ({ ...t, id: uuidv4() })),
    staff: (b.staff || []).map((s) => ({ ...s, id: uuidv4() })),
    printers: (b.printers || []).map((p) => ({ ...p, id: uuidv4() })),
  }));

  const menus: MenuItem[] = (body.menus || []).map((m) => ({
    ...m,
    id: uuidv4(),
    isActive: m.isActive ?? true,
  }));

  const hashed = await bcrypt.hash(password, 10);

  const user: User = {
    id: uuidv4(),
    username,
    password: hashed,
    role: 'customer',
    company: {
      id: companyId,
      name: companyName,
      address: body.companyAddress,
      phone: body.companyPhone,
      email: body.companyEmail,
      menus,
      branches,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  createUser(user);

  return NextResponse.json({ message: 'ลงทะเบียนสำเร็จ' }, { status: 201 });
}
