import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AttendanceRecord, Student, LetterheadConfig, ExportCustomOptions } from '../types';

export const ExportService = {
  /**
   * Export daily/filtered attendance records to Excel with customizable columns
   */
  exportAttendanceToExcel(
    records: AttendanceRecord[],
    title: string = 'Rekap_Presensi_SMA_IT_AL_ITTIHAD',
    options?: Partial<ExportCustomOptions>
  ) {
    const data = records.map((r, index) => {
      const row: Record<string, string | number> = {
        No: index + 1,
        Tanggal: r.date,
        Waktu: r.time,
      };

      if (options?.includeNis !== false) row['NIS'] = r.studentNis;
      row['Nama Siswa'] = r.studentName;
      if (options?.includeClass !== false) row['Kelas'] = r.classId;
      row['Kategori Sesi'] = r.categoryName;
      row['Status'] = r.status.toUpperCase();
      row['Metode Absensi'] = r.method === 'qr_scan' ? 'Scan QR Code' : 'Input Manual';
      if (options?.includeNotes !== false) row['Keterangan'] = r.notes || '-';
      row['Petugas'] = r.verifiedBy;

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Presensi');
    XLSX.writeFile(workbook, `${title}_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  /**
   * Export Monthly Attendance Matrix (Dates 1-31 x Students) to Excel
   */
  exportMonthlyMatrixToExcel(
    students: Student[],
    records: AttendanceRecord[],
    year: number,
    month: number,
    className?: string,
    categoryName?: string,
    letterhead?: LetterheadConfig
  ) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const filteredStudents = className && className !== 'all' && className !== 'Semua Kelas'
      ? students.filter(s => s.classId === className) 
      : students;

    const rows: Record<string, string | number>[] = [];

    filteredStudents.forEach((student, index) => {
      const studentRecords = records.filter(
        r => r.studentId === student.id &&
             new Date(r.date).getFullYear() === year &&
             new Date(r.date).getMonth() + 1 === month
      );

      let hadirCount = 0;
      let terlambatCount = 0;
      let izinCount = 0;
      let sakitCount = 0;
      let alpaCount = 0;

      const rowObj: Record<string, string | number> = {
        No: index + 1,
        NIS: student.nis,
        'Nama Siswa': student.name,
        Kelas: student.classId,
      };

      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayRecord = studentRecords.find(r => r.date === dayStr);

        let code = '-';
        if (dayRecord) {
          switch (dayRecord.status) {
            case 'hadir':
              code = 'H';
              hadirCount++;
              break;
            case 'terlambat':
              code = 'T';
              terlambatCount++;
              break;
            case 'izin':
              code = 'I';
              izinCount++;
              break;
            case 'sakit':
              code = 'S';
              sakitCount++;
              break;
            case 'alpa':
              code = 'A';
              alpaCount++;
              break;
          }
        }
        rowObj[`Tgl ${day}`] = code;
      }

      const totalRecorded = hadirCount + terlambatCount + izinCount + sakitCount + alpaCount;
      const effectivePresent = hadirCount + terlambatCount;
      const percentage = totalRecorded > 0 ? Math.round((effectivePresent / totalRecorded) * 100) : 0;

      rowObj['Hadir (H)'] = hadirCount;
      rowObj['Terlambat (T)'] = terlambatCount;
      rowObj['Izin (I)'] = izinCount;
      rowObj['Sakit (S)'] = sakitCount;
      rowObj['Alpa (A)'] = alpaCount;
      rowObj['% Kehadiran'] = `${percentage}%`;

      rows.push(rowObj);
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap ${monthNames[month - 1]}`);
    XLSX.writeFile(workbook, `Rekap_${letterhead?.schoolName || 'SMAIT'}_${monthNames[month - 1]}_${year}_${className || 'Semua'}.xlsx`);
  },

  /**
   * Export Single Student Academic Year Attendance Transcript to Excel
   */
  exportSingleStudentYearToExcel(
    student: Student,
    monthlyBreakdown: { monthName: string; monthNumber: number; hadir: number; terlambat: number; izin: number; sakit: number; alpa: number; totalDays: number; percent: number }[],
    academicYear: string,
    letterhead?: LetterheadConfig
  ) {
    const data = monthlyBreakdown.map((m, idx) => ({
      No: idx + 1,
      Bulan: m.monthName,
      'Hadir (H)': m.hadir,
      'Terlambat (T)': m.terlambat,
      'Izin (I)': m.izin,
      'Sakit (S)': m.sakit,
      'Alpa (A)': m.alpa,
      'Total Hari': m.totalDays,
      '% Kehadiran': `${m.percent}%`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, `Transkrip ${student.nis}`);
    XLSX.writeFile(workbook, `Transkrip_Presensi_Tahunan_${student.name.replace(/\s+/g, '_')}_${academicYear}.xlsx`);
  },

  /**
   * Export Master Student List to Excel
   */
  exportStudentsToExcel(students: Student[]) {
    const data = students.map((s, idx) => ({
      No: idx + 1,
      NIS: s.nis,
      NISN: s.nisn,
      'Nama Lengkap': s.name,
      'Jenis Kelamin': s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      Kelas: s.classId,
      'Nama Orang Tua / Wali': s.parentName,
      'No. WhatsApp Wali': s.parentPhone,
      Alamat: s.address || '-',
      'Kode QR': s.qrCodeData,
      Status: s.status.toUpperCase(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');
    XLSX.writeFile(workbook, `Data_Siswa_SMA_IT_AL_ITTIHAD_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  /**
   * Generate Blank Sample Excel for Bulk Import
   */
  downloadBulkImportTemplate() {
    const sampleData = [
      {
        NIS: '242510119',
        NISN: '0071234599',
        'Nama Siswa': 'Fathan Robbani',
        'Jenis Kelamin (L/P)': 'L',
        Kelas: 'XII 1',
        'Nama Orang Tua': 'H. Robbani',
        'No WhatsApp Ortu': '081234567890',
        Alamat: 'Pekanbaru, Riau',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Siswa');
    XLSX.writeFile(workbook, 'Template_Import_Siswa_SMAIT_AlIttihad.xlsx');
  },

  /**
   * Export Official PDF Attendance Recap with Dynamic Kop & Customizable Fields
   */
  exportMonthlyRecapPdf(
    students: Student[],
    records: AttendanceRecord[],
    year: number,
    month: number,
    className: string = 'Semua Kelas',
    categoryName: string = 'Semua Sesi',
    letterhead?: LetterheadConfig,
    options?: Partial<ExportCustomOptions>
  ) {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthLabel = monthNames[month - 1];

    const yayasan = letterhead?.yayasanName || 'YAYASAN KESATUAN PENDIDIKAN ISLAM AL ITTIHAD';
    const school = letterhead?.schoolName || 'SMA IT AL ITTIHAD';
    const motto = letterhead?.motto || 'Alquran Akhlak Prestasi';
    const npsn = letterhead?.npsn || '10404435';
    const nss = letterhead?.nss || '304096008035';
    const accreditation = letterhead?.accreditation || 'A (Unggul)';
    const address = letterhead?.address || 'Kompleks Chevron Rumbai, Lembah Damai, Rumbai Pesisir, Pekanbaru, Riau 28265';
    const phone = letterhead?.phone || '(0761) 51522';
    const email = letterhead?.email || 'info@alittihad.sch.id';
    const website = letterhead?.website || 'www.smaitalittihad.sch.id';

    // --- KOP SURAT DINAMIS ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(6, 95, 70); // Emerald 800
    doc.text(yayasan.toUpperCase(), 148, 13, { align: 'center' });
    
    doc.setFontSize(17);
    doc.setTextColor(4, 120, 87); // Emerald 700
    doc.text(school.toUpperCase(), 148, 20, { align: 'center' });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(180, 83, 9); // Amber 700
    doc.text(`Motto: "${motto}"`, 148, 25, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105); // Slate 600
    doc.text(`Akreditasi: "${accreditation}" | NSS: ${nss} | NPSN: ${npsn}`, 148, 29, { align: 'center' });
    doc.text(address, 148, 33, { align: 'center' });
    doc.text(`Website: ${website} | Email: ${email} | Telp: ${phone}`, 148, 37, { align: 'center' });

    // Decorative double horizontal header bar
    doc.setDrawColor(4, 120, 87);
    doc.setLineWidth(1.2);
    doc.line(14, 40, 283, 40);
    doc.setDrawColor(217, 119, 6); // Amber
    doc.setLineWidth(0.4);
    doc.line(14, 41.5, 283, 41.5);

    // Document Title & Subtitle
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(options?.reportTitle || 'LAPORAN REKAPITULASI KEHADIRAN SISWA BULANAN', 148, 48, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Periode: ${monthLabel} ${year}   |   Rombel: ${className}   |   Sesi: ${categoryName}`, 148, 52.5, { align: 'center' });

    // Filter students
    const filteredStudents = className && className !== 'Semua Kelas' && className !== 'all'
      ? students.filter(s => s.classId === className)
      : students;

    // Build dynamic table columns based on options
    const tableColumns: { header: string; dataKey: string }[] = [{ header: 'No', dataKey: 'no' }];

    if (options?.includeNis !== false) tableColumns.push({ header: 'NIS', dataKey: 'nis' });
    tableColumns.push({ header: 'Nama Siswa', dataKey: 'name' });
    if (options?.includeClass !== false) tableColumns.push({ header: 'Kelas', dataKey: 'kelas' });

    if (options?.includeHadir !== false) tableColumns.push({ header: 'Hadir (H)', dataKey: 'hadir' });
    if (options?.includeTerlambat !== false) tableColumns.push({ header: 'Terlambat (T)', dataKey: 'terlambat' });
    if (options?.includeIzin !== false) tableColumns.push({ header: 'Izin (I)', dataKey: 'izin' });
    if (options?.includeSakit !== false) tableColumns.push({ header: 'Sakit (S)', dataKey: 'sakit' });
    if (options?.includeAlpa !== false) tableColumns.push({ header: 'Alpa (A)', dataKey: 'alpa' });

    tableColumns.push({ header: 'Total Hadir', dataKey: 'totalHadir' });
    if (options?.includePercentage !== false) tableColumns.push({ header: '% Hadir', dataKey: 'persen' });

    const tableRows = filteredStudents.map((s, idx) => {
      const studentRecords = records.filter(
        r => r.studentId === s.id &&
             new Date(r.date).getFullYear() === year &&
             new Date(r.date).getMonth() + 1 === month
      );

      const hadir = studentRecords.filter(r => r.status === 'hadir').length;
      const terlambat = studentRecords.filter(r => r.status === 'terlambat').length;
      const izin = studentRecords.filter(r => r.status === 'izin').length;
      const sakit = studentRecords.filter(r => r.status === 'sakit').length;
      const alpa = studentRecords.filter(r => r.status === 'alpa').length;

      const totalRecorded = hadir + terlambat + izin + sakit + alpa;
      const effective = hadir + terlambat;
      const percent = totalRecorded > 0 ? Math.round((effective / totalRecorded) * 100) : 0;

      return {
        no: idx + 1,
        nis: s.nis,
        name: s.name,
        kelas: s.classId,
        hadir,
        terlambat,
        izin,
        sakit,
        alpa,
        totalHadir: effective,
        persen: `${percent}%`,
      };
    });

    autoTable(doc, {
      startY: 56,
      columns: tableColumns,
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [30, 41, 59],
        valign: 'middle',
      },
      headStyles: {
        fillColor: [6, 95, 70],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
    });

    // Signature Footer
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    if (finalY + 35 > 195) {
      doc.addPage();
    }

    const sigY = finalY + 35 > 195 ? 20 : finalY;
    const todayFormatted = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    // Left Signature
    doc.text('Mengetahui,', 40, sigY);
    doc.text('Koordinator Kesiswaan & Ibadah', 40, sigY + 5);
    doc.text(school, 40, sigY + 9);
    doc.setFont('helvetica', 'bold');
    doc.text(letterhead?.counselorName || 'Ustadz Ahmad Fauzi, Lc.', 40, sigY + 28);
    doc.setFont('helvetica', 'normal');
    doc.text(letterhead?.counselorNiy || 'NIY. 201208 1 042', 40, sigY + 32);

    // Right Signature
    doc.text(`Pekanbaru, ${todayFormatted}`, 215, sigY);
    doc.text('Kepala Sekolah', 215, sigY + 5);
    doc.text(school, 215, sigY + 9);
    doc.setFont('helvetica', 'bold');
    doc.text(letterhead?.headmasterName || 'Alkis Saputra, S.Pd., M.Kom.', 215, sigY + 28);
    doc.setFont('helvetica', 'normal');
    doc.text(letterhead?.headmasterNip || 'NIP. 19880530 201101 1 008', 215, sigY + 32);

    doc.save(`Laporan_Presensi_${school.replace(/\s+/g, '_')}_${monthLabel}_${year}.pdf`);
  },

  /**
   * Export Single Student Academic Year Attendance Report to PDF
   */
  exportSingleStudentYearPdf(
    student: Student,
    monthlyBreakdown: { monthName: string; monthNumber: number; hadir: number; terlambat: number; izin: number; sakit: number; alpa: number; totalDays: number; percent: number }[],
    academicYear: string,
    letterhead?: LetterheadConfig
  ) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const yayasan = letterhead?.yayasanName || 'YAYASAN KESATUAN PENDIDIKAN ISLAM AL ITTIHAD';
    const school = letterhead?.schoolName || 'SMA IT AL ITTIHAD';
    const motto = letterhead?.motto || 'Alquran Akhlak Prestasi';
    const address = letterhead?.address || 'Kompleks Chevron Rumbai, Lembah Damai, Pekanbaru, Riau';

    // Kop Surat
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(6, 95, 70);
    doc.text(yayasan.toUpperCase(), 105, 14, { align: 'center' });

    doc.setFontSize(15);
    doc.setTextColor(4, 120, 87);
    doc.text(school.toUpperCase(), 105, 20, { align: 'center' });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 83, 9);
    doc.text(`Motto: "${motto}"`, 105, 25, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(address, 105, 29, { align: 'center' });

    // Decorative line
    doc.setDrawColor(4, 120, 87);
    doc.setLineWidth(1.2);
    doc.line(14, 33, 196, 33);
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.4);
    doc.line(14, 34.5, 196, 34.5);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('TRANSKRIP REKAPITULASI KEHADIRAN SISWA TAHUNAN', 105, 42, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tahun Ajaran ${academicYear}`, 105, 47, { align: 'center' });

    // Student identity card
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 52, 182, 24, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.text('Nama Siswa', 20, 58);
    doc.text(`:  ${student.name}`, 55, 58);
    doc.text('NIS / NISN', 20, 64);
    doc.text(`:  ${student.nis} / ${student.nisn}`, 55, 64);
    doc.text('Kelas / Rombel', 20, 70);
    doc.text(`:  ${student.classId}`, 55, 70);

    doc.text('Nama Wali', 120, 58);
    doc.text(`:  ${student.parentName}`, 148, 58);
    doc.text('WhatsApp Wali', 120, 64);
    doc.text(`:  ${student.parentPhone}`, 148, 64);
    doc.text('Status Siswa', 120, 70);
    doc.text(`:  ${student.status.toUpperCase()}`, 148, 70);

    // Table of Monthly Totals
    const columns = [
      { header: 'No', dataKey: 'no' },
      { header: 'Bulan', dataKey: 'bulan' },
      { header: 'Hadir (H)', dataKey: 'hadir' },
      { header: 'Terlambat (T)', dataKey: 'terlambat' },
      { header: 'Izin (I)', dataKey: 'izin' },
      { header: 'Sakit (S)', dataKey: 'sakit' },
      { header: 'Alpa (A)', dataKey: 'alpa' },
      { header: '% Kehadiran', dataKey: 'persen' },
    ];

    let sumHadir = 0;
    let sumTerlambat = 0;
    let sumIzin = 0;
    let sumSakit = 0;
    let sumAlpa = 0;

    const rows = monthlyBreakdown.map((m, idx) => {
      sumHadir += m.hadir;
      sumTerlambat += m.terlambat;
      sumIzin += m.izin;
      sumSakit += m.sakit;
      sumAlpa += m.alpa;

      return {
        no: idx + 1,
        bulan: m.monthName,
        hadir: m.hadir,
        terlambat: m.terlambat,
        izin: m.izin,
        sakit: m.sakit,
        alpa: m.alpa,
        persen: `${m.percent}%`,
      };
    });

    const totalDaysRecorded = sumHadir + sumTerlambat + sumIzin + sumSakit + sumAlpa;
    const effectivePresent = sumHadir + sumTerlambat;
    const overallPercentage = totalDaysRecorded > 0 ? Math.round((effectivePresent / totalDaysRecorded) * 100) : 0;

    // Add Total Row
    rows.push({
      no: '',
      bulan: 'TOTAL AKUMULASI',
      hadir: sumHadir,
      terlambat: sumTerlambat,
      izin: sumIzin,
      sakit: sumSakit,
      alpa: sumAlpa,
      persen: `${overallPercentage}%`,
    });

    autoTable(doc, {
      startY: 81,
      columns,
      body: rows,
      theme: 'grid',
      styles: {
        fontSize: 8.5,
        cellPadding: 2.5,
        textColor: [30, 41, 59],
        valign: 'middle',
      },
      headStyles: {
        fillColor: [6, 95, 70],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        no: { halign: 'center', cellWidth: 10 },
        bulan: { cellWidth: 40 },
        hadir: { halign: 'center', cellWidth: 22 },
        terlambat: { halign: 'center', cellWidth: 24 },
        izin: { halign: 'center', cellWidth: 20 },
        sakit: { halign: 'center', cellWidth: 20 },
        alpa: { halign: 'center', cellWidth: 20 },
        persen: { halign: 'center', cellWidth: 26, fontStyle: 'bold' },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

    const todayFormatted = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // Signature Block
    doc.setFontSize(8.5);
    doc.text('Mengetahui,', 25, finalY);
    doc.text('Wali Kelas / Guru Piket', 25, finalY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(letterhead?.counselorName || 'Ustadz Ahmad Fauzi, Lc.', 25, finalY + 26);
    doc.setFont('helvetica', 'normal');
    doc.text(letterhead?.counselorNiy || 'NIY. 201208 1 042', 25, finalY + 30);

    doc.text(`Pekanbaru, ${todayFormatted}`, 130, finalY);
    doc.text('Kepala Sekolah', 130, finalY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(letterhead?.headmasterName || 'Alkis Saputra, S.Pd., M.Kom.', 130, finalY + 26);
    doc.setFont('helvetica', 'normal');
    doc.text(letterhead?.headmasterNip || 'NIP. 19880530 201101 1 008', 130, finalY + 30);

    doc.save(`Transkrip_Presensi_${student.name.replace(/\s+/g, '_')}_${academicYear}.pdf`);
  },
};
