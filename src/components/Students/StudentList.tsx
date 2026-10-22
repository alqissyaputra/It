import { useState, useMemo } from 'react';
import { Student } from '../../types';
import { ExportService } from '../../services/exportService';
import { StudentFormModal } from './StudentFormModal';
import { BulkImportModal } from './BulkImportModal';
import { StudentIdCardModal } from '../Scanner/StudentIdCardModal';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  QrCode,
  Search,
  Filter,
  Download,
  Trash2,
  Edit3,
  Phone,
  Printer,
  Sparkles,
} from 'lucide-react';

interface StudentListProps {
  students: Student[];
  onAddStudent: (data: Omit<Student, 'id' | 'qrCodeData' | 'createdDate'>) => void;
  onUpdateStudent: (id: string, data: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
  onBulkImport: (students: Omit<Student, 'id' | 'qrCodeData' | 'createdDate'>[]) => void;
  userRole: string;
}

export function StudentList({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBulkImport,
  userRole,
}: StudentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [viewingCardStudent, setViewingCardStudent] = useState<Student | null>(null);

  // Extract unique classes
  const classes = useMemo(() => {
    const clsSet = new Set(students.map(s => s.classId));
    return Array.from(clsSet).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.nis.includes(searchQuery) ||
        student.nisn.includes(searchQuery) ||
        student.parentName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchClass = selectedClass === 'all' || student.classId === selectedClass;
      const matchGender = selectedGender === 'all' || student.gender === selectedGender;

      return matchSearch && matchClass && matchGender;
    });
  }, [students, searchQuery, selectedClass, selectedGender]);

  return (
    <div className="space-y-6">
      {/* Top Header & Action Buttons */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            Master Data SMA IT AL ITTIHAD
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Pengelolaan Data & Kartu Siswa</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Total {students.length} santri terdaftar. Data ini tersinkron dengan database pusat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => ExportService.exportStudentsToExcel(students)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
            title="Download Excel Siswa"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-xl border border-emerald-200 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Excel Massal</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa, NIS, NISN, atau orang tua..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Rombel Kelas</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                Kelas {cls}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Gender</option>
            <option value="L">Ikhwan (L)</option>
            <option value="P">Akhwat (P)</option>
          </select>
        </div>

        <div className="md:col-span-2 text-right">
          <span className="text-xs text-slate-500 font-medium">
            Ditemukan: <b>{filteredStudents.length}</b> siswa
          </span>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 text-center">No</th>
                <th className="py-3.5 px-4">Nama Siswa & NIS</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4">JK</th>
                <th className="py-3.5 px-4">Orang Tua / Wali</th>
                <th className="py-3.5 px-4">WhatsApp Wali</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi & Kartu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 text-center text-xs font-mono text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{student.name}</p>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          NIS: {student.nis} | NISN: {student.nisn}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {student.classId}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        student.gender === 'L'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-pink-50 text-pink-700'
                      }`}
                    >
                      {student.gender === 'L' ? 'L (Ikhwan)' : 'P (Akhwat)'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-slate-800">
                    {student.parentName}
                  </td>
                  <td className="py-3 px-4">
                    <a
                      href={`https://api.whatsapp.com/send?phone=${student.parentPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{student.parentPhone}</span>
                    </a>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                        student.status === 'aktif'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setViewingCardStudent(student)}
                        title="Lihat / Cetak Kartu Presensi QR"
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setEditingStudent(student)}
                        title="Edit Data Siswa"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {userRole === 'super_admin' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus data siswa ${student.name}?`)) {
                              onDeleteStudent(student.id);
                            }
                          }}
                          title="Hapus Siswa"
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-sm">Tidak ditemukan siswa dengan kriteria pencarian.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {(isAddModalOpen || editingStudent) && (
        <StudentFormModal
          student={editingStudent}
          classes={classes}
          onSave={(data) => {
            if (editingStudent) {
              onUpdateStudent(editingStudent.id, data);
            } else {
              onAddStudent(data);
            }
            setIsAddModalOpen(false);
            setEditingStudent(null);
          }}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingStudent(null);
          }}
        />
      )}

      {/* Bulk Excel Import Modal */}
      {isBulkModalOpen && (
        <BulkImportModal
          onImport={(rows) => {
            onBulkImport(rows);
            setIsBulkModalOpen(false);
          }}
          onClose={() => setIsBulkModalOpen(false)}
        />
      )}

      {/* Student ID Card Modal */}
      {viewingCardStudent && (
        <StudentIdCardModal
          student={viewingCardStudent}
          onClose={() => setViewingCardStudent(null)}
        />
      )}
    </div>
  );
}
