import { useState, useMemo } from 'react';
import { Student, AttendanceRecord, AttendanceCategory, NotificationLog } from '../../types';
import {
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HeartPulse,
  Phone,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Edit2,
  Check,
} from 'lucide-react';

interface ParentNotificationCenterProps {
  students: Student[];
  records: AttendanceRecord[];
  categories: AttendanceCategory[];
  notifications: NotificationLog[];
  onSendBatchNotification: (records: AttendanceRecord[]) => void;
  onSendSingleNotification: (record: AttendanceRecord, customMsg?: string) => void;
}

export function ParentNotificationCenter({
  students,
  records,
  categories,
  notifications,
  onSendBatchNotification,
  onSendSingleNotification,
}: ParentNotificationCenterProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [filterType, setFilterType] = useState<string>('all');
  const [editingTemplate, setEditingTemplate] = useState<boolean>(false);
  const [templateAlpa, setTemplateAlpa] = useState<string>(
    `Assalamu'alaikum Wr. Wb. Yth. Bapak/Ibu Wali dari {nama_siswa} (Kelas {kelas}). Kami informasikan dari pihak Sekolah SMA IT AL ITTIHAD bahwa hari ini ({tanggal}) ananda tercatat TIDAK HADIR (ALPA) pada sesi {sesi}. Mohon konfirmasinya melalui pesan ini. Jazakumullahu khairan katsiran.`
  );
  const [templateLate, setTemplateLate] = useState<string>(
    `Assalamu'alaikum Wr. Wb. Yth. Bapak/Ibu Wali dari {nama_siswa} (Kelas {kelas}). Ananda telah tiba dan melakukan presensi pada sesi {sesi} SMA IT AL ITTIHAD pukul {jam_scan} WIB dengan status TERLAMBAT ({keterangan}). Mohon motivasi dan kerjasamanya. Terima kasih.`
  );

  // Today's records needing parent notification: Alpa, Terlambat, Sakit, Izin
  const needNotificationRecords = useMemo(() => {
    return records.filter(r => {
      const isToday = r.date === todayStr;
      const isNotPresent = r.status !== 'hadir';
      const matchType = filterType === 'all' || r.status === filterType;
      return isToday && isNotPresent && matchType;
    });
  }, [records, todayStr, filterType]);

  const handleOpenWhatsApp = (record: AttendanceRecord) => {
    const student = students.find(s => s.id === record.studentId);
    if (!student) return;

    let text = templateAlpa;
    if (record.status === 'terlambat') {
      text = templateLate;
    }

    const formattedMessage = text
      .replace(/{nama_siswa}/g, student.name)
      .replace(/{kelas}/g, student.classId)
      .replace(/{tanggal}/g, todayStr)
      .replace(/{sesi}/g, record.categoryName)
      .replace(/{jam_scan}/g, record.time)
      .replace(/{keterangan}/g, record.notes || 'Melebihi batas jam masuk');

    const cleanPhone = student.parentPhone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

    onSendSingleNotification(record, formattedMessage);
    window.open(`https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(formattedMessage)}`, '_blank');
  };

  const handleSendAllPending = () => {
    const pendingList = needNotificationRecords.filter(r => !r.notifiedParent);
    if (pendingList.length === 0) return;
    onSendBatchNotification(pendingList);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            Layanan Komunikasi Orang Tua
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Notifikasi Otomatis WhatsApp Wali</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Kirim pemberitahuan kedatangan terlambat, sakit, atau ketidakhadiran (alpa) langsung ke WhatsApp orang tua siswa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingTemplate(!editingTemplate)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            <Edit2 className="w-4 h-4 text-emerald-700" />
            <span>{editingTemplate ? 'Tutup Template' : 'Atur Template Pesan'}</span>
          </button>

          <button
            onClick={handleSendAllPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Semua Antrean WA</span>
          </button>
        </div>
      </div>

      {/* Template Editor Drawer */}
      {editingTemplate && (
        <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 shadow-inner space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>Format Template Pesan WhatsApp Islami</span>
            </h4>
            <span className="text-[11px] text-emerald-800 font-medium">
              Variabel tersedia: &#123;nama_siswa&#125;, &#123;kelas&#125;, &#123;tanggal&#125;, &#123;sesi&#125;, &#123;jam_scan&#125;, &#123;keterangan&#125;
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1">
                Template Alpa (Ketidakhadiran)
              </label>
              <textarea
                rows={4}
                value={templateAlpa}
                onChange={(e) => setTemplateAlpa(e.target.value)}
                className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1">
                Template Keterlambatan Masuk
              </label>
              <textarea
                rows={4}
                value={templateLate}
                onChange={(e) => setTemplateLate(e.target.value)}
                className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'Semua Antrean Hari Ini' },
          { key: 'alpa', label: 'Alpa (Tanpa Keterangan)' },
          { key: 'terlambat', label: 'Terlambat Masuk' },
          { key: 'sakit', label: 'Sakit' },
          { key: 'izin', label: 'Izin' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setFilterType(t.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterType === t.key
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Queue List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-slate-800 text-sm">
            Daftar Siswa Butuh Notifikasi ({needNotificationRecords.length} Siswa)
          </span>
          <span className="text-xs text-slate-500">
            Terikirim: {needNotificationRecords.filter(r => r.notifiedParent).length} | Menunggu: {needNotificationRecords.filter(r => !r.notifiedParent).length}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {needNotificationRecords.map((record) => {
            const student = students.find(s => s.id === record.studentId);
            if (!student) return null;

            return (
              <div
                key={record.id}
                className="p-4 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {record.studentName.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{record.studentName}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {record.classId}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          record.status === 'alpa'
                            ? 'bg-rose-100 text-rose-800'
                            : record.status === 'terlambat'
                            ? 'bg-amber-100 text-amber-800'
                            : record.status === 'sakit'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Wali: <b>{student.parentName}</b></span>
                      <span>•</span>
                      <span className="font-mono flex items-center gap-1 text-slate-700">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        {student.parentPhone}
                      </span>
                      <span>•</span>
                      <span>Sesi: {record.categoryName}</span>
                    </div>

                    {record.notes && (
                      <p className="text-[11px] text-amber-800 mt-1 font-medium">
                        Keterangan: {record.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {record.notifiedParent ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <Check className="w-3.5 h-3.5" />
                      <span>Sudah Dikabari</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Belum Terkirim</span>
                    </span>
                  )}

                  <button
                    onClick={() => handleOpenWhatsApp(record)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim WA</span>
                  </button>
                </div>
              </div>
            );
          })}

          {needNotificationRecords.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
              <p className="font-medium text-sm text-slate-700">Alhamdulillah! Tidak ada antrean notifikasi absensi.</p>
              <p className="text-xs text-slate-400 mt-0.5">Semua siswa hadir atau telah terkonfirmasi dengan baik.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
