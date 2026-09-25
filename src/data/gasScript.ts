/**
 * Google Apps Script (Code.gs) Source Code & Setup Guide
 * for SiMONCUT – Sistem Monitoring Cuti Pegawai Puskesmas Kepulauan Seribu Selatan
 */

export const GAS_CODE_GS = `/**
 * ====================================================================
 * SiMONCUT - BACKEND GOOGLE APPS SCRIPT (Code.gs)
 * Sistem Monitoring Cuti Pegawai Puskesmas Kepulauan Seribu Selatan
 * Tagline: “Pantau Cuti, Mudahkan Pengelolaan Kepegawaian”
 * ====================================================================
 * Petunjuk:
 * 1. Buka Google Spreadsheet baru (atau gunakan Spreadsheet yang sudah ada).
 * 2. Buat 3 Sheet bernama persis: "DATA_PEGAWAI", "DATA_CUTI", "REFERENSI".
 * 3. Buka menu Extensions > Apps Script.
 * 4. Hapus semua kode default, lalu tempelkan (paste) seluruh kode ini.
 * 5. Jika Spreadsheet terpisah dari Apps Script, isi SPREADSHEET_ID di bawah.
 *    Jika script terikat langsung (container-bound), biarkan SPREADSHEET_ID kosong "".
 * 6. Klik "Deploy" > "New deployment".
 * 7. Pilih tipe "Web app".
 * 8. Konfigurasi:
 *    - Description: SiMONCUT API v1.0
 *    - Execute as: "Me" (email Anda)
 *    - Who has access: "Anyone" (Siapa saja, termasuk anonim)
 * 9. Klik "Deploy", izinkan hak akses (Authorize access).
 * 10. Salin "Web App URL" dan tempelkan ke menu "Integrasi Spreadsheet" pada SiMONCUT.
 */

// Kosongkan jika Script dibuat dari menu Extensions > Apps Script di Spreadsheet yang sama
var SPREADSHEET_ID = "";

function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Handle HTTP GET Requests
 * Parameter:
 * - action: 'all' | 'pegawai' | 'cuti' | 'dashboard' | 'referensi' | 
 *           'cutiHariIni' | 'cutiMingguIni' | 'cutiBulanIni' | 'cutiBulanDepan' |
 *           'rekapTempatTugas' | 'rekapJabatan'
 */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'all';
    var responseData = {};

    switch (action) {
      case 'pegawai':
        responseData = { status: 'success', data: getPegawai() };
        break;
      case 'cuti':
        responseData = { status: 'success', data: getCuti() };
        break;
      case 'referensi':
        responseData = { status: 'success', data: getReferensi() };
        break;
      case 'dashboard':
        responseData = { status: 'success', data: getDashboard() };
        break;
      case 'cutiHariIni':
        responseData = { status: 'success', data: getCutiHariIni() };
        break;
      case 'cutiMingguIni':
        responseData = { status: 'success', data: getCutiMingguIni() };
        break;
      case 'cutiBulanIni':
        responseData = { status: 'success', data: getCutiBulanIni() };
        break;
      case 'cutiBulanDepan':
        responseData = { status: 'success', data: getCutiBulanDepan() };
        break;
      case 'rekapTempatTugas':
        responseData = { status: 'success', data: getRekapTempatTugas() };
        break;
      case 'rekapJabatan':
        responseData = { status: 'success', data: getRekapJabatan() };
        break;
      case 'all':
      default:
        responseData = {
          status: 'success',
          timestamp: new Date().toISOString(),
          instansi: 'Puskesmas Kepulauan Seribu Selatan',
          pegawai: getPegawai(),
          cuti: getCuti(),
          referensi: getReferensi(),
          dashboard: getDashboard()
        };
        break;
    }

    return ContentService
      .createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: err.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle HTTP POST Requests (Untuk Tambah/Ubah Data Cuti dari Aplikasi)
 */
function doPost(e) {
  try {
    var rawBody = e.postData.contents;
    var data = JSON.parse(rawBody);
    var action = data.action || 'addCuti';

    if (action === 'addCuti') {
      var result = addCutiRow(data.cuti);
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'success', data: result }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'addPegawai') {
      var resultPegawai = addPegawaiRow(data.pegawai);
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'success', data: resultPegawai }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: 'Action tidak dikenal' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Mengambil Seluruh Data Pegawai dari Sheet DATA_PEGAWAI
 */
function getPegawai() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('DATA_PEGAWAI');
  if (!sheet) throw new Error('Sheet DATA_PEGAWAI tidak ditemukan.');

  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  var headers = values[0].map(function(h) { return String(h || '').toLowerCase().trim(); });

  function findCol(keywords, fallback) {
    for (var k = 0; k < keywords.length; k++) {
      for (var c = 0; c < headers.length; c++) {
        if (headers[c].indexOf(keywords[k]) !== -1) return c;
      }
    }
    return fallback;
  }

  var colNo = findCol(['no'], 0);
  var colNip = findCol(['nip'], 1);
  var colNama = findCol(['nama pegawai', 'nama'], 2);
  var colPangkat = findCol(['pangkat', 'golongan'], 3);
  var colJabatan = findCol(['jabatan', 'posisi'], 4);
  var colTempat = findCol(['tempat tugas', 'tempat', 'unit kerja', 'unit'], 5);
  var colPuskesmas = findCol(['puskesmas/pustu', 'puskesmas', 'pustu'], 6);
  var colStatusKep = findCol(['status kepegawaian', 'kepegawaian'], 7);
  var colGender = findCol(['jenis kelamin', 'kelamin', 'gender'], 8);
  var colHp = findCol(['nomor hp', 'no hp', 'telepon', 'hp', 'wa'], 9);
  var colStatusAktif = findCol(['status aktif', 'status', 'keaktifan'], 10);

  var result = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var nip = colNip < row.length ? String(row[colNip] || '').trim() : '';
    var nama = colNama < row.length ? String(row[colNama] || '').trim() : '';
    if (!nip && !nama) continue;

    var tempat = colTempat < row.length ? String(row[colTempat] || '').trim() : '';
    var pusk = colPuskesmas < row.length ? String(row[colPuskesmas] || tempat || '').trim() : tempat;

    result.push({
      no: (colNo < row.length && row[colNo]) ? row[colNo] : i,
      nip: nip,
      nama: nama,
      pangkatGolongan: colPangkat < row.length ? String(row[colPangkat] || '-').trim() : '-',
      jabatan: colJabatan < row.length ? String(row[colJabatan] || '-').trim() : '-',
      tempatTugas: tempat || 'Puskesmas Kepulauan Seribu Selatan',
      puskesmasPustu: pusk || tempat || 'Puskesmas Kepulauan Seribu Selatan',
      statusKepegawaian: colStatusKep < row.length ? String(row[colStatusKep] || 'PNS').trim() : 'PNS',
      jenisKelamin: colGender < row.length ? String(row[colGender] || 'Laki-laki').trim() : 'Laki-laki',
      nomorHp: colHp < row.length ? String(row[colHp] || '-').trim() : '-',
      statusAktif: colStatusAktif < row.length ? String(row[colStatusAktif] || 'Aktif').trim() : 'Aktif'
    });
  }
  return result;
}

/**
 * Mengambil Seluruh Data Cuti dari Sheet DATA_CUTI
 */
function getCuti() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('DATA_CUTI');
  if (!sheet) throw new Error('Sheet DATA_CUTI tidak ditemukan.');

  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  // Pemetaan kolom cerdas berdasarkan baris header (values[0])
  var headers = values[0].map(function(h) { return String(h || '').toLowerCase().trim(); });

  function findCol(keywords, fallbackIdx) {
    for (var k = 0; k < keywords.length; k++) {
      var idx = headers.indexOf(keywords[k]);
      if (idx !== -1) return idx;
    }
    return fallbackIdx;
  }

  // Cek apakah ada kolom 'pengganti' di header
  var hasPengganti = headers.some(function(h) { return h.indexOf('pengganti') !== -1; });
  var offset = hasPengganti ? 1 : 0;

  var colId = findCol(['id cuti', 'id'], 0);
  var colNip = findCol(['nip'], 1);
  var colNama = findCol(['nama pegawai', 'nama'], 2);
  var colJabatan = findCol(['jabatan'], 3);
  var colTempat = findCol(['tempat tugas', 'unit kerja', 'unit'], 4);
  var colPengganti = findCol(['nama pengganti cuti', 'nama pengganti', 'pengganti'], hasPengganti ? 5 : -1);
  var colJenis = findCol(['jenis cuti', 'jenis'], 5 + offset);
  var colMulai = findCol(['tanggal mulai', 'tgl mulai', 'mulai'], 6 + offset);
  var colSelesai = findCol(['tanggal selesai', 'tgl selesai', 'selesai'], 7 + offset);
  var colHari = findCol(['jumlah hari', 'jml hari', 'hari'], 8 + offset);
  var colAlasan = findCol(['alasan/keterangan', 'alasan', 'keterangan'], 9 + offset);
  var colSurat = findCol(['nomor surat cuti', 'nomor surat', 'no surat'], 10 + offset);
  var colPengajuan = findCol(['tanggal pengajuan', 'tgl pengajuan'], 11 + offset);
  var colStatus = findCol(['status persetujuan', 'status'], 12 + offset);
  var colPejabat = findCol(['pejabat/pemberi persetujuan', 'pejabat penyetuju', 'penyetuju'], 13 + offset);
  var colCatatan = findCol(['catatan'], 14 + offset);
  var colTime = findCol(['timestamp update', 'timestamp'], 15 + offset);

  var result = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (!row[colId] && !row[colNip] && !row[colNama]) continue;

    var startStr = formatDateString(row[colMulai]);
    var endStr = formatDateString(row[colSelesai]);
    var pengajuanStr = formatDateString(row[colPengajuan]);

    result.push({
      idCuti: String(row[colId] || ('CUTI-' + i)).trim(),
      nip: String(row[colNip] || '').trim(),
      nama: String(row[colNama] || '').trim(),
      jabatan: String(row[colJabatan] || '').trim(),
      tempatTugas: String(row[colTempat] || '').trim(),
      namaPengganti: colPengganti !== -1 ? String(row[colPengganti] || '').trim() : '',
      jenisCuti: String(row[colJenis] || 'Cuti Tahunan').trim(),
      tanggalMulai: startStr,
      tanggalSelesai: endStr,
      jumlahHari: Number(row[colHari]) || calculateDays(startStr, endStr),
      alasan: String(row[colAlasan] || '').trim(),
      nomorSuratCuti: String(row[colSurat] || '').trim(),
      tanggalPengajuan: pengajuanStr || getTodayFormatted(),
      statusPersetujuan: String(row[colStatus] || 'Pengajuan').trim(),
      pejabatPenyetuju: String(row[colPejabat] || '').trim(),
      catatan: String(row[colCatatan] || '').trim(),
      timestampUpdate: row[colTime] ? new Date(row[colTime]).toISOString() : new Date().toISOString()
    });
  }
  return result;
}

/**
 * Mengambil Master Referensi dari Sheet REFERENSI
 */
function getReferensi() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('REFERENSI');
  
  // Default fallback 4 Tempat Tugas Resmi Puskesmas Kepulauan Seribu Selatan
  var defaultRef = {
    tempatTugasList: [
      'Puskesmas Kepulauan Seribu Selatan',
      'Puskesmas Pembantu Pulau Pari',
      'Puskesmas Pembantu Pulau Lancang',
      'Puskesmas Pembantu Pulau Untung Jawa'
    ],
    jabatanList: [
      'Kepala Puskesmas', 'Kasubbag Tata Usaha', 'Dokter', 'Dokter Gigi',
      'Perawat', 'Bidan', 'Apoteker', 'Tenaga Teknis Kefarmasian',
      'Analis Laboratorium', 'Nutrisionis', 'Sanitarian',
      'Administrator Kesehatan', 'Tenaga Administrasi', 'Lainnya'
    ],
    jenisCutiList: [
      'Cuti Tahunan', 'Cuti Sakit', 'Cuti Melahirkan',
      'Cuti Alasan Penting', 'Cuti Besar', 'Cuti di Luar Tanggungan Negara', 'Cuti Lainnya'
    ],
    statusKepegawaianList: ['PNS', 'PPPK', 'PJLP', 'Tenaga Kontrak', 'Lainnya'],
    statusPersetujuanList: ['Pengajuan', 'Disetujui', 'Ditolak', 'Selesai']
  };

  if (!sheet) return defaultRef;

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol < 1) return defaultRef;

  var rangeValues = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = rangeValues[0].map(function(h) { return String(h || '').toLowerCase().trim(); });

  function findColIdx(keywords, fallback) {
    for (var k = 0; k < keywords.length; k++) {
      for (var col = 0; col < headers.length; col++) {
        if (headers[col].indexOf(keywords[k]) !== -1) return col;
      }
    }
    return fallback;
  }

  var colTempat = findColIdx(['tempat tugas', 'tempat', 'unit', 'lokasi'], 0);
  var colJabatan = findColIdx(['jabatan', 'posisi', 'profesi'], 1);
  var colJenisCuti = findColIdx(['jenis cuti', 'cuti'], 2);
  var colStatusKep = findColIdx(['status kepegawaian', 'kepegawaian'], 3);
  var colStatusSetuju = findColIdx(['status persetujuan', 'persetujuan'], 4);

  var tempatSet = [];
  var jabatanSet = [];
  var jenisCutiSet = [];
  var statusKepSet = [];
  var statusSetujuSet = [];

  for (var i = 1; i < rangeValues.length; i++) {
    var row = rangeValues[i];
    if (colTempat < row.length && row[colTempat]) {
      var valTempat = String(row[colTempat]).trim();
      if (valTempat && tempatSet.indexOf(valTempat) === -1) tempatSet.push(valTempat);
    }
    if (colJabatan < row.length && row[colJabatan]) {
      var valJab = String(row[colJabatan]).trim();
      if (valJab && jabatanSet.indexOf(valJab) === -1) jabatanSet.push(valJab);
    }
    if (colJenisCuti < row.length && row[colJenisCuti]) {
      var valCuti = String(row[colJenisCuti]).trim();
      if (valCuti && jenisCutiSet.indexOf(valCuti) === -1) jenisCutiSet.push(valCuti);
    }
    if (colStatusKep < row.length && row[colStatusKep]) {
      var valKep = String(row[colStatusKep]).trim();
      if (valKep && statusKepSet.indexOf(valKep) === -1) statusKepSet.push(valKep);
    }
    if (colStatusSetuju < row.length && row[colStatusSetuju]) {
      var valSetuju = String(row[colStatusSetuju]).trim();
      if (valSetuju && statusSetujuSet.indexOf(valSetuju) === -1) statusSetujuSet.push(valSetuju);
    }
  }

  return {
    tempatTugasList: tempatSet.length > 0 ? tempatSet : defaultRef.tempatTugasList,
    jabatanList: jabatanSet.length > 0 ? jabatanSet : defaultRef.jabatanList,
    jenisCutiList: jenisCutiSet.length > 0 ? jenisCutiSet : defaultRef.jenisCutiList,
    statusKepegawaianList: statusKepSet.length > 0 ? statusKepSet : defaultRef.statusKepegawaianList,
    statusPersetujuanList: statusSetujuSet.length > 0 ? statusSetujuSet : defaultRef.statusPersetujuanList
  };
}

/**
 * Filter Pegawai yang Sedang Cuti Hari Ini
 */
function getCutiHariIni() {
  var allCuti = getCuti();
  var today = getTodayFormatted();
  return allCuti.filter(function(c) {
    return c.statusPersetujuan === 'Disetujui' && c.tanggalMulai <= today && c.tanggalSelesai >= today;
  });
}

/**
 * Filter Cuti yang Bersinggungan dengan Minggu Ini
 */
function getCutiMingguIni() {
  var allCuti = getCuti();
  var week = getCurrentWeekBounds();
  return allCuti.filter(function(c) {
    return c.statusPersetujuan === 'Disetujui' && c.tanggalMulai <= week.end && c.tanggalSelesai >= week.start;
  });
}

/**
 * Filter Cuti yang Bersinggungan dengan Bulan Ini
 */
function getCutiBulanIni() {
  var allCuti = getCuti();
  var month = getCurrentMonthBounds();
  return allCuti.filter(function(c) {
    return c.statusPersetujuan === 'Disetujui' && c.tanggalMulai <= month.end && c.tanggalSelesai >= month.start;
  });
}

/**
 * Filter Cuti untuk Bulan Depan
 */
function getCutiBulanDepan() {
  var allCuti = getCuti();
  var nextMonth = getNextMonthBounds();
  return allCuti.filter(function(c) {
    return c.statusPersetujuan === 'Disetujui' && c.tanggalMulai <= nextMonth.end && c.tanggalSelesai >= nextMonth.start;
  });
}

/**
 * Rekap Monitoring Pegawai dan Cuti per Tempat Tugas (4 Unit Resmi)
 */
function getRekapTempatTugas() {
  var pegawai = getPegawai().filter(function(p) { return p.statusAktif === 'Aktif'; });
  var cutiHariIni = getCutiHariIni();
  var cutiMingguIni = getCutiMingguIni();
  var cutiBulanIni = getCutiBulanIni();
  var cutiBulanDepan = getCutiBulanDepan();

  var units = [
    'Puskesmas Kepulauan Seribu Selatan',
    'Puskesmas Pembantu Pulau Pari',
    'Puskesmas Pembantu Pulau Lancang',
    'Puskesmas Pembantu Pulau Untung Jawa'
  ];

  function matchUnitName(val) {
    var s = String(val || '').toLowerCase();
    if (s.indexOf('pari') !== -1) return 'Puskesmas Pembantu Pulau Pari';
    if (s.indexOf('lancang') !== -1) return 'Puskesmas Pembantu Pulau Lancang';
    if (s.indexOf('untung') !== -1) return 'Puskesmas Pembantu Pulau Untung Jawa';
    return 'Puskesmas Kepulauan Seribu Selatan';
  }

  var result = units.map(function(unit) {
    var total = pegawai.filter(function(p) { return matchUnitName(p.tempatTugas) === unit; }).length;
    var cHari = cutiHariIni.filter(function(c) { return matchUnitName(c.tempatTugas) === unit; }).length;
    var cMinggu = cutiMingguIni.filter(function(c) { return matchUnitName(c.tempatTugas) === unit; }).length;
    var cBulan = cutiBulanIni.filter(function(c) { return matchUnitName(c.tempatTugas) === unit; }).length;
    var cBulanDepan = cutiBulanDepan.filter(function(c) { return matchUnitName(c.tempatTugas) === unit; }).length;

    var pct = total > 0 ? Math.round((cHari / total) * 100) : 0;
    var risk = 'Aman';
    if (pct >= 40 || (total <= 3 && cHari >= 1)) risk = 'Kritis';
    else if (pct >= 20 || cHari >= 2) risk = 'Waspada';

    return {
      tempatTugas: unit,
      totalPegawai: total,
      cutiHariIni: cHari,
      cutiMingguIni: cMinggu,
      cutiBulanIni: cBulan,
      cutiBulanDepan: cBulanDepan,
      tersediaHariIni: Math.max(0, total - cHari),
      persentaseCuti: pct,
      levelRisiko: risk
    };
  });

  return result;
}

/**
 * Rekap Monitoring Pegawai Berdasarkan Jabatan dan Tempat Tugas
 */
function getRekapJabatanTempatTugas() {
  var pegawai = getPegawai().filter(function(p) { return p.statusAktif === 'Aktif'; });
  var cutiHariIni = getCutiHariIni();
  var ref = getReferensi();
  var units = [
    'Puskesmas Kepulauan Seribu Selatan',
    'Puskesmas Pembantu Pulau Pari',
    'Puskesmas Pembantu Pulau Lancang',
    'Puskesmas Pembantu Pulau Untung Jawa'
  ];

  function matchUnitName(val) {
    var s = String(val || '').toLowerCase();
    if (s.indexOf('pari') !== -1) return 'Puskesmas Pembantu Pulau Pari';
    if (s.indexOf('lancang') !== -1) return 'Puskesmas Pembantu Pulau Lancang';
    if (s.indexOf('untung') !== -1) return 'Puskesmas Pembantu Pulau Untung Jawa';
    return 'Puskesmas Kepulauan Seribu Selatan';
  }

  var matrix = [];
  for (var u = 0; u < units.length; u++) {
    var unitName = units[u];
    var unitPegawai = pegawai.filter(function(p) { return matchUnitName(p.tempatTugas) === unitName; });
    var unitCuti = cutiHariIni.filter(function(c) { return matchUnitName(c.tempatTugas) === unitName; });

    var jabatanBreakdown = ref.jabatanList.map(function(jab) {
      var count = unitPegawai.filter(function(p) { return p.jabatan === jab; }).length;
      var cuti = unitCuti.filter(function(c) { return c.jabatan === jab; }).length;
      return {
        jabatan: jab,
        totalPegawai: count,
        sedangCuti: cuti,
        tersedia: Math.max(0, count - cuti)
      };
    }).filter(function(item) { return item.totalPegawai > 0; });

    matrix.push({
      tempatTugas: unitName,
      totalPegawai: unitPegawai.length,
      totalCuti: unitCuti.length,
      jabatanBreakdown: jabatanBreakdown
    });
  }

  return matrix;
}

/**
 * Rekap Monitoring Berdasarkan Jabatan
 */
function getRekapJabatan() {
  var pegawai = getPegawai().filter(function(p) { return p.statusAktif === 'Aktif'; });
  var cutiHariIni = getCutiHariIni();
  var ref = getReferensi();
  var jabatans = ref.jabatanList;

  return jabatans.map(function(jab) {
    var total = pegawai.filter(function(p) { return p.jabatan === jab; }).length;
    var cuti = cutiHariIni.filter(function(c) { return c.jabatan === jab; }).length;
    return {
      jabatan: jab,
      totalPegawai: total,
      sedangCuti: cuti,
      tidakCuti: Math.max(0, total - cuti)
    };
  }).filter(function(item) {
    return item.totalPegawai > 0;
  });
}

/**
 * Menghitung Statistik Ringkas untuk Dashboard
 */
function getDashboard() {
  var pegawai = getPegawai().filter(function(p) { return p.statusAktif === 'Aktif'; });
  var cuti = getCuti();
  var pending = cuti.filter(function(c) { return c.statusPersetujuan === 'Pengajuan'; }).length;

  return {
    totalPegawaiAktif: pegawai.length,
    cutiHariIni: getCutiHariIni().length,
    cutiMingguIni: getCutiMingguIni().length,
    cutiBulanIni: getCutiBulanIni().length,
    cutiBulanDepan: getCutiBulanDepan().length,
    pengajuanPending: pending,
    rekapTempatTugas: getRekapTempatTugas(),
    rekapJabatan: getRekapJabatan()
  };
}

/**
 * Helper Fungsi Tambah Baris Cuti Baru ke Sheet DATA_CUTI
 */
function addCutiRow(c) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('DATA_CUTI');
  if (!sheet) throw new Error('Sheet DATA_CUTI tidak ditemukan.');

  var id = c.idCuti || ('CUTI-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000));
  var timestamp = new Date().toISOString();

  sheet.appendRow([
    id,
    c.nip || '',
    c.nama || '',
    c.jabatan || '',
    c.tempatTugas || '',
    c.namaPengganti || '',
    c.jenisCuti || 'Cuti Tahunan',
    c.tanggalMulai || '',
    c.tanggalSelesai || '',
    c.jumlahHari || 1,
    c.alasan || '',
    c.nomorSuratCuti || '',
    c.tanggalPengajuan || getTodayFormatted(),
    c.statusPersetujuan || 'Pengajuan',
    c.pejabatPenyetuju || '',
    c.catatan || '',
    timestamp
  ]);

  return { idCuti: id, success: true };
}

/**
 * Helper Fungsi Tambah Baris Pegawai Baru ke Sheet DATA_PEGAWAI
 */
function addPegawaiRow(p) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('DATA_PEGAWAI');
  if (!sheet) throw new Error('Sheet DATA_PEGAWAI tidak ditemukan.');

  var lastRow = sheet.getLastRow();
  var no = lastRow;

  sheet.appendRow([
    no,
    p.nip || '',
    p.nama || '',
    p.pangkatGolongan || '',
    p.jabatan || '',
    p.tempatTugas || '',
    p.puskesmasPustu || p.tempatTugas || '',
    p.statusKepegawaian || 'PNS',
    p.jenisKelamin || 'Laki-laki',
    p.nomorHp || '',
    p.statusAktif || 'Aktif'
  ]);

  return { success: true, nip: p.nip };
}

// ==========================================
// Helper Utility Dates (WIB Asia/Jakarta)
// ==========================================

function getTodayFormatted() {
  var d = new Date();
  return Utilities.formatDate(d, 'Asia/Jakarta', 'yyyy-MM-dd');
}

function formatDateString(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, 'Asia/Jakarta', 'yyyy-MM-dd');
  }
  var str = String(val).trim();
  if (str.match(/^\\d{4}-\\d{2}-\\d{2}/)) {
    return str.substring(0, 10);
  }
  return str;
}

function calculateDays(startStr, endStr) {
  if (!startStr || !endStr) return 1;
  var s = new Date(startStr);
  var e = new Date(endStr);
  var diff = e.getTime() - s.getTime();
  if (diff < 0) return 0;
  return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
}

function getCurrentWeekBounds() {
  var d = new Date();
  var day = d.getDay();
  var diffToMonday = day === 0 ? -6 : 1 - day;
  var monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  var sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: Utilities.formatDate(monday, 'Asia/Jakarta', 'yyyy-MM-dd'),
    end: Utilities.formatDate(sunday, 'Asia/Jakarta', 'yyyy-MM-dd')
  };
}

function getCurrentMonthBounds() {
  var d = new Date();
  var first = new Date(d.getFullYear(), d.getMonth(), 1);
  var last = new Date(d.getFullYear(), d.getMonth() + 1, 0);

  return {
    start: Utilities.formatDate(first, 'Asia/Jakarta', 'yyyy-MM-dd'),
    end: Utilities.formatDate(last, 'Asia/Jakarta', 'yyyy-MM-dd')
  };
}

function getNextMonthBounds() {
  var d = new Date();
  var first = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  var last = new Date(d.getFullYear(), d.getMonth() + 2, 0);

  return {
    start: Utilities.formatDate(first, 'Asia/Jakarta', 'yyyy-MM-dd'),
    end: Utilities.formatDate(last, 'Asia/Jakarta', 'yyyy-MM-dd')
  };
}
`;

export const SPREADSHEET_COLUMNS = {
  DATA_PEGAWAI: [
    'No',
    'NIP',
    'Nama Pegawai',
    'Pangkat/Golongan',
    'Jabatan',
    'Tempat Tugas',
    'Puskesmas/Pustu',
    'Status Kepegawaian',
    'Jenis Kelamin',
    'Nomor HP',
    'Status Aktif',
  ],
  DATA_CUTI: [
    'ID Cuti',
    'NIP',
    'Nama Pegawai',
    'Jabatan',
    'Tempat Tugas',
    'Nama Pengganti Cuti',
    'Jenis Cuti',
    'Tanggal Mulai',
    'Tanggal Selesai',
    'Jumlah Hari',
    'Alasan/Keterangan',
    'Nomor Surat Cuti',
    'Tanggal Pengajuan',
    'Status Persetujuan',
    'Pejabat/Pemberi Persetujuan',
    'Catatan',
    'Timestamp Update',
  ],
  REFERENSI: [
    'Daftar Puskesmas/Pustu',
    'Daftar Jabatan',
    'Daftar Jenis Cuti',
    'Daftar Status Kepegawaian',
    'Daftar Status Persetujuan',
  ],
};
