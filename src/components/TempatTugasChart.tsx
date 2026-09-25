import React, { useState } from 'react';
import { TempatTugasSummary } from '../types';
import { BarChart3, PieChart } from 'lucide-react';

interface TempatTugasChartProps {
  summary: TempatTugasSummary[];
}

export const TempatTugasChart: React.FC<TempatTugasChartProps> = ({ summary }) => {
  const [metric, setMetric] = useState<'total' | 'cuti'>('total');
  const [chartType, setChartType] = useState<'bar' | 'donut'>('bar');

  const maxVal = Math.max(...summary.map((s) => (metric === 'total' ? s.totalPegawai : s.cutiHariIni)), 1);
  const totalSum = summary.reduce((acc, s) => acc + (metric === 'total' ? s.totalPegawai : s.cutiHariIni), 0);

  const colors = [
    '#0d9488', // teal-600
    '#0284c7', // sky-600
    '#6366f1', // indigo-500
    '#f59e0b', // amber-500
    '#ec4899', // pink-500
    '#10b981', // emerald-500
  ];

  // Calculate donut slices
  let cumulativeAngle = 0;
  const donutSlices = summary.map((s, idx) => {
    const val = metric === 'total' ? s.totalPegawai : s.cutiHariIni;
    const fraction = totalSum > 0 ? val / totalSum : 0;
    const angle = fraction * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;

    return {
      name: s.tempatTugas,
      value: val,
      percentage: Math.round(fraction * 100),
      color: colors[idx % colors.length],
      startAngle,
      angle,
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal-600" />
            <span>Grafik Distribusi per Tempat Tugas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualisasi perbandingan beban dan sebaran pegawai di setiap pustu kepulauan.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Metric Selector */}
          <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setMetric('total')}
              className={`px-2.5 py-1 rounded-md transition ${
                metric === 'total' ? 'bg-white font-semibold text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Total Pegawai
            </button>
            <button
              onClick={() => setMetric('cuti')}
              className={`px-2.5 py-1 rounded-md transition ${
                metric === 'cuti' ? 'bg-white font-semibold text-rose-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Cuti Hari Ini
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-md transition ${chartType === 'bar' ? 'bg-white text-teal-700 shadow-2xs' : 'text-slate-500'}`}
              title="Grafik Batang"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('donut')}
              className={`p-1.5 rounded-md transition ${chartType === 'donut' ? 'bg-white text-teal-700 shadow-2xs' : 'text-slate-500'}`}
              title="Grafik Donut"
            >
              <PieChart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {chartType === 'bar' ? (
        <div className="space-y-3 pt-1">
          {summary.map((row, idx) => {
            const val = metric === 'total' ? row.totalPegawai : row.cutiHariIni;
            const pct = Math.round((val / maxVal) * 100);
            const share = totalSum > 0 ? Math.round((val / totalSum) * 100) : 0;

            return (
              <div key={row.tempatTugas} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 truncate max-w-[65%]">
                    {row.tempatTugas}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {val} orang
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">({share}%)</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(pct, val > 0 ? 3 : 0)}%`,
                      backgroundColor: colors[idx % colors.length],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Donut View */
        <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-2">
          {/* SVG Donut */}
          <div className="relative w-44 h-44 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {donutSlices.map((slice, i) => {
                const strokeDasharray = `${(slice.angle / 360) * 251.2} 251.2`;
                const strokeDashoffset = -((slice.startAngle / 360) * 251.2);
                return (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth="14"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 hover:opacity-85"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-slate-400 font-medium">Total</span>
              <span className="text-xl font-black text-slate-900 font-mono tabular-nums leading-none">
                {totalSum}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">Pegawai</span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs w-full max-w-md">
            {donutSlices.map((slice) => (
              <div key={slice.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                  <span className="text-slate-700 truncate text-[11px] font-medium">{slice.name}</span>
                </div>
                <div className="font-mono font-bold text-slate-900 text-xs shrink-0 pl-2">
                  {slice.value} <span className="text-[10px] text-slate-400 font-normal">({slice.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
