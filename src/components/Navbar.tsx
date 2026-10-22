import { useState, useEffect } from 'react';
import { User, ApiSyncConfig } from '../types';
import { SchoolLogo } from './common/SchoolLogo';
import {
  Clock,
  QrCode,
  CloudCheck,
  RefreshCw,
  LogOut,
  ChevronDown,
  User as UserIcon,
  Shield,
  Menu,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  apiConfig: ApiSyncConfig;
  onOpenScanner: () => void;
  onOpenSync: () => void;
  onLogout: () => void;
  onToggleSidebarMobile: () => void;
}

export function Navbar({
  currentUser,
  apiConfig,
  onOpenScanner,
  onOpenSync,
  onLogout,
  onToggleSidebarMobile,
}: NavbarProps) {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
      setDateStr(now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebarMobile}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <SchoolLogo size="md" />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-900 text-base leading-tight tracking-tight">
                  SMA IT AL ITTIHAD
                </h1>
                <span className="hidden xl:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Akreditasi A
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 font-medium">
                Sistem Presensi Siswa & Sholat Berjamaah Real-Time
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Clock & Hijri/Indonesian Date */}
        <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 shadow-inner">
          <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{timeStr}</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="font-medium text-slate-700">{dateStr}</span>
        </div>

        {/* Right: Quick Scan, API Status & User Menu */}
        <div className="flex items-center gap-2.5">
          {/* Central Cloud API Status */}
          <button
            onClick={onOpenSync}
            title={`Status Sinkronisasi API: ${apiConfig.lastSyncMessage || 'Aktif'}`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>API Pusat</span>
          </button>

          {/* Direct Scan QR Button */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition active:scale-95"
          >
            <QrCode className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Pindai QR</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-tight max-w-[120px] truncate">
                  {currentUser.name.split(',')[0]}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold capitalize">
                  {currentUser.role.replace('_', ' ')}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-slate-200 p-2 z-50 animate-fade-in text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-slate-400 font-mono text-[10px]">@{currentUser.username}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>

                <div className="pt-1.5">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenSync();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition"
                  >
                    <RefreshCw className="w-4 h-4 text-emerald-600" />
                    <span>Sinkronisasi Data Pusat</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar / Ganti Akun</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
