import React from 'react';
import { User } from '../types';
import {
  LayoutDashboard,
  QrCode,
  CalendarCheck2,
  FileSpreadsheet,
  Users,
  Clock,
  MessageSquare,
  Server,
  ShieldCheck,
  X,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: User;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  totalAlpaToday: number;
}

export function Sidebar({
  currentTab,
  onTabChange,
  currentUser,
  isMobileOpen,
  onCloseMobile,
  totalAlpaToday,
}: SidebarProps) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Interaktif',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: undefined,
    },
    {
      id: 'scanner',
      label: 'Pindai QR Code',
      icon: <QrCode className="w-4 h-4 text-emerald-500" />,
      badge: 'Live',
    },
    {
      id: 'presensi',
      label: 'Presensi Harian',
      icon: <CalendarCheck2 className="w-4 h-4" />,
      badge: undefined,
    },
    {
      id: 'rekap',
      label: 'Rekap Bulanan (PDF/XLS)',
      icon: <FileSpreadsheet className="w-4 h-4 text-amber-500" />,
      badge: undefined,
    },
    {
      id: 'siswa',
      label: 'Pengelolaan Siswa',
      icon: <Users className="w-4 h-4" />,
      badge: undefined,
    },
    {
      id: 'kategori',
      label: 'Kategori & Jadwal Sesi',
      icon: <Clock className="w-4 h-4" />,
      badge: undefined,
    },
    {
      id: 'notifikasi',
      label: 'Notifikasi Orang Tua',
      icon: <MessageSquare className="w-4 h-4 text-emerald-600" />,
      badge: totalAlpaToday > 0 ? `${totalAlpaToday} WA` : undefined,
    },
    {
      id: 'sync',
      label: 'Sinkronisasi API Pusat',
      icon: <Server className="w-4 h-4" />,
      badge: undefined,
    },
    {
      id: 'akses',
      label: 'Level Akses Pengguna',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: undefined,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800 shadow-2xl lg:shadow-none`}
      >
        <div>
          {/* Top Header Mobile Close */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                IT
              </div>
              <div>
                <p className="font-extrabold text-white text-xs tracking-wider uppercase">SMA IT AL ITTIHAD</p>
                <p className="text-[10px] text-emerald-400 font-mono">Presensi Digital v2.4</p>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Menu Utama
            </div>

            {navItems.map((item) => {
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-950 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.badge === 'Live'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card in Sidebar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-amber-400 font-medium capitalize">
                {currentUser.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
