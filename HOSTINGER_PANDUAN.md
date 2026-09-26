# Panduan Lengkap SiMONCUT: Deploy Sekali Klik GitHub ke Hostinger (Anti Layar Putih)

Dokumen ini berisi panduan resmi agar aplikasi **SiMONCUT (Sistem Monitoring Cuti Pegawai Puskesmas Kepulauan Seribu Selatan)** langsung tampil normal dan berfungsi penuh tanpa layar putih (*blank screen*) saat disinkronisasikan dari GitHub ke Hostinger.

> **Tagline Aplikasi:**  
> *“Pantau Cuti, Mudahkan Pengelolaan Kepegawaian”*

---

## 🛑 Penyebab Utama Masalah "Layar Putih" di Hostinger

Ketika repositori GitHub ditarik (*Git Deploy / Pull*) ke Hostinger:
1. **Hostinger Hanya Menarik Kode Mentah**:  
   Secara default, Hostinger Git tidak otomatis menjalankan `npm run build`. File `index.html` mentah di root memanggil `<script type="module" src="/src/main.tsx">`. Peramban (browser) **tidak dapat membaca file TypeScript/JSX (`.tsx`) secara langsung**, sehingga peramban mengalami error sintaks dan layar menjadi putih polos.
2. **Folder `dist/` Sebelumnya Masuk `.gitignore`**:  
   Karena diabaikan oleh Git, folder hasil kompilasi `dist/` tidak pernah terunggah ke repositori GitHub. Akibatnya, server Hostinger tidak memiliki file aplikasi siap jalan.
3. **Prioritas File Index Server**:  
   Server Apache di Hostinger secara default mencari `index.html` mentah di root sebelum membaca file hasil build.

---

## ✅ Solusi yang Telah Diterapkan di Repositori Ini (Siap Sekali Klik!)

Kami telah mengonfigurasi seluruh sistem agar **SEKALI KLIK SINKRONISASI DI HOSTINGER LANGSUNG JALAN**:

1. **Folder `dist/` Sudah Dikompilasi & Diikutsertakan di Git**:  
   Aturan `.gitignore` telah disesuaikan agar folder produksi `dist/` yang berisi file HTML, CSS, JavaScript teroptimasi, dan PWA Service Worker ikut tersimpan di repositori GitHub. Saat Anda sinkronisasi di Hostinger, semua file siap pakai langsung tersedia di `public_html/dist/`.
2. **File `.htaccess` Cerdas di Root**:  
   Secara otomatis mengarahkan pengunjung ke `dist/index.html` dan memetakan semua aset (`/assets/...`, manifest, service worker) serta rute SPA tanpa perlu konfigurasi manual.
3. **Dispatcher `index.php` Cadangan**:  
   Jika server Hostinger memprioritaskan PHP atau modul rewrite tertentu berbeda, `index.php` bertindak sebagai dispatcher otomatis yang melayani `dist/index.html` dan mengatur MIME type berkas JS/CSS secara sempurna.
4. **File `.htaccess` di dalam Folder `dist/`**:  
   Jika Anda mengubah *Document Root* di Hostinger ke `public_html/dist`, aplikasi tetap berjalan 100% dengan dukungan SPA routing.

---

## 🚀 Cara Sinkronisasi GitHub ke Hostinger (Sekali Klik)

### Langkah 1: Hubungkan Repositori GitHub di Hostinger
1. Masuk ke **hPanel Hostinger**.
2. Pilih hosting/domain Anda, lalu buka menu **Tingkat Lanjut (Advanced)** > **Git**.
3. Masukkan:
   - **Repository**: URL GitHub repositori Anda (misal: `https://github.com/username/simoncut.git`)
   - **Branch**: `main`
   - **Install path**: biarkan kosong atau isi `public_html`
4. Klik **Deploy** / **Buat**.

### Langkah 2: Setiap Ada Pembaruan (Sinkronisasi Sekali Klik)
- Setiap kali Anda ingin memperbarui website dari GitHub, cukup klik tombol **Deploy** / **Tarik Cabang (Pull)** di menu Git Hostinger.
- Website langsung terupdate dan langsung tampil tanpa layar putih!

---

## 🛠️ Alternatif 1: Mengatur Document Root ke `public_html/dist` (Opsi Terbaik di Hostinger)
Jika Anda ingin performa maksimal dan struktur terbersih di Hostinger:
1. Buka hPanel Hostinger > menu **Domain** atau **Websites**.
2. Ubah **Document Root** domain Anda dari `public_html` menjadi:
   ```text
   public_html/dist
   ```
3. Klik **Simpan**. Website langsung membaca folder `dist/` sebagai halaman utama.

---

## 🛠️ Alternatif 2: Otomatisasi GitHub Actions (Opsional)
Kami juga menyertakan file `.github/workflows/deploy-hostinger.yml`.  
Jika Anda ingin setiap `git push` otomatis terunggah via FTP tanpa perlu membuka hPanel:
1. Buka hPanel Hostinger > **FTP Accounts** (catat Host, Username, Password).
2. Di repositori GitHub > **Settings** > **Secrets and variables** > **Actions**.
3. Tambahkan 3 secret:
   - `HOSTINGER_FTP_SERVER`
   - `HOSTINGER_FTP_USERNAME`
   - `HOSTINGER_FTP_PASSWORD`
4. Setiap push ke branch `main`, GitHub Actions akan otomatis mengompilasi dan mengunggah ke Hostinger.

---

## 📋 Ringkasan File Kunci Siap Deploy:
- `/.htaccess` : Mengalihkan lalu lintas root ke folder build produksi `dist/`
- `/index.php` : Dispatcher PHP cadangan untuk streaming file aset dan SPA
- `/dist/` : Berisi berkas kompilasi produksi siap tayang (HTML, JS, CSS, PWA)
- `/dist/.htaccess` : Routing SPA dan MIME types di dalam folder dist
- `/.gitignore` : Memastikan folder `dist/` tersinkronisasi ke GitHub
- `/package.json` : Konfigurasi dependensi dan perintah `build`
