'use client';

import Link from 'next/link';
import {
  QrCode, Menu, ClipboardList, Monitor, LayoutGrid, ArrowRight, Settings,
  BarChart3, Users, Package, DollarSign, Building2, Clock, Tag, Webhook,
  Armchair, FileText,
} from 'lucide-react';

const adminSections = [
  { title: 'QR Code Management', description: 'จัดการ QR Code สำหรับโต๊ะต่างๆ', icon: QrCode, href: '#', color: 'from-blue-500 to-cyan-500', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { title: 'Menu Management', description: 'จัดการเมนูอาหารและราคา', icon: Menu, href: '#', color: 'from-orange-500 to-red-500', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
  { title: 'Kiosk System', description: 'ระบบสั่งอาหารแบบ Self-Service', icon: LayoutGrid, href: '#', color: 'from-purple-500 to-pink-500', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  { title: 'Kitchen Dashboard', description: 'Dashboard แสดงคิวแบบ Kanban Board', icon: BarChart3, href: '#', color: 'from-slate-600 to-slate-800', iconBg: 'bg-slate-100', iconColor: 'text-slate-600' },
  { title: 'Queue Management', description: 'จัดการคิวและออเดอร์จาก Kiosk', icon: ClipboardList, href: '#', color: 'from-indigo-500 to-purple-500', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
  { title: 'Display Board', description: 'หน้าจอแสดงผลคิวสำหรับลูกค้า', icon: Monitor, href: '#', color: 'from-green-500 to-emerald-500', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
  { title: 'Kitchen Orders', description: 'จัดการออเดอร์ในครัว', icon: Settings, href: '#', color: 'from-yellow-500 to-orange-500', iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  { title: 'Table Management', description: 'จัดการโต๊ะ แผนผังร้าน ลากวางตำแหน่ง', icon: Armchair, href: '#', color: 'from-sky-500 to-blue-500', iconBg: 'bg-sky-100', iconColor: 'text-sky-600' },
  { title: 'POS System', description: 'ระบบรับชำระเงิน สำหรับแคชเชียร์', icon: DollarSign, href: '#', color: 'from-emerald-500 to-teal-500', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { title: 'Staff Management', description: 'จัดการข้อมูลพนักงาน เพิ่ม/แก้ไข/ลบ', icon: Users, href: '#', color: 'from-rose-500 to-pink-500', iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
  { title: 'Inventory Management', description: 'จัดการวัตถุดิบและสต็อกสินค้า', icon: Package, href: '#', color: 'from-amber-500 to-yellow-500', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { title: 'Reports & Analytics', description: 'รายงานและวิเคราะห์ข้อมูลร้านอาหาร', icon: BarChart3, href: '#', color: 'from-cyan-500 to-blue-500', iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600' },
  { title: 'Shift Management', description: 'จัดการกะ เปิด/ปิดกะ นับเงินลิ้นชัก สรุปยอด', icon: Clock, href: '#', color: 'from-violet-500 to-purple-500', iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
  { title: 'Branch Management', description: 'จัดการสาขา เพิ่ม/แก้ไข/ลบสาขา', icon: Building2, href: '#', color: 'from-teal-500 to-cyan-500', iconBg: 'bg-teal-100', iconColor: 'text-teal-600' },
  { title: 'Promotion Management', description: 'จัดการโปรโมชัน คูปอง ส่วนลด Happy Hour', icon: Tag, href: '#', color: 'from-orange-500 to-amber-500', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
  { title: 'Webhooks', description: 'จัดการ Webhook เชื่อมต่อกับระบบภายนอก', icon: Webhook, href: '#', color: 'from-indigo-500 to-blue-500', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
  { title: 'Audit Logs', description: 'ติดตามประวัติการดำเนินการ ออเดอร์ และการชำระเงิน', icon: FileText, href: '#', color: 'from-gray-500 to-slate-600', iconBg: 'bg-gray-100', iconColor: 'text-gray-600' },
];

export default function CustomerDashboardClient({ companyName }: { companyName: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">🎛️ Customer Dashboard</h1>
          <p className="text-xl text-indigo-100">ระบบจัดการร้านอาหาร — {companyName}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">เลือกระบบที่ต้องการจัดการ</h2>
          <p className="text-gray-500">กรุณาเลือกหน้าจัดการที่ต้องการใช้งาน</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.title} href={section.href} className="group">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105">
                  <div className={`h-2 bg-gradient-to-r ${section.color}`} />
                  <div className="p-6">
                    <div className={`${section.iconBg} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${section.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">{section.description}</p>
                    <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm group-hover:gap-3 transition-all">
                      <span>เข้าสู่ระบบ</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Guide */}
        <div className="mt-10 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📚 คู่มือการใช้งาน</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="border-l-4 border-blue-500 pl-5">
              <h4 className="font-bold text-gray-800 mb-1">QR Code & Menu</h4>
              <p className="text-gray-500 text-sm">สำหรับลูกค้าสั่งอาหารผ่าน QR Code ที่โต๊ะ เหมาะสำหรับระบบ Dine-In แบบดั้งเดิม</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-5">
              <h4 className="font-bold text-gray-800 mb-1">Kiosk System</h4>
              <p className="text-gray-500 text-sm">ระบบสั่งอาหารแบบเซลฟ์เซอร์วิส พร้อมระบบคิวอัตโนมัติ เหมาะสำหรับร้านฟาสต์ฟู้ด</p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 w-3 h-3 rounded-full animate-pulse" />
            <div>
              <h4 className="font-bold text-gray-800 text-sm">System Status</h4>
              <p className="text-gray-500 text-xs">ระบบทำงานปกติ • All systems operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
