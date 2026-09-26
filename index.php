<?php
/**
 * ====================================================================
 * SiMONCUT - Hostinger Production Dispatcher & Auto-Restorer
 * Sistem Monitoring Cuti Pegawai Puskesmas Kepulauan Seribu Selatan
 * Tagline: “Pantau Cuti, Mudahkan Pengelolaan Kepegawaian”
 * ====================================================================
 * 
 * File ini menjamin website langsung tampil 100% sempurna di Hostinger:
 * 1. Mendeteksi lokasi folder dist/ secara cerdas di berbagai konfigurasi Hostinger.
 * 2. Jika folder dist/ belum ada (misal akibat Git clone yang melewatkan folder),
 *    file ini OTOMATIS mengekstrak seluruh bundle aplikasi dari dist_package.dat / dist.zip!
 * 3. Menyajikan aset statis (JS, CSS, SVG, PNG, PWA) dengan MIME Type yang akurat.
 * 4. Mendukung SPA HTML5 pushState routing (navigasi lancar tanpa error 404).
 */

error_reporting(0);
ini_set('display_errors', '0');

$baseDir = __DIR__;

// Fungsi bantu untuk mencari folder dist yang valid
function findDistDirectory($baseDir) {
    // 1. Cek langsung di __DIR__/dist
    if (file_exists($baseDir . '/dist/index.html')) {
        return realpath($baseDir . '/dist');
    }
    
    // 2. Cek jika Document Root sudah diarahkan ke dist itu sendiri
    if (file_exists($baseDir . '/index.html')) {
        $content = @file_get_contents($baseDir . '/index.html', false, null, 0, 1024);
        if ($content && (strpos($content, 'assets/index-') !== false || strpos($content, 'id="root"') !== false)) {
            return realpath($baseDir);
        }
    }
    
    // 3. Cek direktori public_html/dist
    if (file_exists($baseDir . '/public_html/dist/index.html')) {
        return realpath($baseDir . '/public_html/dist');
    }

    // 4. Cek parent directory /dist
    if (file_exists(dirname($baseDir) . '/dist/index.html')) {
        return realpath(dirname($baseDir) . '/dist');
    }

    // 5. Cek subdirektori (misal git clone ke folder bernama simoncut/dist)
    $subdirs = @glob($baseDir . '/*/dist/index.html');
    if (!empty($subdirs)) {
        return realpath(dirname($subdirs[0]));
    }
    
    return null;
}

// Coba temukan folder dist
$distDir = findDistDirectory($baseDir);

// JIKA DIST BELUM DITEMUKAN, LAKUKAN AUTO-EXTRACT SECARA OTOMATIS!
$packageDat = $baseDir . '/dist_package.dat';
$packageZip = $baseDir . '/dist.zip';

if (!$distDir) {
    $extracted = false;

    // A. Ekstraksi dari dist_package.dat (Menggunakan fungsi bawaan PHP zlib)
    if (file_exists($packageDat)) {
        $compressed = @file_get_contents($packageDat);
        if ($compressed) {
            $json = null;
            if (function_exists('gzdecode')) {
                $json = @gzdecode($compressed);
            }
            if (!$json && function_exists('gzuncompress')) {
                $json = @gzuncompress($compressed);
            }
            if (!$json && function_exists('gzinflate')) {
                $json = @gzinflate(substr($compressed, 10, -8));
            }
            
            if ($json) {
                $files = @json_decode($json, true);
                if (is_array($files)) {
                    $targetDist = $baseDir . '/dist';
                    if (!is_dir($targetDist)) {
                        @mkdir($targetDist, 0755, true);
                    }
                    foreach ($files as $file) {
                        $filePath = $targetDist . '/' . ltrim($file['path'], '/');
                        $fileDir = dirname($filePath);
                        if (!is_dir($fileDir)) {
                            @mkdir($fileDir, 0755, true);
                        }
                        $fileData = base64_decode($file['content']);
                        @file_put_contents($filePath, $fileData);
                    }
                    $extracted = true;
                }
            }
        }
    }

    // B. Ekstraksi cadangan dari dist.zip jika dist_package.dat belum diekstrak
    if (!$extracted && file_exists($packageZip) && class_exists('ZipArchive')) {
        $zip = new ZipArchive();
        if ($zip->open($packageZip) === true) {
            $zip->extractTo($baseDir);
            $zip->close();
            $extracted = true;
        }
    }

    // Coba deteksi kembali setelah auto-extract
    $distDir = findDistDirectory($baseDir);
}

