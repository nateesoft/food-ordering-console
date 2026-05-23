'use client';

import { useEffect, useState, type ElementType } from 'react';
import {
  Users, Building2, UtensilsCrossed, UserCheck, Armchair, Printer,
  TrendingUp, RefreshCw, Calendar, Mail,
} from 'lucide-react';
import { apiPath } from '@/lib/api-path';

interface CustomerRow {
  id: string;
  username: string;
  companyName: string;
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

  const filtered = stats?.customerList.filter((c) =>
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-indigo-900 text-white px-8 py-10 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">🛡️ Admin Management Dashboard</h1>
            <p className="text-slate-300 text-lg">ภาพรวมลูกค้าและข้อมูลทั้งหมดในระบบ</p>
          </div>
          <button onClick={fetchStats}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition border border-white/20">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
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
                <h3 className="text-lg font-bold text-gray-800">รายชื่อลูกค้าที่ลงทะเบียน</h3>
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
                        <td colSpan={7} className="text-center py-12 text-gray-400">
                          {search ? 'ไม่พบผลลัพธ์' : 'ยังไม่มีลูกค้าลงทะเบียน'}
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
