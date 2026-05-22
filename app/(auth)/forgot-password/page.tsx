'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, UtensilsCrossed, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || 'เกิดข้อผิดพลาด'); return; }
      setSuccess(true);
    } catch {
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg mb-4">
          <UtensilsCrossed className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Food Ordering Console</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {success ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">ส่งอีเมลแล้ว!</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              หากบัญชีนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยัง<br />
              <strong className="text-gray-700">{username}</strong><br />
              กรุณาตรวจสอบอีเมลของคุณ (รวมถึงโฟลเดอร์สแปม)
            </p>
            <Link href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition text-sm">
              กลับไปหน้า Login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">ลืมรหัสผ่าน?</h2>
              <p className="text-gray-500 text-sm">กรอก email ที่ใช้สมัคร เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้คุณ</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email (Username)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" value={username} onChange={(e) => setUsername(e.target.value)}
                    placeholder="email@example.com" required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition text-gray-800 text-sm" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-70">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Mail className="w-5 h-5" /> ส่งลิงก์รีเซ็ตรหัสผ่าน</>
                )}
              </button>
            </form>

            <div className="mt-6">
              <Link href="/login" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition">
                <ArrowLeft className="w-4 h-4" /> กลับไปหน้า Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
