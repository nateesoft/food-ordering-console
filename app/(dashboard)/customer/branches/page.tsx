'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Search,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Phone,
  Hash,
  Upload,
  Image as ImageIcon,
  Link,
  FolderOpen,
  RefreshCw,
  CheckCircle,
  Sun,
  Moon,
  QrCode,
  Printer,
} from 'lucide-react';
import QRCodeLib from 'qrcode';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUrl';
import { useDialog } from '@/contexts/DialogContext';
import PageHeader from '@/components/dashboard/PageHeader';

type ThemeMode = 'LIGHT' | 'DARK';

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  logo: string | null;
  themeMode: ThemeMode;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BranchManagementPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // QR modal state
  const [qrModalBranch, setQrModalBranch] = useState<Branch | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    address: string;
    phone: string;
    logo: string;
    themeMode: ThemeMode;
    isActive: boolean;
  }>({
    name: '',
    code: '',
    address: '',
    phone: '',
    logo: '',
    themeMode: 'LIGHT',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Image upload state
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image gallery state
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<{ url: string; filename: string; size: number; uploadedAt: string }[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [gallerySearch, setGallerySearch] = useState('');

  const { confirm } = useDialog();

  const loadBranches = async () => {
    try {
      const data = await api.getBranches();
      setBranches(data);
    } catch (err) {
      console.error('Failed to load branches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const loadGalleryImages = useCallback(async () => {
    setGalleryLoading(true);
    try {
      const data = await api.getUploadedImages();
      setGalleryImages(data.images);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setGalleryLoading(false);
    }
  }, []);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('ไฟล์ต้องมีขนาดไม่เกิน 5MB');
      return;
    }
    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      setFormData(prev => ({ ...prev, logo: result.url }));
    } catch (err: any) {
      alert(err.message || 'อัพโหลดไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = '';
  };

  const handleDeleteGalleryImage = async (filename: string) => {
    const ok = await confirm({ title: 'ลบรูปภาพ?', description: 'รูปภาพนี้จะถูกลบออกจากระบบ ไม่สามารถกู้คืนได้', confirmLabel: 'ลบ' });
    if (!ok) return;
    try {
      await api.deleteUploadedImage(filename);
      setGalleryImages(prev => prev.filter(img => img.filename !== filename));
    } catch (err: any) {
      alert(err.message || 'ลบไม่สำเร็จ');
    }
  };

  const handleSelectGalleryImage = (url: string) => {
    setFormData(prev => ({ ...prev, logo: url }));
    setShowImageGallery(false);
  };

  const filteredGalleryImages = galleryImages.filter(img =>
    img.filename.toLowerCase().includes(gallerySearch.toLowerCase())
  );

  const openCreateModal = () => {
    setEditBranch(null);
    setFormData({ name: '', code: '', address: '', phone: '', logo: '', themeMode: 'LIGHT', isActive: true });
    setImageInputMode('upload');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code,
      address: branch.address || '',
      phone: branch.phone || '',
      logo: branch.logo || '',
      themeMode: branch.themeMode ?? 'LIGHT',
      isActive: branch.isActive,
    });
    setImageInputMode('upload');
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setFormError('กรุณากรอกชื่อสาขา');
      return;
    }
    if (!formData.code.trim()) {
      setFormError('กรุณากรอกรหัสสาขา');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      if (editBranch) {
        await api.updateBranch(editBranch.id, {
          name: formData.name,
          code: formData.code,
          address: formData.address || undefined,
          phone: formData.phone || undefined,
          logo: formData.logo || undefined,
          themeMode: formData.themeMode,
          isActive: formData.isActive,
        });
      } else {
        await api.createBranch({
          name: formData.name,
          code: formData.code,
          address: formData.address || undefined,
          phone: formData.phone || undefined,
          logo: formData.logo || undefined,
          themeMode: formData.themeMode,
        });
      }
      setShowModal(false);
      loadBranches();
    } catch (err: any) {
      setFormError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (branch: Branch) => {
    const ok = await confirm({
      title: `ลบสาขา "${branch.name}"?`,
      description: 'สาขานี้จะถูกลบออกจากระบบ ไม่สามารถกู้คืนได้',
      confirmLabel: 'ลบ',
    });
    if (!ok) return;
    try {
      await api.deleteBranch(branch.id);
      loadBranches();
    } catch (err) {
      console.error('Failed to delete branch:', err);
    }
  };

  const buildOrdersUrl = (branchId: string) => {
    const systemUrl = process.env.NEXT_PUBLIC_FOOD_ORDERING_SYSTEM_URL ?? window.location.origin;
    return `${systemUrl}/food-ordering/${branchId}/orders`;
  };

  const handleShowQrModal = async (branch: Branch) => {
    const url = buildOrdersUrl(branch.id);
    const dataUrl = await QRCodeLib.toDataURL(url, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
    });
    setQrDataUrl(dataUrl);
    setQrModalBranch(branch);
  };

  const printBranchQr = async (branch: Branch) => {
    const url = buildOrdersUrl(branch.id);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dataUrl = await QRCodeLib.toDataURL(url, { width: 500, margin: 2 });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${branch.name}</title>
          <style>
            body {
              margin: 0;
              padding: 40px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: Arial, sans-serif;
            }
            .container {
              text-align: center;
              border: 3px solid #000;
              padding: 30px;
              border-radius: 15px;
            }
            h1 { font-size: 36px; margin: 0 0 10px 0; color: #000; }
            .subtitle { font-size: 20px; color: #555; margin: 0 0 20px 0; }
            img { width: 400px; height: 400px; margin: 20px 0; }
            .instruction { font-size: 22px; margin: 20px 0 5px 0; color: #333; }
            .url { font-size: 12px; color: #888; margin-top: 10px; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${branch.name}</h1>
            <p class="subtitle">รหัสสาขา: ${branch.code}</p>
            <img src="${dataUrl}" alt="QR Code" />
            <p class="instruction">สแกน QR Code เพื่อดูรายการออร์เดอร์</p>
            <p class="url">${url}</p>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100">
      <PageHeader icon={<Building2 className="w-8 h-8" />} title="Branch Management" subtitle="จัดการสาขา เพิ่ม/แก้ไข/ลบ" />

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Toolbar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาสาขา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-200 text-sm focus:border-teal-400 focus:outline-none"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold text-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            เพิ่มสาขา
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 text-xl">Loading...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">สาขา</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">รหัส</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">ที่อยู่</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-600">โทรศัพท์</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-600">สถานะ</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-600">QR Orders</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBranches.map((branch) => (
                  <tr key={branch.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {branch.logo ? (
                          <img
                            src={getImageUrl(branch.logo)}
                            alt={branch.name}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`bg-teal-100 w-10 h-10 rounded-lg flex items-center justify-center ${branch.logo ? 'hidden' : ''}`}>
                          <Building2 className="w-5 h-5 text-teal-600" />
                        </div>
                        <span className="font-bold text-gray-800 text-lg">{branch.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg font-mono text-sm">
                        {branch.code}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {branch.address ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-xs">{branch.address}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">
                      {branch.phone ? (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {branch.phone}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {branch.isActive ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Active
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleShowQrModal(branch)}
                        className="p-2 hover:bg-teal-100 rounded-lg transition-colors"
                        title="QR Code Orders"
                      >
                        <QrCode className="w-5 h-5 text-teal-600" />
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(branch)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(branch)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="ลบ"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBranches.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 text-lg">
                      ไม่พบข้อมูลสาขา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b shrink-0">
              <h2 className="text-2xl font-bold text-gray-800">
                {editBranch ? 'แก้ไขสาขา' : 'เพิ่มสาขาใหม่'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  ชื่อสาขา *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:border-teal-400 focus:outline-none"
                  placeholder="เช่น สาขาสยาม"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <Hash className="w-4 h-4 inline mr-1" />
                  รหัสสาขา *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:border-teal-400 focus:outline-none font-mono"
                  placeholder="เช่น SIAM"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  ที่อยู่
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:border-teal-400 focus:outline-none"
                  rows={2}
                  placeholder="ที่อยู่สาขา"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  โทรศัพท์
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:border-teal-400 focus:outline-none"
                  placeholder="02-XXX-XXXX"
                />
              </div>

              {/* Logo Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  โลโก้สาขา
                </label>

                {/* Image Preview */}
                {formData.logo && (
                  <div className="mb-3 relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={getImageUrl(formData.logo)}
                      alt="Logo Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Image+Error'; }}
                    />
                    <button
                      onClick={() => setFormData({ ...formData, logo: '' })}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Mode Toggle */}
                <div className="flex gap-1 mb-3 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setImageInputMode('upload')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      imageInputMode === 'upload'
                        ? 'bg-white text-teal-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    อัพโหลดรูป
                  </button>
                  <button
                    onClick={() => setImageInputMode('url')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      imageInputMode === 'url'
                        ? 'bg-white text-teal-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Link className="w-4 h-4" />
                    ใส่ URL
                  </button>
                </div>

                {imageInputMode === 'upload' ? (
                  <div>
                    {/* Drag & Drop Zone */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                        dragOver
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50/50'
                      } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="w-8 h-8 text-teal-500 animate-spin" />
                          <p className="text-sm text-teal-600 font-medium">กำลังอัพโหลด...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-teal-500" />
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold text-teal-600">คลิกเพื่อเลือกไฟล์</span> หรือลากไฟล์มาวางที่นี่
                          </p>
                          <p className="text-xs text-gray-400">JPG, PNG, WebP, GIF (ไม่เกิน 5MB)</p>
                        </div>
                      )}
                    </div>

                    {/* Gallery Button */}
                    <button
                      onClick={() => { loadGalleryImages(); setShowImageGallery(true); }}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-teal-300 transition-all"
                    >
                      <FolderOpen className="w-4 h-4" />
                      เลือกจากคลังรูปภาพ
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-teal-400 focus:outline-none"
                      placeholder="https://..."
                    />
                    <p className="mt-1 text-xs text-gray-400">วาง URL รูปภาพจากเว็บไซต์ภายนอก</p>
                  </div>
                )}
              </div>

              {/* Theme Mode */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  รูปแบบธีม (หน้าลูกค้า)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, themeMode: 'LIGHT' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      formData.themeMode === 'LIGHT'
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    Light Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, themeMode: 'DARK' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      formData.themeMode === 'DARK'
                        ? 'border-gray-700 bg-gray-800 text-white'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    Dark Mode
                  </button>
                </div>
              </div>

              {editBranch && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">สถานะ</span>
                  <button
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className="flex items-center gap-2"
                  >
                    {formData.isActive ? (
                      <>
                        <ToggleRight className="w-8 h-8 text-green-500" />
                        <span className="text-green-600 font-semibold">Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-8 h-8 text-gray-400" />
                        <span className="text-gray-500 font-semibold">Inactive</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold text-lg hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Orders Modal */}
      {qrModalBranch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-bold text-gray-800">QR Orders — {qrModalBranch.name}</h2>
              </div>
              <button onClick={() => setQrModalBranch(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
              {qrDataUrl && (
                <img src={qrDataUrl} alt="QR Code" className="w-56 h-56 rounded-xl border border-gray-200" />
              )}
              <p className="text-xs text-gray-500 text-center break-all px-2">
                {buildOrdersUrl(qrModalBranch.id)}
              </p>
              <button
                onClick={() => printBranchQr(qrModalBranch)}
                className="flex items-center gap-2 w-full justify-center bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl font-semibold transition-colors"
              >
                <Printer className="w-5 h-5" />
                พิมพ์ QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      {showImageGallery && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowImageGallery(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Gallery Header */}
            <div className="p-5 border-b flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">คลังรูปภาพ</h3>
                  <p className="text-xs text-gray-500">{galleryImages.length} รูปภาพ</p>
                </div>
              </div>
              <button
                onClick={() => setShowImageGallery(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Upload */}
            <div className="p-4 border-b flex gap-3 shrink-0">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={gallerySearch}
                  onChange={(e) => setGallerySearch(e.target.value)}
                  placeholder="ค้นหาชื่อไฟล์..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/jpeg,image/png,image/webp,image/gif';
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      setUploading(true);
                      try {
                        const result = await api.uploadImage(file);
                        setGalleryImages(prev => [{ url: result.url, filename: result.filename, size: file.size, uploadedAt: new Date().toISOString() }, ...prev]);
                      } catch (err: any) {
                        alert(err.message || 'อัพโหลดไม่สำเร็จ');
                      } finally {
                        setUploading(false);
                      }
                    }
                  };
                  input.click();
                }}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all text-sm font-medium disabled:opacity-50"
              >
                {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                อัพโหลด
              </button>
              <button
                onClick={loadGalleryImages}
                disabled={galleryLoading}
                className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                <RefreshCw className={`w-4 h-4 text-gray-500 ${galleryLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {galleryLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 text-teal-500 animate-spin" />
                </div>
              ) : filteredGalleryImages.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{gallerySearch ? 'ไม่พบรูปภาพที่ค้นหา' : 'ยังไม่มีรูปภาพในคลัง'}</p>
                  <p className="text-xs mt-1">อัพโหลดรูปภาพใหม่เพื่อเริ่มต้น</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredGalleryImages.map((img) => (
                    <div
                      key={img.filename}
                      className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer hover:shadow-lg ${
                        formData.logo === img.url ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200 hover:border-teal-300'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.filename}
                        className="w-full h-32 object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x128?text=Error'; }}
                      />

                      {/* Selected indicator */}
                      {formData.logo === img.url && (
                        <div className="absolute top-2 left-2">
                          <CheckCircle className="w-6 h-6 text-teal-500 bg-white rounded-full" />
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleSelectGalleryImage(img.url)}
                          className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition-all shadow-lg"
                        >
                          เลือก
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteGalleryImage(img.filename); }}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-all shadow-lg"
                        >
                          ลบ
                        </button>
                      </div>

                      {/* File info */}
                      <div className="p-2 bg-white">
                        <p className="text-xs text-gray-600 truncate font-medium">{img.filename}</p>
                        <p className="text-xs text-gray-400">
                          {(img.size / 1024).toFixed(0)} KB
                          {' · '}
                          {new Date(img.uploadedAt).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
