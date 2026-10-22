import { AttendanceRecord, Student } from '../../types';
import { Activity, Send, Clock, QrCode, UserCheck } from 'lucide-react';

interface LiveFeedProps {
  records: AttendanceRecord[];
  students: Student[];
  onOpenCard?: (student: Student) => void;
  onSendWhatsApp?: (record: AttendanceRecord) => void;
}

export function LiveFeed({ records, students, onOpenCard, onSendWhatsApp }: LiveFeedProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter(r => r.date === todayStr);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Activity className="w-5 h-5 text-emerald-600" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Aktivitas Presensi Terkini (Live)</h3>
            <p className="text-xs text-slate-400">Sinkron real-time per detik dari gerbang & musholla</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
          {todayRecords.length} Scan Masuk
        </span>
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {todayRecords.slice(0, 10).map((record) => {
          const student = students.find(s => s.id === record.studentId);

          return (
            <div
              key={record.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100 border border-slate-100 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm border border-emerald-200 flex-shrink-0">
                  {record.studentName.charAt(0)}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm leading-tight">
                      {record.studentName}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                      {record.classId}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="text-emerald-700 font-semibold">{record.categoryName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {record.time} WIB
                    </span>
                    <span>•</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                      {record.method === 'qr_scan' ? <QrCode className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                      {record.method === 'qr_scan' ? 'QR' : 'Manual'}
                    </span>
                  </div>

                  {record.notes && (
                    <p className="text-[11px] text-amber-700 mt-0.5 font-medium">
                      Ket: {record.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`text-xs font-bold capitalize px-2.5 py-1 rounded-full ${
                    record.status === 'hadir'
                      ? 'bg-emerald-100 text-emerald-800'
                      : record.status === 'terlambat'
                      ? 'bg-amber-100 text-amber-800'
                      : record.status === 'sakit'
                      ? 'bg-purple-100 text-purple-800'
                      : record.status === 'izin'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {record.status}
                </span>

                {record.status !== 'hadir' && onSendWhatsApp && (
                  <button
                    onClick={() => onSendWhatsApp(record)}
                    title="Kirim Notifikasi WA ke Orang Tua"
                    className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition border border-emerald-200"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {todayRecords.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-pulse" />
            <p className="text-xs">Menunggu pemindaian presensi pertama hari ini...</p>
          </div>
        )}
      </div>
    </div>
  );
}
