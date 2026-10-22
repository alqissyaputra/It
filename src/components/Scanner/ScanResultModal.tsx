import { Student, AttendanceCategory, AttendanceStatus } from '../../types';
import { CheckCircle2, Clock, AlertTriangle, Send, X, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface ScanResultModalProps {
  student: Student;
  category: AttendanceCategory;
  status: AttendanceStatus;
  timeStr: string;
  notes?: string;
  onClose: () => void;
  onSendWhatsApp: () => void;
}

export function ScanResultModal({
  student,
  category,
  status,
  timeStr,
  notes,
  onClose,
  onSendWhatsApp,
}: ScanResultModalProps) {
  useEffect(() => {
    if (status === 'hadir') {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#059669', '#34d399', '#f59e0b'],
        });
      } catch {
        // confetti optional
      }
    }
  }, [status]);

  const isLate = status === 'terlambat';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all scale-100">
        {/* Top colored status banner */}
        <div
          className={`p-6 text-center text-white relative overflow-hidden ${
            status === 'hadir'
              ? 'bg-gradient-to-br from-emerald-600 to-teal-700'
              : 'bg-gradient-to-br from-amber-500 to-orange-600'
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex p-3 rounded-full bg-white/20 mb-3 shadow-inner">
            {status === 'hadir' ? (
              <CheckCircle2 className="w-12 h-12 text-white" />
            ) : (
              <Clock className="w-12 h-12 text-white animate-pulse" />
            )}
          </div>

          <h3 className="text-2xl font-black uppercase tracking-tight">
            {status === 'hadir' ? 'Presensi Berhasil!' : 'Presensi Terlambat!'}
          </h3>
          <p className="text-emerald-100 text-sm mt-1 font-medium">
            Sesi: <span className="font-bold underline text-white">{category.name}</span>
          </p>
        </div>

        {/* Student card info */}
        <div className="p-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-2xl border border-emerald-200 flex-shrink-0">
              {student.name.charAt(0)}
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-600 text-white uppercase tracking-wider mb-1">
                {student.classId}
              </span>
              <h4 className="font-bold text-slate-800 text-base leading-snug">{student.name}</h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                NIS: {student.nis} | NISN: {student.nisn}
              </p>
            </div>
          </div>

          {/* Time & Notes details */}
          <div className="space-y-2 text-sm bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center text-slate-600">
              <span>Waktu Scan Masuk:</span>
              <span className="font-bold font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {timeStr} WIB
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Status Kehadiran:</span>
              <span
                className={`font-semibold capitalize px-2 py-0.5 rounded-full text-xs ${
                  status === 'hadir'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {status}
              </span>
            </div>
            {notes && (
              <div className="pt-2 border-t border-slate-200 text-xs text-amber-700 flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{notes}</span>
              </div>
            )}
          </div>

          {/* Parent WhatsApp Quick Action if Late */}
          {isLate && (
            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Notifikasi Wali Siswa:</p>
                  <p className="text-slate-600 text-[11px]">Kirim pesan WA otomatis ke {student.parentName}</p>
                </div>
                <button
                  onClick={onSendWhatsApp}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim WA</span>
                </button>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-5 flex gap-2">
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Selesai (Scan Berikutnya)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
