# Panduan Mengatasi Website Ngeblank Putih di Hostinger (SiMONCUT)

Dokumen ini menjelaskan penyebab layar putih (*blank white screen*) saat melakukan hosting di **Hostinger** dan solusi mudah agar aplikasi **SiMONCUT** langsung tampil normal.

---

## 🔍 Mengapa Terjadi Blank Putih di Hostinger?

1. **Hostinger Git Deployment Hanya Mengunduh Kode Mentah**:
   Fitur Git bawaan di hPanel Hostinger hanya melakukan `git pull` dari repositori GitHub. File `index.html` utama di root masih memanggil `<script src="/src/main.tsx">`. Peramban (browser) **tidak dapat membaca file TypeScript (`.tsx`) secara langsung**, sehingga peramban memunculkan error dan layar menjadi putih polos.
2. **Belum Ada File `.htaccess`**:
   Server Hostinger menggunakan Apache / LiteSpeed. Aplikasi React SPA membutuhkan berkas `.htaccess` agar semua rute dialihkan (*rewrite*) ke file build yang sudah dikompilasi.
3. **Jalur Aset (Base URL)**:
   Sebelumnya jalur aset menggunakan path absolut `/assets/`. Kami telah memperbaruinya menjadi `./assets/` (relatif) agar dapat dibuka di domain utama maupun sub-direktori tanpa error 404.

---

## 🚀 3 Pilihan Solusi Agar Langsung Tampil di Hostinger

### Pilihan 1: Upload Isi Folder `dist/` ke Hostinger (Paling Cepat & Mudah)
Jika Anda ingin langsung online dalam 2 menit:
1. Di komputer lokal Anda, jalankan perintah:
   ```bash
   npm run build
   ```
2. Buka folder `dist/` yang baru saja terbentuk.
3. Buka **hPanel Hostinger** > **File Manager** > buka folder `public_html`.
4. Unggah **semua isi di dalam folder `dist/`** (yaitu file `index.html`, `.htaccess`, folder `assets/`, dll.) langsung ke dalam `public_html`.
5. Buka domain Anda di browser: Website langsung tampil normal tanpa layar putih!

---

### Pilihan 2: Otomatisasi GitHub Actions (Sangat Disarankan)
Kami sudah menyiapkan berkas `.github/workflows/deploy-hostinger.yml` di repositori ini. Setiap kali Anda melakukan `git push` ke GitHub, GitHub akan otomatis mengompilasi kode dan mengunggahnya ke Hostinger.

**Langkah aktivasi:**
1. Buka hPanel Hostinger > menu **FTP Accounts**. Catat:
   - **FTP Server / Host** (contoh: `ftp.domainanda.com` atau IP Hostinger)
   - **FTP Username**
   - **FTP Password**
2. Buka repositori GitHub Anda di browser > klik **Settings** > **Secrets and variables** > **Actions** > **New repository secret**.
3. Buat 3 secret:
   - `HOSTINGER_FTP_SERVER` : (Host/IP FTP Hostinger)
   - `HOSTINGER_FTP_USERNAME` : (Username FTP)
   - `HOSTINGER_FTP_PASSWORD` : (Password FTP)
4. Lakukan `git push` ke branch `main`. GitHub Actions akan otomatis melakukan build dan upload ke `public_html`.

---

### Pilihan 3: Menggunakan Git di hPanel Hostinger
Jika Anda menggunakan fitur **Git** di hPanel Hostinger:
1. Hubungkan repositori GitHub Anda seperti biasa ke folder `public_html`.
2. Di hPanel Hostinger, ubah **Document Root** domain Anda dari `public_html` menjadi:
   ```text
   public_html/dist
   ```
   *(Atau jalankan terminal SSH di Hostinger: `cd public_html && npm install && npm run build`)*.
3. File `.htaccess` yang telah kami sediakan di root dan di dalam folder `public/` akan otomatis memastikan routing aplikasi berjalan lancar.

---

## 🛡️ Fitur Proteksi Layar Putih yang Sudah Ditambahkan:
1. **ErrorBoundary**: Jika terjadi kendala pada peramban klien, sistem menampilkan pesan ramah dengan tombol **Muat Ulang Halaman** dan **Reset Cache & Data**.
2. **Base URL Relatif (`./`)**: Menghindari kegagalan muat file CSS / JS akibat perbedaan domain / sub-folder.
3. **MIME Types di `.htaccess`**: Memastikan LiteSpeed Hostinger mengenali file `.js` ES Modules dan font web.
