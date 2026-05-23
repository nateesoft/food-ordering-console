'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UtensilsCrossed, Building2, UserPlus, ChevronRight, ChevronLeft,
  Check, Eye, EyeOff,
} from 'lucide-react';
import { apiPath } from '@/lib/api-path';

const STEPS = [
  { label: 'บริษัท', icon: Building2 },
  { label: 'บัญชี', icon: UserPlus },
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

  // Step 1: Account
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  function validateCurrentStep(): string | null {
    if (step === 0) {
      if (!companyName.trim()) return 'กรุณากรอกชื่อบริษัท';
    }
    if (step === 1) {
      if (!username.trim()) return 'กรุณากรอก email';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) return 'email ไม่ถูกต้อง';
      if (password.length < 6) return 'password ต้องมีอย่างน้อย 6 ตัวอักษร';
      if (password !== confirmPassword) return 'password ไม่ตรงกัน';
    }
    return null;
  }

  function handleNext() {
    const err = validateCurrentStep();
    if (err) { setError(err); return; }
    setError('');
    setStep(1);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validateCurrentStep();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);

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

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg mb-3">
          <UtensilsCrossed className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">ลงทะเบียนใช้งาน</h1>
        <p className="text-gray-500 text-sm mt-1">Food Ordering Console</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-0 mb-8">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${done ? 'bg-green-500 text-white' : active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-gray-100 text-gray-400'}`}>
                  {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-xs mt-1.5 font-medium ${active ? 'text-indigo-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-16 h-0.5 mb-5 mx-2 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={step === 0 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>

          {/* Step 0: Company */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">ข้อมูลบริษัท</h3>
                <p className="text-sm text-gray-400 mt-0.5">สามารถแก้ไขเพิ่มเติมได้หลัง login</p>
              </div>
              <Field label="ชื่อบริษัท *" value={companyName} onChange={setCompanyName} placeholder="บริษัท อร่อย จำกัด" required />
              <Field label="ที่อยู่" value={companyAddress} onChange={setCompanyAddress} placeholder="123 ถนนสุขุมวิท กรุงเทพฯ" />
              <Field label="เบอร์โทรศัพท์" value={companyPhone} onChange={setCompanyPhone} placeholder="02-XXX-XXXX" />
              <Field label="อีเมลบริษัท" value={companyEmail} onChange={setCompanyEmail} placeholder="contact@company.com" type="email" />
            </div>
          )}

          {/* Step 1: Account */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">ข้อมูลบัญชี</h3>
                <p className="text-sm text-gray-400 mt-0.5">ใช้สำหรับ login เข้าใช้งานระบบ</p>
              </div>

              <Field label="Email *" value={username} onChange={setUsername} placeholder="email@example.com" type="email" required />

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Password * <span className="font-normal text-gray-400">(อย่างน้อย 6 ตัวอักษร)</span></label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-gray-700 pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-gray-700 pr-10"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-sm">
                <p className="font-semibold text-indigo-800 mb-2">สรุปข้อมูลที่จะลงทะเบียน</p>
                <p className="text-gray-600">🏢 <span className="font-medium">{companyName}</span></p>
                {companyPhone && <p className="text-gray-500 text-xs mt-0.5">📞 {companyPhone}</p>}
                {companyEmail && <p className="text-gray-500 text-xs">✉️ {companyEmail}</p>}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {step === 0 ? (
              <Link href="/login" className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition">
                ยกเลิก
              </Link>
            ) : (
              <button type="button" onClick={() => { setError(''); setStep(0); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition">
                <ChevronLeft className="w-4 h-4" /> ย้อนกลับ
              </button>
            )}

            {step === 0 ? (
              <button type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm hover:from-indigo-700 hover:to-purple-700 transition shadow-md">
                ถัดไป <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm hover:from-green-600 hover:to-emerald-700 transition shadow-md disabled:opacity-70">
                {loading
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Check className="w-4 h-4" />}
                ลงทะเบียน
              </button>
            )}
          </div>
        </form>
      </div>

      <p className="text-center text-sm text-gray-500 mt-5">
        มีบัญชีอยู่แล้ว?{' '}
        <Link href="/login" className="text-indigo-600 font-semibold hover:underline">เข้าสู่ระบบ</Link>
      </p>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', required = false }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-gray-700 transition"
      />
    </div>
  );
}
