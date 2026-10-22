import { useState, useMemo } from 'react';
import { Student, LetterheadConfig } from '../../types';
import { QrCodeView } from '../common/QrCodeView';
import { SchoolLogo } from '../common/SchoolLogo';
import { Printer, X, CheckSquare, Square, Filter, Sparkles } from 'lucide-react';

interface BulkQrPrintModalProps {
  students: Student[];
  letterhead: LetterheadConfig;
  onClose: () => void;
  initialClass?: string;
}

export function BulkQrPrintModal({
  students,
  letterhead,
  onClose,
  initialClass = 'XII 1',
}: BulkQrPrintModalProps) {
  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(
    new Set(students.filter(s => initialClass === 'all' || s.classId === initialClass).map(s => s.id))
  );

  const classes = useMemo(() => {
    return Array.from(new Set(students.map(s => s.classId))).sort();
  }, [students]);

  const displayedStudents = useMemo(() => {
    return selectedClass === 'all'
      ? students
      : students.filter(s => s.classId === selectedClass);
  }, [students, selectedClass]);

  const toggleSelectAll = () => {
    if (selectedStudentIds.size === displayedStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(displayedStudents.map(s => s.id)));
    }
  };

  const toggleStudent = (id: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStudentIds(next);
  };

  const studentsToPrint = useMemo(() => {
    return displayedStudents.filter(s => selectedStudentIds.has(s.id));
  }, [displayedStudents, selectedStudentIds]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Cetak Kartu QR Presensi Massal (Batch Print)
              </h3>
              <p className="text-xs text-slate-500">
                Format lembar cetak A4 kisi-kisi (grid) siap gunting untuk tali lanyard santri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={studentsToPrint.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak {studentsToPrint.length} Kartu Sekarang</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex items-center gap-3">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pilih Rombel Kelas:</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                const newClass = e.target.value;
                setSelectedClass(newClass);
                const classStds = students.filter(s => newClass === 'all' || s.classId === newClass);
                setSelectedStudentIds(new Set(classStds.map(s => s.id)));
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Kelas ({students.length} Siswa)</option>
              {classes.map(c => (
                <option key={c} value={c}>
                  Kelas {c} ({students.filter(s => s.classId === c).length} Siswa)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-emerald-700"
          >
            {selectedStudentIds.size === displayedStudents.length ? (
              <CheckSquare className="w-4 h-4 text-emerald-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>Pilih Semua Santri ({displayedStudents.length})</span>
          </button>
        </div>

        {/* Printable Cards Grid Canvas */}
        <div className="p-6 overflow-y-auto bg-slate-100/60 print:p-0 print:bg-white" id="bulk-qr-print-area">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-3 print:gap-3">
            {displayedStudents.map((student) => {
              const isChecked = selectedStudentIds.has(student.id);

              return (
                <div
                  key={student.id}
                  onClick={() => toggleStudent(student.id)}
                  className={`relative rounded-2xl bg-white border-2 p-3 cursor-pointer transition select-none flex flex-col justify-between shadow-xs hover:shadow-md ${
                    isChecked
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 opacity-40'
                  } print:border-emerald-800 print:shadow-none print:opacity-100`}
                >
                  {/* Card Header */}
                  <div className="text-center pb-2 border-b border-emerald-100">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <SchoolLogo size="sm" className="w-6 h-6" />
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase text-emerald-900 leading-none">
                          {letterhead.schoolName}
                        </p>
                        <p className="text-[8px] text-slate-400 font-medium">PEKANBARU</p>
                      </div>
                    </div>
                    <p className="text-[8px] font-mono text-amber-700 font-bold tracking-wider">
                      "{letterhead.motto}"
                    </p>
                  </div>

                  {/* QR Canvas */}
                  <div className="my-2 flex flex-col items-center justify-center">
                    <QrCodeView value={student.qrCodeData} size={110} darkColor="#064e3b" />
                    <p className="text-[9px] font-mono font-bold text-slate-800 mt-1">
                      {student.nis}
                    </p>
                  </div>

                  {/* Student Details */}
                  <div className="text-center pt-1 border-t border-slate-100">
                    <span className="inline-block px-2 py-0.2 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-900 mb-0.5">
                      {student.classId}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs leading-tight line-clamp-1">
                      {student.name}
                    </h4>
                    <p className="text-[8px] text-slate-400 font-mono mt-0.5">
                      NISN: {student.nisn}
                    </p>
                  </div>

                  {/* Checkbox overlay */}
                  <div className="absolute top-2 right-2 print:hidden">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <span>
            {studentsToPrint.length} kartu terpilih untuk dicetak pada kertas tebal / PVC.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
