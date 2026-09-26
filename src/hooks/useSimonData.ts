import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Pegawai,
  Cuti,
  ReferensiMaster,
  DashboardStats,
  TempatTugasSummary,
  JabatanSummary,
  UserRole,
  GlobalFilter,
} from '../types';
import { INITIAL_PEGAWAI, INITIAL_CUTI, REFERENSI_MASTER } from '../data/initialData';
import {
  isLeaveActiveToday,
  isLeaveStartingInNextDays,
  isLeaveOverlappingWeek,
  isLeaveOverlappingMonth,
  isLeaveOverlappingNextMonth,
  getTodayString,
  getNow,
  isSameUnit,
  normalizeDateStr,
  normalizeJenisCuti,
  normalizeTempatTugas,
  detectPegawaiTempatTugas,
  OFFICIAL_TEMPAT_TUGAS,
} from '../utils/dateUtils';

const STORAGE_KEYS = {
  PEGAWAI: 'simon_pegawai_v1',
  CUTI: 'simon_cuti_v1',
  REFERENSI: 'simon_referensi_v1',
  GAS_URL: 'simon_gas_url_v1',
  LAST_SYNC: 'simon_last_sync_v1',
  ROLE: 'simon_user_role_v1',
};

export const DEFAULT_GAS_URL =
  'https://script.google.com/macros/s/AKfycbxva-qmhnXDmrn3ioRp4RcO5ZVvK5qy-N4HYiWUPY8FGmuIcMGuDXtlC6Suii3sFZQQ/exec';

// Helper to normalize pegawai rows from storage or network
function normalizePegawaiItem(p: any, idx = 0): Pegawai {
  const normUnit = detectPegawaiTempatTugas(p.tempatTugas, p.puskesmasPustu);
  return {
    ...p,
    no: Number(p.no) || idx + 1,
    nip: String(p.nip || '').trim(),
    nama: String(p.nama || '').trim(),
    pangkatGolongan: String(p.pangkatGolongan || '-').trim(),
    jabatan: String(p.jabatan || '').trim(),
    tempatTugas: normUnit,
    puskesmasPustu: normUnit,
    statusKepegawaian: String(p.statusKepegawaian || 'PNS').trim() as any,
    jenisKelamin: String(p.jenisKelamin || 'Laki-laki').trim() as any,
    nomorHp: String(p.nomorHp || '-').trim(),
    statusAktif: String(p.statusAktif || 'Aktif').trim() as any,
  };
}

// Helper to normalize cuti rows from storage or network
function normalizeCutiItem(c: any): Cuti {
  const normUnit = detectPegawaiTempatTugas(c.tempatTugas, c.puskesmasPustu);
  return {
    ...c,
    idCuti: String(c.idCuti || `CUTI-${Math.floor(1000 + Math.random() * 9000)}`),
    nip: String(c.nip || '').trim(),
    nama: String(c.nama || '').trim(),
    jabatan: String(c.jabatan || '').trim(),
    tempatTugas: normUnit,
    namaPengganti: c.namaPengganti ? String(c.namaPengganti).trim() : undefined,
    jenisCuti: normalizeJenisCuti(c.jenisCuti) as any,
    tanggalMulai: normalizeDateStr(c.tanggalMulai),
    tanggalSelesai: normalizeDateStr(c.tanggalSelesai),
    jumlahHari: Number(c.jumlahHari) || 1,
    alasan: String(c.alasan || '').trim(),
    nomorSuratCuti: String(c.nomorSuratCuti || '').trim(),
    tanggalPengajuan: normalizeDateStr(c.tanggalPengajuan) || getTodayString(),
    statusPersetujuan: String(c.statusPersetujuan || 'Disetujui').trim() as any,
    pejabatPenyetuju: String(c.pejabatPenyetuju || '').trim(),
    catatan: String(c.catatan || '').trim(),
    timestampUpdate: c.timestampUpdate || new Date().toISOString(),
  };
}

