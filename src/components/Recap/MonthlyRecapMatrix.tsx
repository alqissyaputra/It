import { useState, useMemo } from 'react';
import { Student, AttendanceRecord, AttendanceCategory } from '../../types';
import { ExportService } from '../../services/exportService';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  Calendar,
  Filter,
  Users,
  Award,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface MonthlyRecapMatrixProps {
  students: Student[];
  records: AttendanceRecord[];
  categories: AttendanceCategory[];
}

export function MonthlyRecapMatrix({
  students,
  records,
  categories,
}: MonthlyRecapMatrixProps) {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const classes = useMemo(() => {
    const set = new Set(students.map(s => s.classId));
    return Array.from(set).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    return selectedClass === 'all'
      ? students
      : students.filter(s => s.classId === selectedClass);
  }, [students, selectedClass]);

  // Pre-calculate monthly matrix and statistics
  const { studentStats, overallAverage, perfectAttendanceCount, needAttentionCount } = useMemo(() => {
    let sumPercent = 0;
    let perfectCount = 0;
    let attentionCount = 0;

    const stats = filteredStudents.map((student) => {
      // Find all records for this student in the selected month & year
      const studentMonthRecords = records.filter(r => {
        const d = new Date(r.date);
        const matchTime = d.getFullYear() === selectedYear && (d.getMonth() + 1) === selectedMonth;
        const matchCat = selectedCategory === 'all' || r.categoryId === selectedCategory;
        return r.studentId === student.id && matchTime && matchCat;
      });

      // Day by day lookup
      const dayMap: Record<number, { status: string; code: string; notes?: string }> = {};

      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayRec = studentMonthRecords.find(r => r.date === dayStr);

        if (dayRec) {
          let code = 'H';
          if (dayRec.status === 'terlambat') code = 'T';
          if (dayRec.status === 'izin') code = 'I';
          if (dayRec.status === 'sakit') code = 'S';
          if (dayRec.status === 'alpa') code = 'A';
          dayMap[day] = { status: dayRec.status, code, notes: dayRec.notes };
        } else {
          // Check if Sunday or Saturday
          const dateObj = new Date(selectedYear, selectedMonth - 1, day);
          const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
          dayMap[day] = { status: 'none', code: isWeekend ? '•' : '-' };
        }
      }

      const hadir = studentMonthRecords.filter(r => r.status === 'hadir').length;
      const terlambat = studentMonthRecords.filter(r => r.status === 'terlambat').length;
      const izin = studentMonthRecords.filter(r => r.status === 'izin').length;
      const sakit = studentMonthRecords.filter(r => r.status === 'sakit').length;
      const alpa = studentMonthRecords.filter(r => r.status === 'alpa').length;

      const totalRecorded = hadir + terlambat + izin + sakit + alpa;
      const presentCount = hadir + terlambat;
      const percent = totalRecorded > 0 ? Math.round((presentCount / totalRecorded) * 100) : 0;

      sumPercent += percent;
      if (percent === 100 && totalRecorded > 0) perfectCount++;
      if (alpa >= 2 || percent < 75) attentionCount++;

      return {
        student,
        dayMap,
        hadir,
        terlambat,
        izin,
        sakit,
        alpa,
        totalRecorded,
        percent,
      };
    });

    const avg = stats.length > 0 ? Math.round(sumPercent / stats.length) : 0;

    return {
      studentStats: stats,
      overallAverage: avg,
      perfectAttendanceCount: perfectCount,
      needAttentionCount: attentionCount,
    };
  }, [filteredStudents, records, selectedYear, selectedMonth, selectedCategory, daysInMonth]);

  const handleExportExcel = () => {
    ExportService.exportMonthlyMatrixToExcel(
      students,
      records,
      selectedYear,
      selectedMonth,
      selectedClass,
      selectedCategory === 'all' ? 'Semua Sesi' : categories.find(c => c.id === selectedCategory)?.name
    );
  };

  const handleExportPdf = () => {
    ExportService.exportMonthlyRecapPdf(
      students,
      records,
      selectedYear,
      selectedMonth,
      selectedClass === 'all' ? 'Semua Kelas' : selectedClass,
      selectedCategory === 'all' ? 'Semua Sesi' : categories.find(c => c.id === selectedCategory)?.name
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Action Buttons */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            Laporan Otomatis Bulanan
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Matriks & Rekapitulasi Kehadiran</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Format resmi tanggal 1 s/d {daysInMonth} siap diekspor ke PDF dan Excel berstandar dinas/yayasan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Export Excel (.XLSX)</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>Export PDF Kop Resmi</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak / Print</span>
          </button>
        </div>
      </div>

      {/* Filter Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Bulan Periode
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {monthNames.map((m, idx) => (
              <option key={m} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Tahun
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Rombel Kelas
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
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

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Filter Sesi / Ibadah
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Sesi & Sholat</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics KPI Mini Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">Rata-rata Kehadiran</span>
            <p className="text-2xl font-black text-emerald-800 mt-0.5">{overallAverage}%</p>
            <p className="text-[11px] text-emerald-600 font-medium">Bulan {monthNames[selectedMonth - 1]}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">Santri Terdata</span>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{filteredStudents.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">Kelas {selectedClass === 'all' ? 'Seluruh' : selectedClass}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">Kehadiran 100%</span>
            <p className="text-2xl font-black text-amber-700 mt-0.5">{perfectAttendanceCount} Santri</p>
            <p className="text-[11px] text-amber-600 font-medium">Selalu hadir tepat waktu</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">Perlu Pembinaan</span>
            <p className="text-2xl font-black text-rose-700 mt-0.5">{needAttentionCount} Santri</p>
            <p className="text-[11px] text-rose-600 font-medium">Alpa &gt; 2 kali / &lt; 75%</p>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold px-2 text-slate-600">
        <span className="text-slate-400 font-bold uppercase text-[10px]">Keterangan Matriks:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded flex items-center justify-center font-bold bg-emerald-600 text-white text-[11px]">H</span>
          <span>Hadir Tepat Waktu</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded flex items-center justify-center font-bold bg-amber-500 text-white text-[11px]">T</span>
          <span>Terlambat</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded flex items-center justify-center font-bold bg-blue-600 text-white text-[11px]">I</span>
          <span>Izin</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded flex items-center justify-center font-bold bg-purple-600 text-white text-[11px]">S</span>
          <span>Sakit</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded flex items-center justify-center font-bold bg-rose-600 text-white text-[11px]">A</span>
          <span>Alpa</span>
        </span>
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 text-slate-400 text-[11px]">🞄</span>
          <span>Libur Akhir Pekan</span>
        </span>
      </div>

      {/* Full Horizontal Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 select-none">
              <tr>
                <th className="p-2 text-center sticky left-0 bg-slate-100 z-10 w-10 border-r border-slate-200">No</th>
                <th className="p-2 sticky left-10 bg-slate-100 z-10 min-w-[140px] border-r border-slate-200">Nama Siswa</th>
                <th className="p-2 text-center sticky left-[180px] bg-slate-100 z-10 min-w-[70px] border-r border-slate-200">Kelas</th>
                
                {/* 1..31 Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateObj = new Date(selectedYear, selectedMonth - 1, dayNum);
                  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

                  return (
                    <th
                      key={dayNum}
                      className={`p-1.5 text-center w-7 border-r border-slate-200 ${
                        isWeekend ? 'bg-slate-200/60 text-rose-700 font-extrabold' : ''
                      }`}
                      title={`${dayNum} ${monthNames[selectedMonth - 1]}`}
                    >
                      {dayNum}
                    </th>
                  );
                })}

                <th className="p-2 text-center bg-emerald-100 text-emerald-900 border-r border-slate-200">H</th>
                <th className="p-2 text-center bg-amber-100 text-amber-900 border-r border-slate-200">T</th>
                <th className="p-2 text-center bg-blue-100 text-blue-900 border-r border-slate-200">I</th>
                <th className="p-2 text-center bg-purple-100 text-purple-900 border-r border-slate-200">S</th>
                <th className="p-2 text-center bg-rose-100 text-rose-900 border-r border-slate-200">A</th>
                <th className="p-2 text-center bg-slate-200 text-slate-900 min-w-[70px]">% Hadir</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-800">
              {studentStats.map((item, idx) => (
                <tr key={item.student.id} className="hover:bg-slate-50 transition">
                  <td className="p-2 text-center font-mono text-slate-400 sticky left-0 bg-white z-10 border-r border-slate-100">
                    {idx + 1}
                  </td>
                  <td className="p-2 font-semibold text-slate-900 sticky left-10 bg-white z-10 border-r border-slate-100">
                    <div className="line-clamp-1">{item.student.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 font-normal">NIS: {item.student.nis}</div>
                  </td>
                  <td className="p-2 text-center font-bold sticky left-[180px] bg-white z-10 border-r border-slate-100">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                      {item.student.classId}
                    </span>
                  </td>

                  {/* Day cells */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const info = item.dayMap[dayNum];
                    const isWeekend = info?.code === '•';

                    let cellBg = '';
                    let cellTextColor = 'text-slate-400';

                    if (info?.code === 'H') {
                      cellBg = 'bg-emerald-600 text-white font-bold';
                    } else if (info?.code === 'T') {
                      cellBg = 'bg-amber-500 text-white font-bold';
                    } else if (info?.code === 'I') {
                      cellBg = 'bg-blue-600 text-white font-bold';
                    } else if (info?.code === 'S') {
                      cellBg = 'bg-purple-600 text-white font-bold';
                    } else if (info?.code === 'A') {
                      cellBg = 'bg-rose-600 text-white font-bold';
                    } else if (isWeekend) {
                      cellBg = 'bg-slate-50 text-slate-300';
                    }

                    return (
                      <td
                        key={dayNum}
                        className={`p-1 text-center font-mono text-[11px] border-r border-slate-100 ${cellBg || cellTextColor}`}
                        title={info?.notes || `${item.student.name} - Tgl ${dayNum}: ${info?.code}`}
                      >
                        {info?.code || '-'}
                      </td>
                    );
                  })}

                  <td className="p-2 text-center font-bold text-emerald-800 bg-emerald-50/50 border-r border-slate-100">
                    {item.hadir}
                  </td>
                  <td className="p-2 text-center font-bold text-amber-800 bg-amber-50/50 border-r border-slate-100">
                    {item.terlambat}
                  </td>
                  <td className="p-2 text-center font-bold text-blue-800 bg-blue-50/50 border-r border-slate-100">
                    {item.izin}
                  </td>
                  <td className="p-2 text-center font-bold text-purple-800 bg-purple-50/50 border-r border-slate-100">
                    {item.sakit}
                  </td>
                  <td className="p-2 text-center font-bold text-rose-800 bg-rose-50/50 border-r border-slate-100">
                    {item.alpa}
                  </td>
                  <td className="p-2 text-center font-bold font-mono text-slate-900 bg-slate-50">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] ${
                        item.percent >= 90
                          ? 'text-emerald-700 bg-emerald-100'
                          : item.percent >= 75
                          ? 'text-amber-700 bg-amber-100'
                          : 'text-rose-700 bg-rose-100'
                      }`}
                    >
                      {item.percent}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
