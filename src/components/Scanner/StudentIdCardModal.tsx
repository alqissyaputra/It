import { useRef } from 'react';
import { Student } from '../../types';
import { QrCodeView } from '../common/QrCodeView';
import { SchoolLogo } from '../common/SchoolLogo';
import { X, Printer, Download, Sparkles } from 'lucide-react';

interface StudentIdCardModalProps {
  student: Student | null;
  onClose: () => void;
}

export function StudentIdCardModal({ student, onClose }: StudentIdCardModalProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-lg">Kartu Presensi Siswa (QR Card)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Canvas */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-100/70">
          <div
            ref={cardRef}
            id="printable-student-card"
            className="w-[340px] h-[520px] rounded-2xl bg-gradient-to-b from-emerald-800 via-emerald-900 to-teal-950 text-white p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between border-2 border-amber-400/50"
          >
            {/* Background Islamic Geometric Watermark */}
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full border-[20px] border-emerald-600/20 pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full border-[20px] border-emerald-500/15 pointer-events-none" />

            {/* Top School Header */}
            <div className="text-center relative z-10 border-b border-emerald-700/60 pb-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                <SchoolLogo size="sm" />
                <div className="text-left">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-amber-300">
                    SMA IT AL ITTIHAD
                  </h4>
                  <p className="text-[10px] text-emerald-200 font-medium">PEKANBARU - RIAU</p>
                </div>
              </div>
              <p className="text-[9px] text-emerald-300/90 font-mono tracking-widest mt-1">
                KARTU TANDA SISWA & PRESENSI DIGITAL
              </p>
            </div>

            {/* Photo & Student Details */}
            <div className="flex flex-col items-center relative z-10 my-auto text-center">
              <div className="relative mb-3">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-400 to-emerald-400 shadow-lg">
                  <div className="w-full h-full rounded-full bg-emerald-950 overflow-hidden flex items-center justify-center text-emerald-300 font-bold text-2xl">
                    {student.photoUrl ? (
                      <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{student.name.charAt(0)}</span>
                    )}
                  </div>
                </div>
                <span className="absolute bottom-0 right-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-emerald-950 uppercase shadow">
                  {student.classId}
                </span>
              </div>

              <h2 className="text-base font-bold text-white px-2 leading-tight drop-shadow-sm line-clamp-2">
                {student.name}
              </h2>

              <div className="flex items-center gap-2 mt-1.5 text-xs text-emerald-200">
                <span className="font-mono">NIS: {student.nis}</span>
                <span>•</span>
                <span className="font-mono">NISN: {student.nisn}</span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="relative z-10 flex flex-col items-center bg-white/95 rounded-xl p-3 text-slate-800 shadow-md">
              <QrCodeView value={student.qrCodeData} size={110} darkColor="#064e3b" />
              <p className="text-[10px] font-mono text-emerald-900 font-semibold tracking-wider mt-1">
                {student.qrCodeData}
              </p>
              <p className="text-[8px] text-slate-500 mt-0.5">
                Scan saat kedatangan, sholat berjamaah & kepulangan
              </p>
            </div>

            {/* Footer motto */}
            <div className="text-center text-[9px] text-emerald-300/80 pt-2 border-t border-emerald-800/80">
              <p>Motto: Berakhlak Mulia • Unggul • Mandiri</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Cetak kartu fisik untuk dipasang pada tali lanyard siswa.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-emerald-700/20 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kartu</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
