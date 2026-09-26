import React from 'react';
import { RefreshCw, Shield, UserCheck, Menu, Database, CheckCircle2, Zap } from 'lucide-react';
import { UserRole } from '../types';
import { formatTimestampIndo } from '../utils/dateUtils';
import { PWAInstallButton } from './PWAInstallButton';
import { LogoJayaRaya, LogoKesehatan } from './OfficialLogos';

interface HeaderProps {
  lastSync: string;
  isLoading: boolean;
  onRefresh: () => void;
  role: UserRole;
  onRoleChange: (r: UserRole) => void;
  onOpenIntegration: () => void;
  onToggleMobileMenu: () => void;
  isGasConfigured: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  lastSync,
  isLoading,
  onRefresh,
  role,
  onRoleChange,
  onOpenIntegration,
  onToggleMobileMenu,
  isGasConfigured,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 py-2.5 transition-colors no-print">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Zone 1: Mobile toggle & Official Logos & Brand Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            aria-label="Buka menu navigasi"
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {/* Official Logos Side-by-side: Jaya Raya DKI Jakarta & Kesehatan */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs shrink-0">
              <LogoJayaRaya className="w-7 h-8 object-contain" />
              <div className="w-px h-6 bg-slate-300" />
              <LogoKesehatan className="w-7 h-8 object-contain" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  SiMONCUT
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  Puskesmas Kep. Seribu Selatan
                </span>
                
                {/* Auto-Sync Live Indicator */}
                <div 
                  onClick={onOpenIntegration}
                  className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold cursor-pointer hover:bg-emerald-100 transition"
                  title="Auto-Sync aktif: Setiap kali aplikasi dibuka di browser/gadget mana saja, data tersambung otomatis"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
                  </span>
                  <span>Auto-Sync Aktif</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:flex items-center gap-1.5 leading-tight font-medium">
                <span>Sistem Monitoring Cuti Pegawai</span>
                <span className="text-slate-300">·</span>
                <span className="italic text-teal-700 font-semibold">“Pantau Cuti, Mudahkan Pengelolaan Kepegawaian”</span>
              </p>
            </div>
          </div>
        </div>

        {/* Zone 2: Sync Status & Refresh */}
        <div className="hidden xl:flex items-center gap-3 text-xs text-slate-500">
          <button
            onClick={onOpenIntegration}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 transition"
            title="Database App Scribe (Google Apps Script) terhubung otomatis"
          >
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span>Database:</span>
            {isGasConfigured ? (
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Apps Script Terhubung
              </span>
            ) : (
              <span className="font-semibold text-slate-600 flex items-center gap-1">
                Spreadsheet Standar (Lokal)
              </span>
            )}
          </button>

          <span className="text-slate-300">|</span>

          <span>
            Update: <span className="font-medium text-slate-700 font-mono">{formatTimestampIndo(lastSync)}</span>
          </span>
        </div>

        {/* Zone 3: Actions (Refresh, Role Selector, PWA) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:scale-98 transition shadow-2xs disabled:opacity-50"
            title="Klik untuk menyinkronkan data manual sewaktu-waktu"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          {/* Role Toggle Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => onRoleChange('ADMIN KEPEGAWAIAN')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition ${
                role === 'ADMIN KEPEGAWAIAN'
                  ? 'bg-white text-teal-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Admin TU</span>
            </button>

            <button
              onClick={() => onRoleChange('PIMPINAN')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition ${
                role === 'PIMPINAN'
                  ? 'bg-amber-500 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pimpinan</span>
            </button>
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
