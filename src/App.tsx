/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Student,
  AttendanceRecord,
  AttendanceCategory,
  User,
  ApiSyncConfig,
  SyncLog,
  NotificationLog,
  AttendanceStatus,
} from './types';
import { StorageService } from './services/storage';
import { ApiSyncService } from './services/apiSyncService';
import { soundFx } from './services/audioService';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { QrScannerView } from './components/Scanner/QrScannerView';
import { AttendanceTable } from './components/Attendance/AttendanceTable';
import { ManualAttendanceModal } from './components/Attendance/ManualAttendanceModal';
import { MonthlyRecapMatrix } from './components/Recap/MonthlyRecapMatrix';
import { StudentList } from './components/Students/StudentList';
import { CategoryManager } from './components/Categories/CategoryManager';
import { ParentNotificationCenter } from './components/Notifications/ParentNotificationCenter';
import { ApiConfigView } from './components/Sync/ApiConfigView';
import { UserManagement } from './components/Auth/UserManagement';
import { LoginModal } from './components/Auth/LoginModal';

export default function App() {
  // Application Data States
  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getCurrentUser());
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [students, setStudents] = useState<Student[]>(() => StorageService.getStudents());
  const [categories, setCategories] = useState<AttendanceCategory[]>(() => StorageService.getCategories());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => StorageService.getAttendance());
  const [apiConfig, setApiConfig] = useState<ApiSyncConfig>(() => StorageService.getApiConfig());
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(() => StorageService.getSyncLogs());
  const [notifications, setNotifications] = useState<NotificationLog[]>(() => StorageService.getNotifications());

  // UI States
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  // Today string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Save changes to localStorage
  useEffect(() => {
    StorageService.setCurrentUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    StorageService.saveUsers(users);
  }, [users]);

  useEffect(() => {
    StorageService.saveStudents(students);
  }, [students]);

  useEffect(() => {
    StorageService.saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    StorageService.saveAttendance(attendanceRecords);
  }, [attendanceRecords]);

  useEffect(() => {
    StorageService.saveApiConfig(apiConfig);
  }, [apiConfig]);

  useEffect(() => {
    StorageService.saveSyncLogs(syncLogs);
  }, [syncLogs]);

  useEffect(() => {
    StorageService.saveNotifications(notifications);
  }, [notifications]);

  // Periodic Auto-Sync simulation if enabled
  useEffect(() => {
    if (!apiConfig.autoSyncEnabled) return;

    const intervalMinutes = apiConfig.syncIntervalMinutes || 30;
    const intervalMs = intervalMinutes * 60 * 1000;

    const timer = setInterval(async () => {
      try {
        const result = await ApiSyncService.performSync(apiConfig, students, attendanceRecords);
        setApiConfig(result.updatedConfig);
        setSyncLogs(StorageService.getSyncLogs());
      } catch (err) {
        console.warn('Auto sync failed:', err);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [apiConfig, students, attendanceRecords]);

  // Total Alpa today for notification badge
  const totalAlpaToday = attendanceRecords.filter(
    r => r.date === todayStr && r.status === 'alpa' && !r.notifiedParent
  ).length;

  // Handlers
  const handleAddAttendance = useCallback((recordData: Omit<AttendanceRecord, 'id'>) => {
    const newRecord: AttendanceRecord = {
      ...recordData,
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    };

    setAttendanceRecords(prev => [newRecord, ...prev]);
  }, []);

  const handleUpdateStatus = useCallback((recordId: string, newStatus: AttendanceStatus, notes?: string) => {
    setAttendanceRecords(prev =>
      prev.map(r => {
        if (r.id === recordId) {
          return {
            ...r,
            status: newStatus,
            notes: notes !== undefined ? notes : r.notes,
            notifiedParent: newStatus !== 'hadir' ? r.notifiedParent : false,
          };
        }
        return r;
      })
    );
  }, []);

  const handleDeleteRecord = useCallback((recordId: string) => {
    setAttendanceRecords(prev => prev.filter(r => r.id !== recordId));
  }, []);

  const handleAddStudent = useCallback((data: Omit<Student, 'id' | 'qrCodeData' | 'createdDate'>) => {
    const newStudent: Student = {
      ...data,
      id: `std-${Date.now()}`,
      qrCodeData: `SMAIT-${data.nis}-${data.nisn}`,
      createdDate: new Date().toISOString().split('T')[0],
    };

    setStudents(prev => [newStudent, ...prev]);
  }, []);

  const handleUpdateStudent = useCallback((id: string, data: Partial<Student>) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === id) {
          const updated = { ...s, ...data };
          if (data.nis || data.nisn) {
            updated.qrCodeData = `SMAIT-${updated.nis}-${updated.nisn}`;
          }
          return updated;
        }
        return s;
      })
    );
  }, []);

  const handleDeleteStudent = useCallback((id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setAttendanceRecords(prev => prev.filter(r => r.studentId !== id));
  }, []);

  const handleBulkImportStudents = useCallback((imported: Omit<Student, 'id' | 'qrCodeData' | 'createdDate'>[]) => {
    const today = new Date().toISOString().split('T')[0];
    const newStudents: Student[] = imported.map((data, idx) => ({
      ...data,
      id: `std-bulk-${Date.now()}-${idx}`,
      qrCodeData: `SMAIT-${data.nis}-${data.nisn}`,
      createdDate: today,
    }));

    setStudents(prev => [...newStudents, ...prev]);
  }, []);

  const handleAddCategory = useCallback((cat: Omit<AttendanceCategory, 'id'>) => {
    const newCat: AttendanceCategory = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories(prev => [...prev, newCat]);
  }, []);

  const handleUpdateCategory = useCallback((id: string, data: Partial<AttendanceCategory>) => {
    setCategories(prev =>
      prev.map(c => (c.id === id ? { ...c, ...data } : c))
    );
  }, []);

  const handleDeleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleSendSingleWhatsApp = useCallback((record: AttendanceRecord) => {
    setAttendanceRecords(prev =>
      prev.map(r => (r.id === record.id ? { ...r, notifiedParent: true, parentNotifiedAt: new Date().toLocaleString('id-ID') } : r))
    );
  }, []);

  const handleSendBatchWhatsApp = useCallback((records: AttendanceRecord[]) => {
    const ids = new Set(records.map(r => r.id));
    const nowStr = new Date().toLocaleString('id-ID');

    setAttendanceRecords(prev =>
      prev.map(r => (ids.has(r.id) ? { ...r, notifiedParent: true, parentNotifiedAt: nowStr } : r))
    );

    // Simulate opening bulk notification summary
    alert(`Berhasil mengirimkan ${records.length} pesan pemberitahuan WhatsApp ke seluruh wali siswa.`);
  }, []);

  const handleResetSystemData = useCallback(() => {
    const seeded = StorageService.resetToDefault();
    setUsers(seeded.users);
    setCurrentUser(seeded.users[0]);
    setCategories(seeded.categories);
    setStudents(seeded.students);
    const newRecords = StorageService.getAttendance();
    setAttendanceRecords(newRecords);
    alert('Sistem berhasil diatur ulang ke data awal SMA IT AL ITTIHAD.');
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        apiConfig={apiConfig}
        onOpenScanner={() => setCurrentTab('scanner')}
        onOpenSync={() => setCurrentTab('sync')}
        onLogout={() => setIsLoginModalOpen(true)}
        onToggleSidebarMobile={() => setIsMobileSidebarOpen(prev => !prev)}
      />

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          currentUser={currentUser}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          totalAlpaToday={totalAlpaToday}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              students={students}
              categories={categories}
              attendanceRecords={attendanceRecords}
              currentUser={currentUser}
              onNavigate={(tab) => setCurrentTab(tab)}
              onQuickScan={() => setCurrentTab('scanner')}
              onManualAttendance={() => setIsManualModalOpen(true)}
              onSyncApi={() => setCurrentTab('sync')}
              onSendWhatsApp={handleSendSingleWhatsApp}
              onSelectClassFilter={(cls) => {
                setSelectedClassFilter(cls);
                setCurrentTab('presensi');
              }}
            />
          )}

          {currentTab === 'scanner' && (
            <QrScannerView
              students={students}
              categories={categories.filter(c => c.isActive)}
              attendanceRecords={attendanceRecords}
              onAddAttendance={handleAddAttendance}
              currentUserRole={currentUser.name}
            />
          )}

          {currentTab === 'presensi' && (
            <AttendanceTable
              records={attendanceRecords}
              students={students}
              categories={categories}
              currentUserId={currentUser.name}
              userRole={currentUser.role}
              initialClassFilter={selectedClassFilter}
              onAddRecord={handleAddAttendance}
              onUpdateStatus={handleUpdateStatus}
              onDeleteRecord={handleDeleteRecord}
              onSendWhatsApp={handleSendSingleWhatsApp}
            />
          )}

          {currentTab === 'rekap' && (
            <MonthlyRecapMatrix
              students={students}
              records={attendanceRecords}
              categories={categories}
            />
          )}

          {currentTab === 'siswa' && (
            <StudentList
              students={students}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onBulkImport={handleBulkImportStudents}
              userRole={currentUser.role}
            />
          )}

          {currentTab === 'kategori' && (
            <CategoryManager
              categories={categories}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              userRole={currentUser.role}
            />
          )}

          {currentTab === 'notifikasi' && (
            <ParentNotificationCenter
              students={students}
              records={attendanceRecords}
              categories={categories}
              notifications={notifications}
              onSendBatchNotification={handleSendBatchWhatsApp}
              onSendSingleNotification={handleSendSingleWhatsApp}
            />
          )}

          {currentTab === 'sync' && (
            <ApiConfigView
              config={apiConfig}
              logs={syncLogs}
              students={students}
              attendance={attendanceRecords}
              onSaveConfig={(cfg) => setApiConfig(cfg)}
              onSyncComplete={(cfg) => {
                setApiConfig(cfg);
                setSyncLogs(StorageService.getSyncLogs());
              }}
            />
          )}

          {currentTab === 'akses' && (
            <UserManagement
              users={users}
              currentUser={currentUser}
              onAddUser={(u) => setUsers(prev => [...prev, u])}
              onUpdateUser={(id, data) => setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u))}
              onDeleteUser={(id) => setUsers(prev => prev.filter(u => u.id !== id))}
              onResetSystemData={handleResetSystemData}
              onSwitchUser={(u) => setCurrentUser(u)}
            />
          )}
        </main>
      </div>

      {/* Manual Attendance Modal */}
      {isManualModalOpen && (
        <ManualAttendanceModal
          students={students}
          categories={categories.filter(c => c.isActive)}
          currentUserId={currentUser.name}
          onSaveRecord={handleAddAttendance}
          onClose={() => setIsManualModalOpen(false)}
        />
      )}

      {/* Login & Switch User Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        users={users}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          setIsLoginModalOpen(false);
        }}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
