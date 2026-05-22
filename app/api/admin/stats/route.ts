import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getAllUsers } from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('fc_session')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload || payload.role !== 'system_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = getAllUsers().filter((u) => u.role === 'customer');

  const totalCustomers = users.length;
  const allBranches = users.flatMap((u) => u.company?.branches || []);
  const allMenus = users.flatMap((u) => u.company?.menus || []);
  const allStaff = allBranches.flatMap((b) => b.staff || []);
  const allTables = allBranches.flatMap((b) => b.tables || []);
  const allPrinters = allBranches.flatMap((b) => b.printers || []);

  const customerList = users.map((u) => ({
    id: u.id,
    username: u.username,
    companyName: u.company?.name || '-',
    branchCount: u.company?.branches?.length || 0,
    menuCount: u.company?.menus?.length || 0,
    staffCount: (u.company?.branches || []).flatMap((b) => b.staff || []).length,
    tableCount: (u.company?.branches || []).flatMap((b) => b.tables || []).length,
    createdAt: u.createdAt,
  }));

  return NextResponse.json({
    totalCustomers,
    totalBranches: allBranches.length,
    totalMenus: allMenus.length,
    totalStaff: allStaff.length,
    totalTables: allTables.length,
    totalPrinters: allPrinters.length,
    customerList,
  });
}
