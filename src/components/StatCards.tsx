import React from 'react';
import { Users, CalendarCheck, CalendarRange, CalendarDays, CalendarClock, Clock } from 'lucide-react';
import { DashboardStats } from '../types';
import { NavTab } from './Sidebar';

interface StatCardsProps {
  stats: DashboardStats;
  onNavigateTab: (tab: NavTab) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats, onNavigateTab }) => {
  const cards = [
    {
      id: 'pegawai' as NavTab,
      label: 'TOTAL PEGAWAI',
      sublabel: 'Seluruh pegawai aktif di 4 tempat tugas',
      count: stats.totalPegawaiAktif,
      icon: <Users className="w-5 h-5 text-teal-600" />,
      color: 'border-l-4 border-l-teal-600',
      badgeColor: 'text-teal-700 bg-teal-50',
    },
    {
      id: 'cuti-hari-ini' as NavTab,
      label: 'PEGAWAI CUTI HARI INI',
      sublabel: 'Sedang menjalani cuti hari ini',
      count: stats.cutiHariIni,
      icon: <CalendarCheck className="w-5 h-5 text-rose-600" />,
      color: 'border-l-4 border-l-rose-500',
      badgeColor: 'text-rose-700 bg-rose-50',
      isWarning: stats.cutiHariIni > 0,
    },
    {
      id: 'cuti-minggu-ini' as NavTab,
      label: 'PEGAWAI CUTI MINGGU INI',
      sublabel: 'Bersinggungan minggu berjalan',
      count: stats.cutiMingguIni,
      icon: <CalendarRange className="w-5 h-5 text-amber-600" />,
      color: 'border-l-4 border-l-amber-500',
      badgeColor: 'text-amber-700 bg-amber-50',
    },
    {
      id: 'cuti-bulan-ini' as NavTab,
      label: 'PEGAWAI CUTI BULAN INI',
      sublabel: 'Terjadwal pada bulan berjalan',
      count: stats.cutiBulanIni,
      icon: <CalendarDays className="w-5 h-5 text-indigo-600" />,
      color: 'border-l-4 border-l-indigo-500',
      badgeColor: 'text-indigo-700 bg-indigo-50',
    },
    {
      id: 'cuti-bulan-depan' as NavTab,
      label: 'PEGAWAI CUTI BULAN DEPAN',
      sublabel: 'Perencanaan bulan berikutnya',
      count: stats.cutiBulanDepan,
      icon: <CalendarClock className="w-5 h-5 text-sky-600" />,
      color: 'border-l-4 border-l-sky-500',
      badgeColor: 'text-sky-700 bg-sky-50',
    },
    {
      id: 'cuti' as NavTab,
      label: 'PENGAJUAN CUTI',
      sublabel: 'Menunggu telaah/persetujuan',
      count: stats.pengajuanPending,
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      color: 'border-l-4 border-l-amber-400',
      badgeColor: 'text-amber-700 bg-amber-50',
      isHighlight: stats.pengajuanPending > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card) => (
        <button
          key={card.label}
          onClick={() => onNavigateTab(card.id)}
          className={`bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition text-left flex flex-col justify-between group ${card.color}`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-[11px] font-bold text-slate-500 tracking-wide uppercase truncate">
              {card.label}
            </span>
            <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition shrink-0">
              {card.icon}
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
              {card.count}
            </span>
            <span className="text-xs text-slate-500">orang</span>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="truncate">{card.sublabel}</span>
          </div>
        </button>
      ))}
    </div>
  );
};
