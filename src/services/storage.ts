import {
  AttendanceCategory,
  AttendanceRecord,
  Student,
  User,
  ApiSyncConfig,
  SyncLog,
  NotificationLog,
  LetterheadConfig,
} from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'alittihad_current_user',
  USERS: 'alittihad_users',
  STUDENTS: 'alittihad_students_v2',
  CATEGORIES: 'alittihad_categories_v2',
  ATTENDANCE: 'alittihad_attendance_v2',
  API_CONFIG: 'alittihad_api_config',
  SYNC_LOGS: 'alittihad_sync_logs',
  NOTIFICATIONS: 'alittihad_notifications',
  LETTERHEAD: 'alittihad_letterhead_config',
};

// Default Kop Surat & Logo Config
export const DEFAULT_LETTERHEAD: LetterheadConfig = {
  yayasanName: 'YAYASAN KESATUAN PENDIDIKAN ISLAM AL ITTIHAD',
  schoolName: 'SMA IT AL ITTIHAD',
  motto: 'Alquran Akhlak Prestasi',
  npsn: '10404435',
  nss: '304096008035',
  accreditation: 'A (Unggul)',
  address: 'Kompleks Chevron Rumbai, Lembah Damai, Rumbai Pesisir, Pekanbaru, Riau 28265',
  phone: '(0761) 51522',
  email: 'info@alittihad.sch.id',
  website: 'www.smaitalittihad.sch.id',
  headmasterName: 'Alkis Saputra, S.Pd., M.Kom.',
  headmasterNip: 'NIP. 19880530 201101 1 008',
  counselorName: 'Ustadz Ahmad Fauzi, Lc.',
  counselorNiy: 'NIY. 201208 1 042',
  customLogoUrl: '',
};

