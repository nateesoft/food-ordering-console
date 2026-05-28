'use client';

import { useEffect, useState } from 'react';
import { Crown, Check, Sparkles, Building2, UtensilsCrossed, Armchair, Users, BarChart3, Zap } from 'lucide-react';
import { apiPath } from '@/lib/api-path';

type Plan = 'FREE' | 'BASIC' | 'PRO';

interface PlanFeature {
  label: string;
  free: string | boolean;
  basic: string | boolean;
  pro: string | boolean;
}

const FEATURES: PlanFeature[] = [
  { label: 'จำนวนสาขา',          free: '1 สาขา',          basic: '3 สาขา',          pro: 'ไม่จำกัด'       },
  { label: 'เมนูอาหาร/สาขา',     free: '50 รายการ',        basic: '200 รายการ',      pro: 'ไม่จำกัด'       },
  { label: 'โต๊ะ/สาขา',          free: '10 โต๊ะ',          basic: '30 โต๊ะ',          pro: 'ไม่จำกัด'       },
  { label: 'พนักงาน/สาขา',       free: '5 คน',             basic: '15 คน',           pro: 'ไม่จำกัด'       },
  { label: 'รายงาน & Analytics', free: 'พื้นฐาน',           basic: 'ขั้นสูง',           pro: 'ขั้นสูง + Export' },
  { label: 'Webhooks',           free: false,              basic: true,              pro: true              },
  { label: 'QR Code สั่งอาหาร',  free: true,               basic: true,              pro: true              },
  { label: 'KDS (ครัว)',         free: false,              basic: true,              pro: true              },
  { label: 'Priority Support',   free: false,              basic: false,             pro: true              },
];

interface PlanCard {
  id: Plan;
  name: string;
  price: string;
  priceNote: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  highlight: boolean;
  icon: React.ElementType;
}

const PLANS: PlanCard[] = [
  {
    id: 'FREE',
    name: 'Free',
    price: 'ฟรี',
    priceNote: 'ตลอดไป',
    description: 'เริ่มต้นสำหรับร้านเล็กหรือทดลองใช้ระบบ',
    color: 'text-gray-700',
    bg: 'bg-white',
    border: 'border-gray-200',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-600',
    highlight: false,
    icon: UtensilsCrossed,
  },
  {
    id: 'BASIC',
    name: 'Basic',
    price: '499',
    priceNote: 'บาท/เดือน',
    description: 'เหมาะสำหรับร้านที่ขยายกิจการหลายสาขา',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    highlight: false,
    icon: Building2,
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '999',
    priceNote: 'บาท/เดือน',
    description: 'สำหรับธุรกิจที่ต้องการฟีเจอร์ครบและไม่มีข้อจำกัด',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    highlight: true,
    icon: Crown,
  },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === false) return <span className="text-gray-300 text-lg">—</span>;
  if (value === true) return <Check className="w-4 h-4 text-green-500 mx-auto" />;
  return <span className="text-sm text-gray-700">{value}</span>;
}

