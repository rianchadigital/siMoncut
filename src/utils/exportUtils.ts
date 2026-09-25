import * as XLSX from 'xlsx';
import { Pegawai, Cuti, TempatTugasSummary, JabatanSummary } from '../types';
import { formatDateIndo, formatDateShortIndo, formatTimestampIndo } from './dateUtils';

/**
 * Export array of objects to Excel file (.xlsx)
 */
export function exportToExcel(data: Record<string, unknown>[], fileName: string, sheetName = 'Data') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

/**
 * Export leave reports to structured Excel
 */
export function exportCutiReportToExcel(cutiList: Cuti[], reportTitle: string) {
  const rows = cutiList.map((c, idx) => ({
    'No': idx + 1,
    'ID Cuti': c.idCuti,
    'NIP': c.nip,
    'Nama Pegawai': c.nama,
    'Pegawai Pengganti': c.namaPengganti || '-',
    'Jabatan': c.jabatan,
    'Tempat Tugas': c.tempatTugas,
    'Jenis Cuti': c.jenisCuti,
    'Periode Cuti': `${formatDateShortIndo(c.tanggalMulai)} s/d ${formatDateShortIndo(c.tanggalSelesai)}`,
    'Tanggal Mulai': formatDateShortIndo(c.tanggalMulai),
    'Tanggal Selesai': formatDateShortIndo(c.tanggalSelesai),
    'Jumlah Hari': `${c.jumlahHari} Hari`,
    'Status': c.statusPersetujuan,
    'No. Surat Cuti': c.nomorSuratCuti || '-',
    'Pemberi Persetujuan': c.pejabatPenyetuju || '-',
    'Keterangan / Alasan': c.alasan || '-',
  }));

  const safeFileName = reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  exportToExcel(rows, `simon_cuti_${safeFileName}_${new Date().toISOString().substring(0, 10)}`, 'Laporan Cuti');
}

/**
 * Export staff directory to Excel
 */
export function exportPegawaiToExcel(pegawaiList: Pegawai[]) {
  const rows = pegawaiList.map((p, idx) => ({
    'No': idx + 1,
    'NIP': p.nip,
    'Nama Lengkap': p.nama,
    'Pangkat / Golongan': p.pangkatGolongan,
    'Jabatan': p.jabatan,
    'Tempat Tugas': p.tempatTugas,
    'Puskesmas / Pustu': p.puskesmasPustu,
    'Status Kepegawaian': p.statusKepegawaian,
    'Jenis Kelamin': p.jenisKelamin,
    'Nomor HP': p.nomorHp,
    'Status': p.statusAktif,
  }));

  exportToExcel(rows, `simon_cuti_data_pegawai_${new Date().toISOString().substring(0, 10)}`, 'Pegawai');
}

/**
 * Export unit monitoring summary to Excel
 */
export function exportTempatTugasToExcel(summaryList: TempatTugasSummary[]) {
  const rows = summaryList.map((s, idx) => ({
    'No': idx + 1,
    'Tempat Tugas': s.tempatTugas,
    'Total Pegawai': s.totalPegawai,
    'Cuti Hari Ini': s.cutiHariIni,
    'Pegawai Tersedia': s.tersediaHariIni,
    '% Sedang Cuti': `${s.persentaseCuti}%`,
    'Status Risiko': s.levelRisiko,
    'Cuti Minggu Ini': s.cutiMingguIni,
    'Cuti Bulan Ini': s.cutiBulanIni,
    'Cuti Bulan Depan': s.cutiBulanDepan,
  }));

  exportToExcel(rows, `simon_cuti_rekap_tempat_tugas_${new Date().toISOString().substring(0, 10)}`, 'Rekap Unit');
}

/**
 * Download standard CSV for Google Sheet import
 */
export function downloadCSV(content: string, fileName: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
