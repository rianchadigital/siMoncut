export type StatusKepegawaian = 'PNS' | 'PPPK' | 'PJLP' | 'Tenaga Kontrak' | 'Lainnya';

export type StatusAktif = 'Aktif' | 'Tidak Aktif';

export type JenisKelamin = 'Laki-laki' | 'Perempuan';

export type JenisCuti =
  | 'Cuti Tahunan'
  | 'Cuti Sakit'
  | 'Cuti Melahirkan'
  | 'Cuti Alasan Penting'
  | 'Cuti Besar'
  | 'Cuti di Luar Tanggungan Negara'
  | 'Cuti Lainnya';

export type StatusPersetujuan = 'Pengajuan' | 'Disetujui' | 'Ditolak' | 'Selesai';

export interface Pegawai {
  no: number;
  nip: string;
  nama: string;
  pangkatGolongan: string;
  jabatan: string;
  tempatTugas: string;
  puskesmasPustu: string;
  statusKepegawaian: StatusKepegawaian;
  jenisKelamin: JenisKelamin;
  nomorHp: string;
  statusAktif: StatusAktif;
}

export interface Cuti {
  idCuti: string;
  nip: string;
  nama: string;
  jabatan: string;
  tempatTugas: string;
  namaPengganti?: string;
  jenisCuti: JenisCuti;
  tanggalMulai: string; // YYYY-MM-DD
  tanggalSelesai: string; // YYYY-MM-DD
  jumlahHari: number;
  alasan: string;
  nomorSuratCuti: string;
  tanggalPengajuan: string; // YYYY-MM-DD
  statusPersetujuan: StatusPersetujuan;
  pejabatPenyetuju: string;
  catatan: string;
  timestampUpdate: string;
}

export interface ReferensiMaster {
  tempatTugasList: string[];
  jabatanList: string[];
  jenisCutiList: JenisCuti[];
  statusKepegawaianList: StatusKepegawaian[];
  statusPersetujuanList: StatusPersetujuan[];
}

export interface TempatTugasSummary {
  tempatTugas: string;
  totalPegawai: number;
  cutiHariIni: number;
  cutiMingguIni: number;
  cutiBulanIni: number;
  cutiBulanDepan: number;
  tersediaHariIni: number;
  persentaseCuti: number;
  levelRisiko: 'Aman' | 'Waspada' | 'Kritis';
}

export interface JabatanSummary {
  jabatan: string;
  totalPegawai: number;
  sedangCuti: number;
  tidakCuti: number;
}

export interface DashboardStats {
  totalPegawaiAktif: number;
  cutiHariIni: number;
  cutiMingguIni: number;
  cutiBulanIni: number;
  cutiBulanDepan: number;
  pengajuanPending: number;
}

export type UserRole = 'ADMIN KEPEGAWAIAN' | 'PIMPINAN';

export interface GlobalFilter {
  tempatTugas: string;
  jabatan: string;
  jenisCuti: string;
  statusPersetujuan: string;
  searchQuery: string;
}
