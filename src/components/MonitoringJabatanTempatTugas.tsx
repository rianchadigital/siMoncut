import React, { useState, useMemo } from 'react';
import { Pegawai, Cuti } from '../types';
import {
  Building2,
  Users,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Grid,
  ListFilter,
  UserX,
  UserCheck,
  Palmtree,
  Activity,
  Heart,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  isSameUnit,
  OFFICIAL_TEMPAT_TUGAS,
  formatDateIndo,
  normalizeJenisCuti,
  isLeaveActiveToday,
  isLeaveOverlappingWeek,
  isLeaveOverlappingMonth,
  isLeaveOverlappingNextMonth,
  getTodayString,
  getNow,
} from '../utils/dateUtils';

interface MonitoringJabatanTempatTugasProps {
  pegawaiList: Pegawai[];
  cutiList: Cuti[];
  tempatTugasList: string[];
  jabatanList: string[];
  cutiHariIni: Cuti[];
  cutiMingguIni: Cuti[];
  cutiBulanIni: Cuti[];
  cutiBulanDepan: Cuti[];
  onSelectCuti?: (cuti: Cuti) => void;
  onSelectJabatanUnit?: (jabatan: string, tempatTugas: string) => void;
}

type TimeframeType = 'hariIni' | 'mingguIni' | 'bulanIni' | 'bulanDepan';
type ViewMode = 'rincian' | 'matriks';

