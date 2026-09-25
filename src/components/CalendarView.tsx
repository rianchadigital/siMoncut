import React, { useState, useMemo } from 'react';
import { Cuti } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Info,
  Filter,
  Palmtree,
  Activity,
  Heart,
  AlertTriangle,
  Sparkles,
  UserCheck,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import {
  toDateString,
  isDateInRange,
  isSameUnit,
  matchJenisCuti,
  formatDateIndo,
  normalizeJenisCuti,
} from '../utils/dateUtils';

interface CalendarViewProps {
  cutiList: Cuti[];
  onSelectCuti: (cuti: Cuti) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ cutiList, onSelectCuti }) => {
  // Calendar state: starts at current date (September 2026)
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedJenis, setSelectedJenis] = useState<string>('Semua');
  const [selectedUnit, setSelectedUnit] = useState<string>('Semua');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysOfWeek = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const todayMonth = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar grid
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day index 0: Sun, 1: Mon, ..., 6: Sat -> Convert so 0 is Monday, 6 is Sunday
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const totalDays = lastDayOfMonth.getDate();

  // Grid cells
  const calendarCells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const dateObj = new Date(year, month - 1, d);
    calendarCells.push({
      dateStr: toDateString(dateObj),
      dayNum: d,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, month, d);
    calendarCells.push({
      dateStr: toDateString(dateObj),
      dayNum: d,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete full grid (multiples of 7)
  const remaining = 7 - (calendarCells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const dateObj = new Date(year, month + 1, d);
      calendarCells.push({
        dateStr: toDateString(dateObj),
        dayNum: d,
        isCurrentMonth: false,
      });
    }
  }

  const todayStr = toDateString(new Date());

  // Date range of the currently viewed month
  const monthStartStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const monthEndStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(totalDays).padStart(2, '0')}`;

  // All leaves that overlap with the currently displayed month
  const leavesInViewedMonth = useMemo(() => {
    return cutiList.filter((c) => {
      const status = (c.statusPersetujuan || '').trim().toLowerCase();
      if (status === 'ditolak') return false;
      return c.tanggalMulai <= monthEndStr && c.tanggalSelesai >= monthStartStr;
    });
  }, [cutiList, monthStartStr, monthEndStr]);

  // Count by leave type for the 5 key categories in current month
  const categoryCounts = useMemo(() => {
    const counts = {
      Tahunan: 0,
      Sakit: 0,
      Melahirkan: 0,
      'Alasan Penting': 0,
      Besar: 0,
    };

    leavesInViewedMonth.forEach((c) => {
      const norm = normalizeJenisCuti(c.jenisCuti);
      if (norm.includes('Tahunan')) counts.Tahunan++;
      else if (norm.includes('Sakit')) counts.Sakit++;
      else if (norm.includes('Melahirkan')) counts.Melahirkan++;
      else if (norm.includes('Alasan Penting')) counts['Alasan Penting']++;
      else if (norm.includes('Besar')) counts.Besar++;
    });

    return counts;
  }, [leavesInViewedMonth]);

  // Filtered leaves according to user's quick filter
  const filteredCutiList = useMemo(() => {
    return cutiList.filter((c) => {
      // Exclude rejected leaves
      const status = (c.statusPersetujuan || '').trim().toLowerCase();
      if (status === 'ditolak') return false;

      // Filter by leave category using robust match
      if (selectedJenis !== 'Semua' && !matchJenisCuti(c.jenisCuti, selectedJenis)) {
        return false;
      }

      // Filter by unit / tempat tugas
      if (selectedUnit !== 'Semua' && !isSameUnit(c.tempatTugas, selectedUnit)) {
        return false;
      }

      return true;
    });
  }, [cutiList, selectedJenis, selectedUnit]);

  // Extract available units for filter dropdown
  const availableUnits = useMemo(() => {
    const set = new Set<string>();
    cutiList.forEach((c) => {
      if (c.tempatTugas) set.add(c.tempatTugas.trim());
    });
    return Array.from(set);
  }, [cutiList]);

  // Helper for leave color styling
  const getEventConfig = (jenis: string, status?: string) => {
    const isPengajuan = (status || '').trim().toLowerCase() === 'pengajuan';
    const borderStyle = isPengajuan ? 'border-dashed border-2' : 'border';
    const norm = normalizeJenisCuti(jenis);

    if (norm.includes('Tahunan')) {
      return {
        className: `bg-teal-100 text-teal-950 border-teal-400 hover:bg-teal-200 font-semibold ${borderStyle}`,
        badgeClass: 'bg-teal-600 text-white',
        icon: <Palmtree className="w-2.5 h-2.5 shrink-0 inline text-teal-700" />,
        label: 'Tahunan',
      };
    }
    if (norm.includes('Sakit')) {
      return {
        className: `bg-rose-100 text-rose-950 border-rose-400 hover:bg-rose-200 font-semibold ${borderStyle}`,
        badgeClass: 'bg-rose-600 text-white',
        icon: <Activity className="w-2.5 h-2.5 shrink-0 inline text-rose-700" />,
        label: 'Sakit',
      };
    }
    if (norm.includes('Melahirkan')) {
      return {
        className: `bg-pink-100 text-pink-950 border-pink-400 hover:bg-pink-200 font-semibold ${borderStyle}`,
        badgeClass: 'bg-pink-600 text-white',
        icon: <Heart className="w-2.5 h-2.5 shrink-0 inline text-pink-700" />,
        label: 'Melahirkan',
      };
    }
    if (norm.includes('Alasan Penting')) {
      return {
        className: `bg-amber-100 text-amber-950 border-amber-400 hover:bg-amber-200 font-semibold ${borderStyle}`,
        badgeClass: 'bg-amber-600 text-white',
        icon: <AlertTriangle className="w-2.5 h-2.5 shrink-0 inline text-amber-700" />,
        label: 'Alasan Penting',
      };
    }
    if (norm.includes('Besar')) {
      return {
        className: `bg-indigo-100 text-indigo-950 border-indigo-400 hover:bg-indigo-200 font-semibold ${borderStyle}`,
        badgeClass: 'bg-indigo-600 text-white',
        icon: <Sparkles className="w-2.5 h-2.5 shrink-0 inline text-indigo-700" />,
        label: 'Besar',
      };
    }

    return {
      className: `bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200 font-medium ${borderStyle}`,
      badgeClass: 'bg-slate-600 text-white',
      icon: <CalendarIcon className="w-2.5 h-2.5 shrink-0 inline text-slate-600" />,
      label: jenis.replace('Cuti ', ''),
    };
  };

  // Leaves active in the currently viewed month that match current filters (for the summary list below)
  const monthLeaveList = useMemo(() => {
    return filteredCutiList.filter(
      (c) => c.tanggalMulai <= monthEndStr && c.tanggalSelesai >= monthStartStr
    );
  }, [filteredCutiList, monthStartStr, monthEndStr]);

  return (
    <div className="space-y-4">
      {/* Calendar Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Calendar Header with Navigation */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-teal-600" />
              <span>Kalender Cuti Pegawai (Semua Kategori Cuti)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Jadwal cuti terintegrasi untuk Cuti Tahunan, Sakit, Melahirkan, Alasan Penting, dan Besar di seluruh unit.
            </p>
          </div>

          {/* Month Selector Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={todayMonth}
              className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              Bulan Ini
            </button>
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button
                onClick={prevMonth}
                className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition"
                aria-label="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-bold text-slate-900 font-mono min-w-[150px] text-center">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={nextMonth}
                className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition"
                aria-label="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filters for Leave Type (Tahunan, Sakit, Melahirkan, Alasan Penting, Besar) */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="font-semibold text-slate-700 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-teal-600" /> Kategori Cuti:
            </span>

            {/* Semua */}
            <button
              onClick={() => setSelectedJenis('Semua')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-xs flex items-center gap-1 ${
                selectedJenis === 'Semua'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Semua</span>
              <span className="px-1.5 py-0.2 bg-slate-200/60 text-slate-800 rounded-full text-[10px] font-mono">
                {leavesInViewedMonth.length}
              </span>
            </button>

            {/* Tahunan */}
            <button
              onClick={() => setSelectedJenis('Tahunan')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-xs flex items-center gap-1 ${
                selectedJenis === 'Tahunan'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-white border border-teal-300 text-teal-800 hover:bg-teal-50'
              }`}
            >
              <Palmtree className="w-3 h-3 text-teal-600" />
              <span>Tahunan</span>
              <span className="px-1.5 py-0.2 bg-teal-100 text-teal-900 rounded-full text-[10px] font-mono font-bold">
                {categoryCounts.Tahunan}
              </span>
            </button>

            {/* Sakit */}
            <button
              onClick={() => setSelectedJenis('Sakit')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-xs flex items-center gap-1 ${
                selectedJenis === 'Sakit'
                  ? 'bg-rose-700 text-white shadow-2xs'
                  : 'bg-white border border-rose-300 text-rose-800 hover:bg-rose-50'
              }`}
            >
              <Activity className="w-3 h-3 text-rose-600" />
              <span>Sakit</span>
              <span className="px-1.5 py-0.2 bg-rose-100 text-rose-900 rounded-full text-[10px] font-mono font-bold">
                {categoryCounts.Sakit}
              </span>
            </button>

            {/* Melahirkan */}
            <button
              onClick={() => setSelectedJenis('Melahirkan')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-xs flex items-center gap-1 ${
                selectedJenis === 'Melahirkan'
                  ? 'bg-pink-700 text-white shadow-2xs'
                  : 'bg-white border border-pink-300 text-pink-800 hover:bg-pink-50'
              }`}
            >
              <Heart className="w-3 h-3 text-pink-600" />
              <span>Melahirkan</span>
              <span className="px-1.5 py-0.2 bg-pink-100 text-pink-900 rounded-full text-[10px] font-mono font-bold">
                {categoryCounts.Melahirkan}
              </span>
            </button>

            {/* Alasan Penting */}
            <button
              onClick={() => setSelectedJenis('Alasan Penting')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-xs flex items-center gap-1 ${
                selectedJenis === 'Alasan Penting'
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'bg-white border border-amber-300 text-amber-800 hover:bg-amber-50'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>Alasan Penting</span>
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded-full text-[10px] font-mono font-bold">
                {categoryCounts['Alasan Penting']}
              </span>
            </button>

            {/* Besar */}
            <button
              onClick={() => setSelectedJenis('Besar')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-xs flex items-center gap-1 ${
                selectedJenis === 'Besar'
                  ? 'bg-indigo-700 text-white shadow-2xs'
                  : 'bg-white border border-indigo-300 text-indigo-800 hover:bg-indigo-50'
              }`}
            >
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Besar</span>
              <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-900 rounded-full text-[10px] font-mono font-bold">
                {categoryCounts.Besar}
              </span>
            </button>
          </div>

          {/* Filter Unit / Pustu */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">Unit Kerja:</span>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="bg-white border border-slate-300 rounded-md py-1 px-2 text-xs text-slate-800 focus:outline-hidden focus:border-teal-600 font-medium"
            >
              <option value="Semua">Semua Unit & Pustu</option>
              {availableUnits.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 text-center bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider py-2">
          {daysOfWeek.map((day, idx) => (
            <div key={day} className={idx >= 5 ? 'text-rose-600 font-bold' : ''}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 border-b border-slate-200 bg-slate-100/30">
          {calendarCells.map((cell) => {
            const isToday = cell.dateStr === todayStr;

            // Find leaves active on this cell date
            const activeLeaves = filteredCutiList.filter((c) =>
              isDateInRange(cell.dateStr, c.tanggalMulai, c.tanggalSelesai)
            );

            return (
              <div
                key={cell.dateStr}
                onClick={() => {
                  if (activeLeaves.length > 0) {
                    // On mobile, tap on cell with leave will show first leave or jump to list
                    onSelectCuti(activeLeaves[0]);
                  }
                }}
                className={`min-h-[58px] sm:min-h-[125px] p-1 sm:p-2 flex flex-col justify-between transition cursor-pointer sm:cursor-default ${
                  cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/60 opacity-60'
                } ${isToday ? 'ring-2 ring-teal-500 ring-inset bg-teal-50/20' : ''}`}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] sm:text-xs font-mono font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : cell.isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {activeLeaves.length > 0 && (
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-1 sm:px-1.5 py-0.2 rounded-full border border-teal-200">
                      {activeLeaves.length} <span className="hidden sm:inline">cuti</span>
                    </span>
                  )}
                </div>

                {/* Event Badges list */}
                <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-[90px]">
                  {/* Desktop Full Badges */}
                  <div className="hidden sm:block space-y-1">
                    {activeLeaves.map((cuti) => {
                      const cfg = getEventConfig(cuti.jenisCuti, cuti.statusPersetujuan);
                      const isPengajuan = (cuti.statusPersetujuan || '').toLowerCase() === 'pengajuan';

                      return (
                        <button
                          key={`${cuti.idCuti}-${cell.dateStr}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCuti(cuti);
                          }}
                          className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] truncate transition block leading-tight shadow-2xs ${cfg.className}`}
                          title={`${cuti.nama} (${cuti.jenisCuti}) - ${cuti.tempatTugas} [${cuti.statusPersetujuan || 'Disetujui'}]`}
                        >
                          <div className="flex items-center gap-1 truncate">
                            {cfg.icon}
                            <span className="font-bold truncate">{cuti.nama.split(' ')[0]}</span>
                            <span className="text-[9px] opacity-80">({cfg.label})</span>
                          </div>
                          {isPengajuan && (
                            <span className="text-[8px] bg-amber-200 text-amber-900 px-1 rounded-xs font-bold block mt-0.5">
                              Ajuan
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Mobile Smartphone Dots */}
                  <div className="block sm:hidden">
                    {activeLeaves.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center mt-1">
                        {activeLeaves.slice(0, 3).map((cuti, idx) => {
                          const norm = normalizeJenisCuti(cuti.jenisCuti);
                          const dotColor =
                            norm === 'Tahunan'
                              ? 'bg-teal-500'
                              : norm === 'Sakit'
                              ? 'bg-rose-500'
                              : norm === 'Melahirkan'
                              ? 'bg-pink-500'
                              : norm === 'Alasan Penting'
                              ? 'bg-amber-500'
                              : 'bg-indigo-500';
                          return (
                            <span
                              key={idx}
                              className={`w-2 h-2 rounded-full ${dotColor}`}
                              title={`${cuti.nama} (${cuti.jenisCuti})`}
                            />
                          );
                        })}
                        {activeLeaves.length > 3 && (
                          <span className="text-[8px] font-mono text-slate-600 font-bold">
                            +{activeLeaves.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend Footer */}
        <div className="p-3 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-teal-600" />
            <span>Klik pada nama cuti untuk melihat surat dan detail pelimpahan tugas.</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Tahunan
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Sakit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span> Melahirkan
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Alasan Penting
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Besar
            </span>
          </div>
        </div>
      </div>

      {/* Rincian Pegawai Cuti Pada Bulan Terpilih (Detail Section) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-teal-600" />
              <span>Daftar Pegawai Mengambil Cuti - {monthNames[month]} {year}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan {monthLeaveList.length} pegawai yang memiliki jadwal cuti pada bulan {monthNames[month]} {year}.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
            Total: {monthLeaveList.length} Cuti
          </span>
        </div>

        {monthLeaveList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Tidak ada data cuti yang terjadwal pada bulan {monthNames[month]} {year} untuk filter yang dipilih.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {monthLeaveList.map((cuti) => {
              const cfg = getEventConfig(cuti.jenisCuti, cuti.statusPersetujuan);
              return (
                <div
                  key={cuti.idCuti}
                  className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0 text-xs">
                      {cuti.nama.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900">{cuti.nama}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.className}`}
                        >
                          {cuti.jenisCuti}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.2 rounded-full ${
                            cuti.statusPersetujuan === 'Disetujui'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : cuti.statusPersetujuan === 'Pengajuan'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {cuti.statusPersetujuan || 'Disetujui'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>{cuti.jabatan}</span>
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <MapPin className="w-3 h-3 text-teal-600" />
                          {cuti.tempatTugas}
                        </span>
                        {cuti.namaPengganti && (
                          <span className="flex items-center gap-1 text-teal-700">
                            <UserCheck className="w-3 h-3" />
                            Pengganti: {cuti.namaPengganti}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right shrink-0">
                    <div>
                      <div className="font-mono font-bold text-slate-800 text-xs">
                        {formatDateIndo(cuti.tanggalMulai)} s/d {formatDateIndo(cuti.tanggalSelesai)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Durasi: <strong className="text-slate-800 font-mono">{cuti.jumlahHari}</strong> hari kerja
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectCuti(cuti)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Detail</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
