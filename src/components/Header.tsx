import React from 'react';
import { RefreshCw, Shield, UserCheck, Menu, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';
import { formatTimestampIndo } from '../utils/dateUtils';
import { PWAInstallButton } from './PWAInstallButton';

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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 py-3 transition-colors no-print">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Zone 1: Mobile toggle & Brand Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            aria-label="Buka menu navigasi"
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-xs font-black text-xs sm:text-sm tracking-tight shrink-0">
              SMC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  SiMONCUT
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  Puskesmas Kep. Seribu Selatan
                </span>
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
            title="Klik untuk konfigurasi integrasi Google Spreadsheet"
          >
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span>Database:</span>
            {isGasConfigured ? (
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Apps Script Terhubung
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
            title="Sinkronisasi data dari Google Spreadsheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          {/* Role Switcher */}
          <div className="relative inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-xs">
            <button
              onClick={() => onRoleChange('ADMIN KEPEGAWAIAN')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                role === 'ADMIN KEPEGAWAIAN'
                  ? 'bg-white text-teal-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="inline-flex items-center gap-1">
                <Shield className="w-3 h-3 text-teal-600" />
                <span className="hidden sm:inline">Admin</span> TU
              </span>
            </button>
            <button
              onClick={() => onRoleChange('PIMPINAN')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                role === 'PIMPINAN'
                  ? 'bg-white text-teal-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="inline-flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-amber-600" />
                Pimpinan
              </span>
            </button>
          </div>

          {/* PWA Install */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
