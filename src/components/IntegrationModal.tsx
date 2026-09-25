import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Copy,
  Check,
  ExternalLink,
  Download,
  Terminal,
  Database,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { GAS_CODE_GS, SPREADSHEET_COLUMNS } from '../data/gasScript';
import { downloadCSV } from '../utils/exportUtils';
import { INITIAL_PEGAWAI, INITIAL_CUTI, REFERENSI_MASTER } from '../data/initialData';

interface IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  gasUrl: string;
  onSaveGasUrl: (url: string) => void;
  onTestSync: () => Promise<void>;
  isLoading: boolean;
  syncStatus: { type: string; message: string };
  onResetToDefault: () => void;
}

export const IntegrationModal: React.FC<IntegrationModalProps> = ({
  isOpen,
  onClose,
  gasUrl,
  onSaveGasUrl,
  onTestSync,
  isLoading,
  syncStatus,
  onResetToDefault,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'panduan' | 'codegs' | 'struktur' | 'koneksi'>('koneksi');
  const [urlInput, setUrlInput] = useState(gasUrl);
  const [copiedCode, setCopiedCode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (gasUrl) {
      setUrlInput(gasUrl);
    }
  }, [gasUrl]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GAS_CODE_GS);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGasUrl(urlInput);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Generate template CSVs
  const handleDownloadCsv = (sheet: 'DATA_PEGAWAI' | 'DATA_CUTI' | 'REFERENSI') => {
    let csvContent = '';
    if (sheet === 'DATA_PEGAWAI') {
      const headers = SPREADSHEET_COLUMNS.DATA_PEGAWAI.join(',');
      const rows = INITIAL_PEGAWAI.map(
        (p) =>
          `"${p.no}","${p.nip}","${p.nama}","${p.pangkatGolongan}","${p.jabatan}","${p.tempatTugas}","${p.puskesmasPustu}","${p.statusKepegawaian}","${p.jenisKelamin}","${p.nomorHp}","${p.statusAktif}"`
      ).join('\n');
      csvContent = `${headers}\n${rows}`;
    } else if (sheet === 'DATA_CUTI') {
      const headers = SPREADSHEET_COLUMNS.DATA_CUTI.join(',');
      const rows = INITIAL_CUTI.map(
        (c) =>
          `"${c.idCuti}","${c.nip}","${c.nama}","${c.jabatan}","${c.tempatTugas}","${c.namaPengganti || ''}","${c.jenisCuti}","${c.tanggalMulai}","${c.tanggalSelesai}","${c.jumlahHari}","${c.alasan}","${c.nomorSuratCuti}","${c.tanggalPengajuan}","${c.statusPersetujuan}","${c.pejabatPenyetuju}","${c.catatan}","${c.timestampUpdate}"`
      ).join('\n');
      csvContent = `${headers}\n${rows}`;
    } else {
      const headers = SPREADSHEET_COLUMNS.REFERENSI.join(',');
      const maxRows = Math.max(
        REFERENSI_MASTER.tempatTugasList.length,
        REFERENSI_MASTER.jabatanList.length,
        REFERENSI_MASTER.jenisCutiList.length,
        REFERENSI_MASTER.statusKepegawaianList.length,
        REFERENSI_MASTER.statusPersetujuanList.length
      );
      const rows: string[] = [];
      for (let i = 0; i < maxRows; i++) {
        rows.push(
          `"${REFERENSI_MASTER.tempatTugasList[i] || ''}","${REFERENSI_MASTER.jabatanList[i] || ''}","${
            REFERENSI_MASTER.jenisCutiList[i] || ''
          }","${REFERENSI_MASTER.statusKepegawaianList[i] || ''}","${
            REFERENSI_MASTER.statusPersetujuanList[i] || ''
          }"`
        );
      }
      csvContent = `${headers}\n${rows.join('\n')}`;
    }

    downloadCSV(csvContent, `Template_${sheet}.csv`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs no-print">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Integrasi Google Spreadsheet & Apps Script</h3>
              <p className="text-xs text-slate-400">
                Puskesmas Kepulauan Seribu Selatan · Database Utama & API Web App
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 shrink-0 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('koneksi')}
            className={`py-2 px-3 border-b-2 font-semibold transition whitespace-nowrap ${
              activeTab === 'koneksi'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Sambungkan Web App URL
          </button>
          <button
            onClick={() => setActiveTab('panduan')}
            className={`py-2 px-3 border-b-2 font-semibold transition whitespace-nowrap ${
              activeTab === 'panduan'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Petunjuk Instalasi & Deploy
          </button>
          <button
            onClick={() => setActiveTab('codegs')}
            className={`py-2 px-3 border-b-2 font-semibold transition whitespace-nowrap ${
              activeTab === 'codegs'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Kode Backend (Code.gs)
          </button>
          <button
            onClick={() => setActiveTab('struktur')}
            className={`py-2 px-3 border-b-2 font-semibold transition whitespace-nowrap ${
              activeTab === 'struktur'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Struktur Sheet & Template CSV
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
          {activeTab === 'koneksi' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200">
                <h4 className="font-bold text-teal-950 text-sm mb-1">
                  Koneksi Langsung Google Spreadsheet
                </h4>
                <p className="text-xs text-teal-800 leading-relaxed">
                  Masukkan Web App URL hasil deployment Google Apps Script Anda. Setelah terhubung, SiMONCUT akan langsung membaca dan menampilkan data real-time dari Spreadsheet Puskesmas Kepulauan Seribu Selatan setiap kali Anda klik tombol <strong>Refresh Data</strong>.
                </p>
              </div>

              <form onSubmit={handleSaveUrl} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Google Apps Script Web App URL:
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-teal-600"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Format: URL berakhiran <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">/exec</code>.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-teal-700 text-xs font-bold text-white hover:bg-teal-800 transition shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Simpan URL
                  </button>

                  <button
                    type="button"
                    onClick={onTestSync}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Menghubungkan...' : 'Uji Koneksi & Sinkronisasi'}
                  </button>

                  {saveSuccess && (
                    <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> URL Tersimpan!
                    </span>
                  )}
                </div>
              </form>

              {/* Status Message */}
              {syncStatus.message && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                    syncStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : syncStatus.type === 'error'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {syncStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <span>{syncStatus.message}</span>
                </div>
              )}

              {/* Reset to Default */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Gunakan Data Standar Puskesmas</span>
                  <span className="text-[11px] text-slate-500">
                    Kembalikan ke data awal 28 pegawai dan simulasi cuti Kepulauan Seribu Selatan.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onResetToDefault}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-100 transition font-medium"
                >
                  Reset Standar
                </button>
              </div>
            </div>
          )}

          {activeTab === 'panduan' && (
            <div className="space-y-4 leading-relaxed">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  Langkah-Langkah Menghubungkan Google Spreadsheet:
                </h4>
                <ol className="list-decimal pl-5 space-y-2 mt-2">
                  <li>
                    <strong>Buat Spreadsheet Baru:</strong> Buka <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-teal-700 underline font-medium">sheets.new</a> dan beri nama misalnya: <em>"DATABASE CUTI - PUSKESMAS KEP SERIBU SELATAN"</em>.
                  </li>
                  <li>
                    <strong>Buat 3 Sheet:</strong> Rename tab di bagian bawah menjadi persis:
                    <div className="mt-1 flex flex-wrap gap-2 font-mono text-[11px]">
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-300 font-bold">DATA_PEGAWAI</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-300 font-bold">DATA_CUTI</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-300 font-bold">REFERENSI</span>
                    </div>
                  </li>
                  <li>
                    <strong>Unduh & Impor Template:</strong> Pada tab <em>"4. Struktur Sheet"</em>, klik download template CSV, lalu impor ke masing-masing sheet di Google Spreadsheet.
                  </li>
                  <li>
                    <strong>Buka Apps Script:</strong> Di Google Sheets, klik menu <strong>Extensions (Ekstensi) &gt; Apps Script</strong>.
                  </li>
                  <li>
                    <strong>Tempelkan Kode:</strong> Buka tab <em>"3. Kode Backend (Code.gs)"</em> di modal ini, klik <strong>Salin Kode Code.gs</strong>, lalu tempelkan menggantikan seluruh isi editor di Apps Script.
                  </li>
                  <li>
                    <strong>Deploy sebagai Web App:</strong>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                      <li>Klik tombol biru <strong>Deploy &gt; New deployment</strong> di pojok kanan atas.</li>
                      <li>Pilih jenis <strong>Web app</strong> (ikon roda gigi).</li>
                      <li>Description: <code className="bg-slate-100 px-1 py-0.5 rounded">SiMONCUT v1.0</code></li>
                      <li><strong>Execute as:</strong> Pilih <strong>Me (email Anda)</strong></li>
                      <li><strong>Who has access:</strong> Pilih <strong>Anyone (Siapa saja)</strong> agar dashboard web dapat membaca data secara langsung.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Beri Izin Akses (Authorize):</strong> Klik <em>Deploy</em>, lalu klik <em>Authorize access</em> &gt; pilih akun Google Anda &gt; <em>Advanced (Lanjutan)</em> &gt; <em>Go to ... (unsafe)</em> &gt; <em>Allow</em>.
                  </li>
                  <li>
                    <strong>Salin Web App URL:</strong> Salin URL yang dihasilkan (berakhiran <code>/exec</code>) dan tempelkan ke tab <em>"1. Sambungkan Web App URL"</em> di atas. Selesai!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'codegs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs">File: Code.gs</span>
                  <p className="text-[11px] text-slate-500">
                    Mendukung fungsi doGet(), getPegawai(), getCuti(), getDashboard(), getReferensi(), getCutiHariIni(), getCutiMingguIni(), getCutiBulanIni(), getCutiBulanDepan(), getRekapTempatTugas(), getRekapJabatan().
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition shadow-2xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Tersalin!' : 'Salin Kode Code.gs'}
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-[360px] leading-relaxed border border-slate-800">
                  {GAS_CODE_GS}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'struktur' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  Struktur Sheet & Download Template Siap Pakai
                </h4>
                <p className="text-xs text-slate-600">
                  Klik tombol di bawah untuk mengunduh template CSV siap impor ke Google Sheets Anda:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
                  <button
                    onClick={() => handleDownloadCsv('DATA_PEGAWAI')}
                    className="p-3 bg-white border border-slate-300 rounded-lg text-left hover:border-teal-600 transition shadow-2xs group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">DATA_PEGAWAI.csv</span>
                      <Download className="w-3.5 h-3.5 text-teal-600 group-hover:translate-y-0.5 transition" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">11 Kolom (NIP, Jabatan, Unit, dll)</p>
                  </button>

                  <button
                    onClick={() => handleDownloadCsv('DATA_CUTI')}
                    className="p-3 bg-white border border-slate-300 rounded-lg text-left hover:border-teal-600 transition shadow-2xs group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">DATA_CUTI.csv</span>
                      <Download className="w-3.5 h-3.5 text-teal-600 group-hover:translate-y-0.5 transition" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">16 Kolom (ID Cuti, Tanggal, dll)</p>
                  </button>

                  <button
                    onClick={() => handleDownloadCsv('REFERENSI')}
                    className="p-3 bg-white border border-slate-300 rounded-lg text-left hover:border-teal-600 transition shadow-2xs group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">REFERENSI.csv</span>
                      <Download className="w-3.5 h-3.5 text-teal-600 group-hover:translate-y-0.5 transition" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">5 Kolom Data Master</p>
                  </button>
                </div>
              </div>

              {/* Rincian Kolom */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-800">Daftar Kolom Header Sheet:</div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-[11px] font-mono">
                  <div>
                    <strong className="text-teal-900">SHEET 1: DATA_PEGAWAI</strong>
                    <div className="text-slate-600 mt-0.5">{SPREADSHEET_COLUMNS.DATA_PEGAWAI.join(' | ')}</div>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <strong className="text-teal-900">SHEET 2: DATA_CUTI</strong>
                    <div className="text-slate-600 mt-0.5">{SPREADSHEET_COLUMNS.DATA_CUTI.join(' | ')}</div>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <strong className="text-teal-900">SHEET 3: REFERENSI</strong>
                    <div className="text-slate-600 mt-0.5">{SPREADSHEET_COLUMNS.REFERENSI.join(' | ')}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-white hover:bg-slate-900 transition"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
