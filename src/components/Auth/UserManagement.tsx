import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Edit2,
  Key,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  onAddUser: (u: User) => void;
  onUpdateUser: (id: string, u: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onResetSystemData: () => void;
  onSwitchUser: (u: User) => void;
}

export function UserManagement({
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onResetSystemData,
  onSwitchUser,
}: UserManagementProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('guru');
  const [newEmail, setNewEmail] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim()) return;

    onAddUser({
      id: `usr-${Date.now()}`,
      username: newUsername.trim().toLowerCase(),
      name: newName.trim(),
      role: newRole,
      email: newEmail.trim() || undefined,
    });

    setNewUsername('');
    setNewName('');
    setNewEmail('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            Hak Akses & Otorisasi
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Manajemen Pengguna & Level Admin</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Kelola hak akses untuk Kepala Sekolah (Super Admin), Guru Piket / Wali Kelas, dan Staf Tata Usaha.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Add User Form Drawer */}
      {isAddOpen && (
        <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 shadow-inner animate-fade-in">
          <h3 className="font-bold text-emerald-950 text-sm mb-3">
            Form Tambah Petugas / Guru Baru
          </h3>
          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ust. Ridwan, S.Pd.I"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username Login *
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="ridwan_guru"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Peran / Level Akses
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="guru">Guru Piket / Wali Kelas</option>
                <option value="staf_tu">Staf Tata Usaha (TU)</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
              >
                Simpan Akun
              </button>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-3 py-2 border border-slate-200 bg-white text-slate-600 rounded-xl text-xs font-medium"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Role explanation cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
          <div className="flex items-center gap-2 mb-1.5 font-bold text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Super Admin (Kepala Sekolah)</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Akses tak terbatas: konfigurasi jadwal, hapus data, sinkronisasi API pusat, manajemen hak akses, dan ekspor dokumen legal.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
          <div className="flex items-center gap-2 mb-1.5 font-bold text-emerald-900">
            <UserIcon className="w-4 h-4 text-emerald-600" />
            <span>Guru Piket / Wali Kelas</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Dapat menjalankan pemindai QR Code, input absensi manual, melihat rekap kelas, dan mengirim notifikasi WA ke orang tua santri.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
          <div className="flex items-center gap-2 mb-1.5 font-bold text-blue-900">
            <Key className="w-4 h-4 text-blue-600" />
            <span>Staf Tata Usaha (TU)</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Pengelolaan database siswa, import massal file Excel, cetak kartu QR siswa, dan arsip laporan bulanan.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Daftar Akun Pengguna Terdaftar</h3>
          <span className="text-xs text-slate-500 font-mono">Password Default: 30052000</span>
        </div>

        <div className="divide-y divide-slate-100">
          {users.map((u) => {
            const isSelf = u.id === currentUser.id;

            return (
              <div
                key={u.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{u.name}</h4>
                      {isSelf && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Sedang Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono">@{u.username} • {u.email || 'tanpa email'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      u.role === 'super_admin'
                        ? 'bg-amber-100 text-amber-800'
                        : u.role === 'guru'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {u.role.replace('_', ' ')}
                  </span>

                  {!isSelf && (
                    <button
                      onClick={() => onSwitchUser(u)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                    >
                      Beralih Akun
                    </button>
                  )}

                  {users.length > 1 && !isSelf && currentUser.role === 'super_admin' && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus akun ${u.name}?`)) {
                          onDeleteUser(u.id);
                        }
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus Akun"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Factory Reset Section */}
      {currentUser.role === 'super_admin' && (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>Reset Data Demo Sistem</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Kembalikan seluruh database santri, presensi, dan kategori ke pengaturan awal SMA IT AL ITTIHAD.
            </p>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin mengatur ulang data ke default pabrik?')) {
                onResetSystemData();
              }
            }}
            className="px-4 py-2 bg-slate-200 hover:bg-rose-600 hover:text-white text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Reset Database ke Awal
          </button>
        </div>
      )}
    </div>
  );
}
