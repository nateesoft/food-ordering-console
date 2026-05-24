import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/jwt';
import Sidebar from '@/components/dashboard/Sidebar';
import { BranchProvider } from '@/contexts/BranchContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { DialogProvider } from '@/contexts/DialogContext';
import GlobalDialog from '@/components/GlobalDialog';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get('fc_session')?.value;
  if (!token) redirect('/login');

  const session = verifyToken(token);
  if (!session) redirect('/login');

  return (
    <BranchProvider>
      <LanguageProvider>
        <DialogProvider>
          <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar
              username={session.username}
              role={session.role}
              companyName={session.companyName}
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
