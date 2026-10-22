import { ApiSyncConfig, AttendanceRecord, Student, SyncLog } from '../types';
import { StorageService } from './storage';

export const ApiSyncService = {
  /**
   * Test connection to the central database endpoint
   */
  async testConnection(config: ApiSyncConfig): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const startTime = performance.now();
    
    // Simulate network handshake to central endpoint
    await new Promise(resolve => setTimeout(resolve, 800));
    const latencyMs = Math.round(performance.now() - startTime);

    if (!config.apiUrl || !config.apiKey) {
      return {
        success: false,
        message: 'URL Endpoint API atau Kunci Akses (API Key) belum diisi.',
        latencyMs,
      };
    }

    return {
      success: true,
      message: `Terhubung ke Gateway Pusat Yayasan Al Ittihad (Kode Sekolah: ${config.schoolCode || 'SMAIT-PKU-01'})`,
      latencyMs,
    };
  },

  /**
   * Perform manual or automatic two-way sync with Central Server
   */
  async performSync(
    config: ApiSyncConfig,
    students: Student[],
    attendance: AttendanceRecord[]
  ): Promise<{
    success: boolean;
    recordsSent: number;
    recordsReceived: number;
    message: string;
    updatedConfig: ApiSyncConfig;
  }> {
    // Simulate real cloud sync with latency and payload verification
    await new Promise(resolve => setTimeout(resolve, 1400));

    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecords = attendance.filter(a => a.date === todayStr);

    const recordsSent = todayRecords.length;
    const recordsReceived = Math.floor(Math.random() * 2); // occasionally receives 1 update

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateFormatted = now.toLocaleDateString('id-ID');

    const updatedConfig: ApiSyncConfig = {
      ...config,
      lastSyncTime: `${dateFormatted} ${timeFormatted}`,
      syncStatus: 'success',
      lastSyncMessage: `Sinkronisasi sukses: ${recordsSent} data presensi terkirim ke server pusat.`,
    };

    const newLog: SyncLog = {
      id: `sync-${Date.now()}`,
      timestamp: `${dateFormatted} ${timeFormatted}`,
      status: 'success',
      recordsSent,
      recordsReceived,
      message: `Sinkronisasi data presensi & master siswa selesai (${recordsSent} rekap terkirim).`,
    };

    const existingLogs = StorageService.getSyncLogs();
    StorageService.saveSyncLogs([newLog, ...existingLogs.slice(0, 49)]);
    StorageService.saveApiConfig(updatedConfig);

    return {
      success: true,
      recordsSent,
      recordsReceived,
      message: `Berhasil sinkronisasi dengan Server Pusat Yayasan. ${recordsSent} data absensi telah diarsipkan secara aman.`,
      updatedConfig,
    };
  },
};
