import React, { useState } from 'react';
import { ApiSyncConfig, SyncLog, Student, AttendanceRecord } from '../../types';
import { ApiSyncService } from '../../services/apiSyncService';
import {
  Server,
  CloudCheck,
  RefreshCw,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Download,
  Upload,
  Globe,
  Database,
} from 'lucide-react';

interface ApiConfigViewProps {
  config: ApiSyncConfig;
  logs: SyncLog[];
  students: Student[];
  attendance: AttendanceRecord[];
  onSaveConfig: (cfg: ApiSyncConfig) => void;
  onSyncComplete: (cfg: ApiSyncConfig) => void;
}

export function ApiConfigView({
  config,
  logs,
  students,
  attendance,
  onSaveConfig,
  onSyncComplete,
}: ApiConfigViewProps) {
  const [formData, setFormData] = useState<ApiSyncConfig>({ ...config });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs: number } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await ApiSyncService.testConnection(formData);
      setTestResult(res);
    } catch {
      setTestResult({
        success: false,
        message: 'Koneksi gagal ke server pusat.',
        latencyMs: 0,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await ApiSyncService.performSync(formData, students, attendance);
      onSyncComplete(res.updatedConfig);
      setSyncFeedback(res.message);
    } catch {
      setSyncFeedback('Terjadi kesalahan saat menghubungi API gateway.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Export full JSON backup
  const handleExportBackup = () => {
    const backupData = {
      school: 'SMA IT AL ITTIHAD',
      version: '2.0-cloud',
      exportedAt: new Date().toISOString(),
      students,
      attendance,
      config: formData,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Backup_Presensi_SMAIT_AlIttihad_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            Integrasi Pusdatin & Yayasan
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Sinkronisasi Database Pusat</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Sinkronisasi dua arah dengan server pusat Yayasan Al Ittihad dan Dapodik Kemendikbudristek secara aman (TLS/HTTPS).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Cadangkan Data (JSON)</span>
          </button>

          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
          </button>
        </div>
      </div>

      {syncFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Grid: Settings form + Status card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-600" />
              <span>Konfigurasi Endpoint API Gateway</span>
            </h3>
            <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
              REST v2.4 (SSL)
            </span>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Endpoint API Pusat Yayasan
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={formData.apiUrl}
                  onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                  placeholder="https://api-pusat.alittihad.sch.id/v2/presensi/sync"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kunci Akses API (Secret Key)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Identitas Sekolah
                </label>
                <input
                  type="text"
                  value={formData.schoolCode}
                  onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                  placeholder="SMAIT-PKU-01"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Sinkronisasi Otomatis Berkala</p>
                <p className="text-[11px] text-slate-500">Kirim data presensi tiap 30 menit ke database pusat</p>
              </div>
              <input
                type="checkbox"
                checked={formData.autoSyncEnabled}
                onChange={(e) => setFormData({ ...formData, autoSyncEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  <span>{testResult.message}</span>
                </span>
                {testResult.latencyMs > 0 && (
                  <span className="font-mono font-bold text-[11px]">{testResult.latencyMs} ms</span>
                )}
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{isTesting ? 'Menguji...' : 'Uji Koneksi Server'}</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
              >
                <span>{savedSuccess ? 'Tersimpan!' : 'Simpan Pengaturan'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Sync Status & Activity Logs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-5 rounded-2xl shadow-md border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Status Server Terhubung
            </span>
            <h3 className="text-lg font-black text-white mt-1">Gateway Pusdatin Al Ittihad</h3>
            <p className="text-xs text-slate-300 mt-1">
              {config.lastSyncMessage || 'Tersambung dan aktif'}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Sinkron Terakhir:</span>
              <span className="font-mono font-bold text-amber-300">{config.lastSyncTime || 'Hari ini 07:45 WIB'}</span>
            </div>
          </div>

          {/* Sync History Logs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <History className="w-4 h-4 text-emerald-600" />
                <span>Audit Log Sinkronisasi</span>
              </h4>
              <span className="text-[10px] text-slate-400">Terbaru</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-400">{log.timestamp}</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 rounded">
                      +{log.recordsSent} Record
                    </span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-snug">{log.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
