import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { AttendanceCategory, AttendanceRecord, Student } from '../../types';
import { soundFx } from '../../services/audioService';
import { ScanResultModal } from './ScanResultModal';
import {
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  Keyboard,
  Clock,
  Sparkles,
  Search,
  CheckCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

interface QrScannerViewProps {
  students: Student[];
  categories: AttendanceCategory[];
  attendanceRecords: AttendanceRecord[];
  onAddAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  currentUserRole: string;
}

export function QrScannerView({
  students,
  categories,
  attendanceRecords,
  onAddAttendance,
  currentUserRole,
}: QrScannerViewProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || '');
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScannedStudent, setLastScannedStudent] = useState<Student | null>(null);
  const [scanResult, setScanResult] = useState<{
    student: Student;
    category: AttendanceCategory;
    status: AttendanceRecord['status'];
    timeStr: string;
    notes?: string;
  } | null>(null);

  // Manual / Barcode input gun state
  const [manualInput, setManualInput] = useState('');
  const [manualFeedback, setManualFeedback] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);
  const manualInputRef = useRef<HTMLInputElement | null>(null);

  const activeCategory = categories.find(c => c.id === selectedCategoryId) || categories[0];

  // Process a scanned or typed QR / NIS / NISN string
  const processScan = useCallback((decodedText: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    const trimmed = decodedText.trim();
    // Search student by QR Code data, NIS, or NISN
    const student = students.find(
      s => s.qrCodeData === trimmed ||
           s.nis === trimmed ||
           s.nisn === trimmed ||
           trimmed.includes(s.nis) ||
           trimmed.includes(s.nisn)
    );

    if (!student) {
      if (soundEnabled) soundFx.playError();
      setManualFeedback(`Data siswa tidak ditemukan untuk kode: "${trimmed}"`);
      setTimeout(() => {
        isProcessingRef.current = false;
        setManualFeedback(null);
      }, 2000);
      return;
    }

    // Check if already checked in for this category today
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const alreadyCheckedIn = attendanceRecords.find(
      r => r.studentId === student.id &&
           r.categoryId === activeCategory.id &&
           r.date === todayStr
    );

    if (alreadyCheckedIn) {
      if (soundEnabled) soundFx.playWarning();
      setManualFeedback(`Siswa ${student.name} sudah tercatat presensi sebelumnya pada pukul ${alreadyCheckedIn.time} WIB.`);
      setTimeout(() => {
        isProcessingRef.current = false;
        setManualFeedback(null);
      }, 2500);
      return;
    }

    // Determine status based on category startTime and late tolerance
    const [startH, startM] = activeCategory.startTime.split(':').map(Number);
    const scheduledStartMin = startH * 60 + startM;
    const toleranceMin = scheduledStartMin + (activeCategory.lateToleranceMinutes || 15);
    const currentMin = now.getHours() * 60 + now.getMinutes();

    let status: AttendanceRecord['status'] = 'hadir';
    let notes: string | undefined = undefined;

    if (currentMin > toleranceMin) {
      status = 'terlambat';
      const lateDiff = currentMin - scheduledStartMin;
      notes = `Terlambat ${lateDiff} menit setelah jadwal (${activeCategory.startTime})`;
      if (soundEnabled) soundFx.playWarning();
    } else {
      if (soundEnabled) soundFx.playSuccess();
    }

    // Record attendance
    onAddAttendance({
      studentId: student.id,
      studentNis: student.nis,
      studentName: student.name,
      classId: student.classId,
      categoryId: activeCategory.id,
      categoryName: activeCategory.name,
      date: todayStr,
      time: timeStr,
      status,
      notes,
      method: 'qr_scan',
      verifiedBy: currentUserRole || 'Admin',
      notifiedParent: status === 'terlambat',
      parentNotifiedAt: status === 'terlambat' ? `${todayStr} ${timeStr}` : undefined,
    });

    setLastScannedStudent(student);
    setScanResult({
      student,
      category: activeCategory,
      status,
      timeStr,
      notes,
    });

    setManualInput('');
    setManualFeedback(null);

    // Debounce processing unlock
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 1500);
  }, [activeCategory, attendanceRecords, currentUserRole, onAddAttendance, soundEnabled, students]);

  // Start Camera QR Scanner
  const startCamera = async () => {
    try {
      setScannerError(null);
      const scannerElementId = 'qr-reader-viewport';
      
      const html5QrCode = new Html5Qrcode(scannerElementId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.EAN_13,
        ],
        verbose: false,
      });

      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          processScan(decodedText);
        },
        () => {
          // Frame not detected (normal polling)
        }
      );

      setIsScanning(true);
    } catch (err: unknown) {
      console.warn('Camera start error:', err);
      setScannerError('Tidak dapat mengakses kamera web. Pastikan izin kamera telah disetujui, atau gunakan pemindai barcode / input NIS di bawah.');
      setIsScanning(false);
    }
  };

  // Stop Camera QR Scanner
  const stopCamera = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    processScan(manualInput.trim());
  };

  // Quick WhatsApp message trigger for parents
  const sendWhatsAppNotification = (student: Student, note?: string) => {
    const phone = student.parentPhone.replace(/[^0-9]/g, '');
    const intlPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
    const msg = encodeURIComponent(
      `Assalamu'alaikum Wr. Wb. Yth. Bapak/Ibu Wali dari ${student.name} (Kelas ${student.classId}). ` +
      `Kami informasikan bahwa ananda telah tercatat presensi pada sesi ${activeCategory.name} SMA IT AL ITTIHAD hari ini dengan status TERLAMBAT. ` +
      `${note ? `Keterangan: ${note}. ` : ''}` +
      `Mohon bimbingan dan kerjasamanya. Jazakumullahu khairan katsiran. - Bagian Kesiswaan SMA IT AL ITTIHAD`
    );
    window.open(`https://api.whatsapp.com/send?phone=${intlPhone}&text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Category Selector Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            Sesi Presensi Aktif
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Pemindai QR Code Presensi Real-Time</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Pindai kartu siswa dengan kamera web atau barcode scanner gun untuk pencatatan otomatis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Pilih Jadwal Sesi:</span>
          </label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="px-3.5 py-2 bg-emerald-50/70 text-emerald-950 font-semibold rounded-xl border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.startTime} - {c.endTime})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Scanner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Camera Scanner View (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-base">Kamera Pindai Langsung</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg text-xs font-medium transition ${
                  soundEnabled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
                title={soundEnabled ? 'Suara Scanner Aktif' : 'Suara Scanner Senyap'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {isScanning ? (
                <button
                  onClick={stopCamera}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-semibold transition"
                >
                  <CameraOff className="w-4 h-4" />
                  <span>Matikan Kamera</span>
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Buka Kamera Scan</span>
                </button>
              )}
            </div>
          </div>

          {/* Scanner Viewport */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 min-h-[340px] flex items-center justify-center border-2 border-dashed border-slate-200">
            {/* Target ID for Html5Qrcode */}
            <div
              id="qr-reader-viewport"
              className={`w-full h-full min-h-[340px] ${!isScanning ? 'hidden' : ''}`}
            />

            {!isScanning && (
              <div className="text-center p-8 max-w-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/80 text-emerald-400 flex items-center justify-center border border-slate-700">
                  <Camera className="w-8 h-8" />
                </div>
                <h4 className="text-white font-bold text-base mb-1">Kamera Belum Aktif</h4>
                <p className="text-slate-400 text-xs mb-5">
                  Klik tombol di bawah untuk mengaktifkan webcam, atau gunakan pemindai barcode / ketik NIS langsung.
                </p>
                <button
                  onClick={startCamera}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95"
                >
                  Aktifkan Kamera Sekarang
                </button>
              </div>
            )}

            {scannerError && (
              <div className="absolute inset-x-4 bottom-4 p-3 bg-rose-900/90 text-rose-100 text-xs rounded-xl backdrop-blur-sm border border-rose-700 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 flex-shrink-0 text-rose-300" />
                <span>{scannerError}</span>
              </div>
            )}
          </div>

          {/* Manual Input / Barcode Scanner Gun Bar */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <form onSubmit={handleManualSubmit} className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Keyboard className="w-4 h-4 text-emerald-600" />
                  Input Cepat Barcode Gun / Ketik NIS Siswa
                </span>
                <span className="text-[11px] text-slate-400 font-normal">Tekan Enter untuk merekam</span>
              </label>

              <div className="relative">
                <input
                  ref={manualInputRef}
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Scan kartu dengan barcode reader atau ketik NIS..."
                  className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition"
                >
                  Proses
                </button>
              </div>

              {manualFeedback && (
                <p className="text-xs font-medium text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  {manualFeedback}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Right: Real-time scan queue & Last Student (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Session Info Card */}
          <div className="bg-gradient-to-br from-emerald-800 to-teal-950 text-white p-5 rounded-2xl shadow-md border border-emerald-700/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                Informasi Waktu Sesi
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600/60 border border-emerald-500">
                Toleransi: {activeCategory.lateToleranceMinutes} Menit
              </span>
            </div>

            <h3 className="text-lg font-black mt-1 text-white">{activeCategory.name}</h3>
            <p className="text-xs text-emerald-200/90 mt-1 line-clamp-2">
              {activeCategory.description || 'Pencatatan kehadiran tertib dan berkah.'}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                <span className="text-[10px] uppercase text-emerald-300 font-medium">Jam Mulai</span>
                <p className="text-base font-black font-mono text-white mt-0.5">{activeCategory.startTime} WIB</p>
              </div>
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                <span className="text-[10px] uppercase text-emerald-300 font-medium">Batas Terlambat</span>
                <p className="text-base font-black font-mono text-amber-300 mt-0.5">
                  {/* calculate late limit */}
                  {(() => {
                    const [h, m] = activeCategory.startTime.split(':').map(Number);
                    const totalM = h * 60 + m + activeCategory.lateToleranceMinutes;
                    const endH = Math.floor(totalM / 60);
                    const endM = totalM % 60;
                    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')} WIB`;
                  })()}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Recent Scans for this category */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Presensi Masuk Terakhir ({activeCategory.name})</span>
              </h4>
              <span className="text-xs text-slate-400 font-mono">
                {attendanceRecords.filter(r => r.categoryId === activeCategory.id && r.date === new Date().toISOString().split('T')[0]).length} Siswa
              </span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {attendanceRecords
                .filter(r => r.categoryId === activeCategory.id && r.date === new Date().toISOString().split('T')[0])
                .slice(0, 6)
                .map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        {rec.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 line-clamp-1">{rec.studentName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {rec.classId} • NIS: {rec.studentNis}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                          rec.status === 'hadir'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.status}
                      </span>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">{rec.time} WIB</p>
                    </div>
                  </div>
                ))}

              {attendanceRecords.filter(r => r.categoryId === activeCategory.id && r.date === new Date().toISOString().split('T')[0]).length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Sparkles className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                  <p className="text-xs">Belum ada scan presensi pada sesi ini hari ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal when student scans */}
      {scanResult && (
        <ScanResultModal
          student={scanResult.student}
          category={scanResult.category}
          status={scanResult.status}
          timeStr={scanResult.timeStr}
          notes={scanResult.notes}
          onClose={() => setScanResult(null)}
          onSendWhatsApp={() => sendWhatsAppNotification(scanResult.student, scanResult.notes)}
        />
      )}
    </div>
  );
}
