# Panduan Lengkap SiMONCUT: Deploy Sekali Klik GitHub ke Hostinger (Anti Layar Putih)

Dokumen ini berisi panduan resmi agar aplikasi **SiMONCUT (Sistem Monitoring Cuti Pegawai Puskesmas Kepulauan Seribu Selatan)** langsung tampil normal dan berfungsi penuh tanpa layar putih (*blank screen*) saat disinkronisasikan dari GitHub ke Hostinger.

> **Tagline Aplikasi:**  
> *“Pantau Cuti, Mudahkan Pengelolaan Kepegawaian”*

---

## 🔍 Solusi Cepat untuk Pesan:
> *"Aplikasi siap disinkronisasikan. Folder dist/ sudah disertakan langsung di repositori."*

Jika Anda sempat melihat pesan di atas saat membuka domain di Hostinger, hal tersebut terjadi karena:
1. **Sinkronisasi Git Hostinger dilakukan sebelum berkas produksi selesai terunggah ke repositori GitHub**, ATAU
2. **Git di repositori sebelumnya sempat mengabaikan folder `dist/`**.

### ✅ Solusi yang Telah Selesai Diterapkan Sekarang (100% Otomatis):
1. **Auto-Restorer Cerdas di `index.php`**:  
   Kini `index.php` dilengkapi dengan modul pemulihan otomatis dari berkas `dist_package.dat` & `dist.zip`. Begitu halaman web diakses, sistem akan langsung mengekstrak dan menyajikan seluruh antarmuka SiMONCUT secara otomatis dalam hitungan milidetik tanpa perlu menjalankan perintah terminal apapun di Hostinger!
2. **Pelacakan Wajib di `.gitignore`**:  
   Berkas `.gitignore` telah dikonfigurasi dengan aturan `!dist/`, `!dist/**`, `!dist_package.dat`, dan `!dist.zip` agar Git wajib menyertakan semua berkas siap pakai.
3. **Multi-Directory Auto Discovery**:  
   Sistem secara otomatis mendeteksi lokasi aplikasi baik jika Document Root diarahkan ke `public_html` maupun ke `public_html/dist`.

---

## 🚀 Cara Sinkronisasi GitHub ke Hostinger (Sekali Klik)

### Langkah 1: Pastikan Perubahan Terbaru di-Push ke GitHub
- Pastikan commit terbaru dari AI Studio / branch `main` sudah tersinkronkan ke repositori GitHub Anda.

### Langkah 2: Tarik Pembaruan di Hostinger hPanel
1. Masuk ke **hPanel Hostinger**.
2. Buka menu **Tingkat Lanjut (Advanced)** > **Git**.
3. Di samping nama repositori Anda, klik tombol **Tarik Cabang (Pull)** atau **Deploy**.
4. Buka kembali alamat website Anda di browser (tekan `Ctrl + F5` atau `Cmd + Shift + R` untuk hard refresh).
5. **Website SiMONCUT langsung tampil lengkap dengan seluruh fiturnya!**

---

## 🛠️ Pilihan Pengaturan Document Root di Hostinger (Opsional)

### Opsi A: Tetap di `public_html` (Rekomendasi Default)
- Anda tidak perlu mengubah pengaturan apapun. File `.htaccess` dan `index.php` di root akan otomatis mengarahkan dan melayani aplikasi SiMONCUT beserta seluruh aset dan rutenya.

### Opsi B: Ubah Document Root ke `public_html/dist`
- Di hPanel Hostinger > menu **Domain / Websites** > ubah **Document Root** menjadi `public_html/dist`.
- Folder `dist` sudah memiliki file `.htaccess` tersendiri untuk menangani routing SPA secara instan.

---

## 📋 Berkas Inti Siap Deploy yang Tersedia di Repositori:
- `index.php` : Dispatcher & auto-restorer cerdas (menjamin web langsung aktif)
- `.htaccess` : Aturan rewrite URL & penanganan MIME types JS/CSS/PWA di root
- `dist/` : Berkas hasil kompilasi produksi lengkap (HTML, JS, CSS, PWA, ikon logo)
- `dist_package.dat` : Arsip terkompresi cadangan untuk auto-ekstraksi di PHP
- `dist.zip` : Paket zip mandiri produksi
- `dist/.htaccess` : Konfigurasi perutean SPA internal jika Document Root diubah ke folder dist
- `.gitignore` : Memastikan seluruh berkas produksi terunggah ke repositori GitHub
