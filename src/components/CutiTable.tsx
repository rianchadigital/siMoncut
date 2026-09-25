import React from 'react';
import { Cuti } from '../types';
import { formatDateShortIndo } from '../utils/dateUtils';
import { ArrowUpDown, Eye, Calendar } from 'lucide-react';

interface CutiTableProps {
  cutiList: Cuti[];
  onSelectCuti: (cuti: Cuti) => void;
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
}

export const CutiTable: React.FC<CutiTableProps> = ({
  cutiList,
  onSelectCuti,
  title = 'Daftar Pegawai Cuti',
  subtitle,
  emptyMessage = 'Tidak ada data cuti yang sesuai dengan kriteria.',
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Disetujui':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Pengajuan':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Ditolak':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Selesai':
        return 'text-slate-600 bg-slate-100 border-slate-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getJenisCutiColor = (jenis: string) => {
    switch (jenis) {
      case 'Cuti Tahunan':
        return 'border-l-4 border-l-teal-500';
      case 'Cuti Sakit':
        return 'border-l-4 border-l-rose-500';
      case 'Cuti Melahirkan':
        return 'border-l-4 border-l-pink-500';
      case 'Cuti Alasan Penting':
        return 'border-l-4 border-l-amber-500';
      case 'Cuti Besar':
        return 'border-l-4 border-l-indigo-500';
      default:
        return 'border-l-4 border-l-slate-400';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {(title || subtitle) && (
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <span className="text-xs font-mono font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            Total: <strong>{cutiList.length}</strong> data
          </span>
        </div>
      )}

      {cutiList.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-xs">
          <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200/80 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">No</th>
                <th className="py-2.5 px-3">Nama Pegawai / NIP</th>
                <th className="py-2.5 px-3">Jabatan</th>
                <th className="py-2.5 px-3">Tempat Tugas</th>
                <th className="py-2.5 px-3">Jenis Cuti</th>
                <th className="py-2.5 px-3">Mulai</th>
                <th className="py-2.5 px-3">Selesai</th>
                <th className="py-2.5 px-3 text-right">Lama Cuti</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center w-16">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cutiList.map((cuti, index) => (
                <tr
                  key={cuti.idCuti}
                  onClick={() => onSelectCuti(cuti)}
                  className={`hover:bg-teal-50/40 transition cursor-pointer group ${getJenisCutiColor(
                    cuti.jenisCuti
                  )}`}
                >
                  <td className="py-3 px-3 text-center font-mono text-slate-500">{index + 1}</td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 leading-tight">{cuti.nama}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">NIP: {cuti.nip}</div>
                    {cuti.namaPengganti && (
                      <div className="text-[10px] text-teal-700 font-medium mt-0.5 flex items-center gap-1">
                        <span className="text-slate-400">Pengganti:</span> {cuti.namaPengganti}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700">{cuti.jabatan}</td>
                  <td className="py-3 px-3">
                    <span className="text-teal-800 font-semibold">{cuti.tempatTugas}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-800">{cuti.jenisCuti}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                    {formatDateShortIndo(cuti.tanggalMulai)}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                    {formatDateShortIndo(cuti.tanggalSelesai)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {cuti.jumlahHari} Hari
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                        cuti.statusPersetujuan
                      )}`}
                    >
                      {cuti.statusPersetujuan}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCuti(cuti);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition"
                      title="Lihat detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
