import React, { useState } from 'react';
import { Pegawai, ReferensiMaster } from '../types';
import { Users, FileDown, Phone, Search, CalendarPlus } from 'lucide-react';
import { exportPegawaiToExcel } from '../utils/exportUtils';

interface PegawaiTableProps {
  pegawaiList: Pegawai[];
  referensi: ReferensiMaster;
  onInputCutiForPegawai?: (nip: string) => void;
  onOpenAddCuti?: () => void;
}

export const PegawaiTable: React.FC<PegawaiTableProps> = ({
  pegawaiList,
  referensi,
  onInputCutiForPegawai,
  onOpenAddCuti,
}) => {
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = pegawaiList.filter((p) => {
    if (unitFilter && p.tempatTugas !== unitFilter) return false;
    if (statusFilter && p.statusAktif !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.nama.toLowerCase().includes(q) ||
        p.nip.toLowerCase().includes(q) ||
        p.jabatan.toLowerCase().includes(q) ||
        p.tempatTugas.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Table Header & Action Controls */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />
            <span>Master Data Pegawai (DATA_PEGAWAI)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar seluruh pegawai Puskesmas Kepulauan Seribu Selatan dan seluruh Pustu kepulauan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Input Cuti Pegawai */}
          {onOpenAddCuti && (
            <button
              onClick={onOpenAddCuti}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition shadow-2xs"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-teal-200" />
              <span>+ Input Cuti Pegawai</span>
            </button>
          )}

          {/* Download Excel */}
          <button
            onClick={() => exportPegawaiToExcel(filtered)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition shadow-2xs"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-3 bg-slate-50/70 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, NIP, atau jabatan..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:outline-hidden focus:border-teal-600"
          />
        </div>

        <select
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-md py-1.5 px-2 text-xs focus:outline-hidden focus:border-teal-600"
        >
          <option value="">Semua Tempat Tugas</option>
          {referensi.tempatTugasList.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-md py-1.5 px-2 text-xs focus:outline-hidden focus:border-teal-600"
        >
          <option value="">Semua Status Keaktifan</option>
          <option value="Aktif">Aktif</option>
          <option value="Tidak Aktif">Tidak Aktif</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 z-10 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3 text-center w-10">No</th>
              <th className="py-2.5 px-3">Nama Pegawai / NIP</th>
              <th className="py-2.5 px-3">Pangkat / Gol.</th>
              <th className="py-2.5 px-3">Jabatan</th>
              <th className="py-2.5 px-3">Tempat Tugas</th>
              <th className="py-2.5 px-3">Status ASN</th>
              <th className="py-2.5 px-3">L/P</th>
              <th className="py-2.5 px-3">Kontak HP</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-center">Aksi Cuti</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  Tidak ada data pegawai yang sesuai dengan kriteria pencarian.
                </td>
              </tr>
            ) : (
              filtered.map((p, idx) => (
                <tr key={p.nip} className="hover:bg-teal-50/30 transition">
                  <td className="py-2.5 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900 leading-snug">{p.nama}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">NIP: {p.nip}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{p.pangkatGolongan}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{p.jabatan}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-teal-800 font-semibold">{p.tempatTugas}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {p.statusKepegawaian}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {p.jenisKelamin === 'Laki-laki' ? 'L' : 'P'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px]">
                    {p.nomorHp && p.nomorHp !== '-' ? (
                      <a
                        href={`https://wa.me/62${p.nomorHp.replace(/^0/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-700 hover:underline inline-flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-teal-600" />
                        {p.nomorHp}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.statusAktif === 'Aktif'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p.statusAktif}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    {onInputCutiForPegawai && (
                      <button
                        onClick={() => onInputCutiForPegawai(p.nip)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-md text-[11px] font-semibold transition shadow-2xs"
                        title={`Input pengajuan cuti untuk ${p.nama}`}
                      >
                        <CalendarPlus className="w-3.5 h-3.5 text-teal-600" />
                        <span>Input Cuti</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
        <span>Menampilkan <strong>{filtered.length}</strong> dari <strong>{pegawaiList.length}</strong> total pegawai</span>
        <span className="text-[11px] text-slate-400">Puskesmas Kepulauan Seribu Selatan</span>
      </div>
    </div>
  );
};
