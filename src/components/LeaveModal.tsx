import React, { useState } from 'react';
import { X, Calendar, Clock, User, Building2, CheckCircle2, XCircle, FileText, ShieldAlert } from 'lucide-react';
import { Cuti, UserRole } from '../types';
import { formatDateIndo, formatTimestampIndo } from '../utils/dateUtils';

interface LeaveModalProps {
  cuti: Cuti | null;
  onClose: () => void;
  role: UserRole;
  onUpdateStatus?: (idCuti: string, status: Cuti['statusPersetujuan'], catatan?: string) => void;
}

export const LeaveModal: React.FC<LeaveModalProps> = ({ cuti, onClose, role, onUpdateStatus }) => {
  if (!cuti) return null;

  const [note, setNote] = useState(cuti.catatan || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAction = (status: Cuti['statusPersetujuan']) => {
    if (onUpdateStatus) {
      setIsUpdating(true);
      onUpdateStatus(cuti.idCuti, status, note);
      setTimeout(() => {
        setIsUpdating(false);
        onClose();
      }, 300);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Disetujui':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pengajuan':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Ditolak':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Selesai':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs no-print">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Detail Pengajuan Cuti</h3>
              <p className="text-xs text-slate-400 font-mono">{cuti.idCuti}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Pegawai Info Box */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Informasi Pemohon
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                  cuti.statusPersetujuan
                )}`}
              >
                {cuti.statusPersetujuan}
              </span>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0">
                <User className="w-4 h-4 text-teal-700" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900">{cuti.nama}</h4>
                <div className="text-slate-600 font-mono text-[11px]">NIP: {cuti.nip}</div>
                <div className="text-slate-700 font-medium mt-0.5">
                  {cuti.jabatan} · <span className="text-teal-700 font-semibold">{cuti.tempatTugas}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Schedule Box */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Jenis Cuti
              </span>
              <div className="text-xs font-bold text-teal-800 mt-1">{cuti.jenisCuti}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Durasi Cuti
              </span>
              <div className="text-xs font-bold text-slate-900 mt-1 font-mono">
                {cuti.jumlahHari} Hari Kerja
              </div>
            </div>
          </div>

          {cuti.namaPengganti && (
            <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200/80">
              <span className="text-[10px] text-teal-800 uppercase font-bold tracking-wider block">
                Pegawai Pengganti (Pelimpahan Tugas)
              </span>
              <div className="text-xs font-bold text-teal-950 mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                {cuti.namaPengganti}
              </div>
            </div>
          )}

          {/* Dates Range */}
          <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200/70 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-teal-700 font-medium">Tanggal Mulai</div>
              <div className="text-xs font-bold text-slate-900">{formatDateIndo(cuti.tanggalMulai)}</div>
            </div>
            <span className="text-teal-400 font-bold text-sm">→</span>
            <div>
              <div className="text-[10px] text-teal-700 font-medium">Tanggal Selesai</div>
              <div className="text-xs font-bold text-slate-900">{formatDateIndo(cuti.tanggalSelesai)}</div>
            </div>
          </div>

          {/* Additional details */}
          <div className="space-y-2 text-slate-700">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                Alasan / Keperluan Cuti
              </span>
              <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 text-slate-800 leading-relaxed">
                {cuti.alasan || 'Tidak ada keterangan khusus.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-slate-500">Nomor Surat:</span>{' '}
                <strong className="text-slate-800 font-mono">{cuti.nomorSuratCuti || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-500">Tgl Pengajuan:</span>{' '}
                <strong className="text-slate-800">{formatDateIndo(cuti.tanggalPengajuan)}</strong>
              </div>
              <div>
                <span className="text-slate-500">Pejabat Penyetuju:</span>{' '}
                <strong className="text-slate-800">{cuti.pejabatPenyetuju || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-500">Pembaruan:</span>{' '}
                <strong className="text-slate-800 font-mono">{formatTimestampIndo(cuti.timestampUpdate)}</strong>
              </div>
            </div>

            {/* Note edit for Admin */}
            {role === 'ADMIN KEPEGAWAIAN' && onUpdateStatus && (
              <div className="pt-2">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Catatan Kepegawaian / Disposisi:
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tambahkan catatan delegasi tugas atau telaah sisa cuti..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-hidden focus:border-teal-600"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Tutup
          </button>

          {/* Admin status actions */}
          {role === 'ADMIN KEPEGAWAIAN' && onUpdateStatus && (
            <div className="flex items-center gap-2">
              {cuti.statusPersetujuan === 'Pengajuan' && (
                <>
                  <button
                    onClick={() => handleAction('Ditolak')}
                    disabled={isUpdating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Tolak
                  </button>
                  <button
                    onClick={() => handleAction('Disetujui')}
                    disabled={isUpdating}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Setujui Cuti
                  </button>
                </>
              )}
              {cuti.statusPersetujuan === 'Disetujui' && (
                <button
                  onClick={() => handleAction('Selesai')}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-white hover:bg-slate-900 transition"
                >
                  Tandai Selesai Bertugas
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
