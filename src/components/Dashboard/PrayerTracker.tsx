import { AttendanceCategory, AttendanceRecord, Student } from '../../types';
import { Moon, Sun, CheckCircle2, AlertCircle, Users } from 'lucide-react';

interface PrayerTrackerProps {
  students: Student[];
  categories: AttendanceCategory[];
  attendanceRecords: AttendanceRecord[];
  todayDateStr: string;
}

export function PrayerTracker({
  students,
  categories,
  attendanceRecords,
  todayDateStr,
}: PrayerTrackerProps) {
  const totalStudents = students.filter(s => s.status === 'aktif').length;

  const dzuhurCat = categories.find(c => c.code === 'DZUHUR') || categories[1];
  const asharCat = categories.find(c => c.code === 'ASHAR') || categories[2];

  const getStats = (catId?: string) => {
    if (!catId) return { hadir: 0, terlambat: 0, percent: 0 };
    const recs = attendanceRecords.filter(r => r.categoryId === catId && r.date === todayDateStr);
    const hadir = recs.filter(r => r.status === 'hadir').length;
    const terlambat = recs.filter(r => r.status === 'terlambat').length;
    const totalPresent = hadir + terlambat;
    const percent = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;
    return { hadir, terlambat, totalPresent, percent };
  };

  const dzuhurStats = getStats(dzuhurCat?.id);
  const asharStats = getStats(asharCat?.id);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            Monitoring Ibadah Harian
          </span>
          <h3 className="text-base font-bold text-slate-800 mt-1">Presensi Sholat Berjamaah</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>Basis: {totalStudents} Santri Aktif</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sholat Dzuhur */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-200/70 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500 text-white shadow-sm">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Sholat Dzuhur</h4>
                <p className="text-[11px] text-amber-800 font-medium">{dzuhurCat?.startTime || '11:45'} WIB</p>
              </div>
            </div>
            <span className="text-lg font-black text-amber-900 font-mono">
              {dzuhurStats.percent}%
            </span>
          </div>

          <div className="w-full bg-amber-200/60 h-2 rounded-full overflow-hidden my-2">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${dzuhurStats.percent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 mt-2 pt-2 border-t border-amber-200/50">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hadir: <b>{dzuhurStats.hadir}</b></span>
            </span>
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Masuk Shaf Akhir: <b>{dzuhurStats.terlambat}</b></span>
            </span>
          </div>
        </div>

        {/* Sholat Ashar */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-200/70 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-700 text-white shadow-sm">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Sholat Ashar</h4>
                <p className="text-[11px] text-emerald-800 font-medium">{asharCat?.startTime || '15:15'} WIB</p>
              </div>
            </div>
            <span className="text-lg font-black text-emerald-950 font-mono">
              {asharStats.percent}%
            </span>
          </div>

          <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden my-2">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${asharStats.percent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 mt-2 pt-2 border-t border-emerald-200/50">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hadir: <b>{asharStats.hadir}</b></span>
            </span>
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Masuk Shaf Akhir: <b>{asharStats.terlambat}</b></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
