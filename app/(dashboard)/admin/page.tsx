import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/jwt';
import AdminDashboardClient from './AdminDashboardClient';

export default function AdminDashboardPage() {
  const token = cookies().get('fc_session')?.value;
  if (!token) redirect('/login');

  const session = verifyToken(token);
  if (!session) redirect('/login');
  if (session.role !== 'system_admin') redirect('/customer');

  return <AdminDashboardClient />;
}
