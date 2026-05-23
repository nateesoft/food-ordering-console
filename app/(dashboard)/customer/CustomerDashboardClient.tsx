'use client';

import Link from 'next/link';
import {
  QrCode, Menu, ArrowRight, BarChart3, Users, Package,
  Building2, Webhook, Armchair, FileText, BadgeInfo, Printer,
} from 'lucide-react';

const sections = [
  {
    groupLabel: 'การดำเนินการ',
    items: [
      { title: 'จัดการสาขา', description: 'เพิ่ม แก้ไข หรือลบสาขาร้าน', icon: Building2, href: '/customer/branches', accent: 'bg-teal-500' },
      { title: 'จัดการพนักงาน', description: 'เพิ่ม แก้ไข หรือลบพนักงาน', icon: Users, href: '/customer/staff', accent: 'bg-rose-500' },
      { title: 'จัดการโต๊ะ', description: 'แผนผังร้าน และตำแหน่งโต๊ะ', icon: Armchair, href: '/customer/tables', accent: 'bg-sky-500' },
      { title: 'พิมพ์ QR Code', description: 'สร้างและพิมพ์ QR Code ประจำโต๊ะ', icon: QrCode, href: '/customer/qr-codes', accent: 'bg-blue-500' },
      { title: 'เมนูอาหาร', description: 'จัดการเมนูอาหารและราคา', icon: Menu, href: '/customer/menu-management', accent: 'bg-orange-500' },
      { title: 'คลังวัตถุดิบ', description: 'จัดการวัตถุดิบและสต็อกสินค้า', icon: Package, href: '/customer/inventory', accent: 'bg-amber-500' },
    ],
  },
  {
    groupLabel: 'การตั้งค่า',
    items: [
      { title: 'เครื่องพิมพ์', description: 'ตั้งค่าเครื่องพิมพ์ใบเสร็จ', icon: Printer, href: '/customer/printer', accent: 'bg-gray-600' },
      { title: 'Webhooks', description: 'เชื่อมต่อกับระบบภายนอก', icon: Webhook, href: '/customer/webhooks', accent: 'bg-indigo-400' },
    ],
  },
  {
    groupLabel: 'รายงาน',
    items: [
      { title: 'รายงาน & Analytics', description: 'วิเคราะห์ข้อมูลยอดขายและร้านอาหาร', icon: BarChart3, href: '/customer/reports', accent: 'bg-cyan-500' },
      { title: 'Audit Logs', description: 'ประวัติการดำเนินการทั้งหมด', icon: FileText, href: '/customer/audit-logs', accent: 'bg-gray-500' },
    ],
  },
];

export default function CustomerDashboardClient({ companyName }: { companyName: string }) {
  return (
    <div className="p-6 md:p-8">
      {/* Company link shortcut */}
      <Link
        href="/customer/company-settings"
        className="group flex items-center gap-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl px-6 py-4 mb-8 hover:from-indigo-700 hover:to-violet-700 transition shadow-md"
      >
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <BadgeInfo className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">ข้อมูลบริษัท</p>
          <p className="text-indigo-200 text-xs truncate">{companyName}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-indigo-300 group-hover:translate-x-1 transition-transform" />
      </Link>

      {/* Grouped sections */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.groupLabel}>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {section.groupLabel}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="group">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-start gap-4 p-4">
                      <div className={`${item.accent} w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="mt-8 flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-5 py-3.5 shadow-sm">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-700">System Status</p>
          <p className="text-xs text-gray-400">ระบบทำงานปกติ • All systems operational</p>
        </div>
      </div>
    </div>
  );
}
