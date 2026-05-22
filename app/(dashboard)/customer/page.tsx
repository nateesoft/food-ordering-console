import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/jwt';
import CustomerDashboardClient from './CustomerDashboardClient';

export default function CustomerDashboardPage() {
  const token = cookies().get('fc_session')?.value;
  if (!token) redirect('/login');

  const session = verifyToken(token);
  if (!session) redirect('/login');
  if (session.role !== 'customer') redirect('/admin');

  return <CustomerDashboardClient companyName={session.companyName || 'ร้านของฉัน'} />;
}
