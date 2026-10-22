export type UserRole = 'super_admin' | 'guru' | 'staf_tu';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email?: string;
  avatar?: string;
}

export type AttendanceStatus = 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'alpa';

export interface AttendanceCategory {
  id: string;
  name: string;
  code: string; // e.g. 'PAGI', 'DZUHUR', 'ASHAR', 'PRAMUKA', 'TAHFIDZ'
  startTime: string; // "06:45"
  endTime: string;   // "07:30"
  lateToleranceMinutes: number; // e.g. 15 mins after startTime
  activeDays: number[]; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  isRequired: boolean;
  type: 'akademik' | 'ibadah' | 'ekstrakurikuler';
  description?: string;
  isActive: boolean;
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  classId: string; // e.g. 'XII 1', 'X-1', 'XI-IPA 1'
  parentName: string;
  parentPhone: string; // for WhatsApp notification
  address?: string;
  photoUrl?: string;
  qrCodeData: string; // unique token / NISN
  status: 'aktif' | 'nonaktif' | 'mutasi';
  createdDate: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentNis: string;
  studentName: string;
  classId: string;
  categoryId: string; // references AttendanceCategory
  categoryName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  status: AttendanceStatus;
  notes?: string;
  method: 'qr_scan' | 'manual' | 'rfid' | 'api_sync';
  verifiedBy: string; // username
  notifiedParent: boolean;
  parentNotifiedAt?: string;
}

export interface NotificationLog {
  id: string;
  studentId: string;
  studentName: string;
  parentPhone: string;
  parentName: string;
  type: AttendanceStatus;
  date: string;
  message: string;
  status: 'sent' | 'pending' | 'failed';
  sentAt?: string;
}

export interface ApiSyncConfig {
  apiUrl: string;
  apiKey: string;
  schoolCode: string;
  autoSyncEnabled: boolean;
  syncIntervalMinutes: number;
  lastSyncTime?: string;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncMessage?: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
  recordsSent: number;
  recordsReceived: number;
  message: string;
}

export interface LetterheadConfig {
  yayasanName: string;
  schoolName: string;
  motto: string;
  npsn: string;
  nss: string;
  accreditation: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  headmasterName: string;
  headmasterNip: string;
  counselorName: string;
  counselorNiy: string;
  customLogoUrl?: string;
}

export interface ExportCustomOptions {
  includeNis: boolean;
  includeNisn: boolean;
  includeClass: boolean;
  includeHadir: boolean;
  includeTerlambat: boolean;
  includeIzin: boolean;
  includeSakit: boolean;
  includeAlpa: boolean;
  includePercentage: boolean;
  includeNotes: boolean;
  reportTitle: string;
  periodLabel: string;
}
