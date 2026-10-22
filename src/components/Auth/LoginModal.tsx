import React, { useState } from 'react';
import { User } from '../../types';
import { SchoolLogo } from '../common/SchoolLogo';
import { Lock, User as UserIcon, LogIn, Key, Sparkles, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (user: User) => void;
  users: User[];
  onClose?: () => void;
  isOpen: boolean;
}

export function LoginModal({ onLoginSuccess, users, onClose, isOpen }: LoginModalProps) {
  const [username, setUsername] = useState('alkis');
  const [password, setPassword] = useState('30052000');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedUser = username.trim().toLowerCase();

    // Default admin credential check: user 'alkis' & pass '30052000'
    if (trimmedUser === 'alkis' && password === '30052000') {
      const alkisUser = users.find(u => u.username === 'alkis') || users[0];
      onLoginSuccess(alkisUser);
      return;
    }

    // Check other registered users
    const matched = users.find(u => u.username.toLowerCase() === trimmedUser);
    if (matched && password === '30052000') {
      onLoginSuccess(matched);
      return;
    }

    setErrorMsg('Username atau password salah. Password default admin: 30052000');
  };

  const handleQuickLogin = (user: User) => {
    onLoginSuccess(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Islamic Header */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border-8 border-emerald-500/20 pointer-events-none" />

          <div className="flex justify-center mb-3">
            <SchoolLogo size="lg" />
          </div>

          <h3 className="text-xl font-extrabold uppercase tracking-wide text-white">
            SMA IT AL ITTIHAD
          </h3>
          <p className="text-xs text-amber-300 font-semibold mt-0.5">
            Portal Masuk Administrator & Guru Piket
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username Admin / Petugas
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ketik username..."
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi (Default: 30052000)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-700/20 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk ke Sistem</span>
            </button>
          </form>

          {/* Quick Demo Selector */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
              Akses Cepat Berdasarkan Peran
            </p>
            <div className="space-y-1.5">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className="w-full p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/70 text-left transition flex items-center justify-between text-xs group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-emerald-800">{u.name}</p>
                      <p className="text-[10px] text-slate-400">@{u.username}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      u.role === 'super_admin'
                        ? 'bg-amber-100 text-amber-800'
                        : u.role === 'guru'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {u.role.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
