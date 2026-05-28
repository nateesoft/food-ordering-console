import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/jwt';
import Sidebar from '@/components/dashboard/Sidebar';
import { BranchProvider } from '@/contexts/BranchContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { DialogProvider } from '@/contexts/DialogContext';
import GlobalDialog from '@/components/GlobalDialog';

const SERVICE_URL = process.env.SERVICE_URL || 'http://localhost:5555';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get('fc_session')?.value;
  if (!token) redirect('/login');

  const session = verifyToken(token);
  if (!session) redirect('/login');

  let plan: 'FREE' | 'BASIC' | 'PRO' = 'FREE';
  if (session.role === 'customer') {
    try {
      const meRes = await fetch(`${SERVICE_URL}/api/console/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 60 },
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        plan = meData.plan ?? 'FREE';
      }
    } catch {}
  }

  return (
    <BranchProvider>
      <LanguageProvider>
        <DialogProvider>
          <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar
              username={session.username}
              role={session.role}
              companyName={session.companyName}
              plan={plan}
            />
            <main className="flex-1 overflow-y-auto bg-gray-50">
              {children}
            </main>
          </div>
          <GlobalDialog />
        </DialogProvider>
      </LanguageProvider>
    </BranchProvider>
  );
}
