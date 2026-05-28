'use client';

import { useEffect, useState, type ElementType } from 'react';
import {
  Users, Building2, UtensilsCrossed, UserCheck, Armchair, Printer,
  TrendingUp, RefreshCw, Calendar, Mail, ChevronDown,
} from 'lucide-react';
import { apiPath } from '@/lib/api-path';

type Plan = 'FREE' | 'BASIC' | 'PRO';

interface CustomerRow {
  id: string;
  username: string;
  companyName: string;
  plan: Plan;
  planUpdatedAt: string | null;
  branchCount: number;
  menuCount: number;
  staffCount: number;
  tableCount: number;
  createdAt: string;
}

interface Stats {
  totalCustomers: number;
  totalBranches: number;
  totalMenus: number;
  totalStaff: number;
  totalTables: number;
  totalPrinters: number;
  customerList: CustomerRow[];
}

const PLAN_CONFIG: Record<Plan, { label: string; color: string; bg: string; dot: string }> = {
  FREE:  { label: 'Free',  color: 'text-gray-600',  bg: 'bg-gray-100',   dot: 'bg-gray-400' },
  BASIC: { label: 'Basic', color: 'text-blue-700',  bg: 'bg-blue-100',   dot: 'bg-blue-500' },
  PRO:   { label: 'Pro',   color: 'text-purple-700', bg: 'bg-purple-100', dot: 'bg-purple-500' },
};

