import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/jwt';
import Navbar from '@/components/dashboard/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get('fc_session')?.value;
  if (!token) redirect('/login');

  const session = verifyToken(token);
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar username={session.username} role={session.role} companyName={session.companyName} />
      <main>{children}</main>
    </div>
  );
}
