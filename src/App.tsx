import React, { useState } from 'react';
import { useSimonData } from './hooks/useSimonData';
import { NavTab, Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { StatCards } from './components/StatCards';
import { AlertBanner } from './components/AlertBanner';
import { ShortageRiskRadar } from './components/ShortageRiskRadar';
import { TempatTugasTable } from './components/TempatTugasTable';
import { TempatTugasChart } from './components/TempatTugasChart';
import { JabatanTable } from './components/JabatanTable';
import { MonitoringJabatanTempatTugas } from './components/MonitoringJabatanTempatTugas';
import { GlobalFilterBar } from './components/GlobalFilterBar';
import { CutiTable } from './components/CutiTable';
import { PegawaiTable } from './components/PegawaiTable';
import { CalendarView } from './components/CalendarView';
import { PimpinanDashboard } from './components/PimpinanDashboard';
import { LaporanView } from './components/LaporanView';
import { LeaveModal } from './components/LeaveModal';
import { AddLeaveModal } from './components/AddLeaveModal';
import { IntegrationModal } from './components/IntegrationModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Cuti } from './types';
import { Plus, Database, Sparkles, Calendar, Layers, ShieldCheck, MapPin } from 'lucide-react';
import { formatDateIndo, getCurrentWeekRange, getCurrentMonthRange, getNextMonthRange, getTodayString, isSameUnit } from './utils/dateUtils';

export default function App() {
  const {
    pegawaiList,
    cutiList,
    filteredCutiList,
    referensi,
    gasUrl,
    updateGasUrl,
    lastSync,
    isLoading,
    syncStatus,
    refreshData,
    resetToDefault,
    addCuti,
    addPegawai,
    updateStatusCuti,
    role,
    setRole,
    filters,
    setFilters,
    dashboardStats,
    tempatTugasSummary,
    jabatanSummary,
    cutiHariIni,
    cuti3Hari,
    cutiMingguIni,
    cutiBulanIni,
    cutiBulanDepan,
    pengajuanPending,
  } = useSimonData();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);
  const [selectedCuti, setSelectedCuti] = useState<Cuti | null>(null);
  const [isAddLeaveOpen, setIsAddLeaveOpen] = useState(false);
  const [preselectedNipForLeave, setPreselectedNipForLeave] = useState<string | undefined>(undefined);
  const [isIntegrationOpen, setIsIntegrationOpen] = useState(false);

  const handleOpenAddLeaveForPegawai = (nip?: string) => {
    setPreselectedNipForLeave(nip);
    setIsAddLeaveOpen(true);
  };

  const todayStr = getTodayString();
  const weekRange = getCurrentWeekRange();
  const currentMonthRange = getCurrentMonthRange();
  const nextMonthRange = getNextMonthRange();

  const handleResetFilters = () => {
    setFilters({
      tempatTugas: '',
      jabatan: '',
      jenisCuti: '',
      statusPersetujuan: '',
      searchQuery: '',
    });
  };

  const handleSelectUnitFromSummary = (unitName: string) => {
    setFilters({ ...filters, tempatTugas: unitName });
    setActiveTab('cuti');
  };

  const handleSelectJabatanFromSummary = (jabatanName: string) => {
    setFilters({ ...filters, jabatan: jabatanName });
    setActiveTab('cuti');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Bar Contract compliant Header */}
      <Header
        lastSync={lastSync}
        isLoading={isLoading}
        onRefresh={refreshData}
        role={role}
        onRoleChange={setRole}
        onOpenIntegration={() => setIsIntegrationOpen(true)}
        onToggleMobileMenu={() => setIsOpenMobileMenu(true)}
        isGasConfigured={Boolean(gasUrl)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'integrasi') {
              setIsIntegrationOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          isOpenMobile={isOpenMobileMenu}
          onCloseMobile={() => setIsOpenMobileMenu(false)}
          cutiHariIniCount={cutiHariIni.length}
          pengajuanCount={pengajuanPending.length}
          role={role}
          onOpenAddLeave={() => handleOpenAddLeaveForPegawai()}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 space-y-6 overflow-y-auto">
          {/* Status Alert if Google Apps Script sync message is present */}
          {syncStatus.message && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between no-print transition ${
                syncStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : syncStatus.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <span>{syncStatus.message}</span>
              <button
                onClick={() => setIsIntegrationOpen(true)}
                className="text-[11px] font-semibold underline ml-2 shrink-0"
              >
                Konfigurasi Spreadsheet
              </button>
            </div>
          )}

          {/* TAB 1: DASHBOARD UTAMA */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Header Title & CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-teal-600 text-white text-[11px] font-black tracking-wide">
                      SiMONCUT
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Sistem Monitoring Cuti Pegawai
                    </h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs">
                    <span className="font-semibold text-slate-700">Puskesmas Kepulauan Seribu Selatan</span>
                    <span className="text-slate-300 hidden sm:inline">·</span>
                    <span className="text-teal-700 italic font-semibold">
                      “Pantau Cuti, Mudahkan Pengelolaan Kepegawaian”
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('pimpinan')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition shadow-2xs"
                  >
                    Executive Pimpinan
                  </button>
                </div>
              </div>

              {/* 6 Kartu Statistik Utama */}
              <StatCards stats={dashboardStats} onNavigateTab={setActiveTab} />

              {/* Sistem Peringatan Cuti Otomatis */}
              <AlertBanner
                cutiHariIni={cutiHariIni}
                cuti3Hari={cuti3Hari}
                cutiMingguIni={cutiMingguIni}
                cutiBulanDepan={cutiBulanDepan}
                onNavigateTab={setActiveTab}
              />

              {/* Monitoring Risiko Kekurangan Pegawai Antar Pulau */}
              <ShortageRiskRadar
                summary={tempatTugasSummary}
                onSelectUnit={handleSelectUnitFromSummary}
              />

              {/* Fitur Utama Baru: Monitoring Pegawai Berdasarkan Jabatan & Tempat Tugas */}
              <MonitoringJabatanTempatTugas
                pegawaiList={pegawaiList}
                cutiList={cutiList}
                tempatTugasList={referensi.tempatTugasList}
                jabatanList={referensi.jabatanList}
                cutiHariIni={cutiHariIni}
                cutiMingguIni={cutiMingguIni}
                cutiBulanIni={cutiBulanIni}
                cutiBulanDepan={cutiBulanDepan}
                onSelectCuti={setSelectedCuti}
                onSelectJabatanUnit={(jab, unit) => {
                  setFilters({ ...filters, jabatan: jab, tempatTugas: unit });
                  setActiveTab('cuti');
                }}
              />

              {/* Monitoring per Tempat Tugas: Tabel & Grafik Batang/Donut */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7">
                  <TempatTugasTable
                    summary={tempatTugasSummary}
                    onSelectUnit={handleSelectUnitFromSummary}
                  />
                </div>
                <div className="lg:col-span-5">
                  <TempatTugasChart summary={tempatTugasSummary} />
                </div>
              </div>

              {/* Monitoring Berdasarkan Jabatan */}
              <JabatanTable
                summary={jabatanSummary}
                onSelectJabatan={handleSelectJabatanFromSummary}
              />
            </div>
          )}

          {/* TAB 2: EXECUTIVE PIMPINAN */}
          {activeTab === 'pimpinan' && (
            <PimpinanDashboard
              stats={dashboardStats}
              cutiHariIni={cutiHariIni}
              cutiBulanDepan={cutiBulanDepan}
              tempatTugasSummary={tempatTugasSummary}
              onSelectCuti={setSelectedCuti}
              onNavigateTab={setActiveTab}
            />
          )}

          {/* TAB 3: FITUR CUTI HARI INI */}
          {activeTab === 'cuti-hari-ini' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    PEGAWAI YANG CUTI HARI INI
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Tanggal: <strong className="text-slate-800">{formatDateIndo(todayStr)}</strong> · Menampilkan seluruh pegawai aktif yang sedang menjalani izin cuti.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-md self-start sm:self-auto">
                  {cutiHariIni.length} Pegawai Sedang Cuti
                </span>
              </div>

              <GlobalFilterBar
                filters={filters}
                onChangeFilters={setFilters}
                referensi={referensi}
                onResetFilters={handleResetFilters}
              />

              <CutiTable
                cutiList={cutiHariIni.filter((c) => {
                  if (filters.tempatTugas && !isSameUnit(c.tempatTugas, filters.tempatTugas)) return false;
                  if (filters.jabatan && c.jabatan !== filters.jabatan) return false;
                  if (filters.jenisCuti && c.jenisCuti !== filters.jenisCuti) return false;
                  if (filters.searchQuery) {
                    const q = filters.searchQuery.toLowerCase();
                    return c.nama.toLowerCase().includes(q) || c.nip.toLowerCase().includes(q) || c.tempatTugas.toLowerCase().includes(q);
                  }
                  return true;
                })}
                onSelectCuti={setSelectedCuti}
                title="Daftar Tenaga Kesehatan Sedang Cuti Hari Ini"
                subtitle="Menampilkan pegawai yang sedang menjalani cuti pada hari ini"
                emptyMessage="Tidak ada pegawai yang sedang cuti hari ini."
              />
            </div>
          )}

          {/* TAB 4: FITUR CUTI MINGGU INI */}
          {activeTab === 'cuti-minggu-ini' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    PEGAWAI CUTI MINGGU INI
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Periode Pekan Berjalan: <strong className="font-mono text-slate-800">{formatDateIndo(weekRange.start)} s/d {formatDateIndo(weekRange.end)}</strong>
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-md self-start sm:self-auto">
                  {cutiMingguIni.length} Pegawai
                </span>
              </div>

              <GlobalFilterBar
                filters={filters}
                onChangeFilters={setFilters}
                referensi={referensi}
                onResetFilters={handleResetFilters}
              />

              <CutiTable
                cutiList={cutiMingguIni.filter((c) => {
                  if (filters.tempatTugas && !isSameUnit(c.tempatTugas, filters.tempatTugas)) return false;
                  if (filters.jabatan && c.jabatan !== filters.jabatan) return false;
                  if (filters.jenisCuti && c.jenisCuti !== filters.jenisCuti) return false;
                  if (filters.searchQuery) {
                    const q = filters.searchQuery.toLowerCase();
                    return c.nama.toLowerCase().includes(q) || c.nip.toLowerCase().includes(q) || c.tempatTugas.toLowerCase().includes(q);
                  }
                  return true;
                })}
                onSelectCuti={setSelectedCuti}
                title="Daftar Pegawai yang Memiliki Jadwal Cuti pada Minggu Berjalan"
                subtitle="Periode cuti bersinggungan dengan kalender pekan ini (Senin - Minggu)"
              />
            </div>
          )}

          {/* TAB 5: FITUR CUTI BULAN INI */}
          {activeTab === 'cuti-bulan-ini' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    PEGAWAI CUTI BULAN INI ({currentMonthRange.monthName} {currentMonthRange.year})
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Seluruh pegawai dengan jadwal cuti pada bulan berjalan di Puskesmas Kepulauan Seribu Selatan dan seluruh Pustu.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-md self-start sm:self-auto">
                  {cutiBulanIni.length} Terjadwal
                </span>
              </div>

              <GlobalFilterBar
                filters={filters}
                onChangeFilters={setFilters}
                referensi={referensi}
                onResetFilters={handleResetFilters}
              />

              <CutiTable
                cutiList={cutiBulanIni.filter((c) => {
                  if (filters.tempatTugas && !isSameUnit(c.tempatTugas, filters.tempatTugas)) return false;
                  if (filters.jabatan && c.jabatan !== filters.jabatan) return false;
                  if (filters.jenisCuti && c.jenisCuti !== filters.jenisCuti) return false;
                  if (filters.searchQuery) {
                    const q = filters.searchQuery.toLowerCase();
                    return c.nama.toLowerCase().includes(q) || c.nip.toLowerCase().includes(q) || c.tempatTugas.toLowerCase().includes(q);
                  }
                  return true;
                })}
                onSelectCuti={setSelectedCuti}
                title={`Monitoring Seluruh Cuti Bulan ${currentMonthRange.monthName}`}
              />
            </div>
          )}

          {/* TAB 6: FITUR CUTI BULAN DEPAN (PERENCANAAN) */}
          {activeTab === 'cuti-bulan-depan' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-sky-600" />
                    PERENCANAAN CUTI BULAN DEPAN ({nextMonthRange.monthName} {nextMonthRange.year})
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Membantu pimpinan mengantisipasi kekosongan dokter/perawat sejak dini untuk penjadwalan pos jaga.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-md self-start sm:self-auto">
                  {cutiBulanDepan.length} Rencana Terdaftar
                </span>
              </div>

              <GlobalFilterBar
                filters={filters}
                onChangeFilters={setFilters}
                referensi={referensi}
                onResetFilters={handleResetFilters}
              />

              <CutiTable
                cutiList={cutiBulanDepan.filter((c) => {
                  if (filters.tempatTugas && !isSameUnit(c.tempatTugas, filters.tempatTugas)) return false;
                  if (filters.jabatan && c.jabatan !== filters.jabatan) return false;
                  if (filters.jenisCuti && c.jenisCuti !== filters.jenisCuti) return false;
                  if (filters.searchQuery) {
                    const q = filters.searchQuery.toLowerCase();
                    return c.nama.toLowerCase().includes(q) || c.nip.toLowerCase().includes(q) || c.tempatTugas.toLowerCase().includes(q);
                  }
                  return true;
                })}
                onSelectCuti={setSelectedCuti}
                title={`Daftar Cuti Bulan ${nextMonthRange.monthName} ${nextMonthRange.year}`}
                subtitle="Pegawai yang sudah memiliki persetujuan cuti untuk bulan kalender berikutnya"
              />
            </div>
          )}

          {/* TAB 7: KALENDER CUTI INTERAKTIF */}
          {activeTab === 'kalender' && (
            <div className="space-y-4">
              <CalendarView
                cutiList={cutiList}
                onSelectCuti={setSelectedCuti}
              />
            </div>
          )}

          {/* TAB 8: DATA PEGAWAI (DATA_PEGAWAI) */}
          {activeTab === 'pegawai' && (
            <div className="space-y-4">
              <PegawaiTable
                pegawaiList={pegawaiList}
                referensi={referensi}
                onInputCutiForPegawai={(nip) => handleOpenAddLeaveForPegawai(nip)}
                onOpenAddCuti={() => handleOpenAddLeaveForPegawai()}
              />
            </div>
          )}

          {/* TAB 9: DATA CUTI MASTER (DATA_CUTI) */}
          {activeTab === 'cuti' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    Master Data Cuti (DATA_CUTI)
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Daftar seluruh riwayat pengajuan, persetujuan, dan status cuti pegawai.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => handleOpenAddLeaveForPegawai()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-700 text-white rounded-lg text-xs font-bold hover:bg-teal-800 transition shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    Input Cuti Baru
                  </button>
                </div>
              </div>

              <GlobalFilterBar
                filters={filters}
                onChangeFilters={setFilters}
                referensi={referensi}
                onResetFilters={handleResetFilters}
              />

              <CutiTable
                cutiList={filteredCutiList}
                onSelectCuti={setSelectedCuti}
                title="Seluruh Arsip Data Cuti"
                subtitle="Klik pada baris untuk melihat detail, riwayat surat, atau memperbarui status"
              />
            </div>
          )}

          {/* TAB 10: LAPORAN & REKAP */}
          {activeTab === 'laporan' && (
            <LaporanView
              cutiList={cutiList}
              pegawaiList={pegawaiList}
              tempatTugasSummary={tempatTugasSummary}
              referensi={referensi}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Thumb Navigation */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        cutiHariIniCount={cutiHariIni.length}
      />

      {/* Modals */}
      <LeaveModal
        cuti={selectedCuti}
        onClose={() => setSelectedCuti(null)}
        role={role}
        onUpdateStatus={updateStatusCuti}
      />

      <AddLeaveModal
        isOpen={isAddLeaveOpen}
        onClose={() => {
          setIsAddLeaveOpen(false);
          setPreselectedNipForLeave(undefined);
        }}
        pegawaiList={pegawaiList.filter((p) => p.statusAktif === 'Aktif')}
        referensi={referensi}
        onSave={addCuti}
        preselectedNip={preselectedNipForLeave}
      />

      <IntegrationModal
        isOpen={isIntegrationOpen}
        onClose={() => setIsIntegrationOpen(false)}
        gasUrl={gasUrl}
        onSaveGasUrl={updateGasUrl}
        onTestSync={refreshData}
        isLoading={isLoading}
        syncStatus={syncStatus}
        onResetToDefault={resetToDefault}
      />

      {/* PWA Offline indicator */}
      <OfflineIndicator />
    </div>
  );
}