export default function PlanPage() {
  const [currentPlan, setCurrentPlan] = useState<Plan>('FREE');
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    fetch(apiPath('/api/auth/me'))
      .then((r) => r.json())
      .then((data) => {
        setCurrentPlan(data.plan ?? 'FREE');
        setUpdatedAt(data.planUpdatedAt ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  const current = PLANS.find((p) => p.id === currentPlan)!;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Crown className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">แพ็กเกจของฉัน</h1>
            <p className="text-sm text-gray-500">ดูและเปรียบเทียบแพ็กเกจที่ใช้งานอยู่</p>
          </div>
        </div>
      </div>

      {/* Current plan banner */}
      {!loading && (
        <div className={`rounded-2xl border-2 p-5 mb-8 flex items-center justify-between ${current.bg} ${current.border}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${current.badgeBg}`}>
              <current.icon className={`w-6 h-6 ${current.color}`} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">แพ็กเกจปัจจุบัน</p>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold ${current.color}`}>{current.name}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${current.badgeBg} ${current.badgeText}`}>
                  {currentPlan === 'FREE' ? 'ฟรี' : `${current.price} บาท/เดือน`}
                </span>
              </div>
              {updatedAt && (
                <p className="text-xs text-gray-400 mt-0.5">
                  อัพเดตเมื่อ {new Date(updatedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
            </div>
          </div>
          {currentPlan !== 'PRO' && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>ต้องการอัพเกรด? ติดต่อทีมงาน</span>
            </div>
          )}
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {PLANS.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan;
          const PlanIcon = plan.icon;
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-5 transition ${
                isCurrentPlan
                  ? `${plan.bg} ${plan.border} shadow-md`
                  : 'bg-white border-gray-100 opacity-80'
              }`}
            >
              {isCurrentPlan && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${plan.badgeBg} ${plan.badgeText} border ${plan.border} shadow-sm whitespace-nowrap`}>
                  แพ็กเกจปัจจุบัน
                </div>
              )}
              {plan.highlight && !isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white shadow-sm whitespace-nowrap">
                  แนะนำ
                </div>
              )}

              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${plan.badgeBg}`}>
                <PlanIcon className={`w-5 h-5 ${plan.color}`} />
              </div>

              <h3 className={`text-lg font-bold mb-1 ${plan.color}`}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                {plan.id === 'FREE' ? (
                  <span className="text-2xl font-bold text-gray-800">ฟรี</span>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-gray-800">{plan.price}</span>
                    <span className="text-sm text-gray-400">{plan.priceNote}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-4">{plan.description}</p>

              <ul className="space-y-2">
                {FEATURES.slice(0, 5).map((f) => {
                  const val = f[plan.id.toLowerCase() as 'free' | 'basic' | 'pro'];
                  return (
                    <li key={f.label} className="flex items-center gap-2 text-sm">
                      {val === false ? (
                        <span className="w-4 h-4 flex-shrink-0 text-gray-300 text-lg leading-none">—</span>
                      ) : (
                        <Check className="w-4 h-4 flex-shrink-0 text-green-500" />
                      )}
                      <span className={val === false ? 'text-gray-400' : 'text-gray-700'}>
                        {typeof val === 'string' ? val : f.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Feature comparison table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h2 className="font-semibold text-gray-800">เปรียบเทียบฟีเจอร์ทั้งหมด</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-gray-500 font-medium w-1/2">ฟีเจอร์</th>
                {PLANS.map((p) => (
                  <th key={p.id} className={`px-4 py-3 text-center font-semibold ${p.color} w-1/6`}>
                    <div className="flex flex-col items-center gap-1">
                      <span>{p.name}</span>
                      {p.id === currentPlan && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.badgeBg} ${p.badgeText}`}>ปัจจุบัน</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((f, i) => (
                <tr key={f.label} className={i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                  <td className="px-6 py-3 text-gray-700 font-medium">{f.label}</td>
                  <td className="px-4 py-3 text-center"><FeatureValue value={f.free} /></td>
                  <td className="px-4 py-3 text-center"><FeatureValue value={f.basic} /></td>
                  <td className="px-4 py-3 text-center"><FeatureValue value={f.pro} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade CTA */}
      {currentPlan !== 'PRO' && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-yellow-300" />
              <h3 className="font-bold text-lg">อัพเกรดแพ็กเกจ</h3>
            </div>
            <p className="text-indigo-100 text-sm">ติดต่อทีมงานเพื่ออัพเกรดแพ็กเกจและปลดล็อกฟีเจอร์ทั้งหมด</p>
          </div>
          <a
            href="mailto:support@foodconsole.com"
            className="flex-shrink-0 bg-white text-indigo-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition shadow-md"
          >
            ติดต่อทีมงาน
          </a>
        </div>
      )}
    </div>
  );
}
