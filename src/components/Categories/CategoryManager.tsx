import { useState } from 'react';
import { AttendanceCategory } from '../../types';
import { CategoryFormModal } from './CategoryFormModal';
import {
  Clock,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Sun,
  Moon,
  BookOpen,
} from 'lucide-react';

interface CategoryManagerProps {
  categories: AttendanceCategory[];
  onAddCategory: (cat: Omit<AttendanceCategory, 'id'>) => void;
  onUpdateCategory: (id: string, data: Partial<AttendanceCategory>) => void;
  onDeleteCategory: (id: string) => void;
  userRole: string;
}

export function CategoryManager({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  userRole,
}: CategoryManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AttendanceCategory | null>(null);

  const dayNames = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            Konfigurasi Jadwal & Sesi
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Kategori Absensi Harian</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Atur jadwal presensi pagi, sholat dzuhur berjamaah, sholat ashar, dan kegiatan ekstrakurikuler.
          </p>
        </div>

        {userRole === 'super_admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal Sesi</span>
          </button>
        )}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const isPrayer = cat.type === 'ibadah';
          const isExtra = cat.type === 'ekstrakurikuler';

          return (
            <div
              key={cat.id}
              className={`p-5 rounded-2xl bg-white border transition shadow-sm hover:shadow-md flex flex-col justify-between ${
                cat.isActive ? 'border-slate-200/90' : 'border-slate-200/60 opacity-60 bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      isPrayer
                        ? 'bg-amber-100 text-amber-800'
                        : isExtra
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isPrayer ? 'Ibadah Sholat' : isExtra ? 'Ekstrakurikuler' : 'Akademik'}
                  </span>

                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {cat.code}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug flex items-center gap-2">
                  {isPrayer ? (
                    <Sun className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  )}
                  <span>{cat.name}</span>
                </h3>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {cat.description || 'Sesi presensi resmi SMA IT AL ITTIHAD.'}
                </p>

                {/* Schedule Window */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Rentang Waktu:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {cat.startTime} - {cat.endTime} WIB
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Toleransi Terlambat:</span>
                    <span className="font-mono font-bold text-amber-600">
                      {cat.lateToleranceMinutes} Menit
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Kewajiban:</span>
                    <span className={`font-semibold ${cat.isRequired ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {cat.isRequired ? 'Wajib Presensi' : 'Opsional / Minat'}
                    </span>
                  </div>
                </div>

                {/* Active days badges */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {cat.activeDays.map((d) => (
                    <span
                      key={d}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600"
                    >
                      {dayNames[d]}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cat.isActive}
                    onChange={(e) => onUpdateCategory(cat.id, { isActive: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                  <span className="text-xs font-semibold">{cat.isActive ? 'Aktif' : 'Non-aktif'}</span>
                </label>

                {userRole === 'super_admin' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingCategory(cat)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      title="Edit Sesi"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {categories.length > 2 && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus jadwal sesi "${cat.name}"?`)) {
                            onDeleteCategory(cat.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition"
                        title="Hapus Sesi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit */}
      {(isModalOpen || editingCategory) && (
        <CategoryFormModal
          category={editingCategory}
          onSave={(data) => {
            if (editingCategory) {
              onUpdateCategory(editingCategory.id, data);
            } else {
              onAddCategory(data);
            }
            setIsModalOpen(false);
            setEditingCategory(null);
          }}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
}
