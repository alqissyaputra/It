import { useState, useMemo } from 'react';
import { AttendanceRecord, AttendanceCategory, Student, AttendanceStatus } from '../../types';
import { ExportService } from '../../services/exportService';
import { ManualAttendanceModal } from './ManualAttendanceModal';
import {
  Calendar,
  Filter,
  Search,
  Download,
  Plus,
  Send,
  Trash2,
  CheckCircle,
  Clock,
  QrCode,
  UserCheck,
  FileSpreadsheet,
} from 'lucide-react';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  students: Student[];
  categories: AttendanceCategory[];
  currentUserId: string;
  userRole: string;
  initialClassFilter?: string;
  onAddRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
  onUpdateStatus: (recordId: string, newStatus: AttendanceStatus, notes?: string) => void;
  onDeleteRecord: (recordId: string) => void;
  onSendWhatsApp: (record: AttendanceRecord) => void;
}

export function AttendanceTable({
  records,
  students,
  categories,
  currentUserId,
  userRole,
  initialClassFilter = 'all',
  onAddRecord,
  onUpdateStatus,
  onDeleteRecord,
  onSendWhatsApp,
}: AttendanceTableProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [dateFilter, setDateFilter] = useState<string>(todayStr);
  const [classFilter, setClassFilter] = useState<string>(initialClassFilter);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Extract unique classes
  const classes = useMemo(() => {
    const clsSet = new Set(students.map(s => s.classId));
    return Array.from(clsSet).sort();
  }, [students]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchDate = !dateFilter || r.date === dateFilter;
      const matchClass = classFilter === 'all' || r.classId === classFilter;
      const matchCat = categoryFilter === 'all' || r.categoryId === categoryFilter;
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchSearch =
        !searchQuery.trim() ||
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.studentNis.includes(searchQuery);

      return matchDate && matchClass && matchCat && matchStatus && matchSearch;
    });
  }, [records, dateFilter, classFilter, categoryFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            Log Presensi Real-Time
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Riwayat & Daftar Kehadiran</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Menampilkan data kehadiran per sesi, sholat berjamaah, dan kegiatan ekstrakurikuler.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => ExportService.exportAttendanceToExcel(filteredRecords, `Presensi_${dateFilter || 'Semua'}`)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Presensi Manual</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Date Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Tanggal Presensi
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Filter Kelas
            </label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Rombel Kelas</option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  Kelas {c}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Sesi / Kategori
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Kategori Sesi</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Status Kehadiran
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Status</option>
              <option value="hadir">Hadir</option>
              <option value="terlambat">Terlambat</option>
              <option value="izin">Izin</option>
              <option value="sakit">Sakit</option>
              <option value="alpa">Alpa</option>
            </select>
          </div>

          {/* Student Search */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Cari Nama / NIS
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik nama / NIS..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Quick filter resets */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">
            Ditemukan: <b className="text-emerald-700">{filteredRecords.length}</b> data catatan presensi
          </span>

          {(classFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setClassFilter('all');
                setCategoryFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="text-emerald-700 hover:underline font-semibold"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 text-center">No</th>
                <th className="py-3.5 px-4">Nama Siswa & NIS</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4">Kategori Sesi</th>
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4 text-center">Status Kehadiran</th>
                <th className="py-3.5 px-4">Keterangan</th>
                <th className="py-3.5 px-4 text-center">Aksi & Notifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.map((record, idx) => (
                <tr key={record.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 text-center text-xs font-mono text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {record.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{record.studentName}</p>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          NIS: {record.studentNis}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {record.classId}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-emerald-900">
                    {record.categoryName}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{record.time} WIB</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {record.method === 'qr_scan' ? 'Scan QR' : 'Manual Admin'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <select
                      value={record.status}
                      onChange={(e) => onUpdateStatus(record.id, e.target.value as AttendanceStatus)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize border cursor-pointer focus:outline-none ${
                        record.status === 'hadir'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : record.status === 'terlambat'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : record.status === 'izin'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : record.status === 'sakit'
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}
                    >
                      <option value="hadir">Hadir</option>
                      <option value="terlambat">Terlambat</option>
                      <option value="izin">Izin</option>
                      <option value="sakit">Sakit</option>
                      <option value="alpa">Alpa</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600 max-w-xs">
                    {record.notes ? (
                      <span className="text-amber-800 font-medium">{record.notes}</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {record.status !== 'hadir' && (
                        <button
                          onClick={() => onSendWhatsApp(record)}
                          title="Kirim Notifikasi WA ke Orang Tua"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {userRole === 'super_admin' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Hapus catatan presensi ini?')) {
                              onDeleteRecord(record.id);
                            }
                          }}
                          title="Hapus Catatan"
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-sm">Tidak ada catatan presensi yang sesuai dengan filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Attendance Modal */}
      {isManualModalOpen && (
        <ManualAttendanceModal
          students={students}
          categories={categories}
          currentUserId={currentUserId}
          onSaveRecord={onAddRecord}
          onClose={() => setIsManualModalOpen(false)}
        />
      )}
    </div>
  );
}
