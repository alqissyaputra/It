import React, { useState, useEffect } from 'react';
import { AttendanceCategory } from '../../types';
import { Clock, X, Save, Layers } from 'lucide-react';

interface CategoryFormModalProps {
  category?: AttendanceCategory | null;
  onSave: (cat: Omit<AttendanceCategory, 'id'> & { id?: string }) => void;
  onClose: () => void;
}

export function CategoryFormModal({ category, onSave, onClose }: CategoryFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    startTime: '07:00',
    endTime: '08:00',
    lateToleranceMinutes: 15,
    activeDays: [1, 2, 3, 4, 5],
    isRequired: true,
    type: 'akademik' as 'akademik' | 'ibadah' | 'ekstrakurikuler',
    description: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        code: category.code,
        startTime: category.startTime,
        endTime: category.endTime,
        lateToleranceMinutes: category.lateToleranceMinutes,
        activeDays: category.activeDays,
        isRequired: category.isRequired,
        type: category.type,
        description: category.description || '',
        isActive: category.isActive,
      });
    }
  }, [category]);

  const toggleDay = (dayIndex: number) => {
    if (formData.activeDays.includes(dayIndex)) {
      setFormData({
        ...formData,
        activeDays: formData.activeDays.filter(d => d !== dayIndex),
      });
    } else {
      setFormData({
        ...formData,
        activeDays: [...formData.activeDays, dayIndex].sort(),
      });
    }
  };

  const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nama kategori / kegiatan wajib diisi';
    if (!formData.code.trim()) newErrors.code = 'Kode sesi wajib diisi (contoh: DZUHUR)';
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    onSave({
      ...(category ? { id: category.id } : {}),
      ...formData,
      code: formData.code.toUpperCase().replace(/\s+/g, '_'),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-lg">
              {category ? 'Edit Jadwal / Kategori Presensi' : 'Tambah Kategori Presensi Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Kegiatan / Kategori Presensi *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Sholat Dzuhur Berjamaah, Pramuka SIT, atau Tahfidz"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.name && <p className="text-rose-500 text-[11px] mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Singkat *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="DZUHUR / EKSKUL"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.code && <p className="text-rose-500 text-[11px] mt-1">{errors.code}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Klasifikasi Jenis
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'akademik' | 'ibadah' | 'ekstrakurikuler' })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ibadah">Ibadah Sholat Berjamaah</option>
                <option value="akademik">Akademik & Kedatangan</option>
                <option value="ekstrakurikuler">Kegiatan Ekstrakurikuler</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Mulai (WIB)
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Selesai (WIB)
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Toleransi Telat
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={formData.lateToleranceMinutes}
                  onChange={(e) => setFormData({ ...formData, lateToleranceMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400 absolute right-2.5 top-2.5 font-bold">Mnt</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Hari Pelaksanaan Aktif
            </label>
            <div className="flex gap-1.5">
              {dayLabels.map((label, dayIdx) => {
                const isSelected = formData.activeDays.includes(dayIdx);
                return (
                  <button
                    key={dayIdx}
                    type="button"
                    onClick={() => toggleDay(dayIdx)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi Singkat / Tata Tertib
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Catatan pelaksanaan, lokasi masjid, atau pembina..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isRequired}
                onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <span>Presensi Wajib (Mempengaruhi % Kehadiran)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <span>Status Aktif</span>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Jadwal Sesi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