export function useSimonData() {
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PEGAWAI);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(normalizePegawaiItem);
        }
      }
      return INITIAL_PEGAWAI.map(normalizePegawaiItem);
    } catch {
      return INITIAL_PEGAWAI.map(normalizePegawaiItem);
    }
  });

  const [cutiList, setCutiList] = useState<Cuti[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUTI);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(normalizeCutiItem);
        }
      }
      return INITIAL_CUTI.map(normalizeCutiItem);
    } catch {
      return INITIAL_CUTI.map(normalizeCutiItem);
    }
  });

  const [referensi, setReferensi] = useState<ReferensiMaster>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REFERENSI);
      return saved ? JSON.parse(saved) : REFERENSI_MASTER;
    } catch {
      return REFERENSI_MASTER;
    }
  });

  const [gasUrl, setGasUrl] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GAS_URL);
    return saved && saved.trim() ? saved : DEFAULT_GAS_URL;
  });

  const [lastSync, setLastSync] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || new Date().toISOString();
  });

  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'ADMIN KEPEGAWAIAN';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    type: 'idle' | 'success' | 'warning' | 'error';
    message: string;
  }>({
    type: 'idle',
    message: '',
  });

  // Global filters
  const [filters, setFilters] = useState<GlobalFilter>({
    tempatTugas: '',
    jabatan: '',
    jenisCuti: '',
    statusPersetujuan: '',
    searchQuery: '',
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PEGAWAI, JSON.stringify(pegawaiList));
    } catch (e) {
      console.warn('Failed to save pegawai to localStorage', e);
    }
  }, [pegawaiList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUTI, JSON.stringify(cutiList));
    } catch (e) {
      console.warn('Failed to save cuti to localStorage', e);
    }
  }, [cutiList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REFERENSI, JSON.stringify(referensi));
    } catch (e) {
      console.warn('Failed to save referensi to localStorage', e);
    }
  }, [referensi]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  }, [role]);

  // Dynamic Referensi combining sheet REFERENSI and any additional values in DATA_PEGAWAI
  const dynamicReferensi: ReferensiMaster = useMemo(() => {
    const tempatSet = new Set(referensi.tempatTugasList);
    const jabatanSet = new Set(referensi.jabatanList);
    const jenisSet = new Set(referensi.jenisCutiList);

    pegawaiList.forEach((p) => {
      if (p.tempatTugas && p.tempatTugas.trim()) tempatSet.add(p.tempatTugas.trim());
      if (p.jabatan && p.jabatan.trim()) jabatanSet.add(p.jabatan.trim());
    });

    cutiList.forEach((c) => {
      if (c.tempatTugas && c.tempatTugas.trim()) tempatSet.add(c.tempatTugas.trim());
      if (c.jabatan && c.jabatan.trim()) jabatanSet.add(c.jabatan.trim());
    });

    return {
      tempatTugasList: Array.from(OFFICIAL_TEMPAT_TUGAS),
      jabatanList: Array.from(jabatanSet),
      jenisCutiList: Array.from(jenisSet),
      statusKepegawaianList: referensi.statusKepegawaianList,
      statusPersetujuanList: referensi.statusPersetujuanList,
    };
  }, [referensi, pegawaiList, cutiList]);

  // Save GAS URL
  const updateGasUrl = useCallback((url: string) => {
    const trimmed = url.trim();
    setGasUrl(trimmed);
    localStorage.setItem(STORAGE_KEYS.GAS_URL, trimmed);
  }, []);

  // Reset to initial demo data
  const resetToDefault = useCallback(() => {
    setPegawaiList(INITIAL_PEGAWAI.map(normalizePegawaiItem));
    setCutiList(INITIAL_CUTI.map(normalizeCutiItem));
    setReferensi(REFERENSI_MASTER);
    const now = new Date().toISOString();
    setLastSync(now);
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);
    setSyncStatus({
      type: 'success',
      message: 'Data berhasil dikembalikan ke standar awal Puskesmas Kepulauan Seribu Selatan.',
    });
  }, []);

  // Fetch / Sync with Google Spreadsheet via Google Apps Script
  const refreshData = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setIsLoading(true);
      setSyncStatus({ type: 'idle', message: 'Menghubungkan ke Google Spreadsheet...' });
    }

    const targetUrl = gasUrl && gasUrl.trim() ? gasUrl.trim() : DEFAULT_GAS_URL;

    if (!targetUrl) {
      if (!isSilent) {
        setTimeout(() => {
          const now = new Date().toISOString();
          setLastSync(now);
          localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);
          setIsLoading(false);
          setSyncStatus({
            type: 'warning',
            message:
              'Sinkronisasi lokal selesai. Sambungkan Google Apps Script Web App URL untuk mengambil data live dari Spreadsheet.',
          });
        }, 500);
      }
      return;
    }

    try {
      const endpoint = targetUrl.includes('?') ? `${targetUrl}&action=all` : `${targetUrl}?action=all`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Gagal menghubungi Google Apps Script`);
      }

      const result = await response.json();

      if (result.status === 'success' || result.pegawai || result.cuti) {
        if (Array.isArray(result.pegawai) && result.pegawai.length > 0) {
          setPegawaiList(result.pegawai.map(normalizePegawaiItem));
        }
        if (Array.isArray(result.cuti)) {
          setCutiList(result.cuti.map(normalizeCutiItem));
        }
        if (result.referensi) {
          setReferensi((prev) => ({
            tempatTugasList: Array.from(OFFICIAL_TEMPAT_TUGAS),
            jabatanList:
              Array.isArray(result.referensi.jabatanList) && result.referensi.jabatanList.length > 0
                ? result.referensi.jabatanList
                : prev.jabatanList,
            jenisCutiList:
              Array.isArray(result.referensi.jenisCutiList) && result.referensi.jenisCutiList.length > 0
                ? result.referensi.jenisCutiList
                : prev.jenisCutiList,
            statusKepegawaianList:
              Array.isArray(result.referensi.statusKepegawaianList) && result.referensi.statusKepegawaianList.length > 0
                ? result.referensi.statusKepegawaianList
                : prev.statusKepegawaianList,
            statusPersetujuanList:
              Array.isArray(result.referensi.statusPersetujuanList) && result.referensi.statusPersetujuanList.length > 0
                ? result.referensi.statusPersetujuanList
                : prev.statusPersetujuanList,
          }));
        }

        const now = new Date().toISOString();
        setLastSync(now);
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);
        setSyncStatus({
          type: 'success',
          message: 'Berhasil sinkronisasi otomatis dengan Google Spreadsheet Puskesmas!',
        });
      } else {
        if (result.message && result.message.includes('Sheet DATA_PEGAWAI tidak ditemukan')) {
          setSyncStatus({
            type: 'warning',
            message:
              'GAS Berhasil Terhubung! Di Google Spreadsheet, silakan buat sheet bernama "DATA_PEGAWAI", "DATA_CUTI", dan "REFERENSI" (atau unduh template CSV di menu Integrasi).',
          });
          const now = new Date().toISOString();
          setLastSync(now);
          localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);
        } else if (!isSilent) {
          throw new Error(result.message || 'Format data dari Spreadsheet tidak valid');
        }
      }
    } catch (err) {
      console.warn('Fetch GAS error:', err);
      if (!isSilent) {
        setSyncStatus({
          type: 'error',
          message:
            err instanceof Error
              ? `Gagal sinkronisasi: ${err.message}`
              : 'Gagal terhubung ke Google Apps Script. Periksa URL dan izin akses (Anyone).',
        });
      }
    } finally {
      if (!isSilent) {
        setIsLoading(false);
      }
    }
  }, [gasUrl]);

  // Auto-Sync: Automatically connect and fetch on app load & periodically every 60 seconds
  useEffect(() => {
    // 1. Initial auto sync on open in ANY browser or gadget
    refreshData(true);

    // 2. Periodic sync every 60 seconds
    const interval = setInterval(() => {
      refreshData(true);
    }, 60000);

    // 3. Sync on tab focus or when device comes online
    const handleFocus = () => refreshData(true);
    const handleOnline = () => refreshData(true);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [refreshData]);

  // Add new leave record
  const addCuti = useCallback(
    async (newCutiData: Omit<Cuti, 'idCuti' | 'timestampUpdate'>) => {
      const idCuti = `CUTI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const timestampUpdate = new Date().toISOString();
      const completeCuti: Cuti = normalizeCutiItem({
        ...newCutiData,
        idCuti,
        timestampUpdate,
      });

      setCutiList((prev) => [completeCuti, ...prev]);

      // If gasUrl configured, try posting in background
      if (gasUrl) {
        try {
          fetch(gasUrl, {
            method: 'POST',
            mode: 'no-cors', // Apps Script web app handling
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'addCuti', cuti: completeCuti }),
          }).catch((e) => console.log('POST to GAS background:', e));
        } catch {
          // Ignore background POST errors
        }
      }

      return completeCuti;
    },
    [gasUrl]
  );

  // Add new employee record
  const addPegawai = useCallback(
    async (newPegawaiData: Omit<Pegawai, 'no'>) => {
      const nextNo = pegawaiList.length > 0 ? Math.max(...pegawaiList.map((p) => p.no || 0)) + 1 : 1;
      const completePegawai: Pegawai = {
        ...newPegawaiData,
        no: nextNo,
      };

      setPegawaiList((prev) => [...prev, completePegawai]);

      if (gasUrl) {
        try {
          fetch(gasUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'addPegawai', pegawai: completePegawai }),
          }).catch((e) => console.log('POST pegawai to GAS:', e));
        } catch {
          // Ignore background POST errors
        }
      }

      return completePegawai;
    },
    [gasUrl, pegawaiList]
  );

  // Update status persetujuan
  const updateStatusCuti = useCallback((idCuti: string, status: Cuti['statusPersetujuan'], catatan?: string) => {
    setCutiList((prev) =>
      prev.map((c) =>
        c.idCuti === idCuti
          ? {
              ...c,
              statusPersetujuan: status,
              catatan: catatan !== undefined ? catatan : c.catatan,
              timestampUpdate: new Date().toISOString(),
            }
          : c
      )
    );
  }, []);

  // Active pegawai list - match all employees that are not explicitly marked as inactive
  const activePegawaiList = useMemo(() => {
    return pegawaiList.filter((p) => {
      if (!p.statusAktif) return true;
      const s = String(p.statusAktif).trim().toLowerCase();
      return s !== 'tidak aktif' && s !== 'non-aktif' && s !== 'inactive' && s !== 'false';
    });
  }, [pegawaiList]);

  // Today string
  const todayStr = useMemo(() => getTodayString(), []);
  const now = useMemo(() => getNow(), []);

  // Filtered Cuti based on Global Filter
  const filteredCutiList = useMemo(() => {
    return cutiList.filter((c) => {
      if (filters.tempatTugas && !isSameUnit(c.tempatTugas, filters.tempatTugas)) return false;
      if (filters.jabatan && c.jabatan !== filters.jabatan) return false;
      if (filters.jenisCuti && c.jenisCuti !== filters.jenisCuti) return false;
      if (filters.statusPersetujuan && c.statusPersetujuan !== filters.statusPersetujuan) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchName = c.nama.toLowerCase().includes(query);
        const matchNip = c.nip.toLowerCase().includes(query);
        const matchJabatan = c.jabatan.toLowerCase().includes(query);
        const matchTempat = c.tempatTugas.toLowerCase().includes(query);
        const matchJenis = c.jenisCuti.toLowerCase().includes(query);
        if (!matchName && !matchNip && !matchJabatan && !matchTempat && !matchJenis) {
          return false;
        }
      }
      return true;
    });
  }, [cutiList, filters]);

  // Specific Time-Based Leaves - show all non-rejected leaves (both Disetujui & Pengajuan)
  const cutiHariIni = useMemo(() => {
    return cutiList.filter((c) => {
      const s = (c.statusPersetujuan || '').trim().toLowerCase();
      if (s === 'ditolak') return false;
      return isLeaveActiveToday(c.tanggalMulai, c.tanggalSelesai, todayStr);
    });
  }, [cutiList, todayStr]);

  const cuti3Hari = useMemo(() => {
    return cutiList.filter((c) => {
      const s = (c.statusPersetujuan || '').trim().toLowerCase();
      if (s === 'ditolak') return false;
      return isLeaveStartingInNextDays(c.tanggalMulai, 3, todayStr);
    });
  }, [cutiList, todayStr]);

  const cutiMingguIni = useMemo(() => {
    return cutiList.filter((c) => {
      const s = (c.statusPersetujuan || '').trim().toLowerCase();
      if (s === 'ditolak') return false;
      return isLeaveOverlappingWeek(c.tanggalMulai, c.tanggalSelesai, now);
    });
  }, [cutiList, now]);

  const cutiBulanIni = useMemo(() => {
    return cutiList.filter((c) => {
      const s = (c.statusPersetujuan || '').trim().toLowerCase();
      if (s === 'ditolak') return false;
      return isLeaveOverlappingMonth(c.tanggalMulai, c.tanggalSelesai, now);
    });
  }, [cutiList, now]);

  const cutiBulanDepan = useMemo(() => {
    return cutiList.filter((c) => {
      const s = (c.statusPersetujuan || '').trim().toLowerCase();
      if (s === 'ditolak') return false;
      return isLeaveOverlappingNextMonth(c.tanggalMulai, c.tanggalSelesai, now);
    });
  }, [cutiList, now]);

  const pengajuanPending = useMemo(() => {
    return cutiList.filter((c) => {
      const s = (c.statusPersetujuan || '').trim().toLowerCase();
      return s === 'pengajuan';
    });
  }, [cutiList]);

  // High-Level Dashboard Stats
  const dashboardStats: DashboardStats = useMemo(() => {
    const totalCount = activePegawaiList.length > 0 ? activePegawaiList.length : pegawaiList.length;
    return {
      totalPegawaiAktif: totalCount,
      cutiHariIni: cutiHariIni.length,
      cutiMingguIni: cutiMingguIni.length,
      cutiBulanIni: cutiBulanIni.length,
      cutiBulanDepan: cutiBulanDepan.length,
      pengajuanPending: pengajuanPending.length,
    };
  }, [activePegawaiList.length, pegawaiList.length, cutiHariIni.length, cutiMingguIni.length, cutiBulanIni.length, cutiBulanDepan.length, pengajuanPending.length]);

  // Tempat Tugas Summary
  const tempatTugasSummary: TempatTugasSummary[] = useMemo(() => {
    return dynamicReferensi.tempatTugasList.map((unit) => {
      const total = activePegawaiList.filter((p) => isSameUnit(p.tempatTugas, unit)).length;
      const cHari = cutiHariIni.filter((c) => isSameUnit(c.tempatTugas, unit)).length;
      const cMinggu = cutiMingguIni.filter((c) => isSameUnit(c.tempatTugas, unit)).length;
      const cBulan = cutiBulanIni.filter((c) => isSameUnit(c.tempatTugas, unit)).length;
      const cBulanDepan = cutiBulanDepan.filter((c) => isSameUnit(c.tempatTugas, unit)).length;

      const pct = total > 0 ? Math.round((cHari / total) * 100) : 0;
      let levelRisiko: 'Aman' | 'Waspada' | 'Kritis' = 'Aman';
      if (pct >= 40 || (total <= 3 && cHari >= 1)) {
        levelRisiko = 'Kritis';
      } else if (pct >= 25 || cHari >= 2) {
        levelRisiko = 'Waspada';
      }

      return {
        tempatTugas: unit,
        totalPegawai: total,
        cutiHariIni: cHari,
        cutiMingguIni: cMinggu,
        cutiBulanIni: cBulan,
        cutiBulanDepan: cBulanDepan,
        tersediaHariIni: Math.max(0, total - cHari),
        persentaseCuti: pct,
        levelRisiko,
      };
    });
  }, [dynamicReferensi.tempatTugasList, activePegawaiList, cutiHariIni, cutiMingguIni, cutiBulanIni, cutiBulanDepan]);

  // Jabatan Summary
  const jabatanSummary: JabatanSummary[] = useMemo(() => {
    return dynamicReferensi.jabatanList
      .map((jab) => {
        const total = activePegawaiList.filter((p) => p.jabatan === jab).length;
        const sedangCuti = cutiHariIni.filter((c) => c.jabatan === jab).length;
        return {
          jabatan: jab,
          totalPegawai: total,
          sedangCuti,
          tidakCuti: Math.max(0, total - sedangCuti),
        };
      })
      .filter((item) => item.totalPegawai > 0);
  }, [dynamicReferensi.jabatanList, activePegawaiList, cutiHariIni]);

  return {
    pegawaiList,
    setPegawaiList,
    activePegawaiList,
    cutiList,
    setCutiList,
    filteredCutiList,
    referensi: dynamicReferensi,
    gasUrl,
    updateGasUrl,
    lastSync,
    isLoading,
    syncStatus,
    refreshData,
    resetToDefault,
    addCuti,
    addPegawai,
    updateStatusCuti,
    role,
    setRole,
    filters,
    setFilters,
    dashboardStats,
    tempatTugasSummary,
    jabatanSummary,
    cutiHariIni,
    cuti3Hari,
    cutiMingguIni,
    cutiBulanIni,
    cutiBulanDepan,
    pengajuanPending,
  };
}
