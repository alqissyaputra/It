import { useState } from 'react';
import { AttendanceRecord, Student } from '../../types';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  HeartPulse,
  Clock,
  Phone,
  Send,
  UserX,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface ClassOverviewProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  todayDateStr: string;
  onSelectClass?: (classId: string) => void;
  onSendWhatsApp?: (record: AttendanceRecord) => void;
}

export function ClassOverview({
  students,
  attendanceRecords,
  todayDateStr,
  onSelectClass,
  onSendWhatsApp,
}: ClassOverviewProps) {
  // Extract unique classes
  const classes = Array.from(new Set(students.map(s => s.classId))).sort();
  // Expanded class by default: 'XII 1' if present, otherwise first class
  const [expandedClass, setExpandedClass] = useState<string>(
    classes.includes('XII 1') ? 'XII 1' : classes[0] || ''
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            Monitoring Rombel
          </span>
          <h3 className="text-base font-bold text-slate-800 mt-1">Laporan Langsung Kehadiran per Kelas</h3>
          <p className="text-xs text-slate-400">
            Daftar langsung santri yang <b>Sakit</b>, <b>Izin</b>, dan <b>Alpa</b> hari ini
          </p>
        </div>
        <span className="text-xs text-emerald-800 font-mono font-bold bg-emerald-50 px-2 py-1 rounded-lg">
          Hari Ini
        </span>
      </div>

      <div className="space-y-3">
        {classes.map((cls) => {
          const classStudents = students.filter(s => s.classId === cls && s.status === 'aktif');
          const totalInClass = classStudents.length;

          // Records for this class today
          const studentIds = new Set(classStudents.map(s => s.id));
          const classRecordsToday = attendanceRecords.filter(
            r => studentIds.has(r.studentId) && r.date === todayDateStr
          );

          // Categorize students
          const sakitStudents: { student: Student; record?: AttendanceRecord }[] = [];
          const izinStudents: { student: Student; record?: AttendanceRecord }[] = [];
          const alpaStudents: { student: Student; record?: AttendanceRecord }[] = [];
          const terlambatStudents: { student: Student; record?: AttendanceRecord }[] = [];
          const hadirStudents: { student: Student; record?: AttendanceRecord }[] = [];

          classStudents.forEach(student => {
            const studentRec = classRecordsToday.find(r => r.studentId === student.id);
            if (!studentRec) {
              // Not recorded yet -> counted as Alpa/Belum Absen
              alpaStudents.push({ student });
            } else if (studentRec.status === 'sakit') {
              sakitStudents.push({ student, record: studentRec });
            } else if (studentRec.status === 'izin') {
              izinStudents.push({ student, record: studentRec });
            } else if (studentRec.status === 'alpa') {
              alpaStudents.push({ student, record: studentRec });
            } else if (studentRec.status === 'terlambat') {
              terlambatStudents.push({ student, record: studentRec });
            } else if (studentRec.status === 'hadir') {
              hadirStudents.push({ student, record: studentRec });
            }
          });

          const totalPresent = hadirStudents.length + terlambatStudents.length;
          const percentage = totalInClass > 0 ? Math.round((totalPresent / totalInClass) * 100) : 0;
          const isExpanded = expandedClass === cls;
          const totalIssues = sakitStudents.length + izinStudents.length + alpaStudents.length;

          return (
            <div
              key={cls}
              className={`rounded-2xl border transition overflow-hidden ${
                isExpanded ? 'border-emerald-300 bg-emerald-50/15 shadow-xs' : 'border-slate-200/80 bg-slate-50/50'
              }`}
            >
              {/* Header row */}
              <div
                onClick={() => setExpandedClass(isExpanded ? '' : cls)}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition ${
                      isExpanded
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">
                        Kelas {cls}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        ({totalPresent}/{totalInClass} Hadir)
                      </span>
                    </div>

                    {/* Quick indicator badges */}
                    <div className="flex items-center gap-1.5 mt-1">
                      {sakitStudents.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                          <HeartPulse className="w-2.5 h-2.5" />
                          <span>{sakitStudents.length} Sakit</span>
                        </span>
                      )}
                      {izinStudents.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          <HelpCircle className="w-2.5 h-2.5" />
                          <span>{izinStudents.length} Izin</span>
                        </span>
                      )}
                      {alpaStudents.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <UserX className="w-2.5 h-2.5" />
                          <span>{alpaStudents.length} Alpa</span>
                        </span>
                      )}
                      {terlambatStudents.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{terlambatStudents.length} Telat</span>
                        </span>
                      )}
                      {totalIssues === 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>Nihil Absen (100% Hadir)</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full ${
                      percentage >= 90
                        ? 'bg-emerald-100 text-emerald-800'
                        : percentage >= 75
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {percentage}%
                  </span>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Detailed Breakdown */}
              {isExpanded && (
                <div className="p-4 pt-1 border-t border-slate-200/60 bg-white space-y-3">
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        percentage >= 90 ? 'bg-emerald-500' : percentage >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* List of Sakit, Izin, Alpa students */}
                  {totalIssues > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Rincian Santri Tidak Hadir Hari Ini:
                      </p>

                      {/* Sakit */}
                      {sakitStudents.map(({ student, record }) => (
                        <div
                          key={student.id}
                          className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/70 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-purple-600 text-white">
                              <HeartPulse className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{student.name}</p>
                              <p className="text-[11px] text-purple-900 font-medium">
                                NIS: {student.nis} • <b>SAKIT:</b> {record?.notes || 'Surat dokter terlampir'}
                              </p>
                            </div>
                          </div>

                          {record && onSendWhatsApp && (
                            <button
                              onClick={() => onSendWhatsApp(record)}
                              title="Kirim Pesan WhatsApp ke Wali"
                              className="p-1.5 rounded-lg bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 shadow-xs"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Izin */}
                      {izinStudents.map(({ student, record }) => (
                        <div
                          key={student.id}
                          className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/70 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                              <HelpCircle className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{student.name}</p>
                              <p className="text-[11px] text-blue-900 font-medium">
                                NIS: {student.nis} • <b>IZIN:</b> {record?.notes || 'Keperluan keluarga'}
                              </p>
                            </div>
                          </div>

                          {record && onSendWhatsApp && (
                            <button
                              onClick={() => onSendWhatsApp(record)}
                              title="Kirim Pesan WhatsApp ke Wali"
                              className="p-1.5 rounded-lg bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-xs"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Alpa */}
                      {alpaStudents.map(({ student, record }) => (
                        <div
                          key={student.id}
                          className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/70 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-rose-600 text-white">
                              <UserX className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{student.name}</p>
                              <p className="text-[11px] text-rose-900 font-medium">
                                NIS: {student.nis} • <b>ALPA:</b> {record?.notes || 'Belum ada kabar kehadiran'}
                              </p>
                            </div>
                          </div>

                          {onSendWhatsApp && record ? (
                            <button
                              onClick={() => onSendWhatsApp(record)}
                              title="Kirim Pesan WhatsApp ke Wali"
                              className="p-1.5 rounded-lg bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-xs"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <a
                              href={`https://api.whatsapp.com/send?phone=${student.parentPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-xs flex items-center gap-1 text-[11px]"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>Hubungi</span>
                            </a>
                          )}
                        </div>
                      ))}

                      {/* Terlambat */}
                      {terlambatStudents.map(({ student, record }) => (
                        <div
                          key={student.id}
                          className="p-2 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                            <div>
                              <span className="font-bold text-slate-800">{student.name}</span>
                              <span className="text-[11px] text-amber-800 ml-1.5">
                                (Tiba {record?.time || '07:18'} WIB - {record?.notes || 'Terlambat'})
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-3 text-center text-xs text-emerald-700 font-semibold bg-emerald-50 rounded-xl">
                      Semua {totalInClass} santri kelas {cls} tercatat hadir tepat waktu hari ini.
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onSelectClass && onSelectClass(cls)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      Buka Tabel Presensi Lengkap Kelas {cls} →
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
