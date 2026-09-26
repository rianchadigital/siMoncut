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
  Search,
  Users,
  Award,
  BarChart3,
  CalendarCheck2,
  ArrowUpDown,
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
import {
  exportCutiReportToExcel,
  exportTempatTugasToExcel,
  exportRekapPegawaiCutiToExcel,
  RekapPegawaiCutiRow,
} from '../utils/exportUtils';
import { LogoJayaRaya, LogoKesehatan, formatGoogleDriveImageUrl } from './OfficialLogos';

interface LaporanViewProps {
  cutiList: Cuti[];
  pegawaiList: Pegawai[];
  tempatTugasSummary: TempatTugasSummary[];
  referensi: ReferensiMaster;
}

type LaporanType =
  | 'rekap-pegawai-cuti'
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
  const [reportType, setReportType] = useState<LaporanType>('rekap-pegawai-cuti');
  const [filterUnit, setFilterUnit] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>('2026-09');
  const [filterStartDate, setFilterStartDate] = useState<string>('2026-09-01');
  const [filterEndDate, setFilterEndDate] = useState<string>('2026-09-30');
  const [filterDate, setFilterDate] = useState<string>(today);

  // Filter khusus untuk Laporan Total Cuti per Pegawai
  const [filterTahunPegawai, setFilterTahunPegawai] = useState<string>('semua');
  const [searchPegawaiQuery, setSearchPegawaiQuery] = useState<string>('');
  const [sortByPegawai, setSortByPegawai] = useState<'hari-desc' | 'hari-asc' | 'nama-asc' | 'unit-asc'>('hari-desc');

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
  const [inputDriveJaya, setInputDriveJaya] = useState<string>('');
  const [inputDriveKemenkes, setInputDriveKemenkes] = useState<string>('');
  const [showLogoConfig, setShowLogoConfig] = useState(false);
  const [logoSaveNotice, setLogoSaveNotice] = useState(false);

  // 1. Ambil data Kepala Puskesmas langsung dari data pegawai (dr. Ignatius Dendy Purnama)
  const defaultKepala = useMemo(() => {
    const byName = pegawaiList.find((p) => /ignatius|dendy/i.test(p.nama));
    if (byName) return byName;

    const byJabatan = pegawaiList.find((p) => /kepala\s+puskesmas/i.test(p.jabatan));
    if (byJabatan) return byJabatan;

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
    const byName = pegawaiList.find((p) => /pipit|apriyani/i.test(p.nama));
    if (byName) return byName;

    const byJabatan = pegawaiList.find(
      (p) =>
        /kepegawaian|tata\s+usaha|administrasi/i.test(p.jabatan) ||
        /kepegawaian/i.test(p.pangkatGolongan || '')
    );
    if (byJabatan) return byJabatan;

    return {
      nip: '199204122020122019',
      nama: 'Pipit Apriyani, S.Kom',
      jabatan: 'Pengelola Kepegawaian',
      pangkatGolongan: 'III/a (Penata Muda)',
      tempatTugas: 'Puskesmas Kepulauan Seribu Selatan',
      puskesmasPustu: 'Puskesmas Kepulauan Seribu Selatan',
      statusKepegawaian: 'PNS' as const,
      jenisKelamin: 'Perempuan' as const,
      nomorHp: '081298765432',
      statusAktif: 'Aktif' as const,
      no: 2,
    };
  }, [pegawaiList]);

  const kepalaPuskesmas = useMemo(() => {
    if (selectedKepalaNip) {
      const found = pegawaiList.find((p) => p.nip === selectedKepalaNip);
      if (found) return found;
    }
    return defaultKepala;
  }, [selectedKepalaNip, pegawaiList, defaultKepala]);

  const pengelolaKepegawaian = useMemo(() => {
    if (selectedPengelolaNip) {
      const found = pegawaiList.find((p) => p.nip === selectedPengelolaNip);
      if (found) return found;
    }
    return defaultPengelola;
  }, [selectedPengelolaNip, pegawaiList, defaultPengelola]);

  // Kalkulasi Periode Terpilih
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
      return {
        periodeStart: filterStartDate,
        periodeEnd: filterEndDate,
        periodeDeskripsi: `${formatDateIndo(filterStartDate)} s/d ${formatDateIndo(filterEndDate)}`,
      };
    }

    if (reportType === 'rekap-pegawai-cuti') {
      return {
        periodeStart: filterTahunPegawai === 'semua' ? '2024-01-01' : `${filterTahunPegawai}-01-01`,
        periodeEnd: filterTahunPegawai === 'semua' ? today : `${filterTahunPegawai}-12-31`,
        periodeDeskripsi: filterTahunPegawai === 'semua' ? 'Seluruh Waktu (Akumulasi)' : `Tahun ${filterTahunPegawai}`,
      };
    }

    // Default: Bulanan
    const [year, month] = filterMonth.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    const mm = String(month).padStart(2, '0');
    const start = `${year}-${mm}-01`;
    const end = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`;
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    return {
      periodeStart: start,
      periodeEnd: end,
      periodeDeskripsi: `Bulan ${monthNames[month - 1]} ${year} (1 s/d ${lastDay} ${monthNames[month - 1]} ${year})`,
    };
  }, [reportType, filterMonth, filterStartDate, filterEndDate, filterDate, filterTahunPegawai, today]);

  // Perhitungan Akumulasi Cuti per Pegawai
  const rekapPegawaiData: RekapPegawaiCutiRow[] = useMemo(() => {
    const list = pegawaiList
      .filter((p) => {
        if (filterUnit && !isSameUnit(p.tempatTugas, filterUnit)) return false;
        if (searchPegawaiQuery.trim()) {
          const q = searchPegawaiQuery.toLowerCase();
          const matchNama = p.nama.toLowerCase().includes(q);
          const matchNip = p.nip.toLowerCase().includes(q);
          const matchJabatan = p.jabatan.toLowerCase().includes(q);
          if (!matchNama && !matchNip && !matchJabatan) return false;
        }
        return true;
      })
      .map((p, idx) => {
        // Cari semua permohonan cuti pegawai ini
        const employeeLeaves = cutiList.filter((c) => {
          const matchNip = c.nip && p.nip && c.nip.trim() === p.nip.trim();
          const matchName = c.nama && p.nama && c.nama.toLowerCase().trim() === p.nama.toLowerCase().trim();
          if (!matchNip && !matchName) return false;
          if (filterTahunPegawai && filterTahunPegawai !== 'semua') {
            if (!c.tanggalMulai.startsWith(filterTahunPegawai)) return false;
          }
          return true;
        });

        // Filter hanya cuti yang telah disetujui
        const approvedLeaves = employeeLeaves.filter((c) => c.statusPersetujuan === 'Disetujui');

        let totalHariCuti = 0;
        let cutiTahunanHari = 0;
        let cutiSakitHari = 0;
        let cutiAlasanPentingHari = 0;
        let cutiMelahirkanHari = 0;
        let cutiBesarHari = 0;
        let cutiLainnyaHari = 0;

        approvedLeaves.forEach((c) => {
          const days = Number(c.jumlahHari) || 0;
          totalHariCuti += days;
          const jenis = (c.jenisCuti || '').toLowerCase();
          if (jenis.includes('tahunan')) {
            cutiTahunanHari += days;
          } else if (jenis.includes('sakit')) {
            cutiSakitHari += days;
          } else if (jenis.includes('alasan penting')) {
            cutiAlasanPentingHari += days;
          } else if (jenis.includes('melahirkan') || jenis.includes('bersalin')) {
            cutiMelahirkanHari += days;
          } else if (jenis.includes('besar')) {
            cutiBesarHari += days;
          } else {
            cutiLainnyaHari += days;
          }
        });

        // Kuota cuti tahunan resmi ASN adalah 12 hari kerja per tahun
        const sisaCutiTahunan = Math.max(0, 12 - cutiTahunanHari);

        // Riwayat cuti terakhir yang diambil
        const sorted = [...employeeLeaves].sort((a, b) => b.tanggalMulai.localeCompare(a.tanggalMulai));
        const lastLeave = sorted[0];
        const cutiTerakhir = lastLeave
          ? `${formatDateShortIndo(lastLeave.tanggalMulai)} (${lastLeave.jenisCuti}, ${lastLeave.jumlahHari} hari)`
          : '-';

        return {
          no: idx + 1,
          nip: p.nip,
          nama: p.nama,
          pangkatGolongan: p.pangkatGolongan,
          jabatan: p.jabatan,
          tempatTugas: p.tempatTugas,
          statusKepegawaian: p.statusKepegawaian,
          frekuensiPengajuan: employeeLeaves.length,
          totalHariCuti,
          cutiTahunanHari,
          cutiSakitHari,
          cutiAlasanPentingHari,
          cutiMelahirkanHari,
          cutiBesarHari,
          cutiLainnyaHari,
          sisaCutiTahunan,
          cutiTerakhir,
        };
      });

    // Urutkan data sesuai preferensi pengguna
    list.sort((a, b) => {
      if (sortByPegawai === 'hari-desc') return b.totalHariCuti - a.totalHariCuti;
      if (sortByPegawai === 'hari-asc') return a.totalHariCuti - b.totalHariCuti;
      if (sortByPegawai === 'nama-asc') return a.nama.localeCompare(b.nama);
      if (sortByPegawai === 'unit-asc') return a.tempatTugas.localeCompare(b.tempatTugas);
      return 0;
    });

    return list.map((item, index) => ({
      ...item,
      no: index + 1,
    }));
  }, [pegawaiList, cutiList, filterUnit, searchPegawaiQuery, filterTahunPegawai, sortByPegawai]);

  // Statistik Ringkas Rekap Cuti Pegawai
  const rekapPegawaiStats = useMemo(() => {
    const totalPegawai = rekapPegawaiData.length;
    const pegawaiPernahCuti = rekapPegawaiData.filter((r) => r.totalHariCuti > 0).length;
    const pegawaiBelumCuti = totalPegawai - pegawaiPernahCuti;
    const totalHariAkumulasi = rekapPegawaiData.reduce((acc, curr) => acc + curr.totalHariCuti, 0);
    const rataRataHari = totalPegawai > 0 ? (totalHariAkumulasi / totalPegawai).toFixed(1) : '0';
    return {
      totalPegawai,
      pegawaiPernahCuti,
      pegawaiBelumCuti,
      totalHariAkumulasi,
      rataRataHari,
    };
  }, [rekapPegawaiData]);

  // Filter cuti umum (harian, mingguan, bulanan, dll.)
  const reportData = useMemo(() => {
    return cutiList.filter((c) => {
      if (filterUnit && !isSameUnit(c.tempatTugas, filterUnit)) return false;

      if (reportType === 'harian') {
        return isDateInRange(filterDate, c.tanggalMulai, c.tanggalSelesai);
      }

      return c.tanggalMulai <= periodeEnd && c.tanggalSelesai >= periodeStart;
    });
  }, [cutiList, filterUnit, reportType, filterDate, periodeStart, periodeEnd]);

  // Handlers untuk Logo
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

  const handleApplyDriveJaya = () => {
    if (inputDriveJaya.trim()) {
      const formatted = formatGoogleDriveImageUrl(inputDriveJaya.trim()) || inputDriveJaya.trim();
      setCustomLogoJaya(formatted);
      localStorage.setItem('simon_custom_logo_jaya', formatted);
      showSaveToast();
    }
  };

  const handleApplyDriveKemenkes = () => {
    if (inputDriveKemenkes.trim()) {
      const formatted = formatGoogleDriveImageUrl(inputDriveKemenkes.trim()) || inputDriveKemenkes.trim();
      setCustomLogoKemenkes(formatted);
      localStorage.setItem('simon_custom_logo_kemenkes', formatted);
      showSaveToast();
    }
  };

  const handleResetLogos = () => {
    setCustomLogoJaya('');
    setCustomLogoKemenkes('');
    setInputDriveJaya('');
    setInputDriveKemenkes('');
    localStorage.removeItem('simon_custom_logo_jaya');
    localStorage.removeItem('simon_custom_logo_kemenkes');
    showSaveToast();
  };

  const showSaveToast = () => {
    setLogoSaveNotice(true);
    setTimeout(() => setLogoSaveNotice(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (reportType === 'rekap-pegawai-cuti') {
      exportRekapPegawaiCutiToExcel(
        rekapPegawaiData,
        filterTahunPegawai === 'semua' ? 'Semua Waktu' : `Tahun ${filterTahunPegawai}`
      );
    } else if (reportType === 'tempat-tugas') {
      exportTempatTugasToExcel(tempatTugasSummary);
    } else {
      exportCutiReportToExcel(reportData, `Laporan_${reportType}_${periodeStart}_sd_${periodeEnd}`);
    }
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'rekap-pegawai-cuti':
        return `LAPORAN REKAPITULASI TOTAL HARI CUTI YANG SUDAH DIAMBIL PER PEGAWAI ${
          filterTahunPegawai !== 'semua' ? `TAHUN ${filterTahunPegawai}` : '(AKUMULASI SELURUH WAKTU)'
        }`;
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
              Cetak dokumen rekapitulasi resmi Puskesmas Kepulauan Seribu Selatan dengan kop logo resmi dan tanda tangan pejabat.
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
              title="Kustomisasi Logo Kop Surat Jaya Raya dan Kesehatan"
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

        {/* Quick Report Type Selector Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
            Pilihan Laporan:
          </span>
          <button
            onClick={() => setReportType('rekap-pegawai-cuti')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
              reportType === 'rekap-pegawai-cuti'
                ? 'bg-teal-700 text-white border border-teal-800 ring-2 ring-teal-600/30'
                : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Total Cuti per Pegawai</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">Baru</span>
          </button>

          <button
            onClick={() => setReportType('bulanan')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              reportType === 'bulanan'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Bulanan
          </button>
          <button
            onClick={() => setReportType('tempat-tugas')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              reportType === 'tempat-tugas'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Per Tempat Tugas
          </button>
          <button
            onClick={() => setReportType('rentang-tanggal')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              reportType === 'rentang-tanggal'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Rentang Tanggal
          </button>
          <button
            onClick={() => setReportType('harian')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              reportType === 'harian'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Harian
          </button>
          <button
            onClick={() => setReportType('mingguan')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              reportType === 'mingguan'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Mingguan
          </button>
        </div>

        {/* Pejabat Penandatangan Drawer */}
        {showSignatoryConfig && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3 transition">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-teal-600" />
                Pejabat Penandatangan Dokumen Laporan Cuti (Diambil Otomatis dari Data Pegawai)
              </h4>
              <button
                onClick={() => {
                  setSelectedKepalaNip('');
                  setSelectedPengelolaNip('');
                }}
                className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold underline"
              >
                Reset ke Default Pegawai
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <option key={p.nip} value={p.nip}>
                        {p.nama} - {p.jabatan} (NIP. {p.nip})
                      </option>
                    ))}
                </select>
                <div className="text-[11px] text-slate-600">
                  Nama di Laporan: <strong className="text-slate-900 underline">{kepalaPuskesmas.nama}</strong> · NIP:{' '}
                  <span className="font-mono">{kepalaPuskesmas.nip}</span>
                </div>
              </div>

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
                      <option key={p.nip} value={p.nip}>
                        {p.nama} - {p.jabatan} (NIP. {p.nip})
                      </option>
                    ))}
                </select>
                <div className="text-[11px] text-slate-600">
                  Nama di Laporan: <strong className="text-slate-900 underline">{pengelolaKepegawaian.nama}</strong> · NIP:{' '}
                  <span className="font-mono">{pengelolaKepegawaian.nip}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logo Configuration Drawer */}
        {showLogoConfig && (
          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/90 text-xs space-y-3 transition">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-teal-950 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-teal-600" />
                Pengaturan Logo Kop Surat Resmi (Logo Jaya Raya DKI & Logo Kesehatan)
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
                    className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-semibold underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset ke Logo Standar
                  </button>
                )}
              </div>
            </div>

            <p className="text-[11px] text-teal-900 leading-relaxed">
              Kop surat menggunakan <strong>Logo Jaya Raya DKI Jakarta</strong> di sisi kiri dan <strong>Logo Kesehatan (Kemenkes / Puskesmas)</strong> di sisi kanan. Anda dapat mengunggah file dari perangkat atau menempelkan tautan Google Drive.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Logo Jaya Raya Box */}
              <div className="p-3 bg-white rounded-lg border border-teal-200 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-16 shrink-0 bg-slate-50 border border-slate-200 rounded p-1 flex items-center justify-center">
                    <LogoJayaRaya customSrc={customLogoJaya || undefined} className="w-12 h-14" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="font-bold text-slate-800 block text-[11px]">Logo Jaya Raya (Kiri)</span>
                    <span className="text-[10px] text-slate-500 block">
                      {customLogoJaya ? 'Kustom aktif' : 'Vektor resmi DKI Jakarta'}
                    </span>
                    <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-teal-50 border border-teal-300 text-teal-800 text-[10px] font-semibold hover:bg-teal-100 cursor-pointer">
                      <Upload className="w-3 h-3" /> Upload File
                      <input type="file" accept="image/*" onChange={handleUploadLogoJaya} className="hidden" />
                    </label>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                    Atau Link Google Drive Logo Jaya Raya:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/..."
                      value={inputDriveJaya}
                      onChange={(e) => setInputDriveJaya(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-800 focus:outline-hidden focus:border-teal-600"
                    />
                    <button
                      onClick={handleApplyDriveJaya}
                      className="px-2.5 py-1 bg-teal-700 text-white rounded text-[11px] font-semibold hover:bg-teal-800 cursor-pointer shrink-0"
                    >
                      Terapkan
                    </button>
                  </div>
                </div>
              </div>

              {/* Logo Kesehatan Box */}
              <div className="p-3 bg-white rounded-lg border border-teal-200 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-16 shrink-0 bg-slate-50 border border-slate-200 rounded p-1 flex items-center justify-center">
                    <LogoKesehatan customSrc={customLogoKemenkes || undefined} className="w-12 h-14" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="font-bold text-slate-800 block text-[11px]">Logo Kesehatan (Kanan)</span>
                    <span className="text-[10px] text-slate-500 block">
                      {customLogoKemenkes ? 'Kustom aktif' : 'Vektor resmi Puskesmas Indonesia'}
                    </span>
                    <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-teal-50 border border-teal-300 text-teal-800 text-[10px] font-semibold hover:bg-teal-100 cursor-pointer">
                      <Upload className="w-3 h-3" /> Upload File
                      <input type="file" accept="image/*" onChange={handleUploadLogoKemenkes} className="hidden" />
                    </label>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-[10px] text-slate-500 font-semibold mb-1">
                    Atau Link Google Drive Logo Kesehatan:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/..."
                      value={inputDriveKemenkes}
                      onChange={(e) => setInputDriveKemenkes(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-800 focus:outline-hidden focus:border-teal-600"
                    />
                    <button
                      onClick={handleApplyDriveKemenkes}
                      className="px-2.5 py-1 bg-teal-700 text-white rounded text-[11px] font-semibold hover:bg-teal-800 cursor-pointer shrink-0"
                    >
                      Terapkan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Selection Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Pilih Jenis Laporan
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as LaporanType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-teal-600 font-semibold"
            >
              <option value="rekap-pegawai-cuti">⭐ Rekap Total Cuti per Pegawai (Akumulasi)</option>
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

          {/* Conditional Filters depending on reportType */}
          {reportType === 'rekap-pegawai-cuti' ? (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Periode Tahun Cuti
                </label>
                <select
                  value={filterTahunPegawai}
                  onChange={(e) => setFilterTahunPegawai(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-teal-600 font-medium"
                >
                  <option value="semua">Semua Waktu (Akumulasi Historis)</option>
                  <option value="2026">Tahun 2026 (Tahun Berjalan)</option>
                  <option value="2025">Tahun 2025</option>
                  <option value="2024">Tahun 2024</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Urutkan Berdasarkan
                </label>
                <select
                  value={sortByPegawai}
                  onChange={(e) => setSortByPegawai(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-teal-600 font-medium"
                >
                  <option value="hari-desc">Total Hari Cuti: Terbanyak ke Tersedikit</option>
                  <option value="hari-asc">Total Hari Cuti: Tersedikit ke Terbanyak</option>
                  <option value="nama-asc">Nama Pegawai (A ke Z)</option>
                  <option value="unit-asc">Tempat Tugas</option>
                </select>
              </div>
            </>
          ) : reportType === 'bulanan' || reportType === 'tempat-tugas' || reportType === 'jabatan' || reportType === 'jenis-cuti' ? (
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

        {/* Search input for rekap-pegawai-cuti */}
        {reportType === 'rekap-pegawai-cuti' && (
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchPegawaiQuery}
                onChange={(e) => setSearchPegawaiQuery(e.target.value)}
                placeholder="Cari nama pegawai, NIP, atau jabatan..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-teal-600 placeholder:text-slate-400"
              />
            </div>
            {searchPegawaiQuery && (
              <button
                onClick={() => setSearchPegawaiQuery('')}
                className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold underline shrink-0"
              >
                Hapus Pencarian
              </button>
            )}
          </div>
        )}

        {/* Active Period / Stat Information Strip */}
        <div className="p-2.5 rounded-lg bg-teal-50/70 border border-teal-200 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-700" />
            <span className="text-teal-900 font-semibold">Periode Laporan:</span>
            <span className="font-bold text-teal-950 font-mono bg-white px-2 py-0.5 rounded border border-teal-300">
              {periodeDeskripsi}
            </span>
          </div>

          <div className="text-teal-900 font-medium">
            {reportType === 'rekap-pegawai-cuti' ? (
              <span>
                Total Data: <strong className="text-teal-950">{rekapPegawaiData.length}</strong> pegawai · Total Cuti Diambil:{' '}
                <strong className="text-teal-950 font-bold">{rekapPegawaiStats.totalHariAkumulasi} Hari</strong>
              </span>
            ) : (
              <span>
                Total Ditemukan: <strong className="text-teal-950">{reportData.length}</strong> permohonan cuti
              </span>
            )}
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

          {/* Official Dual Line Divider */}
          <div className="mt-3">
            <div className="w-full h-[2.5px] bg-black"></div>
            <div className="w-full h-[1px] bg-black mt-[1.5px]"></div>
          </div>
        </div>

        {/* Report Document Title & Subtitle */}
        <div className="text-center mb-6 space-y-2">
          <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-900 uppercase underline decoration-2 underline-offset-4 tracking-tight">
            {getReportTitle()}
          </h3>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-teal-50 border border-teal-300 text-teal-950 font-medium text-xs sm:text-sm print:border-black print:bg-white">
              <Calendar className="w-4 h-4 text-teal-700 shrink-0 no-print" />
              <span>
                <strong className="uppercase tracking-wider">PERIODE LAPORAN:</strong>{' '}
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

        {/* Summary Metric Cards for rekap-pegawai-cuti (No print) */}
        {reportType === 'rekap-pegawai-cuti' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 no-print">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-600" />
                <span>Total Pegawai</span>
              </div>
              <div className="text-lg font-black text-slate-900 mt-1 font-mono">
                {rekapPegawaiStats.totalPegawai} <span className="text-xs font-normal text-slate-500">Orang</span>
              </div>
            </div>

            <div className="p-3 bg-teal-50/60 rounded-lg border border-teal-200">
              <div className="text-[11px] font-medium text-teal-800 flex items-center gap-1.5">
                <CalendarCheck2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Pernah Cuti</span>
              </div>
              <div className="text-lg font-black text-teal-900 mt-1 font-mono">
                {rekapPegawaiStats.pegawaiPernahCuti} <span className="text-xs font-normal text-teal-700">Orang</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200">
              <div className="text-[11px] font-medium text-amber-800 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
                <span>Akumulasi Hari Cuti</span>
              </div>
              <div className="text-lg font-black text-amber-950 mt-1 font-mono">
                {rekapPegawaiStats.totalHariAkumulasi} <span className="text-xs font-normal text-amber-800">Hari</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
              <div className="text-[11px] font-medium text-emerald-800 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>Rata-rata Cuti</span>
              </div>
              <div className="text-lg font-black text-emerald-950 mt-1 font-mono">
                {rekapPegawaiStats.rataRataHari} <span className="text-xs font-normal text-emerald-800">Hari/Pegawai</span>
              </div>
            </div>
          </div>
        )}

        {/* Content Table by Report Type */}
        {reportType === 'rekap-pegawai-cuti' ? (
          /* TABEL REKAPITULASI TOTAL HARI CUTI YANG PERNAH DIAMBIL PER PEGAWAI */
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-300">
              <thead className="bg-slate-100 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2 border border-slate-300 text-center w-8">No</th>
                  <th className="p-2 border border-slate-300">NIP & Nama Pegawai</th>
                  <th className="p-2 border border-slate-300">Jabatan</th>
                  <th className="p-2 border border-slate-300">Tempat Tugas</th>
                  <th className="p-2 border border-slate-300 text-center">Status</th>
                  <th className="p-2 border border-slate-300 text-center">Pengajuan</th>
                  <th className="p-2 border border-slate-300 text-center bg-teal-100/70 font-black">
                    Total Cuti Diambil
                  </th>
                  <th className="p-2 border border-slate-300 text-center">Tahunan</th>
                  <th className="p-2 border border-slate-300 text-center bg-emerald-50 font-bold text-emerald-800">
                    Sisa Tahunan
                  </th>
                  <th className="p-2 border border-slate-300 text-center">Sakit</th>
                  <th className="p-2 border border-slate-300 text-center">Alasan Penting</th>
                  <th className="p-2 border border-slate-300 text-center">Lainnya</th>
                  <th className="p-2 border border-slate-300">Cuti Terakhir</th>
                </tr>
              </thead>
              <tbody>
                {rekapPegawaiData.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="p-8 text-center text-slate-500 italic">
                      Tidak ditemukan data pegawai yang sesuai dengan kriteria filter.
                    </td>
                  </tr>
                ) : (
                  rekapPegawaiData.map((row) => (
                    <tr
                      key={row.nip || row.nama}
                      className={`border-b border-slate-200 hover:bg-slate-50 transition ${
                        row.totalHariCuti > 0 ? '' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="p-2 border border-slate-300 text-center font-mono font-medium">
                        {row.no}
                      </td>
                      <td className="p-2 border border-slate-300">
                        <div className="font-bold text-slate-900">{row.nama}</div>
                        <div className="text-[10px] text-slate-500 font-mono">NIP. {row.nip || '-'}</div>
                      </td>
                      <td className="p-2 border border-slate-300">
                        <div>{row.jabatan}</div>
                        {row.pangkatGolongan && row.pangkatGolongan !== '-' && (
                          <div className="text-[10px] text-slate-400">{row.pangkatGolongan}</div>
                        )}
                      </td>
                      <td className="p-2 border border-slate-300 font-medium text-slate-700">
                        {row.tempatTugas}
                      </td>
                      <td className="p-2 border border-slate-300 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            row.statusKepegawaian === 'PNS'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : row.statusKepegawaian === 'PPPK'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {row.statusKepegawaian}
                        </span>
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-mono text-slate-600">
                        {row.frekuensiPengajuan}x
                      </td>
                      <td className="p-2 border border-slate-300 text-center bg-teal-50/80">
                        <span
                          className={`inline-block px-2.5 py-1 rounded font-mono font-black text-xs ${
                            row.totalHariCuti > 0
                              ? 'bg-teal-700 text-white shadow-2xs'
                              : 'bg-slate-200 text-slate-500 font-medium'
                          }`}
                        >
                          {row.totalHariCuti} Hari
                        </span>
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-mono font-semibold">
                        {row.cutiTahunanHari} hr
                      </td>
                      <td className="p-2 border border-slate-300 text-center bg-emerald-50/50 font-mono font-bold text-emerald-800">
                        {row.sisaCutiTahunan} hr
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-mono text-slate-600">
                        {row.cutiSakitHari} hr
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-mono text-slate-600">
                        {row.cutiAlasanPentingHari} hr
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-mono text-slate-600">
                        {row.cutiMelahirkanHari + row.cutiBesarHari + row.cutiLainnyaHari} hr
                      </td>
                      <td className="p-2 border border-slate-300 text-[11px] text-slate-600">
                        {row.cutiTerakhir}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : reportType === 'tempat-tugas' ? (
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

        {/* Signature Blocks - dr. Ignatius Dendy Purnama & Pipit Apriyani */}
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
