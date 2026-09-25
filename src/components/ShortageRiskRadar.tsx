import React from 'react';
import { AlertTriangle, CheckCircle2, Info, ArrowUpRight } from 'lucide-react';
import { TempatTugasSummary } from '../types';

interface ShortageRiskRadarProps {
  summary: TempatTugasSummary[];
  onSelectUnit?: (unitName: string) => void;
}

export const ShortageRiskRadar: React.FC<ShortageRiskRadarProps> = ({ summary, onSelectUnit }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Monitoring Ketersediaan Pegawai per Tempat Tugas</span>
            <span className="text-[11px] font-normal text-slate-500">(Kondisi Hari Ini)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rasio pegawai aktif versus sedang cuti di seluruh unit puskesmas dan pustu pulau.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Aman (&lt;25%)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Waspada (25-39%)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Perhatian Khusus (≥40%)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {summary.map((unit) => {
          const isKritis = unit.levelRisiko === 'Kritis';
          const isWaspada = unit.levelRisiko === 'Waspada';

          return (
            <div
              key={unit.tempatTugas}
              onClick={() => onSelectUnit && onSelectUnit(unit.tempatTugas)}
              className={`p-3.5 rounded-xl border transition cursor-pointer hover:border-teal-300 hover:shadow-xs flex flex-col justify-between ${
                isKritis
                  ? 'bg-rose-50/40 border-rose-200'
                  : isWaspada
                  ? 'bg-amber-50/30 border-amber-200'
                  : 'bg-slate-50/50 border-slate-200/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-xs font-bold text-slate-900 leading-snug">
                    {unit.tempatTugas}
                  </h3>
                  {isKritis ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-full shrink-0">
                      <AlertTriangle className="w-3 h-3" />
                      Perhatian
                    </span>
                  ) : isWaspada ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-full shrink-0">
                      Waspada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      Aman
                    </span>
                  )}
                </div>

                {/* Numbers Grid */}
                <div className="grid grid-cols-3 gap-2 my-2 text-center bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total</div>
                    <div className="text-sm font-bold text-slate-800 font-mono tabular-nums">
                      {unit.totalPegawai}
                    </div>
                  </div>
                  <div className="border-x border-slate-100">
                    <div className="text-[10px] text-rose-600 uppercase tracking-wider font-semibold">Cuti</div>
                    <div className="text-sm font-bold text-rose-600 font-mono tabular-nums">
                      {unit.cutiHariIni}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-600 uppercase tracking-wider font-semibold">Tersedia</div>
                    <div className="text-sm font-bold text-emerald-700 font-mono tabular-nums">
                      {unit.tersediaHariIni}
                    </div>
                  </div>
                </div>

                {/* Progress Bar of % On Leave */}
                <div className="mt-2.5">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                    <span>Persentase Sedang Cuti:</span>
                    <span className="font-mono font-bold text-slate-700">{unit.persentaseCuti}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isKritis ? 'bg-rose-500' : isWaspada ? 'bg-amber-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(unit.persentaseCuti, 4))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Rencana Bln Depan: <strong className="font-mono text-slate-700">{unit.cutiBulanDepan}</strong> org</span>
                <span className="inline-flex items-center text-teal-700 font-medium hover:underline text-[10px]">
                  Rincian <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Note indicator per prompt requirements */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
        <span>
          Indikator ini disajikan sebagai bahan pertimbangan pimpinan dalam memonitor kontinuitas pelayanan kesehatan antar pulau.
        </span>
      </div>
    </div>
  );
};
