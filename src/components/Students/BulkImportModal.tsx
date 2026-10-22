import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Student } from '../../types';
import { ExportService } from '../../services/exportService';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';

interface BulkImportModalProps {
  onImport: (students: Omit<Student, 'id' | 'qrCodeData' | 'createdDate'>[]) => void;
  onClose: () => void;
}

export function BulkImportModal({ onImport, onClose }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Omit<Student, 'id' | 'qrCodeData' | 'createdDate'>[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processExcel(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processExcel(droppedFile);
    }
  };

  const processExcel = async (f: File) => {
    setFile(f);
    setIsParsing(true);
    setErrorMsg(null);

    try {
      const data = await f.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

      if (json.length === 0) {
        setErrorMsg('File Excel tidak memuat baris data.');
        setIsParsing(false);
        return;
      }

      // Map rows safely by inspecting possible column header names
      const studentsList: Omit<Student, 'id' | 'qrCodeData' | 'createdDate'>[] = [];

      for (const row of json) {
        const nis = String(row['NIS'] || row['nis'] || row['Nis'] || '').trim();
        const nisn = String(row['NISN'] || row['nisn'] || row['Nisn'] || nis).trim();
        const name = String(row['Nama'] || row['Nama Siswa'] || row['nama'] || row['Nama Lengkap'] || '').trim();
        const rawGender = String(row['Jenis Kelamin'] || row['Gender'] || row['JK'] || 'L').trim().toUpperCase();
        const gender: 'L' | 'P' = rawGender.startsWith('P') || rawGender === 'PEREMPUAN' || rawGender === 'AKHWAT' ? 'P' : 'L';
        const classId = String(row['Kelas'] || row['kelas'] || row['Rombel'] || 'X-1').trim();
        const parentName = String(row['Nama Orang Tua'] || row['Nama Wali'] || row['Ortu'] || '-').trim();
        const parentPhone = String(row['No WhatsApp Ortu'] || row['No WA'] || row['Telepon'] || row['No HP'] || '081234567890').trim();
        const address = String(row['Alamat'] || row['Domisili'] || '').trim();

        if (name && nis) {
          studentsList.push({
            nis,
            nisn: nisn || nis,
            name,
            gender,
            classId,
            parentName,
            parentPhone,
            address,
            status: 'aktif',
          });
        }
      }

      if (studentsList.length === 0) {
        setErrorMsg('Tidak ditemukan kolom yang cocok (NIS dan Nama Siswa wajib ada). Silakan unduh format template.');
      } else {
        setParsedRows(studentsList);
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('Gagal membaca file Excel. Pastikan file berformat .xlsx atau .xls yang valid.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    onImport(parsedRows);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-lg">
              Import Data Siswa Massal (Excel)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Download Template Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Gunakan Format Resmi Excel SMA IT Al Ittihad</h4>
                <p className="text-xs text-emerald-800">
                  Unduh template untuk memastikan kolom NIS, Nama, Kelas, dan WA Orang Tua tersusun rapi.
                </p>
              </div>
            </div>

            <button
              onClick={() => ExportService.downloadBulkImportTemplate()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 shadow-sm transition active:scale-95 flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Template</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50/50 hover:bg-emerald-50/20 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition">
              <UploadCloud className="w-7 h-7" />
            </div>
            <p className="font-bold text-slate-800 text-sm">
              {file ? file.name : 'Klik untuk memilih file Excel atau drag & drop ke sini'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Mendukung format .xlsx, .xls, atau .csv (maksimal 500 siswa per file)
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview Table if rows parsed */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Pratinjau Data Valid ({parsedRows.length} Calon Siswa Ditemukan):
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  QR Token Otomatis Terbuat
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2">NIS</th>
                      <th className="p-2">Nama Siswa</th>
                      <th className="p-2">Kelas</th>
                      <th className="p-2">JK</th>
                      <th className="p-2">WhatsApp Wali</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 15).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 font-mono">
                        <td className="p-2 font-bold text-slate-800">{row.nis}</td>
                        <td className="p-2 font-sans font-medium text-slate-900">{row.name}</td>
                        <td className="p-2 font-sans">{row.classId}</td>
                        <td className="p-2">{row.gender}</td>
                        <td className="p-2 text-slate-600">{row.parentPhone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 15 && (
                <p className="text-[11px] text-slate-400 text-center">
                  ... dan {parsedRows.length - 15} siswa lainnya siap diimpor.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-sm font-medium transition"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0 || isParsing}
            onClick={handleConfirmImport}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold transition shadow-sm ${
              parsedRows.length > 0 && !isParsing
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Impor {parsedRows.length} Siswa Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
}
