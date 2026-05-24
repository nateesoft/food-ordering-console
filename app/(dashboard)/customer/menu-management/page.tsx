'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useBranch } from '@/contexts/BranchContext';
import { Plus, Edit, Trash2, Settings, X, Save, Upload, Image as ImageIcon, Link, FolderOpen, Search, RefreshCw, CheckCircle } from 'lucide-react';
import { MenuItem, AddOn, SetComponent } from '@/types';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUrl';
import BranchSelector from '@/components/BranchSelector';
import PageHeader from '@/components/dashboard/PageHeader';
import { useDialog } from '@/contexts/DialogContext';

export default function MenuManagementPage() {
  const { selectedBranch } = useBranch();
  const { confirm, info } = useDialog();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingAddOn, setEditingAddOn] = useState<AddOn | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'menu' | 'addons' | 'categories'>('menu');


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
      setFormData(prev => ({ ...prev, image: result.url }));
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
    setFormData(prev => ({ ...prev, image: url }));
    setShowImageGallery(false);
  };

  const filteredGalleryImages = galleryImages.filter(img =>
    img.filename.toLowerCase().includes(gallerySearch.toLowerCase())
  );

  const loadData = useCallback(async () => {
    if (!selectedBranch) return;
    setLoading(true);
    try {
      const [items, cats, addOnsData] = await Promise.all([
        api.getMenuItems(),
        api.getMenuCategories(),
        api.getAddOns(),
      ]);
      setMenuItems(items.map(item => ({
        id: item.id,
        code: item.code,
        name: item.name,
        category: item.category,
        price: item.price,
        image: item.image ?? '',
        description: item.description ?? '',
        rating: item.rating ?? undefined,
        reviewCount: item.reviewCount,
        type: item.type.toLowerCase() as 'single' | 'set' | 'group',
        isActive: item.isActive,
        setComponents: item.setComponents,
        availableAddOns: item.availableAddOns.map((a: any) => a.addOnId ?? a),
        availableAddOnGroups: item.availableAddOnGroups.map((a: any) => a.addOnGroupId ?? a),
        nestedMenuConfig: item.nestedMenuConfig ?? undefined,
      })) as MenuItem[]);
      setCategories(cats);
      setAddOns(addOnsData as any[]);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedBranch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  // Menu Item Form State
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    code: '',
    name: '',
    category: '',
    price: 0,
    image: '',
    description: '',
    type: 'single',
    availableAddOns: [],
    setComponents: [],
    isActive: true,
  });

  // Add-on Form State
  const [addOnFormData, setAddOnFormData] = useState<Partial<AddOn>>({
    name: '',
    price: 0,
    category: 'topping',
  });

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData(item);
    setShowEditModal(true);
  };

  const handleCreateItem = () => {
    setEditingItem(null);
    setFormData({
      code: '',
      name: '',
      category: categories[0] || 'อาหารจานเดียว',
      price: 0,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      description: '',
      type: 'single',
      availableAddOns: [],
      setComponents: [],
      isActive: true,
    });
    setShowEditModal(true);
  };

  const handleSaveItem = async () => {
    if (!formData.name || !formData.category) {
      alert('กรุณากรอกชื่อเมนูและหมวดหมู่');
      return;
    }
    if (!formData.code) {
      alert('กรุณากรอกรหัสเมนู (Code)');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: formData.code!,
        name: formData.name!,
        category: formData.category!,
        price: formData.price ?? 0,
        image: formData.image || undefined,
        description: formData.description || undefined,
        type: (formData.type ?? 'single').toUpperCase(),
        isActive: formData.isActive ?? true,
        setComponents: formData.setComponents?.map(c => ({ name: c.name, description: c.description, quantity: c.quantity })),
        addOnIds: formData.availableAddOns as number[] | undefined,
      };

      if (editingItem) {
        await api.updateMenuItem(editingItem.id, payload);
        setSuccessMsg(`อัพเดทเมนู "${formData.name}" สำเร็จ`);
      } else {
        await api.createMenuItem(payload);
        setSuccessMsg(`เพิ่มเมนู "${formData.name}" สำเร็จ`);
      }
      setShowEditModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: number, name: string) => {
    const ok = await confirm({ title: `ลบเมนู "${name}"?`, description: 'รายการนี้จะถูกลบออกจากระบบ ไม่สามารถกู้คืนได้', confirmLabel: 'ลบ' });
    if (!ok) return;
    try {
      await api.deleteMenuItem(id);
      setSuccessMsg(`ลบเมนู "${name}" สำเร็จ`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'ลบไม่สำเร็จ');
    }
  };

  const handleEditAddOn = (addOn: AddOn) => {
    setEditingAddOn(addOn);
    setAddOnFormData(addOn);
    setShowAddOnModal(true);
  };

  const handleCreateAddOn = () => {
    setEditingAddOn(null);
    setAddOnFormData({
      name: '',
      price: 0,
      category: 'topping',
    });
    setShowAddOnModal(true);
  };

  const handleSaveAddOn = async () => {
    if (!addOnFormData.name) {
      alert('กรุณากรอกชื่อ Add-on');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: addOnFormData.name!,
        price: addOnFormData.price ?? 0,
        category: addOnFormData.category || 'topping',
      };

      if (editingAddOn) {
        await api.updateAddOn(editingAddOn.id, payload);
        setSuccessMsg(`อัพเดท Add-on "${addOnFormData.name}" สำเร็จ`);
      } else {
        await api.createAddOn(payload);
        setSuccessMsg(`เพิ่ม Add-on "${addOnFormData.name}" สำเร็จ`);
      }
      setShowAddOnModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddOn = async (id: number, name: string) => {
    const ok = await confirm({ title: `ลบ Add-on "${name}"?`, description: 'รายการนี้จะถูกลบออกจากระบบ ไม่สามารถกู้คืนได้', confirmLabel: 'ลบ' });
    if (!ok) return;
    try {
      await api.deleteAddOn(id);
      setSuccessMsg(`ลบ Add-on "${name}" สำเร็จ`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'ลบไม่สำเร็จ');
    }
  };

  const handleAddCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      await info({ title: 'กรุณากรอกชื่อหมวดหมู่' });
      return;
    }
    if (categories.includes(trimmed)) {
      await info({ title: 'หมวดหมู่นี้มีอยู่แล้ว' });
      return;
    }
    try {
      await api.createMenuCategory(trimmed);
      setCategories(prev => [...prev, trimmed]);
      setNewCategory('');
      setSuccessMsg(`เพิ่มหมวดหมู่ "${trimmed}" สำเร็จ`);
    } catch (err: any) {
      await info({ title: 'เพิ่มหมวดหมู่ไม่สำเร็จ', description: err.message });
    }
  };

  const handleDeleteCategory = async (category: string) => {
    const itemsInCategory = menuItems.filter(item => item.category === category);
    if (itemsInCategory.length > 0) {
      await info({ title: 'ไม่สามารถลบได้', description: `มีเมนู ${itemsInCategory.length} รายการในหมวดหมู่นี้` });
      return;
    }
    const ok = await confirm({ title: `ลบหมวดหมู่ "${category}"?`, description: 'หมวดหมู่นี้จะถูกลบออกจากระบบ', confirmLabel: 'ลบ' });
    if (!ok) return;
    try {
      await api.deleteMenuCategory(category);
      setCategories(prev => prev.filter(c => c !== category));
      setSuccessMsg(`ลบหมวดหมู่ "${category}" สำเร็จ`);
    } catch (err: any) {
      await info({ title: 'ลบหมวดหมู่ไม่สำเร็จ', description: err.message });
    }
  };

  const addSetComponent = () => {
    const newComponent: SetComponent = {
      id: 0,
      name: '',
      description: '',
      quantity: 1,
    };
    setFormData(prev => ({
      ...prev,
      setComponents: [...(prev.setComponents || []), newComponent],
    }));
  };

  const removeSetComponent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      setComponents: prev.setComponents?.filter((_, i) => i !== index),
    }));
  };

  const updateSetComponent = (index: number, field: keyof SetComponent, value: any) => {
    setFormData(prev => ({
      ...prev,
      setComponents: prev.setComponents?.map((comp, i) =>
        i === index ? { ...comp, [field]: value } : comp
      ),
    }));
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50">

      <PageHeader icon={<Settings className="w-8 h-8" />} title="จัดการเมนูอาหาร" subtitle="เพิ่ม แก้ไข ลบเมนูและ Add-ons">
        <BranchSelector />
      </PageHeader>

      {/* No branch selected guard */}
      {!selectedBranch && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="bg-orange-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
            <Settings className="w-12 h-12 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">กรุณาเลือกสาขาก่อน</h2>
          <p className="text-gray-500 max-w-sm">เลือกสาขาที่ต้องการจัดการเมนูจากเมนูด้านบน</p>
        </div>
      )}

      {selectedBranch && <>
      {/* Success message */}
      {successMsg && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <span className="text-green-800">{successMsg}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'menu'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            รายการเมนู ({menuItems.length})
          </button>
          <button
            onClick={() => setActiveTab('addons')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'addons'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Add-ons / Toppings ({addOns.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'categories'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            หมวดหมู่ ({categories.length})
          </button>
        </div>

        {/* Menu Items Tab */}
        {activeTab === 'menu' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">รายการเมนูทั้งหมด</h2>
              <button
                onClick={handleCreateItem}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold"
              >
                <Plus className="w-5 h-5" />
                เพิ่มเมนูใหม่
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {menuItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="relative">
                    <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-40 object-cover" />
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ฿{item.price}
                    </div>
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold uppercase">
                      {item.type}
                    </div>
                    {!item.isActive && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">ปิดใช้งาน</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{item.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    {item.type === 'set' || item.type === 'group' ? (
                      <div className="mb-3 text-xs text-gray-600">
                        <p className="font-semibold">ประกอบด้วย:</p>
                        <ul className="list-disc list-inside">
                          {item.setComponents?.slice(0, 3).map((comp, idx) => (
                            <li key={idx}>{comp.name} x{comp.quantity}</li>
                          ))}
                          {(item.setComponents?.length || 0) > 3 && <li>และอื่นๆ...</li>}
                        </ul>
                      </div>
                    ) : null}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add-ons Tab */}
        {activeTab === 'addons' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add-ons / Toppings ทั้งหมด</h2>
              <button
                onClick={handleCreateAddOn}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold"
              >
                <Plus className="w-5 h-5" />
                เพิ่ม Add-on
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {addOns.map((addOn) => (
                <div key={addOn.id} className="bg-white rounded-xl shadow-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{addOn.name}</h3>
                      <p className="text-xs text-gray-500 uppercase">{addOn.category}</p>
                    </div>
                    <span className="text-orange-500 font-bold text-lg">฿{addOn.price}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEditAddOn(addOn)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDeleteAddOn(addOn.id, addOn.name)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="mb-6 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">เพิ่มหมวดหมู่ใหม่</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="ชื่อหมวดหมู่"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={handleAddCategory}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  เพิ่ม
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const itemCount = menuItems.filter(item => item.category === category).length;
                return (
                  <div key={category} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{category}</h3>
                        <p className="text-sm text-gray-500">{itemCount} เมนู</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Edit Menu Item Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowEditModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editingItem ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}
            </h3>

            <div className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">รหัสเมนู (Code)</label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="เช่น PT001"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อเมนู *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="เช่น ผัดไทย"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่ *</label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ราคา (บาท) *</label>
                <input
                  type="number"
                  value={formData.price || 0}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  min="0"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">รูปภาพ</label>

                {/* Image Preview */}
                {formData.image && (
                  <div className="mb-3 relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={getImageUrl(formData.image)}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Image+Error'; }}
                    />
                    <button
                      onClick={() => setFormData({ ...formData, image: '' })}
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
                        ? 'bg-white text-orange-600 shadow-sm'
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
                        ? 'bg-white text-orange-600 shadow-sm'
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
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/50'
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
                          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                          <p className="text-sm text-orange-600 font-medium">กำลังอัพโหลด...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-orange-500" />
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold text-orange-600">คลิกเพื่อเลือกไฟล์</span> หรือลากไฟล์มาวางที่นี่
                          </p>
                          <p className="text-xs text-gray-400">JPG, PNG, WebP, GIF (ไม่เกิน 5MB)</p>
                        </div>
                      )}
                    </div>

                    {/* Gallery Button */}
                    <button
                      onClick={() => { loadGalleryImages(); setShowImageGallery(true); }}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-orange-300 transition-all"
                    >
                      <FolderOpen className="w-4 h-4" />
                      เลือกจากคลังรูปภาพ
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={formData.image || ''}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="https://..."
                    />
                    <p className="mt-1 text-xs text-gray-400">วาง URL รูปภาพจากเว็บไซต์ภายนอก</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียด</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  rows={3}
                  placeholder="อธิบายเมนูอาหาร"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ประเภท *</label>
                <select
                  value={formData.type || 'single'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'single' | 'set' | 'group' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="single">เมนูเดี่ยว (Single)</option>
                  <option value="set">เซ็ตอาหาร (Set)</option>
                  <option value="group">เซ็ตกรุ๊ป (Group)</option>
                </select>
              </div>

              {/* Set Components (if type is set or group) */}
              {(formData.type === 'set' || formData.type === 'group') && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">รายการในเซ็ต</label>
                    <button
                      onClick={addSetComponent}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      เพิ่มรายการ
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.setComponents?.map((comp, index) => (
                      <div key={index} className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                        <input
                          type="text"
                          value={comp.name}
                          onChange={(e) => updateSetComponent(index, 'name', e.target.value)}
                          placeholder="ชื่อรายการ"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="number"
                          value={comp.quantity}
                          onChange={(e) => updateSetComponent(index, 'quantity', Number(e.target.value))}
                          placeholder="จำนวน"
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          min="1"
                        />
                        <button
                          onClick={() => removeSetComponent(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Add-ons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add-ons ที่สามารถเลือกได้</label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                  {addOns.map((addOn) => (
                    <label key={addOn.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.availableAddOns?.includes(addOn.id) || false}
                        onChange={(e) => {
                          const currentAddOns = formData.availableAddOns || [];
                          if (e.target.checked) {
                            setFormData({ ...formData, availableAddOns: [...currentAddOns, addOn.id] });
                          } else {
                            setFormData({ ...formData, availableAddOns: currentAddOns.filter(id => id !== addOn.id) });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{addOn.name} (+฿{addOn.price})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Is Active */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive !== false}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium text-gray-700">เปิดใช้งานเมนูนี้</span>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveItem}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Add-on Modal */}
      {showAddOnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowAddOnModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <button
              onClick={() => setShowAddOnModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editingAddOn ? 'แก้ไข Add-on' : 'เพิ่ม Add-on ใหม่'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ Add-on *</label>
                <input
                  type="text"
                  value={addOnFormData.name || ''}
                  onChange={(e) => setAddOnFormData({ ...addOnFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="เช่น ไข่ดาว"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ราคา (บาท) *</label>
                <input
                  type="number"
                  value={addOnFormData.price || 0}
                  onChange={(e) => setAddOnFormData({ ...addOnFormData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ประเภท *</label>
                <select
                  value={addOnFormData.category || 'topping'}
                  onChange={(e) => setAddOnFormData({ ...addOnFormData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="topping">Topping (ท็อปปิ้ง)</option>
                  <option value="side">Side (เครื่องเคียง)</option>
                  <option value="sauce">Sauce (น้ำจิ้ม)</option>
                  <option value="extra">Extra (เพิ่มเติม)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddOnModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveAddOn}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                บันทึก
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
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-orange-600" />
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
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all text-sm font-medium disabled:opacity-50"
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
                  <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
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
                        formData.image === img.url ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.filename}
                        className="w-full h-32 object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x128?text=Error'; }}
                      />

                      {/* Selected indicator */}
                      {formData.image === img.url && (
                        <div className="absolute top-2 left-2">
                          <CheckCircle className="w-6 h-6 text-orange-500 bg-white rounded-full" />
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleSelectGalleryImage(img.url)}
                          className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition-all shadow-lg"
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
      </>}
    </div>
  );
}
