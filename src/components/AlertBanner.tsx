import React from 'react';
import { AlertCircle, CalendarCheck, Clock, CalendarRange, ChevronRight } from 'lucide-react';
import { Cuti } from '../types';
import { NavTab } from './Sidebar';

interface AlertBannerProps {
  cutiHariIni: Cuti[];
  cuti3Hari: Cuti[];
  cutiMingguIni: Cuti[];
  cutiBulanDepan: Cuti[];
  onNavigateTab: (tab: NavTab) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  cutiHariIni,
  cuti3Hari,
  cutiMingguIni,
  cutiBulanDepan,
  onNavigateTab,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 🔴 CUTI HARI INI */}
      <div
        onClick={() => onNavigateTab('cuti-hari-ini')}
        className="cursor-pointer bg-rose-50/70 border border-rose-200/80 rounded-xl p-3.5 flex items-start gap-3 hover:bg-rose-50 transition group shadow-2xs"
      >
        <span className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5">
          <AlertCircle className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 tracking-wide uppercase">
              Cuti Hari Ini
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 transition" />
          </div>
          <div className="text-xs font-semibold text-rose-950 mt-0.5">
            {cutiHariIni.length > 0 ? (
              <span>
                <strong className="font-mono">{cutiHariIni.length}</strong> pegawai sedang cuti hari ini
              </span>
            ) : (
              <span>Seluruh pegawai bertugas</span>
            )}
          </div>
          {cutiHariIni.length > 0 && (
            <div className="text-[11px] text-rose-700/90 truncate mt-1">
              {cutiHariIni.map((c) => c.nama.split(' ')[0]).join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* 🟠 CUTI DALAM 3 HARI KE DEPAN */}
      <div
        onClick={() => onNavigateTab('cuti-minggu-ini')}
        className="cursor-pointer bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 hover:bg-amber-50 transition group shadow-2xs"
      >
        <span className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
          <Clock className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 tracking-wide uppercase">
              Mulai 3 Hari ke Depan
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition" />
          </div>
          <div className="text-xs font-semibold text-amber-950 mt-0.5">
            {cuti3Hari.length > 0 ? (
              <span>
                <strong className="font-mono">{cuti3Hari.length}</strong> pegawai akan mulai cuti
              </span>
            ) : (
              <span>Tidak ada jadwal baru dalam 3 hari</span>
            )}
          </div>
          {cuti3Hari.length > 0 && (
            <div className="text-[11px] text-amber-700/90 truncate mt-1">
              {cuti3Hari.map((c) => `${c.nama.split(' ')[0]} (${c.tempatTugas})`).join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* 🟡 CUTI MINGGU INI */}
      <div
        onClick={() => onNavigateTab('cuti-minggu-ini')}
        className="cursor-pointer bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 flex items-start gap-3 hover:bg-emerald-50 transition group shadow-2xs"
      >
        <span className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
          <CalendarCheck className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 tracking-wide uppercase">
              Cuti Minggu Ini
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition" />
          </div>
          <div className="text-xs font-semibold text-emerald-950 mt-0.5">
            <span>
              <strong className="font-mono">{cutiMingguIni.length}</strong> pegawai aktif/akan cuti
            </span>
          </div>
          <div className="text-[11px] text-emerald-700/90 truncate mt-1">
            Periode pekan aktif berjalan
          </div>
        </div>
      </div>

      {/* 🔵 CUTI BULAN DEPAN */}
      <div
        onClick={() => onNavigateTab('cuti-bulan-depan')}
        className="cursor-pointer bg-sky-50/70 border border-sky-200/80 rounded-xl p-3.5 flex items-start gap-3 hover:bg-sky-50 transition group shadow-2xs"
      >
        <span className="p-2 rounded-lg bg-sky-100 text-sky-700 shrink-0 mt-0.5">
          <CalendarRange className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-800 tracking-wide uppercase">
              Cuti Bulan Depan
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-sky-400 group-hover:translate-x-0.5 transition" />
          </div>
          <div className="text-xs font-semibold text-sky-950 mt-0.5">
            <span>
              <strong className="font-mono">{cutiBulanDepan.length}</strong> pegawai telah terjadwal
            </span>
          </div>
          <div className="text-[11px] text-sky-700/90 truncate mt-1">
            Rencana kontinuitas layanan Pustu
          </div>
        </div>
      </div>
    </div>
  );
};
