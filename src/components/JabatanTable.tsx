import React from 'react';
import { JabatanSummary } from '../types';
import { Briefcase } from 'lucide-react';

interface JabatanTableProps {
  summary: JabatanSummary[];
  onSelectJabatan?: (jabatan: string) => void;
}

export const JabatanTable: React.FC<JabatanTableProps> = ({ summary, onSelectJabatan }) => {
  const totalPegawai = summary.reduce((acc, s) => acc + s.totalPegawai, 0);
  const totalSedangCuti = summary.reduce((acc, s) => acc + s.sedangCuti, 0);
  const totalTidakCuti = summary.reduce((acc, s) => acc + s.tidakCuti, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-teal-600" />
            <span>Monitoring Pegawai Berdasarkan Jabatan (Hari Ini)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ketersediaan tenaga medis, penunjang, dan staf administrasi puskesmas.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80 sticky top-0 z-10 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-4">Jabatan</th>
              <th className="py-2.5 px-3 text-right">Total Pegawai</th>
              <th className="py-2.5 px-3 text-right text-rose-700">Sedang Cuti</th>
              <th className="py-2.5 px-3 text-right text-emerald-700">Tidak Cuti (Aktif)</th>
              <th className="py-2.5 px-3 text-right">% Bertugas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {summary.map((row) => {
              const dutyPct = row.totalPegawai > 0 ? Math.round((row.tidakCuti / row.totalPegawai) * 100) : 0;
              return (
                <tr
                  key={row.jabatan}
                  onClick={() => onSelectJabatan && onSelectJabatan(row.jabatan)}
                  className="hover:bg-slate-50 transition cursor-pointer"
                >
                  <td className="py-2.5 px-4 font-semibold text-slate-900">
                    {row.jabatan}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                    {row.totalPegawai}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold">
                    {row.sedangCuti > 0 ? (
                      <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                        {row.sedangCuti}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-emerald-700">
                    {row.tidakCuti}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                    {dutyPct}%
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300 text-xs sticky bottom-0">
            <tr>
              <td className="py-2.5 px-4">TOTAL PEGAWAI AKTIF</td>
              <td className="py-2.5 px-3 text-right font-mono tabular-nums">{totalPegawai}</td>
              <td className="py-2.5 px-3 text-right font-mono tabular-nums text-rose-700">{totalSedangCuti}</td>
              <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700">{totalTidakCuti}</td>
              <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                {totalPegawai > 0 ? Math.round((totalTidakCuti / totalPegawai) * 100) : 0}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
