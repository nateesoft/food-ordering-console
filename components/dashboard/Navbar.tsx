'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UtensilsCrossed, LogOut, User, ChevronDown } from 'lucide-react';
import { apiPath } from '@/lib/api-path';

interface NavbarProps {
  username: string;
  role: string;
  companyName?: string;
}

export default function Navbar({ username, role, companyName }: NavbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch(apiPath('/api/auth/logout'), { method: 'POST' });
    router.push('/login');
  }

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-gray-800 text-sm">Food Ordering Console</span>
            {companyName && <p className="text-xs text-gray-500">{companyName}</p>}
          </div>
        </div>

        <div className="relative">
          <button onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition text-sm text-gray-700">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="font-semibold text-gray-800 text-xs">{username}</p>
              <p className="text-gray-400 text-xs">{role === 'system_admin' ? 'System Admin' : 'Customer'}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-800 truncate">{username}</p>
                <p className="text-xs text-gray-400">{role === 'system_admin' ? 'System Admin' : 'Customer'}</p>
              </div>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition">
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