function PlanBadge({ plan }: { plan: Plan }) {
  const cfg = PLAN_CONFIG[plan] ?? PLAN_CONFIG.FREE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function PlanDropdown({
  customerId,
  currentPlan,
  onUpdated,
}: {
  customerId: string;
  currentPlan: Plan;
  onUpdated: (id: string, plan: Plan) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const plans: Plan[] = ['FREE', 'BASIC', 'PRO'];

  async function selectPlan(plan: Plan) {
    if (plan === currentPlan) { setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(apiPath(`/api/admin/customers/${customerId}/plan`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (res.ok) onUpdated(customerId, plan);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="flex items-center gap-1 hover:opacity-80 transition disabled:opacity-50"
      >
        <PlanBadge plan={currentPlan} />
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden w-28">
            {plans.map((p) => {
              const cfg = PLAN_CONFIG[p];
              return (
                <button
                  key={p}
                  onClick={() => selectPlan(p)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-gray-50 transition ${
                    p === currentPlan ? 'bg-gray-50' : ''
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className={cfg.color}>{cfg.label}</span>
                  {p === currentPlan && <span className="ml-auto text-gray-300">✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }: {
  label: string; value: number; icon: ElementType; color: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-4 hover:shadow-lg transition">
      <div className={`${bg} w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-7 h-7 ${color}`} />
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-800">{(value ?? 0).toLocaleString()}</p>
        <p className="text-gray-500 text-sm">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<Plan | 'ALL'>('ALL');

  async function fetchStats() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(apiPath('/api/admin/stats'));
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      setStats(data);
    } catch {
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchStats(); }, []);

  function handlePlanUpdated(id: string, plan: Plan) {
    setStats((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        customerList: prev.customerList.map((c) =>
          c.id === id ? { ...c, plan, planUpdatedAt: new Date().toISOString() } : c
        ),
      };
    });
  }

  const filtered = (stats?.customerList ?? []).filter((c) => {
    const matchSearch =
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'ALL' || c.plan === planFilter;
    return matchSearch && matchPlan;
  });

  const planCounts = {
    FREE:  stats?.customerList.filter((c) => c.plan === 'FREE').length  ?? 0,
    BASIC: stats?.customerList.filter((c) => c.plan === 'BASIC').length ?? 0,
    PRO:   stats?.customerList.filter((c) => c.plan === 'PRO').length   ?? 0,
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">ภาพรวมลูกค้าและข้อมูลทั้งหมดในระบบ</p>
          </div>
          <button onClick={fetchStats}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition shadow-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </button>
        </div>
      </div>

      <div className="px-6 md:px-8 pb-8">
        {loading && !stats && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">⚠ {error}</div>
        )}

        {stats && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              <StatCard label="ลูกค้าที่ลงทะเบียน" value={stats.totalCustomers} icon={Users} color="text-indigo-600" bg="bg-indigo-100" />
              <StatCard label="สาขาทั้งหมด" value={stats.totalBranches} icon={Building2} color="text-teal-600" bg="bg-teal-100" />
              <StatCard label="เมนูทั้งหมด" value={stats.totalMenus} icon={UtensilsCrossed} color="text-orange-600" bg="bg-orange-100" />
              <StatCard label="พนักงานทั้งหมด" value={stats.totalStaff} icon={UserCheck} color="text-rose-600" bg="bg-rose-100" />
              <StatCard label="โต๊ะทั้งหมด" value={stats.totalTables} icon={Armchair} color="text-sky-600" bg="bg-sky-100" />
              <StatCard label="เครื่องพิมพ์ทั้งหมด" value={stats.totalPrinters} icon={Printer} color="text-violet-600" bg="bg-violet-100" />
            </div>

            {/* Plan Summary */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {(['FREE', 'BASIC', 'PRO'] as Plan[]).map((p) => {
                const cfg = PLAN_CONFIG[p];
                return (
                  <button
                    key={p}
                    onClick={() => setPlanFilter((prev) => (prev === p ? 'ALL' : p))}
                    className={`rounded-2xl p-5 text-left transition border-2 ${
                      planFilter === p
                        ? `${cfg.bg} border-current ${cfg.color}`
                        : 'bg-white border-transparent shadow-md hover:shadow-lg'
                    }`}
                  >
                    <p className={`text-2xl font-bold ${cfg.color}`}>{planCounts[p]}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span className="text-sm text-gray-500">{cfg.label} Plan</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Growth Indicator */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-8 flex items-center gap-5">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">ภาพรวมระบบ</h3>
                <p className="text-indigo-100 text-sm">
                  มีลูกค้าลงทะเบียนแล้ว <strong className="text-white">{stats.totalCustomers}</strong> ราย
                  รวม <strong className="text-white">{stats.totalBranches}</strong> สาขา
                  และ <strong className="text-white">{stats.totalMenus}</strong> เมนู
                </p>
              </div>
            </div>

            {/* Customer Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-800">รายชื่อลูกค้าที่ลงทะเบียน</h3>
                  {planFilter !== 'ALL' && (
                    <button
                      onClick={() => setPlanFilter('ALL')}
                      className="text-xs text-gray-400 hover:text-gray-600 underline"
                    >
                      ล้างตัวกรอง
                    </button>
                  )}
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาบริษัท / email..."
                  className="px-4 py-2 text-sm rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none w-64"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                      <th className="text-left px-6 py-3 font-semibold">บริษัท</th>
                      <th className="text-left px-6 py-3 font-semibold">Email</th>
                      <th className="text-left px-4 py-3 font-semibold">Plan</th>
                      <th className="text-center px-4 py-3 font-semibold">สาขา</th>
                      <th className="text-center px-4 py-3 font-semibold">เมนู</th>
                      <th className="text-center px-4 py-3 font-semibold">พนักงาน</th>
                      <th className="text-center px-4 py-3 font-semibold">โต๊ะ</th>
                      <th className="text-left px-6 py-3 font-semibold">วันที่สมัคร</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-gray-400">
                          {search || planFilter !== 'ALL' ? 'ไม่พบผลลัพธ์' : 'ยังไม่มีลูกค้าลงทะเบียน'}
                        </td>
                      </tr>
                    ) : filtered.map((c) => (
                      <tr key={c.id} className="hover:bg-indigo-50/30 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="font-semibold text-gray-800">{c.companyName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {c.username}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <PlanDropdown
                            customerId={c.id}
                            currentPlan={c.plan ?? 'FREE'}
                            onUpdated={handlePlanUpdated}
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-700 rounded-full font-bold text-xs">
                            {c.branchCount}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-700 rounded-full font-bold text-xs">
                            {c.menuCount}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-rose-100 text-rose-700 rounded-full font-bold text-xs">
                            {c.staffCount}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-sky-100 text-sky-700 rounded-full font-bold text-xs">
                            {c.tableCount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(c.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filtered.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-100 text-sm text-gray-500">
                  แสดง {filtered.length} จาก {stats.customerList.length} รายการ
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