// Initial default user accounts
export const DEFAULT_USERS: User[] = [
  {
    id: 'user-alkis',
    username: 'alkis',
    name: 'Alkis Saputra, S.Pd., M.Kom.',
    role: 'super_admin',
    email: 'alkis.saputra48@guru.sma.belajar.id',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-guru1',
    username: 'ustadz_fauzi',
    name: 'Ustadz Ahmad Fauzi, Lc.',
    role: 'guru',
    email: 'ahmad.fauzi@alittihad.sch.id',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-tu1',
    username: 'bu_marwah',
    name: 'Siti Marwah, S.E. (Tata Usaha)',
    role: 'staf_tu',
    email: 'tatausaha@alittihad.sch.id',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
];

// Initial Attendance Categories for SMA IT AL ITTIHAD
export const DEFAULT_CATEGORIES: AttendanceCategory[] = [
  {
    id: 'cat-pagi',
    name: 'Presensi Pagi (Masuk Sekolah)',
    code: 'PAGI',
    startTime: '06:45',
    endTime: '07:30',
    lateToleranceMinutes: 15,
    activeDays: [1, 2, 3, 4, 5],
    isRequired: true,
    type: 'akademik',
    description: 'Penyambutan siswa 5S dan pembacaan Al-Ma’tsurat pagi.',
    isActive: true,
  },
  {
    id: 'cat-dzuhur',
    name: 'Sholat Dzuhur Berjamaah',
    code: 'DZUHUR',
    startTime: '11:45',
    endTime: '12:45',
    lateToleranceMinutes: 15,
    activeDays: [1, 2, 3, 4, 5],
    isRequired: true,
    type: 'ibadah',
    description: 'Sholat fardhu berjamaah di Masjid Al Ittihad dan kultum adab.',
    isActive: true,
  },
  {
    id: 'cat-ashar',
    name: 'Sholat Ashar Berjamaah',
    code: 'ASHAR',
    startTime: '15:15',
    endTime: '15:45',
    lateToleranceMinutes: 10,
    activeDays: [1, 2, 3, 4, 5],
    isRequired: true,
    type: 'ibadah',
    description: 'Sholat Ashar berjamaah sebelum kepulangan atau ekstrakurikuler.',
    isActive: true,
  },
  {
    id: 'cat-tahfidz',
    name: 'Halaqah Tahfidzul Qur’an',
    code: 'TAHFIDZ',
    startTime: '07:30',
    endTime: '08:30',
    lateToleranceMinutes: 10,
    activeDays: [1, 2, 3, 4],
    isRequired: true,
    type: 'akademik',
    description: 'Setoran hafalan ziyadah dan muraja’ah juz Al-Qur’an pilihan.',
    isActive: true,
  },
  {
    id: 'cat-pulang',
    name: 'Presensi Kepulangan Santri',
    code: 'PULANG',
    startTime: '15:45',
    endTime: '17:00',
    lateToleranceMinutes: 30,
    activeDays: [1, 2, 3, 4, 5],
    isRequired: false,
    type: 'akademik',
    description: 'Tap out siswa saat dijemput orang tua / boarding check-in.',
    isActive: true,
  },
  {
    id: 'cat-ekskul',
    name: 'Ekstrakurikuler (SIT / Robotik / Futsal / Panahan)',
    code: 'EKSKUL',
    startTime: '16:00',
    endTime: '17:30',
    lateToleranceMinutes: 15,
    activeDays: [3, 5],
    isRequired: false,
    type: 'ekstrakurikuler',
    description: 'Pramuka Sekolah Islam Terpadu, Robotik, Panahan, dan English Club.',
    isActive: true,
  },
];

// Exact list of 29 students for Kelas XII 1 requested by user
const RAW_XII_1_DATA = [
  { name: "ABID SYAF'IUL HIDAYAT", nis: '242510002' },
  { name: 'ABIYYU RACHMAN FACHSAN', nis: '242510003' },
  { name: 'ADIB ZADA', nis: '242510005' },
  { name: 'AHZA WIZARSYA PRIYAMA', nis: '242510008' },
  { name: 'AKHYAR RASYID WIBOWO', nis: '242510009' },
  { name: 'ALIF ZHAFRAN FARID', nis: '242510012' },
  { name: 'ASYROF ALHATIM', nis: '242510021' },
  { name: 'DAFFA ARKANA IBNI', nis: '242510029' },
  { name: "DHIYA' ABD. RAHMAN EL FAIZ", nis: '242510031' },
  { name: 'ERLAND ARYASATYA RACHMAN HARAHAP', nis: '242510035' },
  { name: 'FADHIL AL ANSORI', nis: '242510037' },
  { name: 'FARRAS AHMAD FAIZ', nis: '242510043' },
  { name: 'HANIF ABDURRAHMAN', nis: '242510051' },
  { name: 'HELMI MUSTAFA ALI', nis: '242510052' },
  { name: 'KEANDRE NAUFAL ADIWITYA', nis: '242510054' },
  { name: 'M. FATHI ALVARO', nis: '242510061' },
  { name: 'MOHAMMAD ROFIQ AL QOWIYY', nis: '242510066' },
  { name: 'MUHAMMAD ANAS FIHIFDZILLAH', nis: '242510069' },
  { name: 'MUHAMMAD RAYYAN ATHAILLAH', nis: '242510073' },
  { name: 'MUHAMMAD SETYA ADINATA', nis: '242510074' },
  { name: 'MUHAMMAD ZUHDI FAYYADH', nis: '242510075' },
  { name: 'NAWABIL ALNAZURA', nis: '242510083' },
  { name: 'RANU HANDIKA', nis: '242510091' },
  { name: 'RAZIB ARYAFITRAH', nis: '242510093' },
  { name: 'RAZIN ZHAFRAN KHAIRY', nis: '242510094' },
  { name: 'SYATHIR ATHALLAH ALVIS', nis: '242510102' },
  { name: 'THAQIF ALIY SULTHAN NANOS', nis: '242510107' },
  { name: 'M. RAFA GHAISAN PRAYOGA', nis: '242510113' },
  { name: 'FADHLI AKBAR CHANDRA', nis: '242510118' },
];

export const STUDENTS_XII_1: Student[] = RAW_XII_1_DATA.map((item, idx) => {
  const padNis = item.nis;
  const nisn = `007${padNis.slice(2)}`;
  return {
    id: `std-xii1-${padNis}`,
    nis: padNis,
    nisn,
    name: item.name,
    gender: 'L',
    classId: 'XII 1',
    parentName: `Wali dari ${item.name.split(' ')[0]}`,
    parentPhone: `0812${String(70000000 + idx * 11111).slice(0, 8)}`,
    address: 'Pekanbaru, Riau',
    qrCodeData: `SMAIT-${padNis}-${nisn}`,
    status: 'aktif',
    createdDate: '2024-07-15',
  };
});

// Additional classes to ensure comprehensive school dataset
export const ADDITIONAL_STUDENTS: Student[] = [
  // Kelas XI 1
  {
    id: 'std-xi1-01',
    nis: '252610001',
    nisn: '0082100010',
    name: 'Ahmad Faiz Al-Kautsar',
    gender: 'L',
    classId: 'XI 1',
    parentName: 'H. Lukman Hakim',
    parentPhone: '081277112233',
    address: 'Jl. Riau No. 12 Pekanbaru',
    qrCodeData: 'SMAIT-252610001-0082100010',
    status: 'aktif',
    createdDate: '2024-07-15',
  },
  {
    id: 'std-xi1-02',
    nis: '252610002',
    nisn: '0082100011',
    name: 'Aisyah Putri Azzahra',
    gender: 'P',
    classId: 'XI 1',
    parentName: 'dr. Hendra',
    parentPhone: '081388992211',
    address: 'Komplek Chevron Rumbai',
    qrCodeData: 'SMAIT-252610002-0082100011',
    status: 'aktif',
    createdDate: '2024-07-15',
  },
  {
    id: 'std-xi1-03',
    nis: '252610003',
    nisn: '0082100012',
    name: 'Bilal Ar-Rasyid',
    gender: 'L',
    classId: 'XI 1',
    parentName: 'Budi Santoso',
    parentPhone: '085299443322',
    address: 'Jl. Tuanku Tambusai No. 8',
    qrCodeData: 'SMAIT-252610003-0082100012',
    status: 'aktif',
    createdDate: '2024-07-15',
  },
  // Kelas X 1
  {
    id: 'std-x1-01',
    nis: '262710001',
    nisn: '0093100010',
    name: 'Khansa Naura Mumtaza',
    gender: 'P',
    classId: 'X 1',
    parentName: 'Ir. Agus Wijaya',
    parentPhone: '082155667788',
    address: 'Jl. Paus No. 19 Marpoyan',
    qrCodeData: 'SMAIT-262710001-0093100010',
    status: 'aktif',
    createdDate: '2024-07-15',
  },
  {
    id: 'std-x1-02',
    nis: '262710002',
    nisn: '0093100011',
    name: 'Muhammad Zaidan Robbani',
    gender: 'L',
    classId: 'X 1',
    parentName: 'Drs. Supriyanto',
    parentPhone: '081298765432',
    address: 'Jl. Sudirman No. 45',
    qrCodeData: 'SMAIT-262710002-0093100011',
    status: 'aktif',
    createdDate: '2024-07-15',
  },
];

export const ALL_INITIAL_STUDENTS: Student[] = [
  ...STUDENTS_XII_1,
  ...ADDITIONAL_STUDENTS,
];

// Generate Seed attendance including today's specific Sakit, Izin, and Alpa students
export function generateSeedAttendance(students: Student[], categories: AttendanceCategory[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const morningCat = categories.find(c => c.code === 'PAGI') || categories[0];
  const dzuhurCat = categories.find(c => c.code === 'DZUHUR') || categories[1];
  const asharCat = categories.find(c => c.code === 'ASHAR') || categories[2];

  // Specific today scenario for XII 1 students so the dashboard directly shows who is Sakit, Izin, Alpa:
  // 1. ADIB ZADA -> SAKIT ("Demam tinggi dan flu, surat dokter dari RS Chevron Rumbai")
  // 2. FADHIL AL ANSORI -> IZIN ("Menghadiri wisuda kakak kandung di Universitas Riau")
  // 3. NAWABIL ALNAZURA -> ALPA ("Belum ada keterangan / nomor wali belum terhubung")
  // 4. HELMI MUSTAFA ALI -> TERLAMBAT ("Macet di perempatan simpang Panam, tiba 07:18 WIB")
  // 5. ASYROF ALHATIM -> SAKIT ("Cedera engkel kaki saat latihan futsal")
  // Others -> HADIR

  students.forEach((student, index) => {
    let morningStatus: AttendanceRecord['status'] = 'hadir';
    let morningTime = '06:52:14';
    let notes = '';

    if (student.nis === '242510005') { // ADIB ZADA
      morningStatus = 'sakit';
      morningTime = '07:05:00';
      notes = 'Demam tinggi dan flu, surat dokter terlampir';
    } else if (student.nis === '242510037') { // FADHIL AL ANSORI
      morningStatus = 'izin';
      morningTime = '07:00:00';
      notes = 'Menghadiri wisuda kakak di Universitas Riau';
    } else if (student.nis === '242510083') { // NAWABIL ALNAZURA
      morningStatus = 'alpa';
      morningTime = '-';
      notes = 'Belum ada konfirmasi kedatangan saat rekap pagi';
    } else if (student.nis === '242510052') { // HELMI MUSTAFA ALI
      morningStatus = 'terlambat';
      morningTime = '07:18:42';
      notes = 'Ban sepeda motor bocor di Jl. Riau';
    } else if (student.nis === '242510021') { // ASYROF ALHATIM
      morningStatus = 'sakit';
      morningTime = '07:08:00';
      notes = 'Cedera engkel kaki istirahat di UKS';
    } else if (index % 11 === 0 && student.classId !== 'XII 1') {
      morningStatus = 'terlambat';
      morningTime = '07:16:30';
      notes = 'Terlambat 16 menit';
    }

    records.push({
      id: `att-today-${student.id}-pagi`,
      studentId: student.id,
      studentNis: student.nis,
      studentName: student.name,
      classId: student.classId,
      categoryId: morningCat.id,
      categoryName: morningCat.name,
      date: todayStr,
      time: morningTime,
      status: morningStatus,
      notes: notes || undefined,
      method: index % 4 === 0 ? 'manual' : 'qr_scan',
      verifiedBy: 'alkis',
      notifiedParent: morningStatus !== 'hadir',
      parentNotifiedAt: morningStatus !== 'hadir' ? `${todayStr} 07:35:00` : undefined,
    });

    // Sholat Dzuhur for present students
    if (morningStatus === 'hadir' || morningStatus === 'terlambat') {
      const isLateDzuhur = index === 7;
      records.push({
        id: `att-today-${student.id}-dzuhur`,
        studentId: student.id,
        studentNis: student.nis,
        studentName: student.name,
        classId: student.classId,
        categoryId: dzuhurCat.id,
        categoryName: dzuhurCat.name,
        date: todayStr,
        time: isLateDzuhur ? '12:15:30' : '11:54:10',
        status: isLateDzuhur ? 'terlambat' : 'hadir',
        notes: isLateDzuhur ? 'Masuk shaf kedua' : 'Shaf pertama berjamaah di Masjid Al Ittihad',
        method: 'qr_scan',
        verifiedBy: 'ustadz_fauzi',
        notifiedParent: false,
      });
    }

    // Sholat Ashar
    if (index % 2 === 0 && (morningStatus === 'hadir' || morningStatus === 'terlambat')) {
      records.push({
        id: `att-today-${student.id}-ashar`,
        studentId: student.id,
        studentNis: student.nis,
        studentName: student.name,
        classId: student.classId,
        categoryId: asharCat.id,
        categoryName: asharCat.name,
        date: todayStr,
        time: '15:24:00',
        status: 'hadir',
        notes: 'Masjid Al Ittihad',
        method: 'qr_scan',
        verifiedBy: 'alkis',
        notifiedParent: false,
      });
    }
  });

  // Generate historical records spanning the academic year (Months: Juli s/d sekarang)
  // for the individual student 1-year academic transcript!
  const monthsToSeed = [7, 8, 9, 10]; // Juli, Agustus, September, Oktober
  const currentYear = today.getFullYear();

  monthsToSeed.forEach((m) => {
    // Generate 5 days sample per month
    const daysSample = [3, 8, 14, 21, 27];
    daysSample.forEach((d) => {
      const dStr = `${currentYear}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (dStr === todayStr) return;

      students.forEach((student, idx) => {
        const hash = (idx * 5 + m * 7 + d * 11) % 100;
        let status: AttendanceRecord['status'] = 'hadir';
        let time = '06:51:00';
        let note = '';

        if (hash < 5) {
          status = 'terlambat';
          time = '07:15:00';
          note = 'Terlambat perjalanan';
        } else if (hash === 6) {
          status = 'sakit';
          time = '07:00:00';
          note = 'Sakit demam / flu';
        } else if (hash === 7) {
          status = 'izin';
          time = '07:00:00';
          note = 'Izin keperluan keluarga';
        } else if (hash === 8) {
          status = 'alpa';
          time = '07:35:00';
          note = 'Tanpa surat keterangan';
        }

        records.push({
          id: `att-year-${dStr}-${student.id}`,
          studentId: student.id,
          studentNis: student.nis,
          studentName: student.name,
          classId: student.classId,
          categoryId: morningCat.id,
          categoryName: morningCat.name,
          date: dStr,
          time,
          status,
          notes: note || undefined,
          method: 'qr_scan',
          verifiedBy: 'alkis',
          notifiedParent: status !== 'hadir',
        });
      });
    });
  });

  return records;
}

export const StorageService = {
  getCurrentUser(): User {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_USERS[0];
  },

  setCurrentUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  getUsers(): User[] {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  },

  saveUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getCategories(): AttendanceCategory[] {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  },

  saveCategories(categories: AttendanceCategory[]) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getStudents(): Student[] {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If already has XII 1 students, return them
          const hasXii1 = parsed.some((s: Student) => s.classId === 'XII 1');
          if (hasXii1) return parsed;
        }
      } catch {
        // fallback
      }
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(ALL_INITIAL_STUDENTS));
    return ALL_INITIAL_STUDENTS;
  },

  saveStudents(students: Student[]) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  getAttendance(): AttendanceRecord[] {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    const cats = this.getCategories();
    const students = this.getStudents();
    const seeded = generateSeedAttendance(students, cats);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(seeded));
    return seeded;
  },

  saveAttendance(attendance: AttendanceRecord[]) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  },

  getLetterhead(): LetterheadConfig {
    const saved = localStorage.getItem(STORAGE_KEYS.LETTERHEAD);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    localStorage.setItem(STORAGE_KEYS.LETTERHEAD, JSON.stringify(DEFAULT_LETTERHEAD));
    return DEFAULT_LETTERHEAD;
  },

  saveLetterhead(letterhead: LetterheadConfig) {
    localStorage.setItem(STORAGE_KEYS.LETTERHEAD, JSON.stringify(letterhead));
  },

  getApiConfig(): ApiSyncConfig {
    const saved = localStorage.getItem(STORAGE_KEYS.API_CONFIG);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    const defaultConfig: ApiSyncConfig = {
      apiUrl: 'https://api-pusat.alittihad.sch.id/v2/presensi/sync',
      apiKey: 'SEC-ALITTIHAD-2024-LIVE-KEY-9948',
      schoolCode: 'SMAIT-PKU-01',
      autoSyncEnabled: true,
      syncIntervalMinutes: 30,
      lastSyncTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      syncStatus: 'idle',
      lastSyncMessage: 'Tersambung dengan Server Pusat Yayasan Kesatuan Pendidikan Islam Al Ittihad',
    };
    localStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(defaultConfig));
    return defaultConfig;
  },

  saveApiConfig(config: ApiSyncConfig) {
    localStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(config));
  },

  getSyncLogs(): SyncLog[] {
    const saved = localStorage.getItem(STORAGE_KEYS.SYNC_LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    const defaultLogs: SyncLog[] = [
      {
        id: 'sync-1',
        timestamp: new Date().toLocaleDateString('id-ID') + ' 07:45:10',
        status: 'success',
        recordsSent: 29,
        recordsReceived: 0,
        message: 'Presensi Sesi Pagi Kelas XII 1 berhasil disinkronkan ke Cloud Pusdatin.',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(defaultLogs));
    return defaultLogs;
  },

  saveSyncLogs(logs: SyncLog[]) {
    localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(logs));
  },

  getNotifications(): NotificationLog[] {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  },

  saveNotifications(logs: NotificationLog[]) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(logs));
  },

  resetToDefault() {
    localStorage.clear();
    const seededAttendance = generateSeedAttendance(ALL_INITIAL_STUDENTS, DEFAULT_CATEGORIES);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(ALL_INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(seededAttendance));
    localStorage.setItem(STORAGE_KEYS.LETTERHEAD, JSON.stringify(DEFAULT_LETTERHEAD));
    return {
      users: DEFAULT_USERS,
      categories: DEFAULT_CATEGORIES,
      students: ALL_INITIAL_STUDENTS,
      attendance: seededAttendance,
      letterhead: DEFAULT_LETTERHEAD,
    };
  }
};
