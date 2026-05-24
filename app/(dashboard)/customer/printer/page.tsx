'use client';

import { useState, useEffect, useCallback } from 'react';
import { Printer as PrinterIcon } from 'lucide-react';
import type { ConnectionType } from '@/lib/printer/printer-service';
import BranchSelector from '@/components/BranchSelector';
import PageHeader from '@/components/dashboard/PageHeader';
import { useBranch } from '@/contexts/BranchContext';
import { useDialog } from '@/contexts/DialogContext';
import { api } from '@/lib/api';
import type { PrinterConfigItem } from '@/lib/api';

function generateId(): string {
  return crypto.randomUUID();
}

function generateSecret(): string {
  const arr = new Uint8Array(18);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

function getStatusLabel(printer: PrinterConfigItem): { label: string; color: string } {
  if (!printer.lastSeen) return { label: 'ไม่เคยเชื่อมต่อ', color: 'gray' };
  const diffMs = Date.now() - new Date(printer.lastSeen).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (printer.isActive && diffMin < 5) return { label: 'ออนไลน์', color: 'green' };
  if (diffMin < 60) return { label: `${diffMin} นาทีที่แล้ว`, color: 'yellow' };
  return { label: 'ออฟไลน์', color: 'red' };
}

const EMPTY_FORM: Omit<PrinterConfigItem, 'id' | 'secret' | 'isActive' | 'lastSeen'> = {
  name: '',
  connectionType: 'serial',
  serialConfig: { baudRate: 9600 },
  paperWidth: 48,
  shopName: 'ร้านอาหาร',
  shopAddress: '',
  shopPhone: '',
  shopTaxId: '',
  footerText: 'ขอบคุณที่ใช้บริการ',
};

interface FormState extends Omit<PrinterConfigItem, 'id' | 'secret' | 'isActive' | 'lastSeen'> {}

export default function PrinterSettingsPage() {
  const { selectedBranch } = useBranch();
  const { confirm } = useDialog();
  const [printers, setPrinters] = useState<PrinterConfigItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  // Edit modal state
  const [editingId, setEditingId] = useState<string | null>(null); // null = closed, 'new' = add
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });

  // Copy feedback
  const [copied, setCopied] = useState<string | null>(null);

  const [saveError, setSaveError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const loadPrinters = useCallback(async () => {
    if (!selectedBranch) return;
    setLoading(true);
    try {
      const result = await api.getPrinterConfigs();
      setPrinters(Array.isArray(result.value) ? result.value : []);
    } catch {
      setPrinters([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBranch]);

  useEffect(() => {
    loadPrinters();
  }, [loadPrinters]);

  // Poll every 30 s to refresh status
  useEffect(() => {
    const id = setInterval(loadPrinters, 30_000);
    return () => clearInterval(id);
  }, [loadPrinters]);

  const savePrinters = async (updated: PrinterConfigItem[]) => {
    setSaving(true);
    setSaveError('');
    try {
      await api.savePrinterConfigs(updated);
      setPrinters(updated);
      setSaveMessage('บันทึกสำเร็จ!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId('new');
  };

  const openEdit = (printer: PrinterConfigItem) => {
    const { id, secret, isActive, lastSeen, ...rest } = printer;
    setForm(rest);
    setEditingId(id);
  };

  const closeModal = () => setEditingId(null);

  const handleFormSave = async () => {
    if (!form.name.trim()) return;
    if (editingId === 'new') {
      const newPrinter: PrinterConfigItem = {
        ...form,
        id: generateId(),
        secret: generateSecret(),
        isActive: false,
        lastSeen: null,
      };
      await savePrinters([...printers, newPrinter]);
    } else {
      const updated = printers.map((p) =>
        p.id === editingId ? { ...p, ...form } : p,
      );
      await savePrinters(updated);
    }
    closeModal();
  };

  const handleDelete = async (printer: PrinterConfigItem) => {
    const ok = await confirm({
      title: `ลบเครื่องพิมพ์ "${printer.name}"?`,
      description: 'เครื่องพิมพ์นี้จะถูกลบออกจากระบบ ไม่สามารถกู้คืนได้',
      confirmLabel: 'ลบ',
    });
    if (!ok) return;
    await savePrinters(printers.filter((p) => p.id !== printer.id));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const isModalOpen = editingId !== null;

  return (
    <>
      <PageHeader icon={<PrinterIcon className="w-8 h-8" />} title="ตั้งค่าเครื่องพิมพ์ใบเสร็จ" subtitle="จัดการการตั้งค่าเครื่องพิมพ์">
        <BranchSelector />
      </PageHeader>
      <div className="p-6 md:p-8">
        <div className="max-w-4xl mx-auto">

        {/* Feedback messages */}
        {saveMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {saveMessage}
          </div>
        )}
        {saveError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {saveError}
          </div>
        )}

        {/* Add printer button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={openAdd}
            disabled={!selectedBranch || loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มเครื่องพิมพ์
          </button>
        </div>

        {/* Printer list */}
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-12">กำลังโหลด...</p>
        ) : printers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <p className="text-gray-500 font-medium">ยังไม่มีเครื่องพิมพ์</p>
            <p className="text-gray-400 text-sm mt-1">กดปุ่ม "เพิ่มเครื่องพิมพ์" เพื่อเพิ่มรายการ</p>
          </div>
        ) : (
          <div className="space-y-4">
            {printers.map((printer) => {
              const status = getStatusLabel(printer);
              return (
                <div key={printer.id} className="bg-white rounded-xl shadow-sm border p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Status dot */}
                      <div className={`shrink-0 w-3 h-3 rounded-full mt-0.5 ${
                        status.color === 'green' ? 'bg-green-500 animate-pulse' :
                        status.color === 'yellow' ? 'bg-yellow-400' :
                        status.color === 'red' ? 'bg-red-500' :
                        'bg-gray-300'
                      }`} />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{printer.name}</p>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            status.color === 'green' ? 'bg-green-100 text-green-700' :
                            status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                            status.color === 'red' ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {status.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            {printer.connectionType === 'serial' ? 'Web Serial' : 'Web USB'} · {printer.paperWidth === 32 ? '58mm' : '80mm'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => openEdit(printer)}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(printer)}
                        className="px-3 py-1.5 text-sm border border-red-100 rounded-lg hover:bg-red-50 text-red-600"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>

                  {/* Integration credentials */}
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Printer ID (สำหรับ local agent)</p>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <code className="text-xs text-gray-700 flex-1 truncate font-mono">{printer.id}</code>
                        <button
                          onClick={() => copyToClipboard(printer.id, `id-${printer.id}`)}
                          className="shrink-0 text-gray-400 hover:text-gray-600"
                          title="คัดลอก"
                        >
                          {copied === `id-${printer.id}` ? (
                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Secret (สำหรับ local agent)</p>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <code className="text-xs text-gray-700 flex-1 truncate font-mono">{printer.secret}</code>
                        <button
                          onClick={() => copyToClipboard(printer.secret, `secret-${printer.id}`)}
                          className="shrink-0 text-gray-400 hover:text-gray-600"
                          title="คัดลอก"
                        >
                          {copied === `secret-${printer.id}` ? (
                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Heartbeat API hint */}
        {printers.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-1">Local Agent — Heartbeat API</p>
            <p className="mb-2 text-xs">Local printer agent ยิง POST มาทุก ๆ 1–5 นาที เพื่ออัพเดตสถานะ:</p>
            <code className="block bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-800">
              POST {'{API_URL}'}/printers/heartbeat<br />
              {'{ "printerId": "...", "branchId": "{branchId}", "secret": "..." }'}
            </code>
            <p className="mt-2 text-xs">เมื่อปิด agent ให้ยิง <code className="bg-white px-1 rounded">POST /printers/offline</code> ด้วย body เดิม</p>
          </div>
        )}
      </div>


      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingId === 'new' ? 'เพิ่มเครื่องพิมพ์' : 'แก้ไขเครื่องพิมพ์'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Printer name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเครื่องพิมพ์ <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="เช่น เครื่องพิมพ์หน้าร้าน, เครื่องพิมพ์ครัว"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* Connection section */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <p className="text-sm font-semibold text-gray-700">การเชื่อมต่อ</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">ประเภท</label>
                    <select
                      value={form.connectionType}
                      onChange={(e) => setForm((f) => ({ ...f, connectionType: e.target.value as ConnectionType }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                    >
                      <option value="serial">Web Serial (USB/COM Port)</option>
                      <option value="usb">Web USB</option>
                    </select>
                  </div>

                  {form.connectionType === 'serial' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Baud Rate</label>
                      <select
                        value={form.serialConfig?.baudRate ?? 9600}
                        onChange={(e) => setForm((f) => ({ ...f, serialConfig: { baudRate: Number(e.target.value) } }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                      >
                        {[9600, 19200, 38400, 57600, 115200].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">ขนาดกระดาษ</label>
                    <select
                      value={form.paperWidth}
                      onChange={(e) => setForm((f) => ({ ...f, paperWidth: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                    >
                      <option value={32}>58mm (32 chars)</option>
                      <option value={48}>80mm (48 chars)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Shop info section */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700">ข้อมูลร้านค้า (แสดงบนใบเสร็จ)</p>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อร้าน</label>
                  <input
                    type="text"
                    value={form.shopName}
                    onChange={(e) => setForm((f) => ({ ...f, shopName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ที่อยู่</label>
                  <textarea
                    value={form.shopAddress}
                    onChange={(e) => setForm((f) => ({ ...f, shopAddress: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">เบอร์โทร</label>
                    <input
                      type="text"
                      value={form.shopPhone}
                      onChange={(e) => setForm((f) => ({ ...f, shopPhone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">เลขผู้เสียภาษี</label>
                    <input
                      type="text"
                      value={form.shopTaxId}
                      onChange={(e) => setForm((f) => ({ ...f, shopTaxId: e.target.value }))}
                      maxLength={13}
                      placeholder="0000000000000"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ข้อความท้ายใบเสร็จ</label>
                  <input
                    type="text"
                    value={form.footerText}
                    onChange={(e) => setForm((f) => ({ ...f, footerText: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleFormSave}
                disabled={saving || !form.name.trim()}
                className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center gap-2"
              >
                {saving && (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