export const MonitoringJabatanTempatTugas: React.FC<MonitoringJabatanTempatTugasProps> = ({
  pegawaiList,
  cutiList,
  tempatTugasList,
  jabatanList,
  cutiHariIni,
  cutiMingguIni,
  cutiBulanIni,
  cutiBulanDepan,
  onSelectCuti,
  onSelectJabatanUnit,
}) => {
  const [selectedTempat, setSelectedTempat] = useState<string>('Semua');
  const [timeframe, setTimeframe] = useState<TimeframeType>('hariIni');
  const [viewMode, setViewMode] = useState<ViewMode>('rincian');
  const [expandedJabatan, setExpandedJabatan] = useState<string | null>(null);

  // Active employees list
  const activePegawai = useMemo(() => {
    return pegawaiList.filter((p) => {
      if (!p.statusAktif) return true;
      const s = String(p.statusAktif).trim().toLowerCase();
      return s !== 'tidak aktif' && s !== 'non-aktif' && s !== 'inactive' && s !== 'false';
    });
  }, [pegawaiList]);

  // Active leaves based on selected timeframe
  const activeLeavesForTimeframe = useMemo(() => {
    switch (timeframe) {
      case 'mingguIni':
        return cutiMingguIni;
      case 'bulanIni':
        return cutiBulanIni;
      case 'bulanDepan':
        return cutiBulanDepan;
      case 'hariIni':
      default:
        return cutiHariIni;
    }
  }, [timeframe, cutiHariIni, cutiMingguIni, cutiBulanIni, cutiBulanDepan]);

  const timeframeLabel = useMemo(() => {
    switch (timeframe) {
      case 'mingguIni':
        return 'Pekan Ini';
      case 'bulanIni':
        return 'Bulan Ini';
      case 'bulanDepan':
        return 'Bulan Depan';
      case 'hariIni':
      default:
        return 'Hari Ini';
    }
  }, [timeframe]);

  // 4 Official Tempat Tugas
  const validTempatList = useMemo(() => {
    return OFFICIAL_TEMPAT_TUGAS.map((t) => String(t));
  }, []);

  // Filtered employees for selected tempat tugas
  const filteredPegawai = useMemo(() => {
    if (selectedTempat === 'Semua') return activePegawai;
    return activePegawai.filter((p) => isSameUnit(p.tempatTugas, selectedTempat));
  }, [activePegawai, selectedTempat]);

  // Filtered leaves for selected tempat tugas
  const filteredLeaves = useMemo(() => {
    if (selectedTempat === 'Semua') return activeLeavesForTimeframe;
    return activeLeavesForTimeframe.filter((c) => isSameUnit(c.tempatTugas, selectedTempat));
  }, [activeLeavesForTimeframe, selectedTempat]);

  // Aggregate by Jabatan for the selected unit
  const jabatanRows = useMemo(() => {
    // Unique list of jabatans present in the filtered employees or master list
    const jSet = new Set<string>();
    filteredPegawai.forEach((p) => {
      if (p.jabatan && p.jabatan.trim()) jSet.add(p.jabatan.trim());
    });
    // Add master jabatans that have employees
    jabatanList.forEach((j) => {
      if (activePegawai.some((p) => p.jabatan === j)) {
        jSet.add(j);
      }
    });

    const list = Array.from(jSet).map((jab) => {
      const staffList = filteredPegawai.filter((p) => p.jabatan === jab);
      const totalCount = staffList.length;

      const leavesList = filteredLeaves.filter((c) => c.jabatan === jab);
      const cutiCount = leavesList.length;
      const tersediaCount = Math.max(0, totalCount - cutiCount);

      const pctCuti = totalCount > 0 ? Math.round((cutiCount / totalCount) * 100) : 0;

      let statusLevel: 'normal' | 'waspada' | 'kritis' | 'kosong' = 'normal';
      if (totalCount === 0) {
        statusLevel = 'kosong';
      } else if (cutiCount > 0 && tersediaCount === 0) {
        statusLevel = 'kritis'; // 100% on leave! Zero on duty!
      } else if (cutiCount > 0 || pctCuti >= 40) {
        statusLevel = 'waspada';
      }

      return {
        jabatan: jab,
        totalPegawai: totalCount,
        sedangCuti: cutiCount,
        tersedia: tersediaCount,
        pctCuti,
        statusLevel,
        staffList,
        leavesList,
      };
    });

    // Sort: critical first, then with leaves, then by total desc
    return list.sort((a, b) => {
      if (a.statusLevel === 'kritis' && b.statusLevel !== 'kritis') return -1;
      if (b.statusLevel === 'kritis' && a.statusLevel !== 'kritis') return 1;
      if (a.sedangCuti > 0 && b.sedangCuti === 0) return -1;
      if (b.sedangCuti > 0 && a.sedangCuti === 0) return 1;
      return b.totalPegawai - a.totalPegawai;
    });
  }, [filteredPegawai, filteredLeaves, jabatanList, activePegawai]);

  // Critical shortage alerts (any position where 100% of staff are on leave)
  const criticalShortages = useMemo(() => {
    return jabatanRows.filter((row) => row.totalPegawai > 0 && row.tersedia === 0 && row.sedangCuti > 0);
  }, [jabatanRows]);

  // Overall KPIs for selected unit
  const kpi = useMemo(() => {
    const totalStaff = filteredPegawai.length;
    const totalCuti = filteredLeaves.length;
    const totalAvailable = Math.max(0, totalStaff - totalCuti);
    const affectedJabatan = jabatanRows.filter((r) => r.sedangCuti > 0).length;
    const totalJabatan = jabatanRows.filter((r) => r.totalPegawai > 0).length;

    return {
      totalStaff,
      totalCuti,
      totalAvailable,
      affectedJabatan,
      totalJabatan,
    };
  }, [filteredPegawai.length, filteredLeaves.length, jabatanRows]);

  // Helper for Leave Type Badges
  const renderLeaveTypeBadge = (jenis: string) => {
    const norm = normalizeJenisCuti(jenis);
    switch (norm) {
      case 'Tahunan':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
            <Palmtree className="w-2.5 h-2.5 text-teal-600" /> Tahunan
          </span>
        );
      case 'Sakit':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
            <Activity className="w-2.5 h-2.5 text-rose-600" /> Sakit
          </span>
        );
      case 'Melahirkan':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-50 text-pink-800 border border-pink-200">
            <Heart className="w-2.5 h-2.5 text-pink-600" /> Melahirkan
          </span>
        );
      case 'Alasan Penting':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-2.5 h-2.5 text-amber-600" /> Alasan Penting
          </span>
        );
      case 'Besar':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Sparkles className="w-2.5 h-2.5 text-indigo-600" /> Cuti Besar
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            {norm}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600 shrink-0" />
                <span>Monitoring Pegawai Berdasarkan Jabatan & Tempat Tugas</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pantau ketersediaan tenaga medis dan berapa orang pada tiap jabatan yang sedang cuti di masing-masing tempat tugas.
            </p>
          </div>

          {/* Timeframe & Mode Toggle Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Timeframe selector */}
            <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setTimeframe('hariIni')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  timeframe === 'hariIni'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => setTimeframe('mingguIni')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  timeframe === 'mingguIni'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Minggu Ini
              </button>
              <button
                onClick={() => setTimeframe('bulanIni')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  timeframe === 'bulanIni'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bulan Ini
              </button>
              <button
                onClick={() => setTimeframe('bulanDepan')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  timeframe === 'bulanDepan'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bulan Depan
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('rincian')}
                className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition ${
                  viewMode === 'rincian'
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Rincian Jabatan"
              >
                <ListFilter className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden sm:inline">Rincian</span>
              </button>
              <button
                onClick={() => setViewMode('matriks')}
                className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition ${
                  viewMode === 'matriks'
                    ? 'bg-white text-teal-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Matriks Silang"
              >
                <Grid className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Matriks Silang</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tempat Tugas Tabs (Touch-friendly & Smooth Horizontal Scroll on HP) */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Pilih Tempat Tugas:</span>
            {selectedTempat !== 'Semua' && (
              <button
                onClick={() => setSelectedTempat('Semua')}
                className="text-[11px] font-semibold text-teal-700 hover:underline"
              >
                Lihat Semua Tempat Tugas
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200 touch-pan-x">
            <button
              onClick={() => setSelectedTempat('Semua')}
              className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 border ${
                selectedTempat === 'Semua'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>🏥 Semua Tempat Tugas</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  selectedTempat === 'Semua' ? 'bg-slate-800 text-teal-300' : 'bg-white text-slate-700 border border-slate-300'
                }`}
              >
                {activePegawai.length} Pegawai
              </span>
            </button>

            {validTempatList.map((unit) => {
              const isSelected = isSameUnit(selectedTempat, unit);
              const countPegawai = activePegawai.filter((p) => isSameUnit(p.tempatTugas, unit)).length;
              const countCuti = activeLeavesForTimeframe.filter((c) => isSameUnit(c.tempatTugas, unit)).length;

              // Friendly short name for pills
              let shortName = unit;
              if (unit.includes('Selatan')) shortName = 'Puskesmas KSS (Induk)';
              else if (unit.includes('Pari')) shortName = 'Pustu Pulau Pari';
              else if (unit.includes('Lancang')) shortName = 'Pustu Pulau Lancang';
              else if (unit.includes('Untung')) shortName = 'Pustu Pulau Untung Jawa';

              return (
                <button
                  key={unit}
                  onClick={() => setSelectedTempat(unit)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-teal-50/50 hover:border-teal-300'
                  }`}
                >
                  <span className="truncate max-w-[200px] sm:max-w-none">{shortName}</span>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <span
                      className={`px-1.5 py-0.5 rounded-md font-semibold ${
                        isSelected ? 'bg-teal-800 text-teal-100' : 'bg-slate-100 text-slate-700'
                      }`}
                      title="Jumlah Pegawai"
                    >
                      {countPegawai}
                    </span>
                    {countCuti > 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded-md font-bold ${
                          isSelected ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                        }`}
                        title="Jumlah Cuti"
                      >
                        {countCuti} cuti
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Critical Shortage Warning Banner (Antisipasi Kekosongan Jabatan pada Pulau) */}
      {criticalShortages.length > 0 && (
        <div className="mx-4 sm:mx-5 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs text-rose-900">
            <strong className="font-bold block text-sm text-rose-950 mb-0.5">
              ⚠️ Peringatan Kekosongan Tenaga ({timeframeLabel}):
            </strong>
            <p>
              Pada <strong>{selectedTempat === 'Semua' ? 'beberapa unit kerja' : selectedTempat}</strong>, terdapat{' '}
              <strong>{criticalShortages.length} jabatan</strong> yang seluruh tenaganya sedang menjalani cuti:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {criticalShortages.map((c) => (
                <span
                  key={c.jabatan}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-rose-300 font-bold text-rose-700 text-xs shadow-2xs"
                >
                  <span>{c.jabatan}</span>
                  <span className="font-mono text-[10px] text-rose-500">
                    (0 dari {c.totalPegawai} bertugas)
                  </span>
                </span>
              ))}
            </div>
            <p className="text-[11px] text-rose-700 mt-2">
              Disarankan pimpinan atau penanggung jawab piket menyiapkan tenaga pendamping/rujukan lintas pulau.
            </p>
          </div>
        </div>
      )}

      {/* KPI Summary Cards Bar */}
      <div className="px-4 sm:px-5 py-3 bg-slate-50/70 border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            Total Pegawai di Unit
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 font-mono mt-0.5">
            {kpi.totalStaff} <span className="text-xs font-normal text-slate-500">orang</span>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            Jabatan Terdampak Cuti
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-700 font-mono mt-0.5">
            {kpi.affectedJabatan}{' '}
            <span className="text-xs font-normal text-slate-500">dari {kpi.totalJabatan} jabatan</span>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            Pegawai Sedang Cuti ({timeframeLabel})
          </div>
          <div className="text-lg sm:text-xl font-black text-rose-600 font-mono mt-0.5">
            {kpi.totalCuti} <span className="text-xs font-normal text-slate-500">orang</span>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            Tenaga Siaga / On Duty
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-700 font-mono mt-0.5">
            {kpi.totalAvailable} <span className="text-xs font-normal text-slate-500">orang</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: RINCIAN JABATAN */}
      {viewMode === 'rincian' && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Desktop Table View (Hidden on mobile < 640px) */}
          <div className="hidden sm:block overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Jabatan / Profesi</th>
                  <th className="py-3 px-3 text-center">Total Pegawai</th>
                  <th className="py-3 px-3 text-center text-rose-700">Sedang Cuti</th>
                  <th className="py-3 px-3 text-center text-emerald-700">Tersedia / Siaga</th>
                  <th className="py-3 px-3">Kapasitas On-Duty</th>
                  <th className="py-3 px-4 text-center">Status Operasional</th>
                  <th className="py-3 px-4 text-right">Rincian Pegawai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jabatanRows.map((row) => {
                  const isExpanded = expandedJabatan === row.jabatan;

                  return (
                    <React.Fragment key={row.jabatan}>
                      <tr
                        className={`transition hover:bg-slate-50/80 ${
                          row.statusLevel === 'kritis'
                            ? 'bg-rose-50/30'
                            : row.sedangCuti > 0
                            ? 'bg-amber-50/20'
                            : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{row.jabatan}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                          {row.totalPegawai}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {row.sedangCuti > 0 ? (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              {row.sedangCuti} org
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                          {row.tersedia}
                        </td>
                        <td className="py-3 px-3 w-36">
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                row.statusLevel === 'kritis'
                                  ? 'bg-rose-500'
                                  : row.sedangCuti > 0
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{
                                width: `${
                                  row.totalPegawai > 0
                                    ? Math.round((row.tersedia / row.totalPegawai) * 100)
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-400 text-right mt-0.5 font-mono">
                            {row.totalPegawai > 0
                              ? Math.round((row.tersedia / row.totalPegawai) * 100)
                              : 0}
                            % Siaga
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {row.statusLevel === 'kritis' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> Kosong
                            </span>
                          ) : row.statusLevel === 'waspada' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                              Terbatas
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Normal
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {row.sedangCuti > 0 ? (
                            <button
                              onClick={() => setExpandedJabatan(isExpanded ? null : row.jabatan)}
                              className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline inline-flex items-center gap-1"
                            >
                              <span>{isExpanded ? 'Tutup' : `Lihat Cuti (${row.sedangCuti})`}</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Drawer for Staff On Leave */}
                      {isExpanded && row.leavesList.length > 0 && (
                        <tr className="bg-slate-50/90">
                          <td colSpan={7} className="p-3 sm:p-4">
                            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs space-y-2">
                              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                                <span>Pegawai Jabatan {row.jabatan} yang Mengambil Cuti:</span>
                                <span className="text-[11px] text-slate-500 font-normal">
                                  Klik nama untuk melihat rincian surat cuti
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                {row.leavesList.map((c) => (
                                  <div
                                    key={c.idCuti}
                                    onClick={() => onSelectCuti && onSelectCuti(c)}
                                    className="p-2.5 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition cursor-pointer flex flex-col justify-between"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <div className="font-bold text-slate-900 text-xs hover:text-teal-700">
                                          {c.nama}
                                        </div>
                                        <div className="text-[11px] text-slate-500 font-mono">
                                          NIP. {c.nip} · {c.tempatTugas}
                                        </div>
                                      </div>
                                      <div>{renderLeaveTypeBadge(c.jenisCuti)}</div>
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                                      <div>
                                        Tgl: <strong className="font-mono text-slate-800">{formatDateIndo(c.tanggalMulai)}</strong> s/d{' '}
                                        <strong className="font-mono text-slate-800">{formatDateIndo(c.tanggalSelesai)}</strong>{' '}
                                        ({c.jumlahHari} hari)
                                      </div>
                                      {c.namaPengganti && (
                                        <div className="text-slate-500 text-[10px]">
                                          Pengganti: <strong className="text-slate-700">{c.namaPengganti}</strong>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Smartphone Card View (Block on mobile < 640px) */}
          <div className="block sm:hidden space-y-3">
            {jabatanRows.map((row) => (
              <div
                key={row.jabatan}
                className={`p-3.5 rounded-xl border transition ${
                  row.statusLevel === 'kritis'
                    ? 'bg-rose-50/50 border-rose-300'
                    : row.sedangCuti > 0
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{row.jabatan}</h3>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      {selectedTempat === 'Semua' ? 'Semua Unit Kerja' : selectedTempat}
                    </div>
                  </div>

                  <div>
                    {row.statusLevel === 'kritis' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full animate-pulse">
                        <AlertTriangle className="w-2.5 h-2.5" /> Kosong
                      </span>
                    ) : row.statusLevel === 'waspada' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                        Terbatas
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Normal
                      </span>
                    )}
                  </div>
                </div>

                {/* 3 Metrics Box */}
                <div className="grid grid-cols-3 gap-2 my-2.5 p-2 bg-white rounded-lg border border-slate-200 text-center">
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase font-semibold">Total</div>
                    <div className="text-sm font-bold text-slate-800 font-mono">{row.totalPegawai}</div>
                  </div>
                  <div className="border-x border-slate-100">
                    <div className="text-[9px] text-rose-600 uppercase font-bold">Cuti</div>
                    <div className="text-sm font-black text-rose-600 font-mono">{row.sedangCuti}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-emerald-600 uppercase font-bold">Siaga</div>
                    <div className="text-sm font-black text-emerald-700 font-mono">{row.tersedia}</div>
                  </div>
                </div>

                {/* If there are leaves, list them compactly */}
                {row.leavesList.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-700">
                      Pegawai Cuti ({row.leavesList.length}):
                    </div>
                    {row.leavesList.map((c) => (
                      <div
                        key={c.idCuti}
                        onClick={() => onSelectCuti && onSelectCuti(c)}
                        className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] hover:border-teal-400 cursor-pointer active:scale-98 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 truncate">{c.nama}</span>
                          {renderLeaveTypeBadge(c.jenisCuti)}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                          <span>
                            {formatDateIndo(c.tanggalMulai)} s/d {formatDateIndo(c.tanggalSelesai)}
                          </span>
                          <span className="font-mono font-bold text-slate-700">({c.jumlahHari} hr)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: MATRIKS SILANG (CROSS-TABULATION TEMPAT TUGAS VS JABATAN) */}
      {viewMode === 'matriks' && (
        <div className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-600">
            <span>
              Matriks Ketersediaan & Cuti: <strong>[Cuti / Total Tenaga]</strong> per Jabatan pada masing-masing Tempat Tugas.
            </span>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300"></span> 0 Cuti
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-300"></span> Sebagian Cuti
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-100 border border-rose-300"></span> 100% Cuti (Kosong)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                    Jabatan / Profesi
                  </th>
                  <th className="py-3 px-3 text-center">PKM Seribu Selatan</th>
                  <th className="py-3 px-3 text-center">Pustu P. Pari</th>
                  <th className="py-3 px-3 text-center">Pustu P. Lancang</th>
                  <th className="py-3 px-3 text-center">Pustu P. Untung Jawa</th>
                  <th className="py-3 px-4 text-center bg-slate-100 font-bold border-l border-slate-200">
                    Total Instansi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jabatanList
                  .filter((jab) => activePegawai.some((p) => p.jabatan === jab))
                  .map((jab) => {
                    const totalInstansi = activePegawai.filter((p) => p.jabatan === jab).length;
                    const cutiInstansi = activeLeavesForTimeframe.filter((c) => c.jabatan === jab).length;

                    return (
                      <tr key={jab} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-4 font-bold text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-200">
                          {jab}
                        </td>

                        {/* 4 Places */}
                        {validTempatList.map((unit) => {
                          const staff = activePegawai.filter((p) => isSameUnit(p.tempatTugas, unit) && p.jabatan === jab);
                          const total = staff.length;
                          const cuti = activeLeavesForTimeframe.filter(
                            (c) => isSameUnit(c.tempatTugas, unit) && c.jabatan === jab
                          ).length;

                          if (total === 0) {
                            return (
                              <td key={unit} className="py-2.5 px-3 text-center text-slate-300 font-mono">
                                -
                              </td>
                            );
                          }

                          const isCritical = total > 0 && cuti === total;
                          const hasLeave = cuti > 0 && !isCritical;

                          return (
                            <td key={unit} className="py-2.5 px-3 text-center">
                              <span
                                className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[11px] font-mono font-bold border ${
                                  isCritical
                                    ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                                    : hasLeave
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}
                                title={`${jab} di ${unit}: ${cuti} Cuti dari ${total} Pegawai`}
                              >
                                {cuti > 0 ? `${cuti} cuti / ` : ''}
                                {total} staf
                              </span>
                            </td>
                          );
                        })}

                        {/* Total Column */}
                        <td className="py-2.5 px-4 text-center bg-slate-50/60 font-mono font-bold border-l border-slate-200">
                          <span
                            className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[11px] font-bold ${
                              cutiInstansi > 0 ? 'bg-amber-100 text-amber-900' : 'text-slate-800'
                            }`}
                          >
                            {cutiInstansi > 0 ? `${cutiInstansi} / ` : ''}
                            {totalInstansi}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
