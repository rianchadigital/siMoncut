import React, { useState, useMemo } from 'react';
import { Cuti, Pegawai, TempatTugasSummary, ReferensiMaster } from '../types';
import {
  FileText,
  Printer,
  Download,
  Filter,
  Building2,
  Calendar,
  Image as ImageIcon,
  RotateCcw,
  Upload,
  ExternalLink,
  Check,
  UserCheck,
  PenTool,
  Clock,
} from 'lucide-react';
import {
  formatDateIndo,
  formatDateShortIndo,
  getTodayString,
  calculateDaysBetween,
  isDateInRange,
  getCurrentWeekRange,
  isSameUnit,
} from '../utils/dateUtils';
import { exportCutiReportToExcel, exportTempatTugasToExcel } from '../utils/exportUtils';
import { LogoJayaRaya, LogoKesehatan } from './OfficialLogos';

interface LaporanViewProps {
  cutiList: Cuti[];
  pegawaiList: Pegawai[];
  tempatTugasSummary: TempatTugasSummary[];
  referensi: ReferensiMaster;
}

type LaporanType =
  | 'bulanan'
  | 'rentang-tanggal'
  | 'harian'
  | 'mingguan'
  | 'tempat-tugas'
  | 'jabatan'
  | 'jenis-cuti';

