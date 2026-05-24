'use client';

import { AlertCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { useDialog } from '@/contexts/DialogContext';

const VARIANT_CONFIG = {
  confirm: {
    iconBg: 'bg-red-100',
    icon: Trash2,
    iconColor: 'text-red-600',
    confirmBtnClass: 'bg-red-600 hover:bg-red-700 text-white',
    defaultConfirmLabel: 'ลบ',
  },
  warning: {
    iconBg: 'bg-yellow-100',
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
    confirmBtnClass: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    defaultConfirmLabel: 'ตกลง',
  },
  info: {
    iconBg: 'bg-blue-100',
    icon: Info,
    iconColor: 'text-blue-600',
    confirmBtnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    defaultConfirmLabel: 'ตกลง',
  },
};

export default function GlobalDialog() {
  const { state, close } = useDialog();

  if (!state?.open) return null;

  const { variant, options } = state;
  const cfg = VARIANT_CONFIG[variant];
  const Icon = cfg.icon;
  const isConfirm = variant === 'confirm';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) close(false); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className={`w-14 h-14 rounded-full ${cfg.iconBg} flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-7 h-7 ${cfg.iconColor}`} />
          </div>

          <h2 className="text-lg font-bold text-gray-900 text-center">{options.title}</h2>

          {options.description && (
            <p className="mt-2 text-sm text-gray-500 text-center leading-relaxed">
              {options.description}
            </p>
          )}
        </div>

        <div className={`px-6 pb-6 flex gap-3 ${isConfirm ? '' : 'justify-center'}`}>
          {isConfirm && (
            <button
              onClick={() => close(false)}
              className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors"
            >
              {options.cancelLabel ?? 'ยกเลิก'}
            </button>
          )}
          <button
            onClick={() => close(true)}
            className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${cfg.confirmBtnClass}`}
          >
            {options.confirmLabel ?? cfg.defaultConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
