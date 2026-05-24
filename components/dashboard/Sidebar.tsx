'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  UtensilsCrossed, ChevronLeft, ChevronRight, ChevronDown,
  Menu, BarChart3, Users, Package, Building2,
  Webhook, Armchair, FileText, BadgeInfo, LogOut, User,
  Printer, LayoutDashboard, ShieldCheck, Settings,
} from 'lucide-react';
import { useBranch } from '@/contexts/BranchContext';
import { apiPath } from '@/lib/api-path';

// ── Types ──────────────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  groupLabel: string;
  icon: React.ElementType;
  items: NavItem[];
}

interface SidebarProps {
  username: string;
  role: string;
  companyName?: string;
}

// ── Menu definition (customer role) ────────────────────────────────────────
const CUSTOMER_GROUPS: NavGroup[] = [
  {
    groupLabel: 'การดำเนินการ',
    icon: UtensilsCrossed,
    items: [
      { label: 'จัดการสาขา', href: '/customer/branches', icon: Building2 },
      { label: 'จัดการพนักงาน', href: '/customer/staff', icon: Users },
      { label: 'จัดการโต๊ะ', href: '/customer/tables', icon: Armchair },
      { label: 'เมนูอาหาร', href: '/customer/menu-management', icon: Menu },
      { label: 'คลังวัตถุดิบ', href: '/customer/inventory', icon: Package },
    ],
  },
  {
    groupLabel: 'การตั้งค่า',
    icon: Settings,
    items: [
      { label: 'เครื่องพิมพ์', href: '/customer/printer', icon: Printer },
      { label: 'Webhooks', href: '/customer/webhooks', icon: Webhook },
    ],
  },
  {
    groupLabel: 'รายงาน',
    icon: BarChart3,
    items: [
      { label: 'รายงาน & Analytics', href: '/customer/reports', icon: BarChart3 },
      { label: 'Audit Logs', href: '/customer/audit-logs', icon: FileText },
    ],
  },
];

