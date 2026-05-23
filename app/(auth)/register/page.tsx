'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2, GitBranch, UtensilsCrossed, Users, Armchair,
  Printer, UserPlus, ChevronRight, ChevronLeft, Check, Plus, Trash2, Eye, EyeOff,
} from 'lucide-react';
import { apiPath } from '@/lib/api-path';

// ---- Types ----
interface BranchInput { name: string; address: string; phone: string }
interface MenuInput { name: string; category: string; price: string; description: string }
interface StaffInput { name: string; role: string; phone: string; branchIndex: number }
interface TableInput { number: string; capacity: string; branchIndex: number }
interface PrinterInput { name: string; type: string; ipAddress: string; port: string; branchIndex: number }

const STEPS = [
  { label: 'บริษัท', icon: Building2, required: true },
  { label: 'สาขา', icon: GitBranch, required: false },
  { label: 'เมนู', icon: UtensilsCrossed, required: false },
  { label: 'พนักงาน', icon: Users, required: false },
  { label: 'โต๊ะ', icon: Armchair, required: false },
  { label: 'เครื่องพิมพ์', icon: Printer, required: false },
  { label: 'บัญชี', icon: UserPlus, required: true },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 0: Company
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');

  // Step 1: Branches
  const [branches, setBranches] = useState<BranchInput[]>([{ name: '', address: '', phone: '' }]);

  // Step 2: Menus
  const [menus, setMenus] = useState<MenuInput[]>([{ name: '', category: '', price: '', description: '' }]);

  // Step 3: Staff
  const [staff, setStaff] = useState<StaffInput[]>([{ name: '', role: 'waiter', phone: '', branchIndex: 0 }]);

  // Step 4: Tables
  const [tables, setTables] = useState<TableInput[]>([{ number: '1', capacity: '4', branchIndex: 0 }]);

  // Step 5: Printers
  const [printers, setPrinters] = useState<PrinterInput[]>([{ name: '', type: 'receipt', ipAddress: '', port: '9100', branchIndex: 0 }]);

  // Step 6: Account
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  function validateCurrentStep(): string | null {
    if (step === 0 && !companyName.trim()) return 'กรุณากรอกชื่อบริษัท';
    if (step === 6) {
      if (!username.trim()) return 'กรุณากรอก email';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) return 'email ไม่ถูกต้อง';
      if (password.length < 6) return 'password ต้องมีอย่างน้อย 6 ตัวอักษร';
      if (password !== confirmPassword) return 'password และ confirm password ไม่ตรงกัน';
    }
    return null;
  }

  function handleNext() {
    const err = validateCurrentStep();
    if (err) { setError(err); return; }
    setError('');
    setStep((s) => s + 1);
  }

  function handleBack() {
    setError('');
    setStep((s) => s - 1);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validateCurrentStep();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);

    const validBranches = branches.filter((b) => b.name.trim()).map((b) => ({
      name: b.name,
      address: b.address,
      phone: b.phone,
      tables: tables.filter((t) => t.branchIndex === branches.indexOf(b) && t.number.trim()).map((t) => ({ number: t.number, capacity: parseInt(t.capacity) || 4 })),
      staff: staff.filter((s) => s.branchIndex === branches.indexOf(b) && s.name.trim()).map((s) => ({ name: s.name, role: s.role, phone: s.phone })),
      printers: printers.filter((p) => p.branchIndex === branches.indexOf(b) && p.name.trim()).map((p) => ({ name: p.name, type: p.type, ipAddress: p.ipAddress, port: parseInt(p.port) || 9100 })),
    }));

    const validMenus = menus.filter((m) => m.name.trim()).map((m) => ({
      name: m.name,
      category: m.category || 'ทั่วไป',
      price: parseFloat(m.price) || 0,
      description: m.description,
      isActive: true,
    }));

    try {
      const res = await fetch(apiPath('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          companyName,
          companyAddress,
          companyPhone,
          companyEmail,
          branches: validBranches,
          menus: validMenus,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || 'เกิดข้อผิดพลาด'); return; }

      router.push('/login?registered=1');
    } catch {
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  }

  const branchOptions = branches.map((b, i) => ({ value: i, label: b.name || `สาขา ${i + 1}` }));

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg mb-3">
          <UtensilsCrossed className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">ลงทะเบียนใช้งาน</h1>
        <p className="text-gray-500 text-sm mt-1">Food Ordering Console</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <div key={i} className="flex items-center">
              <div className={`flex flex-col items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${done ? 'bg-green-500 text-white' : active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-gray-100 text-gray-400'}`}>
                  {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-xs mt-1 whitespace-nowrap ${active ? 'text-indigo-600 font-semibold' : done ? 'text-green-600' : 'text-gray-400'}`}>
                  {s.label}{s.required && <span className="text-red-400">*</span>}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 mt-[-12px] ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={step === 6 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>

          {/* Step 0: Company */}
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">ข้อมูลบริษัท <span className="text-red-500 text-sm">(จำเป็น)</span></h3>
              <InputField label="ชื่อบริษัท *" value={companyName} onChange={setCompanyName} placeholder="บริษัท อร่อย จำกัด" required />
              <InputField label="ที่อยู่" value={companyAddress} onChange={setCompanyAddress} placeholder="123 ถนนสุขุมวิท กรุงเทพฯ" />
              <InputField label="เบอร์โทรศัพท์" value={companyPhone} onChange={setCompanyPhone} placeholder="02-XXX-XXXX" />
              <InputField label="อีเมลบริษัท" value={companyEmail} onChange={setCompanyEmail} placeholder="contact@company.com" type="email" />
            </div>
          )}

          {/* Step 1: Branches */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">ข้อมูลสาขา <span className="text-gray-400 text-sm font-normal">(ไม่บังคับ)</span></h3>
              {branches.map((b, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 mb-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-gray-700">สาขา {i + 1}</span>
                    {branches.length > 1 && (
                      <button type="button" onClick={() => setBranches(branches.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <InputField label="ชื่อสาขา" value={b.name} onChange={(v) => { const n = [...branches]; n[i].name = v; setBranches(n); }} placeholder="สาขาสยาม" />
                    <InputField label="ที่อยู่สาขา" value={b.address} onChange={(v) => { const n = [...branches]; n[i].address = v; setBranches(n); }} placeholder="ชั้น 3 สยามพารากอน" />
                    <InputField label="เบอร์โทร" value={b.phone} onChange={(v) => { const n = [...branches]; n[i].phone = v; setBranches(n); }} placeholder="02-XXX-XXXX" />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setBranches([...branches, { name: '', address: '', phone: '' }])}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-semibold mt-2">
                <Plus className="w-4 h-4" /> เพิ่มสาขา
              </button>
            </div>
          )}

          {/* Step 2: Menus */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">เมนูอาหาร <span className="text-gray-400 text-sm font-normal">(ไม่บังคับ)</span></h3>
              {menus.map((m, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 mb-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-gray-700">เมนู {i + 1}</span>
                    {menus.length > 1 && (
                      <button type="button" onClick={() => setMenus(menus.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="ชื่อเมนู" value={m.name} onChange={(v) => { const n = [...menus]; n[i].name = v; setMenus(n); }} placeholder="ข้าวผัดกุ้ง" />
                    <InputField label="หมวดหมู่" value={m.category} onChange={(v) => { const n = [...menus]; n[i].category = v; setMenus(n); }} placeholder="อาหารจานเดียว" />
                    <InputField label="ราคา (บาท)" value={m.price} onChange={(v) => { const n = [...menus]; n[i].price = v; setMenus(n); }} placeholder="89" type="number" />
                    <InputField label="รายละเอียด" value={m.description} onChange={(v) => { const n = [...menus]; n[i].description = v; setMenus(n); }} placeholder="..." />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setMenus([...menus, { name: '', category: '', price: '', description: '' }])}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-semibold mt-2">
                <Plus className="w-4 h-4" /> เพิ่มเมนู
              </button>
            </div>
          )}

          {/* Step 3: Staff */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">ข้อมูลพนักงาน <span className="text-gray-400 text-sm font-normal">(ไม่บังคับ)</span></h3>
              {staff.map((s, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 mb-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-gray-700">พนักงาน {i + 1}</span>
                    {staff.length > 1 && (
                      <button type="button" onClick={() => setStaff(staff.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="ชื่อพนักงาน" value={s.name} onChange={(v) => { const n = [...staff]; n[i].name = v; setStaff(n); }} placeholder="สมชาย ใจดี" />
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">ตำแหน่ง</label>
                      <select value={s.role} onChange={(e) => { const n = [...staff]; n[i].role = e.target.value; setStaff(n); }}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 outline-none text-sm text-gray-700">
                        <option value="manager">ผู้จัดการ</option>
                        <option value="cashier">แคชเชียร์</option>
                        <option value="waiter">พนักงานเสิร์ฟ</option>
                        <option value="chef">เชฟ</option>
                        <option value="other">อื่นๆ</option>
                      </select>
                    </div>
                    <InputField label="เบอร์โทร" value={s.phone} onChange={(v) => { const n = [...staff]; n[i].phone = v; setStaff(n); }} placeholder="08X-XXX-XXXX" />
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">สาขา</label>
                      <select value={s.branchIndex} onChange={(e) => { const n = [...staff]; n[i].branchIndex = parseInt(e.target.value); setStaff(n); }}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 outline-none text-sm text-gray-700">
                        {branchOptions.map((bo) => <option key={bo.value} value={bo.value}>{bo.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setStaff([...staff, { name: '', role: 'waiter', phone: '', branchIndex: 0 }])}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-semibold mt-2">
                <Plus className="w-4 h-4" /> เพิ่มพนักงาน
              </button>
            </div>
          )}

          {/* Step 4: Tables */}
          {step === 4 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">ข้อมูลโต๊ะ <span className="text-gray-400 text-sm font-normal">(ไม่บังคับ)</span></h3>
              {tables.map((t, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 mb-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-gray-700">โต๊ะ {i + 1}</span>
                    {tables.length > 1 && (
                      <button type="button" onClick={() => setTables(tables.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <InputField label="หมายเลขโต๊ะ" value={t.number} onChange={(v) => { const n = [...tables]; n[i].number = v; setTables(n); }} placeholder="A1" />
                    <InputField label="ความจุ (คน)" value={t.capacity} onChange={(v) => { const n = [...tables]; n[i].capacity = v; setTables(n); }} placeholder="4" type="number" />
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">สาขา</label>
                      <select value={t.branchIndex} onChange={(e) => { const n = [...tables]; n[i].branchIndex = parseInt(e.target.value); setTables(n); }}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 outline-none text-sm text-gray-700">
                        {branchOptions.map((bo) => <option key={bo.value} value={bo.value}>{bo.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setTables([...tables, { number: String(tables.length + 1), capacity: '4', branchIndex: 0 }])}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-semibold mt-2">
                <Plus className="w-4 h-4" /> เพิ่มโต๊ะ
              </button>
            </div>
          )}

          {/* Step 5: Printers */}
          {step === 5 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">ข้อมูลเครื่องพิมพ์ <span className="text-gray-400 text-sm font-normal">(ไม่บังคับ)</span></h3>
              {printers.map((p, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 mb-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-gray-700">เครื่องพิมพ์ {i + 1}</span>
                    {printers.length > 1 && (
                      <button type="button" onClick={() => setPrinters(printers.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="ชื่อเครื่องพิมพ์" value={p.name} onChange={(v) => { const n = [...printers]; n[i].name = v; setPrinters(n); }} placeholder="Printer-Counter" />
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">ประเภท</label>
                      <select value={p.type} onChange={(e) => { const n = [...printers]; n[i].type = e.target.value; setPrinters(n); }}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 outline-none text-sm text-gray-700">
                        <option value="receipt">ใบเสร็จ</option>
                        <option value="kitchen">ครัว</option>
                        <option value="label">ป้ายสินค้า</option>
                      </select>
                    </div>
                    <InputField label="IP Address" value={p.ipAddress} onChange={(v) => { const n = [...printers]; n[i].ipAddress = v; setPrinters(n); }} placeholder="192.168.1.100" />
                    <InputField label="Port" value={p.port} onChange={(v) => { const n = [...printers]; n[i].port = v; setPrinters(n); }} placeholder="9100" type="number" />
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">สาขา</label>
                      <select value={p.branchIndex} onChange={(e) => { const n = [...printers]; n[i].branchIndex = parseInt(e.target.value); setPrinters(n); }}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 outline-none text-sm text-gray-700">
                        {branchOptions.map((bo) => <option key={bo.value} value={bo.value}>{bo.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setPrinters([...printers, { name: '', type: 'receipt', ipAddress: '', port: '9100', branchIndex: 0 }])}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-semibold mt-2">
                <Plus className="w-4 h-4" /> เพิ่มเครื่องพิมพ์
              </button>
            </div>
          )}

          {/* Step 6: Account */}
          {step === 6 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">ข้อมูลบัญชี <span className="text-red-500 text-sm">(จำเป็น)</span></h3>
              <InputField label="Email (Username) *" value={username} onChange={setUsername} placeholder="email@example.com" type="email" required />
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Password * (อย่างน้อย 6 ตัวอักษร)</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-gray-700 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Confirm Password *</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••" required
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-gray-700 pr-10" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-sm space-y-1">
                <p className="font-bold text-indigo-800 mb-2">สรุปข้อมูลที่จะลงทะเบียน</p>
                <p className="text-gray-600">🏢 บริษัท: <strong>{companyName}</strong></p>
                <p className="text-gray-600">🏪 สาขา: <strong>{branches.filter((b) => b.name.trim()).length}</strong> สาขา</p>
                <p className="text-gray-600">🍜 เมนู: <strong>{menus.filter((m) => m.name.trim()).length}</strong> รายการ</p>
                <p className="text-gray-600">👥 พนักงาน: <strong>{staff.filter((s) => s.name.trim()).length}</strong> คน</p>
                <p className="text-gray-600">🪑 โต๊ะ: <strong>{tables.filter((t) => t.number.trim()).length}</strong> โต๊ะ</p>
                <p className="text-gray-600">🖨️ เครื่องพิมพ์: <strong>{printers.filter((p) => p.name.trim()).length}</strong> เครื่อง</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {step > 0 ? (
              <button type="button" onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition">
                <ChevronLeft className="w-4 h-4" /> ย้อนกลับ
              </button>
            ) : (
              <Link href="/login" className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition">
                ยกเลิก
              </Link>
            )}

            {step < STEPS.length - 1 ? (
              <button type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm hover:from-indigo-700 hover:to-purple-700 transition shadow-md">
                ถัดไป <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm hover:from-green-600 hover:to-emerald-700 transition shadow-md disabled:opacity-70">
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                ลงทะเบียน
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = 'text', required = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-gray-700 transition" />
    </div>
  );
}
