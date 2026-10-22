import React, { useState } from 'react';
import { Student, AttendanceCategory, AttendanceRecord, AttendanceStatus } from '../../types';
import { UserCheck, X, Save, Clock, AlertTriangle, FileText } from 'lucide-react';

interface ManualAttendanceModalProps {
  students: Student[];
  categories: AttendanceCategory[];
  currentUserId: string;
  onSaveRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
  onClose: () => void;
}

export function ManualAttendanceModal({
  students,
  categories,
  currentUserId,
  onSaveRecord,
  onClose,
}: ManualAttendanceModalProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(nowTime);
  const [status, setStatus] = useState<AttendanceStatus>('hadir');
  const [notes, setNotes] = useState('');

  const selectedStudent = students.find(s => s.id === studentId);
  const selectedCategory = categories.find(c => c.id === categoryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedCategory) return;

    onSaveRecord({
      studentId: selectedStudent.id,
      studentNis: selectedStudent.nis,
      studentName: selectedStudent.name,
      classId: selectedStudent.classId,
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      date,
      time,
      status,
      notes: notes.trim() || undefined,
      method: 'manual',
      verifiedBy: currentUserId,
      notifiedParent: status !== 'hadir',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-lg">Input Presensi Manual</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Siswa *
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.classId} - NIS: {s.nis})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kategori / Sesi Kegiatan *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.startTime} - {c.endTime})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Presensi
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Waktu Catat (WIB)
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Kehadiran *
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['hadir', 'terlambat', 'izin', 'sakit', 'alpa'] as AttendanceStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 px-1 text-xs font-bold uppercase rounded-xl border transition text-center ${
                    status === st
                      ? st === 'hadir'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : st === 'terlambat'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : st === 'izin'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : st === 'sakit'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan / Alasan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Surat dokter terlampir, ban bocor, atau izin acara keluarga..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
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
              <span>Simpan Presensi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
