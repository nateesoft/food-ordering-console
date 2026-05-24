'use client';

import { useState, useEffect } from 'react';
import { Building2, Save, Globe, Phone, Mail, MapPin, FileText, Briefcase } from 'lucide-react';
import { apiPath } from '@/lib/api-path';
import PageHeader from '@/components/dashboard/PageHeader';

interface CompanyData {
  id?: number;
  name: string;
  nameEn: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  website: string;
  description: string;
  businessType: string;
}

const BUSINESS_TYPES = [
  { value: 'restaurant', label: 'ร้านอาหาร' },
  { value: 'cafe', label: 'คาเฟ่ / ร้านกาแฟ' },
  { value: 'bakery', label: 'เบเกอรี่' },
  { value: 'fastfood', label: 'อาหารจานด่วน' },
  { value: 'buffet', label: 'บุฟเฟ่ต์' },
  { value: 'bar', label: 'บาร์ / ผับ' },
  { value: 'other', label: 'อื่นๆ' },
];

const empty: CompanyData = {
  name: '',
  nameEn: '',
  address: '',
  phone: '',
  email: '',
  logo: '',
  website: '',
  description: '',
  businessType: '',
};

export default function CompanySettingsPage() {
  const [form, setForm] = useState<CompanyData>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await fetch(apiPath('/api/company'));
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setForm({
            id: data.id,
            name: data.name ?? '',
            nameEn: data.nameEn ?? '',
            address: data.address ?? '',
            phone: data.phone ?? '',
            email: data.email ?? '',
            logo: data.logo ?? '',
            website: data.website ?? '',
            description: data.description ?? '',
            businessType: data.businessType ?? '',
          });
        }
      }
    } catch {
      // first time — no company record yet
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof CompanyData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      setMsg('กรุณากรอกชื่อบริษัท');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch(apiPath('/api/company'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || err.error || 'เกิดข้อผิดพลาด');
      }
      const updated = await res.json();
      setForm((prev) => ({ ...prev, id: updated.id }));
      setMsg('บันทึกข้อมูลบริษัทสำเร็จ!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setMsg('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <>
      <PageHeader icon={<Building2 className="w-8 h-8" />} title="ข้อมูลบริษัท" subtitle="จัดการข้อมูลบริษัทของคุณ" />
      <div className="p-6 md:p-8">
        <div className="max-w-3xl mx-auto">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {/* Basic Info */}
          <div className="p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">ข้อมูลพื้นฐาน</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อบริษัท (ภาษาไทย) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="บริษัท อร่อย จำกัด"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบริษัท (English)</label>
                  <input
                    type="text"
                    value={form.nameEn}
                    onChange={set('nameEn')}
                    placeholder="Aroi Company Limited"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Briefcase className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                  ประเภทธุรกิจ
                </label>
                <select
                  value={form.businessType}
                  onChange={set('businessType')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                >
                  <option value="">-- เลือกประเภทธุรกิจ --</option>
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FileText className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                  คำอธิบายบริษัท
                </label>
                <textarea
                  value={form.description}
                  onChange={set('description')}
                  rows={3}
                  placeholder="ร้านอาหารไทยรสเด็ด บรรยากาศดี..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">ข้อมูลติดต่อ</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                  ที่อยู่บริษัท
                </label>
                <textarea
                  value={form.address}
                  onChange={set('address')}
                  rows={2}
                  placeholder="123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="02-XXX-XXXX"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                    อีเมล
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="contact@company.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                  เว็บไซต์
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={set('website')}
                  placeholder="https://www.myrestaurant.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">โลโก้</h2>
            <div className="flex items-start gap-4">
              {form.logo ? (
                <img src={form.logo} alt="Company logo" className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center border border-dashed border-gray-300">
                  <Building2 className="w-8 h-8 text-gray-300" />
                </div>
              )}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">URL โลโก้</label>
                <input
                  type="url"
                  value={form.logo}
                  onChange={set('logo')}
                  placeholder="https://example.com/logo.png"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">รองรับ URL รูปภาพ (PNG, JPG, SVG)</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 flex items-center justify-between bg-gray-50 rounded-b-2xl">
            <div>
              {msg && (
                <p className={`text-sm font-medium ${msg.includes('สำเร็จ') ? 'text-green-600' : 'text-red-600'}`}>
                  {msg}
                </p>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition"
            >
              <Save className="w-4 h-4" />
              {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