export const LaporanView: React.FC<LaporanViewProps> = ({
  cutiList,
  pegawaiList,
  tempatTugasSummary,
  referensi,
}) => {
  const today = getTodayString();
  const [reportType, setReportType] = useState<LaporanType>('bulanan');
  const [filterUnit, setFilterUnit] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>('2026-09');
  const [filterStartDate, setFilterStartDate] = useState<string>('2026-09-01');
  const [filterEndDate, setFilterEndDate] = useState<string>('2026-09-30');
  const [filterDate, setFilterDate] = useState<string>(today);

  // Signatory states: auto-picked from data pegawai with manual override option
  const [showSignatoryConfig, setShowSignatoryConfig] = useState(false);
  const [selectedKepalaNip, setSelectedKepalaNip] = useState<string>('');
  const [selectedPengelolaNip, setSelectedPengelolaNip] = useState<string>('');

  // Custom Logo Kop Surat states
  const [customLogoJaya, setCustomLogoJaya] = useState<string>(() => {
    return localStorage.getItem('simon_custom_logo_jaya') || '';
  });
  const [customLogoKemenkes, setCustomLogoKemenkes] = useState<string>(() => {
    return localStorage.getItem('simon_custom_logo_kemenkes') || '';
  });
  const [showLogoConfig, setShowLogoConfig] = useState(false);
  const [logoSaveNotice, setLogoSaveNotice] = useState(false);

  // 1. Ambil data Kepala Puskesmas langsung dari data pegawai (dr. Ignatius Dendy Purnama)
  const defaultKepala = useMemo(() => {
    // Cari pegawai dengan nama mengandung "ignatius" atau "dendy"
    const byName = pegawaiList.find((p) => /ignatius|dendy/i.test(p.nama));
    if (byName) return byName;

    // Cari pegawai dengan jabatan Kepala Puskesmas
    const byJabatan = pegawaiList.find((p) => /kepala\s+puskesmas/i.test(p.jabatan));
    if (byJabatan) return byJabatan;

    // Fallback data resmi sesuai SIMON Pegawai
    return {
      nip: '198607192014031004',
      nama: 'dr. Ignatius Dendy Purnama',
      jabatan: 'Kepala Puskesmas',
      pangkatGolongan: 'III/d (Penata Tingkat I)',
      tempatTugas: 'Puskesmas Kepulauan Seribu Selatan',
      puskesmasPustu: 'Puskesmas Kepulauan Seribu Selatan',
      statusKepegawaian: 'PNS' as const,
      jenisKelamin: 'Laki-laki' as const,
      nomorHp: '085246021831',
      statusAktif: 'Aktif' as const,
      no: 1,
    };
  }, [pegawaiList]);

  // 2. Ambil data Pengelola Kepegawaian langsung dari data pegawai (Pipit Apriyani)
  const defaultPengelola = useMemo(() => {
    // Cari pegawai dengan nama mengandung "pipit" atau "apriyani"
    const byName = pegawaiList.find((p) => /pipit|apriyani/i.test(p.nama));
    if (byName) return byName;

    // Cari pegawai dengan jabatan kepegawaian / tata usaha
    const byJabatan = pegawaiList.find((p) => /kepegawaian|tata usaha/i.test(p.jabatan));
    if (byJabatan) return byJabatan;

    // Fallback data resmi sesuai SIMON Pegawai
    return {
      nip: '198304302024212015',
      nama: 'Pipit Apriyani, A.Md.Kep',
      jabatan: 'Pengelola Kepegawaian',
      pangkatGolongan: 'VII (KHUSUS PPPK)',
      tempatTugas: 'Puskesmas Kepulauan Seribu Selatan',
      puskesmasPustu: 'Puskesmas Kepulauan Seribu Selatan',
      statusKepegawaian: 'PPPK' as const,
      jenisKelamin: 'Perempuan' as const,
      nomorHp: '081288919909',
      statusAktif: 'Aktif' as const,
      no: 25,
    };
  }, [pegawaiList]);

  // Pegawai terpilih untuk penandatangan
  const kepalaPuskesmas = useMemo(() => {
    if (selectedKepalaNip) {
      const match = pegawaiList.find((p) => p.nip === selectedKepalaNip);
      if (match) return match;
    }
    return defaultKepala;
  }, [selectedKepalaNip, pegawaiList, defaultKepala]);

  const pengelolaKepegawaian = useMemo(() => {
    if (selectedPengelolaNip) {
      const match = pegawaiList.find((p) => p.nip === selectedPengelolaNip);
      if (match) return match;
    }
    return defaultPengelola;
  }, [selectedPengelolaNip, pegawaiList, defaultPengelola]);

  // 3. Menghitung rentang tanggal periode cuti yang aktif ("tanggal berapa sampai berapa")
  const { periodeStart, periodeEnd, periodeDeskripsi } = useMemo(() => {
    if (reportType === 'harian') {
      return {
        periodeStart: filterDate,
        periodeEnd: filterDate,
        periodeDeskripsi: formatDateIndo(filterDate),
      };
    }

    if (reportType === 'mingguan') {
      const week = getCurrentWeekRange();
      return {
        periodeStart: week.start,
        periodeEnd: week.end,
        periodeDeskripsi: `${formatDateIndo(week.start)} s/d ${formatDateIndo(week.end)}`,
      };
    }

    if (reportType === 'rentang-tanggal') {
      const s = filterStartDate || '2026-09-01';
      const e = filterEndDate || '2026-09-30';
      return {
        periodeStart: s,
        periodeEnd: e,
        periodeDeskripsi: `${formatDateIndo(s)} s/d ${formatDateIndo(e)}`,
      };
    }

    // Default: 'bulanan', 'tempat-tugas', 'jabatan', 'jenis-cuti'
    const ym = filterMonth.split('-');
    const year = parseInt(ym[0], 10) || 2026;
    const month = parseInt(ym[1], 10) || 9;
    const firstDay = `${filterMonth}-01`;
    const lastDateNum = new Date(year, month, 0).getDate();
    const lastDay = `${filterMonth}-${String(lastDateNum).padStart(2, '0')}`;

    return {
      periodeStart: firstDay,
      periodeEnd: lastDay,
      periodeDeskripsi: `${formatDateIndo(firstDay)} s/d ${formatDateIndo(lastDay)}`,
    };
  }, [reportType, filterMonth, filterDate, filterStartDate, filterEndDate]);

  // Handle uploading custom logo for Jaya Raya
  const handleUploadLogoJaya = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCustomLogoJaya(result);
        localStorage.setItem('simon_custom_logo_jaya', result);
        showSaveToast();
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle uploading custom logo for Kesehatan
  const handleUploadLogoKemenkes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCustomLogoKemenkes(result);
        localStorage.setItem('simon_custom_logo_kemenkes', result);
        showSaveToast();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogos = () => {
    setCustomLogoJaya('');
    setCustomLogoKemenkes('');
    localStorage.removeItem('simon_custom_logo_jaya');
    localStorage.removeItem('simon_custom_logo_kemenkes');
    showSaveToast();
  };

  const showSaveToast = () => {
    setLogoSaveNotice(true);
    setTimeout(() => setLogoSaveNotice(false), 3000);
  };

  // Filter cuti berdasarkan unit dan periode aktif
  const reportData = useMemo(() => {
    return cutiList.filter((c) => {
      if (filterUnit && !isSameUnit(c.tempatTugas, filterUnit)) return false;

      if (reportType === 'harian') {
        return isDateInRange(filterDate, c.tanggalMulai, c.tanggalSelesai);
      }

      // Bulanan / Rentang Tanggal / Mingguan:
      // Tampilkan cuti yang tanggalnya beririsan dengan periode yang dipilih
      return c.tanggalMulai <= periodeEnd && c.tanggalSelesai >= periodeStart;
    });
  }, [cutiList, filterUnit, reportType, filterDate, periodeStart, periodeEnd]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (reportType === 'tempat-tugas') {
      exportTempatTugasToExcel(tempatTugasSummary);
    } else {
      exportCutiReportToExcel(reportData, `Laporan_${reportType}_${periodeStart}_sd_${periodeEnd}`);
    }
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'harian':
        return 'LAPORAN CUTI HARIAN PEGAWAI';
      case 'mingguan':
        return 'LAPORAN CUTI MINGGUAN PEGAWAI';
      case 'bulanan':
        return 'LAPORAN REKAPITULASI CUTI BULANAN PEGAWAI';
      case 'rentang-tanggal':
        return 'LAPORAN REKAPITULASI CUTI BERDASARKAN RENTANG TANGGAL';
      case 'tempat-tugas':
        return 'LAPORAN REKAPITULASI CUTI PER TEMPAT TUGAS / PUSTU';
      case 'jabatan':
        return 'LAPORAN CUTI BERDASARKAN JABATAN';
      case 'jenis-cuti':
        return 'LAPORAN REKAPITULASI BERDASARKAN JENIS CUTI';
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Card (hidden during print) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs no-print space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Pusat Laporan & Ekspor Data Cuti</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cetak dokumen rekapitulasi resmi Puskesmas Kepulauan Seribu Selatan dengan periode cuti lengkap dan tanda tangan pejabat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowSignatoryConfig(!showSignatoryConfig)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition"
              title="Atur Pejabat Penandatangan Laporan"
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>{showSignatoryConfig ? 'Tutup Pejabat' : 'Penandatangan'}</span>
            </button>
            <button
              onClick={() => setShowLogoConfig(!showLogoConfig)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition"
            >
              <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
              {showLogoConfig ? 'Tutup Pengaturan Logo' : 'Pengaturan Kop Logo'}
            </button>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Excel (.xlsx)
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / Ekspor PDF
            </button>
          </div>
        </div>

        {/* Pejabat Penandatangan Configuration Drawer */}
        {showSignatoryConfig && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3 transition">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-teal-600" />
                Pejabat Penandatangan Dokumen Laporan Cuti (Diambil dari Data Pegawai)
              </h4>
              <button
                onClick={() => {
                  setSelectedKepalaNip('');
                  setSelectedPengelolaNip('');
                }}
                className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold underline"
              >
                Reset ke Default Data Pegawai
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kepala Puskesmas Selection */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px]">Kepala Puskesmas:</span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Otomatis dari Data Pegawai
                  </span>
                </div>
                <select
                  value={kepalaPuskesmas.nip}
                  onChange={(e) => setSelectedKepalaNip(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-teal-600 font-medium"
                >
                  <option value={defaultKepala.nip}>
                    {defaultKepala.nama} - {defaultKepala.jabatan} (NIP. {defaultKepala.nip})
                  </option>
                  {pegawaiList
                    .filter((p) => p.nip !== defaultKepala.nip)
                    .map((p) => (
                      <option key={`kepala-${p.nip}`} value={p.nip}>
                        {p.nama} - {p.jabatan} (NIP. {p.nip})
                      </option>
                    ))}
                </select>
                <div className="text-[11px] text-slate-600">
                  Nama di Laporan:{' '}
                  <strong className="text-slate-900 underline">{kepalaPuskesmas.nama}</strong> · NIP:{' '}
                  <span className="font-mono">{kepalaPuskesmas.nip}</span>
                </div>
              </div>

              {/* Pengelola Kepegawaian Selection */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px]">Pengelola Kepegawaian:</span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Otomatis dari Data Pegawai
                  </span>
                </div>
                <select
                  value={pengelolaKepegawaian.nip}
                  onChange={(e) => setSelectedPengelolaNip(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-teal-600 font-medium"
                >
                  <option value={defaultPengelola.nip}>
                    {defaultPengelola.nama} - {defaultPengelola.jabatan} (NIP. {defaultPengelola.nip})
                  </option>
                  {pegawaiList
                    .filter((p) => p.nip !== defaultPengelola.nip)
                    .map((p) => (
                      <option key={`pengelola-${p.nip}`} value={p.nip}>
                        {p.nama} - {p.jabatan} (NIP. {p.nip})
                      </option>
                    ))}
                </select>
                <div className="text-[11px] text-slate-600">
                  Nama di Laporan:{' '}
                  <strong className="text-slate-900 underline">{pengelolaKepegawaian.nama}</strong> · NIP:{' '}
                  <span className="font-mono">{pengelolaKepegawaian.nip}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logo Configuration Drawer */}
        {showLogoConfig && (
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 text-xs space-y-3 transition">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-teal-950 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-teal-600" />
                Kustomisasi Logo Kop Surat Resmi (PDF & Cetak)
              </h4>
              <div className="flex items-center gap-2">
                {logoSaveNotice && (
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Logo berhasil diperbarui!
                  </span>
                )}
                {(customLogoJaya || customLogoKemenkes) && (
                  <button
                    onClick={handleResetLogos}
                    className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-semibold underline"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset ke Logo Bawaan
                  </button>
                )}
              </div>
            </div>

            <p className="text-[11px] text-teal-800 leading-relaxed">
              Kop surat menggunakan <strong>Logo Jaya Raya (DKI Jakarta)</strong> di sisi kiri dan <strong>Logo Kesehatan (Kemenkes / Puskesmas)</strong> di sisi kanan. Anda dapat mengunggah file logo instansi dari perangkat Anda.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Logo Jaya Raya Box */}
              <div className="p-3 bg-white rounded-lg border border-teal-200 flex items-center gap-3">
                <div className="w-16 h-16 shrink-0 bg-slate-50 border border-slate-200 rounded p-1 flex items-center justify-center">
                  <LogoJayaRaya customSrc={customLogoJaya || undefined} className="w-14 h-14" />
                </div>
                <div className="flex-1 space-y-1">
                  <span className="font-bold text-slate-800 block text-[11px]">Logo Jaya Raya (Sisi Kiri)</span>
                  <span className="text-[10px] text-slate-500 block">
                    {customLogoJaya ? 'Menggunakan gambar kustom' : 'Menggunakan logo vektor resmi DKI'}
                  </span>
                  <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[11px] font-semibold cursor-pointer transition">
                    <Upload className="w-3 h-3" /> Ganti Gambar
                    <input type="file" accept="image/*" onChange={handleUploadLogoJaya} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Logo Kesehatan Box */}
              <div className="p-3 bg-white rounded-lg border border-teal-200 flex items-center gap-3">
                <div className="w-16 h-16 shrink-0 bg-slate-50 border border-slate-200 rounded p-1 flex items-center justify-center">
                  <LogoKesehatan customSrc={customLogoKemenkes || undefined} className="w-14 h-14" />
                </div>
                <div className="flex-1 space-y-1">
                  <span className="font-bold text-slate-800 block text-[11px]">Logo Kesehatan (Sisi Kanan)</span>
                  <span className="text-[10px] text-slate-500 block">
                    {customLogoKemenkes ? 'Menggunakan gambar kustom' : 'Menggunakan logo vektor resmi Kemenkes'}
                  </span>
                  <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[11px] font-semibold cursor-pointer transition">
                    <Upload className="w-3 h-3" /> Ganti Gambar
                    <input type="file" accept="image/*" onChange={handleUploadLogoKemenkes} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Selection Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Jenis Laporan
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as LaporanType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-teal-600 font-medium"
            >
              <option value="bulanan">Laporan Cuti Bulanan</option>
              <option value="rentang-tanggal">Laporan Rentang Tanggal (Kustom)</option>
              <option value="harian">Laporan Cuti Harian</option>
              <option value="mingguan">Laporan Cuti Mingguan</option>
              <option value="tempat-tugas">Laporan Cuti per Tempat Tugas</option>
              <option value="jabatan">Laporan Cuti per Jabatan</option>
              <option value="jenis-cuti">Laporan Rekap Jenis Cuti</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Filter Tempat Tugas
            </label>
            <select
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-teal-600 font-medium"
            >
              <option value="">Semua Unit / Pustu</option>
              {referensi.tempatTugasList.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Conditional Date Pickers based on reportType */}
          {reportType === 'bulanan' || reportType === 'tempat-tugas' || reportType === 'jabatan' || reportType === 'jenis-cuti' ? (
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Bulan Periode Cuti
              </label>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-teal-600 font-mono font-medium"
              />
            </div>
          ) : reportType === 'harian' ? (
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Tanggal Cuti
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-teal-600 font-mono font-medium"
              />
            </div>
          ) : reportType === 'rentang-tanggal' ? (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-teal-600 font-mono font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-teal-600 font-mono font-medium"
                />
              </div>
            </>
          ) : (
            <div className="lg:col-span-2 flex items-center pt-5 text-xs text-slate-600 font-medium">
              <Clock className="w-4 h-4 text-teal-600 mr-1.5" />
              <span>Minggu ini: <strong>{periodeDeskripsi}</strong></span>
            </div>
          )}
        </div>

        {/* Active Period Information Strip */}
        <div className="p-2.5 rounded-lg bg-teal-50/70 border border-teal-200 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-700" />
            <span className="text-teal-900 font-semibold">Periode Cuti Terpilih:</span>
            <span className="font-bold text-teal-950 font-mono bg-white px-2 py-0.5 rounded border border-teal-300">
              {periodeDeskripsi}
            </span>
            <span className="text-[11px] text-teal-700 font-medium">
              ({calculateDaysBetween(periodeStart, periodeEnd)} hari kalender)
            </span>
          </div>
          <div className="text-teal-900 font-medium">
            Total Ditemukan: <strong className="text-teal-950">{reportData.length}</strong> permohonan cuti
          </div>
        </div>
      </div>

      {/* Printable Sheet Layout */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 print-container">
        {/* Official Government Kop Surat with Dual Logos */}
        <div className="pb-3 mb-6">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Jaya Raya (Kiri) */}
            <div className="w-18 sm:w-22 shrink-0 flex items-center justify-center">
              <LogoJayaRaya
                customSrc={customLogoJaya || undefined}
                className="w-16 h-20 sm:w-20 sm:h-24"
              />
            </div>

            {/* Kop Teks Dinas Kesehatan & Puskesmas (Tengah) */}
            <div className="flex-1 text-center px-1">
              <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-800 leading-tight">
                PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA
              </h4>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-800 leading-tight mt-0.5">
                DINAS KESEHATAN
              </h3>
              <h2 className="text-sm sm:text-base md:text-lg font-black uppercase text-slate-900 leading-tight mt-0.5">
                PUSKESMAS KECAMATAN KEPULAUAN SERIBU SELATAN
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-600 mt-1 leading-normal">
                Jl. Pantai Selatan No. 1, Kelurahan Pulau Tidung, Kec. Kepulauan Seribu Selatan
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono mt-0.5">
                Telepon: (021) 6440268 · Pos-el: puskesmas.kepseribuselatan@jakarta.go.id · KODE POS 14520
              </p>
            </div>

            {/* Logo Kesehatan Kemenkes / Puskesmas (Kanan) */}
            <div className="w-18 sm:w-22 shrink-0 flex items-center justify-center">
              <LogoKesehatan
                customSrc={customLogoKemenkes || undefined}
                className="w-16 h-20 sm:w-20 sm:h-24"
              />
            </div>
          </div>

          {/* Official Dual Line Divider (Garis Ganda Kop Surat Resmi) */}
          <div className="mt-3">
            <div className="w-full h-[2.5px] bg-black"></div>
            <div className="w-full h-[1px] bg-black mt-[1.5px]"></div>
          </div>
        </div>

        {/* Report Document Title & Periode Cuti (Tanggal berapa sampai berapa) */}
        <div className="text-center mb-6 space-y-2">
          <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-900 uppercase underline decoration-2 underline-offset-4 tracking-tight">
            {getReportTitle()}
          </h3>

          {/* PERIODE CUTI DITAMPILKAN SECARA JELAS & EKSPLISIT */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-teal-50 border border-teal-300 text-teal-950 font-medium text-xs sm:text-sm print:border-black print:bg-white">
              <Calendar className="w-4 h-4 text-teal-700 shrink-0 no-print" />
              <span>
                <strong className="uppercase tracking-wider">PERIODE CUTI:</strong>{' '}
                <span className="font-bold underline decoration-teal-600 font-mono text-sm print:decoration-black">
                  {periodeDeskripsi}
                </span>
              </span>
            </div>
            {filterUnit && (
              <span className="text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-300 font-semibold print:border-black">
                Tempat Tugas: {filterUnit}
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-500 pt-0.5">
            Dicetak pada tanggal: {formatDateIndo(today)} · SiMONCUT (Sistem Monitoring Cuti Pegawai) Puskesmas Kepulauan Seribu Selatan
          </p>
        </div>

        {/* Report Content Table */}
        {reportType === 'tempat-tugas' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-300">
              <thead className="bg-slate-100 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2 border border-slate-300 text-center w-8">No</th>
                  <th className="p-2 border border-slate-300">Tempat Tugas</th>
                  <th className="p-2 border border-slate-300 text-right">Total Pegawai</th>
                  <th className="p-2 border border-slate-300 text-right">Cuti Periode Ini</th>
                  <th className="p-2 border border-slate-300 text-right">Tersedia</th>
                  <th className="p-2 border border-slate-300 text-right">% Cuti</th>
                  <th className="p-2 border border-slate-300 text-center">Status Operasional</th>
                </tr>
              </thead>
              <tbody>
                {tempatTugasSummary.map((s, idx) => (
                  <tr key={s.tempatTugas} className="border-b border-slate-200">
                    <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                    <td className="p-2 border border-slate-300 font-semibold">{s.tempatTugas}</td>
                    <td className="p-2 border border-slate-300 text-right font-mono">{s.totalPegawai}</td>
                    <td className="p-2 border border-slate-300 text-right font-mono">{s.cutiHariIni}</td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-bold text-emerald-700">
                      {s.tersediaHariIni}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono">{s.persentaseCuti}%</td>
                    <td className="p-2 border border-slate-300 text-center font-medium">{s.levelRisiko}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-300">
              <thead className="bg-slate-100 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2 border border-slate-300 text-center w-8">No</th>
                  <th className="p-2 border border-slate-300">Nama Pegawai / NIP</th>
                  <th className="p-2 border border-slate-300">Jabatan</th>
                  <th className="p-2 border border-slate-300">Tempat Tugas</th>
                  <th className="p-2 border border-slate-300">Pegawai Pengganti</th>
                  <th className="p-2 border border-slate-300">Jenis Cuti</th>
                  <th className="p-2 border border-slate-300">Periode Cuti (Mulai s/d Selesai)</th>
                  <th className="p-2 border border-slate-300 text-right">Hari</th>
                  <th className="p-2 border border-slate-300 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500 italic">
                      Tidak ada permohonan cuti pegawai pada periode <strong>{periodeDeskripsi}</strong>
                      {filterUnit ? ` di ${filterUnit}` : ''}.
                    </td>
                  </tr>
                ) : (
                  reportData.map((c, idx) => (
                    <tr key={c.idCuti} className="border-b border-slate-200">
                      <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                      <td className="p-2 border border-slate-300">
                        <div className="font-bold text-slate-900">{c.nama}</div>
                        <div className="text-[10px] text-slate-500 font-mono">NIP. {c.nip}</div>
                      </td>
                      <td className="p-2 border border-slate-300">{c.jabatan}</td>
                      <td className="p-2 border border-slate-300">{c.tempatTugas}</td>
                      <td className="p-2 border border-slate-300">
                        {c.namaPengganti ? (
                          <span className="font-medium text-teal-900">{c.namaPengganti}</span>
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">-</span>
                        )}
                      </td>
                      <td className="p-2 border border-slate-300 font-medium">{c.jenisCuti}</td>
                      <td className="p-2 border border-slate-300 whitespace-nowrap">
                        <div className="font-bold text-slate-900 font-mono text-[11px]">
                          {formatDateShortIndo(c.tanggalMulai)} s/d {formatDateShortIndo(c.tanggalSelesai)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-sans">
                          {formatDateIndo(c.tanggalMulai)} s/d {formatDateIndo(c.tanggalSelesai)}
                        </div>
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono font-bold">{c.jumlahHari}</td>
                      <td className="p-2 border border-slate-300 text-center font-semibold">{c.statusPersetujuan}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Signature Blocks - Mengambil dr. Ignatius Dendy Purnama dan Pipit Apriyani langsung dari data pegawai */}
        <div className="mt-12 pt-4 grid grid-cols-2 text-center text-xs">
          <div>
            <p className="text-slate-600">Pengelola Kepegawaian,</p>
            <p className="font-bold text-slate-800 mt-1">Puskesmas Kepulauan Seribu Selatan</p>
            <div className="h-16 flex items-center justify-center">
              {/* Ruang stempel & tanda tangan */}
            </div>
            <p className="font-bold text-slate-900 underline text-sm tracking-wide">
              {pengelolaKepegawaian.nama}
            </p>
            <p className="text-[11px] font-mono text-slate-600 mt-0.5">
              NIP. {pengelolaKepegawaian.nip || '-'}
            </p>
            {pengelolaKepegawaian.pangkatGolongan && (
              <p className="text-[10px] text-slate-500 font-sans">
                {pengelolaKepegawaian.pangkatGolongan}
              </p>
            )}
          </div>

          <div>
            <p className="text-slate-600">Kepulauan Seribu Selatan, {formatDateIndo(today)}</p>
            <p className="font-bold text-slate-800 mt-1">Kepala Puskesmas,</p>
            <div className="h-16 flex items-center justify-center">
              {/* Ruang stempel & tanda tangan */}
            </div>
            <p className="font-bold text-slate-900 underline text-sm tracking-wide">
              {kepalaPuskesmas.nama}
            </p>
            <p className="text-[11px] font-mono text-slate-600 mt-0.5">
              NIP. {kepalaPuskesmas.nip || '-'}
            </p>
            {kepalaPuskesmas.pangkatGolongan && (
              <p className="text-[10px] text-slate-500 font-sans">
                {kepalaPuskesmas.pangkatGolongan}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
