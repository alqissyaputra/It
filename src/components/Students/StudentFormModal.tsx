import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { X, UserPlus, Save, User } from 'lucide-react';

interface StudentFormModalProps {
  student?: Student | null;
  classes: string[];
  onSave: (data: Omit<Student, 'id' | 'qrCodeData' | 'createdDate'> & { id?: string }) => void;
  onClose: () => void;
}

export function StudentFormModal({ student, classes, onSave, onClose }: StudentFormModalProps) {
  const [formData, setFormData] = useState({
    nis: '',
    nisn: '',
    name: '',
    gender: 'L' as 'L' | 'P',
    classId: classes[0] || 'X-1',
    parentName: '',
    parentPhone: '',
    address: '',
    status: 'aktif' as 'aktif' | 'nonaktif' | 'mutasi',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      setFormData({
        nis: student.nis,
        nisn: student.nisn,
        name: student.name,
        gender: student.gender,
        classId: student.classId,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        address: student.address || '',
        status: student.status,
      });
    }
  }, [student]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nis.trim()) newErrors.nis = 'NIS wajib diisi';
    if (!formData.nisn.trim()) newErrors.nisn = 'NISN wajib diisi';
    if (!formData.name.trim()) newErrors.name = 'Nama lengkap siswa wajib diisi';
    if (!formData.parentPhone.trim()) newErrors.parentPhone = 'Nomor WhatsApp wali wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...(student ? { id: student.id } : {}),
      ...formData,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-lg">
              {student ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIS (Nomor Induk Siswa) *
              </label>
              <input
                type="text"
                value={formData.nis}
                onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                placeholder="Contoh: 20241015"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.nis ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {errors.nis && <p className="text-[11px] text-rose-500 mt-1">{errors.nis}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NISN Nasional *
              </label>
              <input
                type="text"
                value={formData.nisn}
                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                placeholder="Contoh: 0081234580"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.nisn ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {errors.nisn && <p className="text-[11px] text-rose-500 mt-1">{errors.nisn}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Siswa *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Muhammad Ihsan Pratama"
              className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.name ? 'border-rose-400' : 'border-slate-200'
              }`}
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rombongan Belajar (Kelas) *
              </label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {classes.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jenis Kelamin *
              </label>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={formData.gender === 'L'}
                    onChange={() => setFormData({ ...formData, gender: 'L' })}
                    className="accent-emerald-600"
                  />
                  <span>Laki-laki (Ikhwan)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={formData.gender === 'P'}
                    onChange={() => setFormData({ ...formData, gender: 'P' })}
                    className="accent-emerald-600"
                  />
                  <span>Perempuan (Akhwat)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Orang Tua / Wali
              </label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="Contoh: H. Bambang S."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. WhatsApp Wali (Notifikasi) *
              </label>
              <input
                type="text"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                placeholder="081234567890"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.parentPhone ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {errors.parentPhone && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.parentPhone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Domisili Siswa
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Contoh: Jl. Riau No. 45 Pekanbaru"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Siswa
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'aktif' | 'nonaktif' | 'mutasi' })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="aktif">Aktif Belajar</option>
              <option value="nonaktif">Non-aktif / Cuti</option>
              <option value="mutasi">Mutasi / Pindah Sekolah</option>
            </select>
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
              <span>Simpan Data Siswa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
