import React from 'react';
import { TempatTugasSummary } from '../types';
import { Building2, ArrowRight } from 'lucide-react';

interface TempatTugasTableProps {
  summary: TempatTugasSummary[];
  onSelectUnit?: (unitName: string) => void;
}

export const TempatTugasTable: React.FC<TempatTugasTableProps> = ({ summary, onSelectUnit }) => {
  const totalPegawai = summary.reduce((acc, s) => acc + s.totalPegawai, 0);
  const totalHariIni = summary.reduce((acc, s) => acc + s.cutiHariIni, 0);
  const totalMingguIni = summary.reduce((acc, s) => acc + s.cutiMingguIni, 0);
  const totalBulanIni = summary.reduce((acc, s) => acc + s.cutiBulanIni, 0);
  const totalBulanDepan = summary.reduce((acc, s) => acc + s.cutiBulanDepan, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Monitoring Rekap Cuti per Tempat Tugas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Komparasi jumlah cuti lintas periode pada masing-masing unit kerja dan pos kepulauan.
          </p>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200/80 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Tempat Tugas</th>
              <th className="py-3 px-3 text-right">Total Pegawai</th>
              <th className="py-3 px-3 text-right text-rose-700">Cuti Hari Ini</th>
              <th className="py-3 px-3 text-right text-amber-700">Cuti Minggu Ini</th>
              <th className="py-3 px-3 text-right text-indigo-700">Cuti Bulan Ini</th>
              <th className="py-3 px-3 text-right text-sky-700">Cuti Bulan Depan</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {summary.map((row) => (
              <tr
                key={row.tempatTugas}
                onClick={() => onSelectUnit && onSelectUnit(row.tempatTugas)}
                className="hover:bg-teal-50/40 transition cursor-pointer group"
              >
                <td className="py-3 px-4 font-semibold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span>{row.tempatTugas}</span>
                    <ArrowRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-teal-600 transition" />
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 font-medium">
                  {row.totalPegawai}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums font-bold">
                  {row.cutiHariIni > 0 ? (
                    <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                      {row.cutiHariIni}
                    </span>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums font-medium text-amber-700">
                  {row.cutiMingguIni}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums font-medium text-indigo-700">
                  {row.cutiBulanIni}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums font-medium text-sky-700">
                  {row.cutiBulanDepan}
                </td>
                <td className="py-3 px-4 text-center">
                  {row.levelRisiko === 'Kritis' ? (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                      Perhatian
                    </span>
                  ) : row.levelRisiko === 'Waspada' ? (
                    <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Waspada
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Terkendali
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300 text-xs">
            <tr>
              <td className="py-3 px-4">TOTAL KESELURUHAN</td>
              <td className="py-3 px-3 text-right font-mono tabular-nums">{totalPegawai}</td>
              <td className="py-3 px-3 text-right font-mono tabular-nums text-rose-700">{totalHariIni}</td>
              <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-700">{totalMingguIni}</td>
              <td className="py-3 px-3 text-right font-mono tabular-nums text-indigo-700">{totalBulanIni}</td>
              <td className="py-3 px-3 text-right font-mono tabular-nums text-sky-700">{totalBulanDepan}</td>
              <td className="py-3 px-4 text-center text-slate-500 font-normal text-[11px]">-</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile Smartphone Card View (HP) */}
      <div className="block sm:hidden divide-y divide-slate-100 p-3 space-y-3">
        {summary.map((row) => (
          <div
            key={row.tempatTugas}
            onClick={() => onSelectUnit && onSelectUnit(row.tempatTugas)}
            className="pt-2 first:pt-0 cursor-pointer active:scale-98 transition"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="font-bold text-xs text-slate-900 leading-snug">
                {row.tempatTugas}
              </span>
              {row.levelRisiko === 'Kritis' ? (
                <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full shrink-0">
                  Perhatian
                </span>
              ) : row.levelRisiko === 'Waspada' ? (
                <span className="text-[9px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                  Waspada
                </span>
              ) : (
                <span className="text-[9px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                  Terkendali
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-500 mb-2">
              Total Pegawai: <strong className="text-slate-800 font-mono">{row.totalPegawai} orang</strong>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-200/70">
              <div>
                <span className="text-slate-500 block">Hari Ini</span>
                <span className={`font-mono font-bold ${row.cutiHariIni > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                  {row.cutiHariIni}
                </span>
              </div>
              <div className="border-l border-slate-200/80">
                <span className="text-slate-500 block">Minggu Ini</span>
                <span className="font-mono font-bold text-amber-700">{row.cutiMingguIni}</span>
              </div>
              <div className="border-l border-slate-200/80">
                <span className="text-slate-500 block">Bulan Ini</span>
                <span className="font-mono font-bold text-indigo-700">{row.cutiBulanIni}</span>
              </div>
              <div className="border-l border-slate-200/80">
                <span className="text-slate-500 block">Bln Depan</span>
                <span className="font-mono font-bold text-sky-700">{row.cutiBulanDepan}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
