import React from 'react';
import { Cuti, TempatTugasSummary, DashboardStats } from '../types';
import { Crown, Users, CalendarCheck, CalendarRange, CalendarClock, Building2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatDateShortIndo } from '../utils/dateUtils';
import { NavTab } from './Sidebar';

interface PimpinanDashboardProps {
  stats: DashboardStats;
  cutiHariIni: Cuti[];
  cutiBulanDepan: Cuti[];
  tempatTugasSummary: TempatTugasSummary[];
  onSelectCuti: (c: Cuti) => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const PimpinanDashboard: React.FC<PimpinanDashboardProps> = ({
  stats,
  cutiHariIni,
  cutiBulanDepan,
  tempatTugasSummary,
  onSelectCuti,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner Executive */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 text-white border border-teal-900/40 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <Crown className="w-48 h-48 text-teal-300" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-semibold mb-3">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            Ringkasan Eksekutif Pimpinan Puskesmas
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Pusat Kendali & Monitoring Cuti Pegawai
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            Puskesmas Kecamatan Kepulauan Seribu Selatan · Memastikan kesiapsiagaan layanan kesehatan di 6 pulau permukiman tetap optimal.
          </p>
        </div>
      </div>

      {/* 5 Kartu Utama Pimpinan */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Pegawai
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
            {stats.totalPegawaiAktif}
          </div>
          <div className="text-[11px] text-teal-700 font-medium mt-1">Pegawai aktif bertugas</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-2xs bg-rose-50/20">
          <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
            Cuti Hari Ini
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono tabular-nums mt-1">
            {stats.cutiHariIni}
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">
            {stats.cutiHariIni > 0 ? 'Sedang izin cuti resmi' : 'Seluruh hadir'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs bg-amber-50/20">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            Cuti Minggu Ini
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono tabular-nums mt-1">
            {stats.cutiMingguIni}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">Pekan aktif berjalan</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Cuti Bulan Ini
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-700 font-mono tabular-nums mt-1">
            {stats.cutiBulanIni}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Bulan September 2026</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-sky-200/80 shadow-2xs bg-sky-50/20">
          <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">
            Cuti Bulan Depan
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-700 font-mono tabular-nums mt-1">
            {stats.cutiBulanDepan}
          </div>
          <div className="text-[11px] text-sky-700 font-medium mt-1">Bulan Oktober 2026</div>
        </div>
      </div>

      {/* Bagian 1: SIAPA YANG CUTI HARI INI? */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              SIAPA YANG CUTI HARI INI?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar tenaga kesehatan dan staf yang sedang izin/cuti pada hari ini.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('cuti-hari-ini')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            Lihat Tabel Lengkap <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {cutiHariIni.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Tidak ada pegawai yang cuti hari ini.</p>
            <p className="text-slate-400 mt-0.5">Seluruh tenaga kesehatan dan staf hadir di pos masing-masing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {cutiHariIni.map((c) => (
              <div
                key={c.idCuti}
                onClick={() => onSelectCuti(c)}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-teal-50/50 hover:border-teal-300 transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{c.nama}</h4>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">NIP: {c.nip}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                    {c.jenisCuti}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/80 text-xs space-y-1">
                  <div className="text-slate-600 flex justify-between">
                    <span>Jabatan:</span>
                    <strong className="text-slate-800">{c.jabatan}</strong>
                  </div>
                  <div className="text-slate-600 flex justify-between">
                    <span>Pos Tugas:</span>
                    <strong className="text-teal-800">{c.tempatTugas}</strong>
                  </div>
                  <div className="text-slate-600 flex justify-between">
                    <span>Durasi:</span>
                    <strong className="font-mono text-slate-800">
                      {formatDateShortIndo(c.tanggalMulai)} s/d {formatDateShortIndo(c.tanggalSelesai)}
                    </strong>
                  </div>
                </div>

                {c.catatan && (
                  <div className="mt-2 text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-200/60">
                    "{c.catatan}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bagian 2 & 4: DI UNIT MANA PEGAWAI SEDANG CUTI? & REKAP PER TEMPAT TUGAS */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              DI UNIT MANA PEGAWAI SEDANG CUTI & REKAP TEMPAT TUGAS
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribusi ketersediaan pegawai per pulau untuk mencegah kekosongan tenaga medis.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {tempatTugasSummary.map((unit) => {
            const hasCuti = unit.cutiHariIni > 0;
            return (
              <div
                key={unit.tempatTugas}
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  unit.levelRisiko === 'Kritis'
                    ? 'bg-rose-50/50 border-rose-200'
                    : hasCuti
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="text-xs font-bold text-slate-900">{unit.tempatTugas}</h4>
                    {hasCuti ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                        {unit.cutiHariIni} Cuti
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Lengkap
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-600 mt-1">
                    Total Pegawai: <strong className="font-mono text-slate-900">{unit.totalPegawai}</strong> | Tersedia: <strong className="font-mono text-emerald-700 font-bold">{unit.tersediaHariIni}</strong>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Rencana Bln Depan:</span>
                  <span className="font-mono font-bold text-slate-800">{unit.cutiBulanDepan} orang</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bagian 3: SIAPA YANG AKAN CUTI BULAN DEPAN? */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-sky-600" />
              SIAPA YANG AKAN CUTI BULAN DEPAN? (Oktober 2026)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Perencanaan awal pimpinan agar penugasan dokter dan perawat pengganti dapat dipersiapkan.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('cuti-bulan-depan')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            Lihat Seluruh Bulan Depan <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {cutiBulanDepan.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl">
            Belum ada pegawai yang terjadwal cuti pada bulan depan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {cutiBulanDepan.map((c) => (
              <div
                key={c.idCuti}
                onClick={() => onSelectCuti(c)}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/30 transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{c.nama}</h4>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{c.jabatan}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                    {c.jenisCuti}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex justify-between">
                  <span>Unit: <strong className="text-teal-800">{c.tempatTugas}</strong></span>
                  <span className="font-mono font-bold text-slate-900">{c.jumlahHari} Hari</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Mulai: {formatDateShortIndo(c.tanggalMulai)} s/d {formatDateShortIndo(c.tanggalSelesai)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
