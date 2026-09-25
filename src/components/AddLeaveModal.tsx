import React, { useState, useEffect, useMemo } from 'react';
import { X, CalendarPlus, Check, AlertCircle } from 'lucide-react';
import { Pegawai, Cuti, JenisCuti, StatusPersetujuan, ReferensiMaster } from '../types';
import { calculateDaysBetween, getTodayString } from '../utils/dateUtils';

interface AddLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  pegawaiList: Pegawai[];
  referensi: ReferensiMaster;
  onSave: (data: Omit<Cuti, 'idCuti' | 'timestampUpdate'>) => Promise<unknown>;
  preselectedNip?: string;
}

export const AddLeaveModal: React.FC<AddLeaveModalProps> = ({
  isOpen,
  onClose,
  pegawaiList,
  referensi,
  onSave,
  preselectedNip,
}) => {
  if (!isOpen) return null;

  const today = getTodayString();

  // Daftar Pejabat Penyetuju yang ditentukan pengguna, diambil dari data pegawai
  const TARGET_PENYETUJU = [
    { key: 'ignatius', defaultNama: 'dr. Ignatius Dendy Purnama' },
    { key: 'dede', defaultNama: 'dr. Dede Hadi Irawan' },
    { key: 'randy', defaultNama: 'drg. Randy Oknelis' },
    { key: 'markus', defaultNama: 'dr. Markus' },
    { key: 'rahmah', defaultNama: 'dr. Rahmah Qonita' },
  ];

  const pejabatOptions = useMemo(() => {
    return TARGET_PENYETUJU.map((item) => {
      const match = pegawaiList.find((p) => p.nama.toLowerCase().includes(item.key));
      if (match) {
        return {
          nama: match.nama,
          label: `${match.nama} - ${match.jabatan} (${match.tempatTugas})`,
        };
      }
      return {
        nama: item.defaultNama,
        label: `${item.defaultNama} - ${item.defaultNama.startsWith('drg.') ? 'Dokter Gigi' : 'Dokter'} (Puskesmas Kep. Seribu Selatan)`,
      };
    });
  }, [pegawaiList]);

  const [selectedNip, setSelectedNip] = useState(preselectedNip || pegawaiList[0]?.nip || '');
  const [namaPengganti, setNamaPengganti] = useState('');

  // Update selectedNip if preselectedNip changes or modal opens
  useEffect(() => {
    if (preselectedNip) {
      setSelectedNip(preselectedNip);
    } else if (!selectedNip && pegawaiList.length > 0) {
      setSelectedNip(pegawaiList[0].nip);
    }
  }, [preselectedNip, isOpen]);

  const [jenisCuti, setJenisCuti] = useState<JenisCuti>('Cuti Tahunan');
  const [tanggalMulai, setTanggalMulai] = useState(today);
  const [tanggalSelesai, setTanggalSelesai] = useState(today);
  const [jumlahHari, setJumlahHari] = useState(1);
  const [alasan, setAlasan] = useState('');
  const [nomorSuratCuti, setNomorSuratCuti] = useState('');
  const [statusPersetujuan, setStatusPersetujuan] = useState<StatusPersetujuan>('Disetujui');
  const [pejabatPenyetuju, setPejabatPenyetuju] = useState<string>(() => {
    return pejabatOptions[0]?.nama || 'dr. Dede Hadi Irawan';
  });
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto calculate days when dates change
  useEffect(() => {
    if (tanggalMulai && tanggalSelesai) {
      if (tanggalSelesai < tanggalMulai) {
        setJumlahHari(0);
        setErrorMsg('Tanggal selesai tidak boleh sebelum tanggal mulai.');
      } else {
        setErrorMsg('');
        const days = calculateDaysBetween(tanggalMulai, tanggalSelesai);
        setJumlahHari(days);
      }
    }
  }, [tanggalMulai, tanggalSelesai]);

  const selectedPegawai = pegawaiList.find((p) => p.nip === selectedNip) || pegawaiList[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPegawai) {
      setErrorMsg('Pilih pegawai terlebih dahulu.');
      return;
    }
    if (tanggalSelesai < tanggalMulai) {
      setErrorMsg('Tanggal selesai tidak valid.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        nip: selectedPegawai.nip,
        nama: selectedPegawai.nama,
        jabatan: selectedPegawai.jabatan,
        tempatTugas: selectedPegawai.tempatTugas,
        namaPengganti: namaPengganti || undefined,
        jenisCuti,
        tanggalMulai,
        tanggalSelesai,
        jumlahHari,
        alasan: alasan || 'Keperluan dinas / pribadi',
        nomorSuratCuti: nomorSuratCuti || `850/${Math.floor(100 + Math.random() * 900)}/PKM-KSS/2026`,
        tanggalPengajuan: today,
        statusPersetujuan,
        pejabatPenyetuju,
        catatan,
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Terjadi kesalahan saat menyimpan data cuti.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs no-print">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-teal-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CalendarPlus className="w-5 h-5 text-teal-300" />
            <div>
              <h3 className="text-base font-bold">Input Data Cuti Baru</h3>
              <p className="text-[11px] text-teal-200">
                Data akan tersinkronisasi ke Google Spreadsheet Puskesmas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-teal-200 hover:text-white hover:bg-teal-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Pegawai Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Pilih Pegawai <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedNip}
              onChange={(e) => setSelectedNip(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-hidden focus:border-teal-600"
              required
            >
              {pegawaiList.map((p) => (
                <option key={p.nip} value={p.nip}>
                  {p.nama} ({p.jabatan} - {p.tempatTugas})
                </option>
              ))}
            </select>
          </div>

          {/* Pegawai Summary Pill */}
          {selectedPegawai && (
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 grid grid-cols-2 gap-2">
              <div>NIP: <strong className="font-mono text-slate-800">{selectedPegawai.nip}</strong></div>
              <div>Unit: <strong className="text-slate-800">{selectedPegawai.tempatTugas}</strong></div>
            </div>
          )}

          {/* Nama Pengganti Cuti (dari daftar pegawai) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-700">
                Nama Pengganti Cuti <span className="text-teal-600 font-normal">(Pelimpahan Tugas)</span>
              </label>
              {namaPengganti && (
                <button
                  type="button"
                  onClick={() => setNamaPengganti('')}
                  className="text-[10px] text-rose-600 hover:underline"
                >
                  Kosongkan
                </button>
              )}
            </div>
            <select
              value={namaPengganti}
              onChange={(e) => setNamaPengganti(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-hidden focus:border-teal-600"
            >
              <option value="">-- Pilih Pegawai Pengganti (Opsional) --</option>
              {pegawaiList
                .filter((p) => p.nip !== selectedNip)
                .map((p) => (
                  <option key={p.nip} value={p.nama}>
                    {p.nama} ({p.jabatan} - {p.tempatTugas})
                  </option>
                ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              Dipilih dari daftar pegawai Puskesmas / Pustu yang akan menerima pelimpahan tanggung jawab pelayanan selama cuti.
            </p>
          </div>

          {/* Jenis Cuti & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Jenis Cuti <span className="text-rose-500">*</span>
              </label>
              <select
                value={jenisCuti}
                onChange={(e) => setJenisCuti(e.target.value as JenisCuti)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-hidden focus:border-teal-600"
                required
              >
                {referensi.jenisCutiList.map((jc) => (
                  <option key={jc} value={jc}>
                    {jc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Status Persetujuan
              </label>
              <select
                value={statusPersetujuan}
                onChange={(e) => setStatusPersetujuan(e.target.value as StatusPersetujuan)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-hidden focus:border-teal-600"
              >
                {referensi.statusPersetujuanList.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tanggal Mulai & Tanggal Selesai */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Tanggal Mulai <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-hidden focus:border-teal-600 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Tanggal Selesai <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-hidden focus:border-teal-600 font-mono"
                required
              />
            </div>
          </div>

          {/* Jumlah Hari Display */}
          <div className="p-2 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between text-xs font-semibold text-teal-900">
            <span>Perhitungan Lama Cuti:</span>
            <span className="font-mono text-sm">{jumlahHari} Hari Kalender</span>
          </div>

          {/* Alasan / Keperluan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Alasan / Keterangan Cuti
            </label>
            <input
              type="text"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Contoh: Keperluan keluarga di Jakarta / rawat jalan"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-hidden focus:border-teal-600"
            />
          </div>

          {/* Nomor Surat & Pejabat Penyetuju */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nomor Surat Cuti
              </label>
              <input
                type="text"
                value={nomorSuratCuti}
                onChange={(e) => setNomorSuratCuti(e.target.value)}
                placeholder="850/.../PKM-KSS/IX/2026"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-hidden focus:border-teal-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Pejabat Penyetuju <span className="text-rose-500">*</span>
              </label>
              <select
                value={pejabatPenyetuju}
                onChange={(e) => setPejabatPenyetuju(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-hidden focus:border-teal-600 font-medium"
                required
              >
                {pejabatOptions.map((opt) => (
                  <option key={opt.nama} value={opt.nama}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Catatan Disposisi */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Catatan / Disposisi Delegasi Tugas
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Pelayanan didelegasikan ke rekan sejawat..."
              rows={2}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-hidden focus:border-teal-600"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || jumlahHari <= 0}
              className="px-4 py-2 rounded-lg bg-teal-700 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-50 transition shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Data Cuti'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