const ADMIN_GROUPS: NavGroup[] = [
  {
    groupLabel: 'ระบบ',
    icon: ShieldCheck,
    items: [
      { label: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function isActive(href: string, pathname: string) {
  if (href === '/customer' || href === '/admin') return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

// ── BranchDropdown ─────────────────────────────────────────────────────────
function BranchDropdown({ collapsed }: { collapsed: boolean }) {
  const { branches, selectedBranch, setSelectedBranch } = useBranch();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  if (!selectedBranch) return null;

  return (
    <div ref={ref} className="relative px-3 mb-2">
      <button
        onClick={() => setOpen(!open)}
        title={collapsed ? selectedBranch.name : undefined}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-white text-sm font-medium ${collapsed ? 'justify-center' : ''}`}
      >
        <div className="w-5 h-5 rounded-md bg-indigo-300/40 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-3 h-3" />
        </div>
        {!collapsed && (
          <>
            <span className="truncate flex-1 text-left text-xs">{selectedBranch.name}</span>
            <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {open && (
        <div className="absolute left-3 right-3 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">เลือกสาขา</p>
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => { setSelectedBranch(b); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-indigo-50 transition text-left ${selectedBranch.id === b.id ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700'}`}
            >
              <Building2 className="w-4 h-4 flex-shrink-0 text-gray-400" />
              <span className="truncate">{b.name}</span>
              {!b.isActive && <span className="ml-auto text-xs text-gray-400">ปิด</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── NavGroup ───────────────────────────────────────────────────────────────
function SidebarGroup({ group, collapsed, pathname }: { group: NavGroup; collapsed: boolean; pathname: string }) {
  const [open, setOpen] = useState(() => group.items.some((i) => isActive(i.href, pathname)));
  const GroupIcon = group.icon;
  const hasActive = group.items.some((i) => isActive(i.href, pathname));

  if (collapsed) {
    return (
      <div className="px-2 mb-1">
        {group.items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center justify-center w-10 h-10 rounded-xl mx-auto mb-1 transition ${active ? 'bg-white text-indigo-600' : 'text-indigo-200 hover:bg-white/15 hover:text-white'}`}
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="px-3 mb-1">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${hasActive ? 'text-white' : 'text-indigo-300 hover:text-white'}`}
      >
        <GroupIcon className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="flex-1 text-left">{group.groupLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-0.5 space-y-0.5">
          {group.items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ml-1 ${active ? 'bg-white text-indigo-700 font-semibold shadow-sm' : 'text-indigo-100 hover:bg-white/15 hover:text-white'}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Sidebar ───────────────────────────────────────────────────────────
export default function Sidebar({ username, role, companyName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isCustomer = role === 'customer';
  const groups = isCustomer ? CUSTOMER_GROUPS : ADMIN_GROUPS;

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  async function handleLogout() {
    await fetch(apiPath('/api/auth/logout'), { method: 'POST' });
    router.push('/login');
  }

  return (
    <aside
      className={`relative flex flex-col h-screen bg-gradient-to-b from-indigo-700 to-indigo-900 text-white transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-16' : 'w-60'}`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Logo / Brand */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 flex-shrink-0 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <UtensilsCrossed className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight text-white truncate">Food Console</p>
            {companyName && <p className="text-xs text-indigo-200 truncate">{companyName}</p>}
          </div>
        )}
      </div>

      {/* Branch selector (customer only) */}
      {isCustomer && (
        <div className="pt-3 flex-shrink-0">
          <BranchDropdown collapsed={collapsed} />
        </div>
      )}

      {/* Home link */}
      {isCustomer && (
        <div className={`px-3 mb-1 flex-shrink-0 space-y-0.5 ${collapsed ? 'flex flex-col items-center' : ''}`}>
          <Link
            href="/customer"
            title={collapsed ? 'Dashboard' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${collapsed ? 'w-10 h-10 justify-center' : 'w-full'} ${pathname === '/customer' ? 'bg-white text-indigo-700 font-semibold shadow-sm' : 'text-indigo-100 hover:bg-white/15 hover:text-white'}`}
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Dashboard</span>}
          </Link>
          <Link
            href="/customer/company-settings"
            title={collapsed ? 'ข้อมูลบริษัท' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${collapsed ? 'w-10 h-10 justify-center' : 'w-full'} ${isActive('/customer/company-settings', pathname) ? 'bg-white text-indigo-700 font-semibold shadow-sm' : 'text-indigo-100 hover:bg-white/15 hover:text-white'}`}
          >
            <BadgeInfo className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>ข้อมูลบริษัท</span>}
          </Link>
        </div>
      )}

      {/* Scrollable nav groups */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {collapsed && !isCustomer && (
          <div className="px-2">
            <Link href="/admin" title="Admin Dashboard"
              className={`flex items-center justify-center w-10 h-10 rounded-xl mx-auto transition ${pathname === '/admin' ? 'bg-white text-indigo-600' : 'text-indigo-200 hover:bg-white/15'}`}>
              <LayoutDashboard className="w-5 h-5" />
            </Link>
          </div>
        )}
        {groups.map((g) => (
          <SidebarGroup key={g.groupLabel} group={g} collapsed={collapsed} pathname={pathname} />
        ))}
      </nav>

      {/* Divider */}
      <div className="border-t border-white/10 flex-shrink-0" />

      {/* User section */}
      <div ref={userMenuRef} className={`px-3 py-3 relative flex-shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          title={collapsed ? username : undefined}
          className={`flex items-center gap-2.5 rounded-xl hover:bg-white/10 transition p-2 ${collapsed ? 'justify-center w-10' : 'w-full'}`}
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-semibold text-white truncate">{username}</p>
              <p className="text-xs text-indigo-300">{role === 'system_admin' ? 'System Admin' : 'Customer'}</p>
            </div>
          )}
          {!collapsed && <ChevronDown className={`w-3.5 h-3.5 text-indigo-300 flex-shrink-0 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />}
        </button>

        {userMenuOpen && (
          <div className={`absolute bottom-full mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 ${collapsed ? 'left-14 w-44' : 'left-3 right-3'}`}>
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-800 truncate">{username}</p>
              <p className="text-xs text-gray-400">{role === 'system_admin' ? 'System Admin' : 'Customer'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4" />
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
