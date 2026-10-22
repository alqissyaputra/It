import { useMemo } from 'react';
import { AttendanceCategory, AttendanceRecord, Student, User } from '../../types';
import { StatCard } from './StatCard';
import { PrayerTracker } from './PrayerTracker';
import { ClassOverview } from './ClassOverview';
import { LiveFeed } from './LiveFeed';
import {
  Users,
  CheckCircle,
  Clock,
  HeartPulse,
  AlertTriangle,
  QrCode,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  Calendar,
} from 'lucide-react';

interface DashboardViewProps {
  students: Student[];
  categories: AttendanceCategory[];
  attendanceRecords: AttendanceRecord[];
  currentUser: User;
  onNavigate: (tab: string) => void;
  onQuickScan: () => void;
  onManualAttendance: () => void;
  onSyncApi: () => void;
  onSendWhatsApp: (record: AttendanceRecord) => void;
  onSelectClassFilter?: (className: string) => void;
}

export function DashboardView({
  students,
  categories,
  attendanceRecords,
  currentUser,
  onNavigate,
  onQuickScan,
  onManualAttendance,
  onSyncApi,
  onSendWhatsApp,
  onSelectClassFilter,
}: DashboardViewProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Active students count
  const activeStudents = useMemo(() => students.filter(s => s.status === 'aktif'), [students]);
  const totalStudents = activeStudents.length;

  // Today's morning / primary check-in records
  const todayRecords = useMemo(() => {
    return attendanceRecords.filter(r => r.date === todayStr);
  }, [attendanceRecords, todayStr]);

  // Aggregate unique students attendance today
  const metrics = useMemo(() => {
    // Map studentId -> highest priority status for today (or morning check-in)
    const morningCat = categories.find(c => c.code === 'PAGI') || categories[0];
    const morningRecs = todayRecords.filter(r => r.categoryId === morningCat?.id);

    const hadir = morningRecs.filter(r => r.status === 'hadir').length;
    const terlambat = morningRecs.filter(r => r.status === 'terlambat').length;
    const izin = morningRecs.filter(r => r.status === 'izin').length;
    const sakit = morningRecs.filter(r => r.status === 'sakit').length;
    const alpa = morningRecs.filter(r => r.status === 'alpa').length;

    const recordedStudentIds = new Set(morningRecs.map(r => r.studentId));
    const belumAbsen = Math.max(0, totalStudents - recordedStudentIds.size);

    return {
      hadir,
      terlambat,
      izinSakit: izin + sakit,
      alpa,
      belumAbsen,
      persenKehadiran: totalStudents > 0 ? Math.round(((hadir + terlambat) / totalStudents) * 100) : 0,
    };
  }, [categories, todayRecords, totalStudents]);

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 p-6 md:p-8 text-white shadow-xl border border-emerald-700/60">
        {/* Decorative Islamic Watermark */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full border-[24px] border-emerald-500/10 pointer-events-none" />
        <div className="absolute right-40 top-0 w-32 h-32 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/50 border border-emerald-500/60 text-xs font-semibold text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Portal Presensi Digital SMA IT AL ITTIHAD</span>
              <span>•</span>
              <span className="text-amber-300 font-mono">Berakhlak, Cerdas, Mandiri</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Ahlan Wa Sahlan, {currentUser.name.split(',')[0]}!
            </h1>

            <p className="text-emerald-100 text-xs md:text-sm max-w-2xl leading-relaxed">
              Pantau kedisiplinan dan kehadiran siswa secara real-time melalui pemindai QR Code.
              Data tersinkron otomatis ke sistem pusat dan siap diekspor ke PDF/Excel.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-300 font-medium">
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>{todayFormatted}</span>
            </div>
          </div>

          {/* Quick Command Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onQuickScan}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm shadow-lg shadow-amber-400/20 transition active:scale-95 cursor-pointer"
            >
              <QrCode className="w-5 h-5 text-emerald-950" />
              <span>Scan QR Code</span>
            </button>

            <button
              onClick={onManualAttendance}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm backdrop-blur-sm transition active:scale-95 cursor-pointer"
            >
              <Users className="w-4 h-4 text-emerald-300" />
              <span>Absen Manual</span>
            </button>

            <button
              onClick={() => onNavigate('rekap')}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm backdrop-blur-sm transition active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-300" />
              <span>Rekap Bulanan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Key Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Siswa Aktif"
          count={totalStudents}
          icon={<Users className="w-5 h-5" />}
          colorClass="text-emerald-700"
          bgLightClass="bg-emerald-50"
          borderClass="border-emerald-200"
          subtext="Terdaftar di 5 Rombel Kelas"
          onClick={() => onNavigate('siswa')}
        />

        <StatCard
          title="Hadir Tepat Waktu"
          count={metrics.hadir}
          total={totalStudents}
          icon={<CheckCircle className="w-5 h-5" />}
          colorClass="text-emerald-600"
          bgLightClass="bg-emerald-50"
          borderClass="border-emerald-200"
          subtext="Presensi sebelum batas waktu"
          onClick={() => onNavigate('presensi')}
        />

        <StatCard
          title="Terlambat"
          count={metrics.terlambat}
          total={totalStudents}
          icon={<Clock className="w-5 h-5" />}
          colorClass="text-amber-600"
          bgLightClass="bg-amber-50"
          borderClass="border-amber-200"
          subtext="Lewat toleransi kedatangan"
          onClick={() => onNavigate('presensi')}
        />

        <StatCard
          title="Izin & Sakit"
          count={metrics.izinSakit}
          total={totalStudents}
          icon={<HeartPulse className="w-5 h-5" />}
          colorClass="text-purple-600"
          bgLightClass="bg-purple-50"
          borderClass="border-purple-200"
          subtext="Dengan surat / konfirmasi orang tua"
          onClick={() => onNavigate('presensi')}
        />

        <StatCard
          title="Alpa / Tanpa Ket."
          count={metrics.alpa}
          total={totalStudents}
          icon={<AlertTriangle className="w-5 h-5" />}
          colorClass="text-rose-600"
          bgLightClass="bg-rose-50"
          borderClass="border-rose-200"
          subtext="Perlu notifikasi WA ke Wali"
          onClick={() => onNavigate('notifikasi')}
        />
      </div>

      {/* Middle Row: Prayer Tracker & Class Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <PrayerTracker
            students={students}
            categories={categories}
            attendanceRecords={attendanceRecords}
            todayDateStr={todayStr}
          />
        </div>

        <div className="lg:col-span-6">
          <ClassOverview
            students={students}
            attendanceRecords={attendanceRecords}
            todayDateStr={todayStr}
            onSelectClass={(cls) => {
              if (onSelectClassFilter) onSelectClassFilter(cls);
              onNavigate('presensi');
            }}
          />
        </div>
      </div>

      {/* Bottom Row: Live Scanner Feed */}
      <div>
        <LiveFeed
          records={attendanceRecords}
          students={students}
          onSendWhatsApp={onSendWhatsApp}
        />
      </div>
    </div>
  );
}
