import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { GlobalFilter, ReferensiMaster } from '../types';

interface GlobalFilterBarProps {
  filters: GlobalFilter;
  onChangeFilters: (f: GlobalFilter) => void;
  referensi: ReferensiMaster;
  onResetFilters: () => void;
}

export const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({
  filters,
  onChangeFilters,
  referensi,
  onResetFilters,
}) => {
  const isFiltered =
    Boolean(filters.searchQuery) ||
    Boolean(filters.tempatTugas) ||
    Boolean(filters.jabatan) ||
    Boolean(filters.jenisCuti) ||
    Boolean(filters.statusPersetujuan);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-3 sm:p-4 shadow-2xs space-y-3 no-print">
      {/* Top Search Input */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onChangeFilters({ ...filters, searchQuery: e.target.value })}
          placeholder="Cari nama, NIP, jabatan, atau tempat tugas..."
          className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onChangeFilters({ ...filters, searchQuery: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            aria-label="Hapus pencarian"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Select Filters Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 pt-1 text-xs">
        {/* Tempat Tugas */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Tempat Tugas
          </label>
          <select
            value={filters.tempatTugas}
            onChange={(e) => onChangeFilters({ ...filters, tempatTugas: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-700 focus:outline-hidden focus:border-teal-600"
          >
            <option value="">Semua Tempat Tugas</option>
            {referensi.tempatTugasList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Jabatan */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Jabatan
          </label>
          <select
            value={filters.jabatan}
            onChange={(e) => onChangeFilters({ ...filters, jabatan: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-700 focus:outline-hidden focus:border-teal-600"
          >
            <option value="">Semua Jabatan</option>
            {referensi.jabatanList.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>

        {/* Jenis Cuti */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Jenis Cuti
          </label>
          <select
            value={filters.jenisCuti}
            onChange={(e) => onChangeFilters({ ...filters, jenisCuti: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-700 focus:outline-hidden focus:border-teal-600"
          >
            <option value="">Semua Jenis Cuti</option>
            {referensi.jenisCutiList.map((jc) => (
              <option key={jc} value={jc}>
                {jc}
              </option>
            ))}
          </select>
        </div>

        {/* Status Persetujuan */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Status Persetujuan
          </label>
          <select
            value={filters.statusPersetujuan}
            onChange={(e) => onChangeFilters({ ...filters, statusPersetujuan: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-700 focus:outline-hidden focus:border-teal-600"
          >
            <option value="">Semua Status</option>
            {referensi.statusPersetujuanList.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        <div className="flex items-end col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-1">
          <button
            onClick={onResetFilters}
            disabled={!isFiltered}
            className={`w-full py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              isFiltered
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filter
          </button>
        </div>
      </div>
    </div>
  );
};
