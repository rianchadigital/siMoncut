import React from 'react';
import {
  LayoutDashboard,
  Crown,
  CalendarCheck,
  CalendarRange,
  CalendarDays,
  CalendarClock,
  Calendar,
  Users,
  Palmtree,
  FileSpreadsheet,
  FileText,
  Building2,
  X,
  CalendarPlus,
} from 'lucide-react';
import { UserRole } from '../types';
import { LogoJayaRaya, LogoKesehatan } from './OfficialLogos';

export type NavTab =
  | 'dashboard'
  | 'pimpinan'
  | 'cuti-hari-ini'
  | 'cuti-minggu-ini'
  | 'cuti-bulan-ini'
  | 'cuti-bulan-depan'
  | 'kalender'
  | 'pegawai'
  | 'cuti'
  | 'laporan'
  | 'integrasi';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  cutiHariIniCount: number;
  pengajuanCount: number;
  role: UserRole;
  onOpenAddLeave?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  cutiHariIniCount,
  pengajuanCount,
  role,
  onOpenAddLeave,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number; highlight?: boolean; pimpinanOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'kalender', label: 'Kalender Cuti', icon: <Calendar className="w-4 h-4 text-indigo-400" /> },
    { id: 'pimpinan', label: 'Executive Pimpinan', icon: <Crown className="w-4 h-4 text-amber-500" />, highlight: true },
    {
      id: 'cuti-hari-ini',
      label: 'Cuti Hari Ini',
      icon: <CalendarCheck className="w-4 h-4 text-rose-500" />,
      badge: cutiHariIniCount,
    },
    { id: 'cuti-minggu-ini', label: 'Cuti Minggu Ini', icon: <CalendarRange className="w-4 h-4 text-amber-600" /> },
    { id: 'cuti-bulan-ini', label: 'Cuti Bulan Ini', icon: <CalendarDays className="w-4 h-4 text-teal-600" /> },
    { id: 'cuti-bulan-depan', label: 'Cuti Bulan Depan', icon: <CalendarClock className="w-4 h-4 text-sky-600" /> },
    { id: 'pegawai', label: 'Data Pegawai', icon: <Users className="w-4 h-4" /> },
    {
      id: 'cuti',
      label: 'Data Cuti Master',
      icon: <Palmtree className="w-4 h-4" />,
      badge: pengajuanCount > 0 ? pengajuanCount : undefined,
    },
    { id: 'laporan', label: 'Laporan & Rekap', icon: <FileText className="w-4 h-4" /> },
    { id: 'integrasi', label: 'Integrasi Spreadsheet', icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> },
  ];

  const handleSelect = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      {/* Brand & Subtitle */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800 border border-slate-700 shadow-inner shrink-0">
            <LogoJayaRaya className="w-7 h-8 object-contain" />
            <div className="w-px h-5 bg-slate-600" />
            <LogoKesehatan className="w-7 h-8 object-contain" />
          </div>
          <div>
            <div className="text-base font-black text-white tracking-wide">SiMONCUT</div>
            <div className="text-[10px] text-teal-300 font-semibold leading-tight">Sistem Monitoring Cuti Pegawai</div>
            <div className="text-[9px] text-slate-400 font-medium">Puskesmas Kep. Seribu Selatan</div>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Menu Monitoring
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <React.Fragment key={item.id}>
              <button
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                      isActive
                        ? 'bg-white text-teal-800'
                        : item.id === 'cuti-hari-ini'
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-500 text-slate-900'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>

              {/* Tepat di bawah menu Executive Pimpinan: Tombol Input Cuti Baru */}
              {item.id === 'pimpinan' && onOpenAddLeave && (
                <div className="pt-1.5 pb-2 px-0.5">
                  <button
                    onClick={() => {
                      onCloseMobile();
                      onOpenAddLeave();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-98 border border-teal-400/30 group"
                    title="Buka formulir input cuti baru pegawai"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CalendarPlus className="w-4 h-4 text-teal-100 shrink-0" />
                      <span className="truncate">Input Cuti Baru</span>
                    </div>
                    <span className="text-[10px] bg-teal-700/80 text-teal-100 font-semibold px-1.5 py-0.5 rounded-sm">
                      + Baru
                    </span>
                  </button>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Footer Info Box & Tagline */}
      <div className="p-3 m-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-2.5">
        <div className="p-2 rounded-lg bg-teal-950/60 border border-teal-800/60 text-center">
          <div className="text-[10px] text-teal-300 italic font-medium leading-snug">
            “Pantau Cuti, Mudahkan Pengelolaan Kepegawaian”
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-1 text-[11px]">
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            <span>4 Tempat Tugas Resmi:</span>
          </div>
          <div className="text-[10px] text-slate-400 leading-tight">
            Puskesmas KSS, Pustu P. Pari, P. Lancang & P. Untung Jawa.
          </div>
        </div>

        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
          <span>Role: <strong className="text-teal-300">{role === 'ADMIN KEPEGAWAIAN' ? 'Admin TU' : 'Pimpinan'}</strong></span>
          <span className="font-mono text-teal-400 font-semibold">SiMONCUT</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-800 h-[calc(100vh-57px)] sticky top-[57px] overflow-hidden no-print">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs no-print transition-opacity"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-200 ease-in-out no-print ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </div>
    </>
  );
};