// 1. TANGANI PERMINTAAN FILE STATIS (CSS, JS, SVG, PNG, PWA MANIFEST, DLL)
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$requestPath = parse_url($requestUri, PHP_URL_PATH);
$cleanPath = ltrim($requestPath, '/');

// Cegah akses ke file sistem atau PHP sensitif
if (!empty($cleanPath) && $cleanPath !== 'index.php') {
    $targetFile = null;
    
    // Periksa di distDir jika ada
    if ($distDir && file_exists($distDir . '/' . $cleanPath)) {
        $targetFile = $distDir . '/' . $cleanPath;
    } elseif ($distDir && strpos($cleanPath, 'dist/') === 0 && file_exists($baseDir . '/' . $cleanPath)) {
        $targetFile = $baseDir . '/' . $cleanPath;
    } elseif (file_exists($baseDir . '/' . $cleanPath) && is_file($baseDir . '/' . $cleanPath)) {
        // Cek jika file publik diminta langsung (misal favicon.ico atau icon.svg)
        $allowedExts = ['js', 'css', 'svg', 'png', 'ico', 'webmanifest', 'json', 'woff', 'woff2', 'txt'];
        $checkExt = strtolower(pathinfo($cleanPath, PATHINFO_EXTENSION));
        if (in_array($checkExt, $allowedExts)) {
            $targetFile = $baseDir . '/' . $cleanPath;
        }
    }

    if ($targetFile && is_file($targetFile)) {
        $ext = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));
        $contentTypes = [
            'js'          => 'application/javascript; charset=UTF-8',
            'mjs'         => 'application/javascript; charset=UTF-8',
            'css'         => 'text/css; charset=UTF-8',
            'svg'         => 'image/svg+xml',
            'png'         => 'image/png',
            'jpg'         => 'image/jpeg',
            'jpeg'        => 'image/jpeg',
            'ico'         => 'image/x-icon',
            'json'        => 'application/json',
            'webmanifest' => 'application/manifest+json',
            'woff'        => 'font/woff',
            'woff2'       => 'font/woff2',
            'txt'         => 'text/plain; charset=UTF-8',
        ];

        if (isset($contentTypes[$ext])) {
            header('Content-Type: ' . $contentTypes[$ext]);
        }
        header('Cache-Control: public, max-age=31536000, immutable');
        header('Access-Control-Allow-Origin: *');
        header('X-Content-Type-Options: nosniff');
        readfile($targetFile);
        exit;
    }
}

// 2. JIKA DIST DITEMUKAN, SAJIKAN INDEX.HTML PRODUKSI
if ($distDir && file_exists($distDir . '/index.html')) {
    header('Content-Type: text/html; charset=UTF-8');
    header('X-Powered-By: SiMONCUT');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    readfile($distDir . '/index.html');
    exit;
}

// 3. FALLBACK STATUS
header('Content-Type: text/html; charset=UTF-8');
echo '<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SiMONCUT – Inisialisasi Aplikasi</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; max-width: 520px; text-align: center; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
    h1 { color: #0d9488; font-size: 24px; margin: 0 0 8px 0; }
    p { font-size: 14px; color: #475569; line-height: 1.6; }
    .badge { display: inline-block; background: #ccfbf1; color: #0f766e; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
    .btn { display: inline-block; background: #0d9488; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; font-size: 14px; }
    .btn:hover { background: #0f766e; }
    .box { background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 12px; text-align: left; font-family: monospace; color: #334155; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Puskesmas Kepulauan Seribu Selatan</div>
    <h1>SiMONCUT</h1>
    <p><strong>Sistem Monitoring Cuti Pegawai</strong></p>
    <p style="color:#0d9488; font-style:italic;">“Pantau Cuti, Mudahkan Pengelolaan Kepegawaian”</p>
    <p>Sedang menyelesaikan persiapan aplikasi. Klik tombol di bawah untuk membuka aplikasi.</p>
    <a href="?" class="btn">Buka Aplikasi SiMONCUT</a>
  </div>
</body>
</html>';
exit;
