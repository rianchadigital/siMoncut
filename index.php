<?php
/**
 * ====================================================================
 * SiMONCUT - Hostinger Production Dispatcher & Auto-Restorer
 * Sistem Monitoring Cuti Pegawai Puskesmas Kepulauan Seribu Selatan
 * Tagline: “Pantau Cuti, Mudahkan Pengelolaan Kepegawaian”
 * ====================================================================
 */

error_reporting(0);
ini_set('display_errors', '0');

$baseDir = __DIR__;

// Fungsi bantu untuk mencari folder dist yang valid
function findDistDirectory($baseDir) {
    if (file_exists($baseDir . '/dist/index.html')) {
        return realpath($baseDir . '/dist');
    }
    if (file_exists($baseDir . '/index.html')) {
        $content = @file_get_contents($baseDir . '/index.html', false, null, 0, 1024);
        if ($content && (strpos($content, 'assets/index-') !== false || strpos($content, 'id="root"') !== false)) {
            return realpath($baseDir);
        }
    }
    if (file_exists($baseDir . '/public_html/dist/index.html')) {
        return realpath($baseDir . '/public_html/dist');
    }
    if (file_exists(dirname($baseDir) . '/dist/index.html')) {
        return realpath(dirname($baseDir) . '/dist');
    }
    $subdirs = @glob($baseDir . '/*/dist/index.html');
    if (!empty($subdirs)) {
        return realpath(dirname($subdirs[0]));
    }
    return null;
}

$distDir = findDistDirectory($baseDir);
$packageDat = $baseDir . '/dist_package.dat';
$rootVersionFile = $baseDir . '/version.json';
$distVersionFile = $distDir ? ($distDir . '/version.json') : ($baseDir . '/dist/version.json');

// Cek apakah ada pemicu pembaruan paksa (force update)
$forceUpdate = isset($_GET['update']) || isset($_GET['sync']) || isset($_GET['rebuild']) || isset($_GET['refresh']);

// Cek apakah ekstraksi diperlukan
$needsExtract = false;

if (!$distDir) {
    $needsExtract = true;
} elseif ($forceUpdate) {
    $needsExtract = true;
} elseif (file_exists($packageDat)) {
    // 1. Cek perbandingan version.json
    if (file_exists($rootVersionFile) && file_exists($distVersionFile)) {
        $rootVer = @json_decode(file_get_contents($rootVersionFile), true);
        $distVer = @json_decode(file_get_contents($distVersionFile), true);
        if ($rootVer && $distVer) {
            if (($rootVer['buildTimestamp'] ?? 0) > ($distVer['buildTimestamp'] ?? 0)) {
                $needsExtract = true;
            }
        } else {
            $needsExtract = true;
        }
    } elseif (file_exists($rootVersionFile) && !file_exists($distVersionFile)) {
        $needsExtract = true;
    }
    // 2. Cek perbandingan mtime file dist_package.dat dengan dist/index.html
    if (!$needsExtract && $distDir && file_exists($distDir . '/index.html')) {
        if (filemtime($packageDat) > filemtime($distDir . '/index.html')) {
            $needsExtract = true;
        }
    }
}

// EKSTRAKSI DIST JIKA DIPERLUKAN
$extractSuccess = false;
$extractMessage = '';

if ($needsExtract && file_exists($packageDat)) {
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
            $parsed = @json_decode($json, true);
            $files = null;
            // Dukung format lama (array file) dan format baru (['meta' => ..., 'files' => ...])
            if (is_array($parsed)) {
                if (isset($parsed['files']) && is_array($parsed['files'])) {
                    $files = $parsed['files'];
                } else {
                    $files = $parsed;
                }
            }

            if (is_array($files)) {
                $targetDist = $baseDir . '/dist';
                if (!is_dir($targetDist)) {
                    @mkdir($targetDist, 0755, true);
                }
                $count = 0;
                foreach ($files as $file) {
                    if (!isset($file['path']) || !isset($file['content'])) continue;
                    $filePath = $targetDist . '/' . ltrim($file['path'], '/');
                    $fileSubDir = dirname($filePath);
                    if (!is_dir($fileSubDir)) {
                        @mkdir($fileSubDir, 0755, true);
                    }
                    $fileData = base64_decode($file['content']);
                    @file_put_contents($filePath, $fileData);
                    $count++;
                }

                // Salin juga version.json ke dist jika ada
                if (file_exists($rootVersionFile)) {
                    @copy($rootVersionFile, $targetDist . '/version.json');
                }

                // Buat .htaccess di dalam folder dist jika belum ada
                $distHtaccess = $targetDist . '/.htaccess';
                if (!file_exists($distHtaccess)) {
                    $htContent = "<IfModule mod_rewrite.c>\n  RewriteEngine On\n  RewriteBase /\n  RewriteCond %{REQUEST_FILENAME} -f [OR]\n  RewriteCond %{REQUEST_FILENAME} -d\n  RewriteRule ^ - [L]\n  RewriteRule ^ index.html [L]\n</IfModule>\n";
                    @file_put_contents($distHtaccess, $htContent);
                }

                $extractSuccess = true;
                $extractMessage = "Berhasil mengekstrak {$count} berkas terbaru.";
                $distDir = findDistDirectory($baseDir);

                // Bersihkan cache OPcache jika tersedia
                if (function_exists('opcache_reset')) {
                    @opcache_reset();
                }
            }
        }
    }
}

// JIKA DIPANGGIL DENGAN ?update=1 TAMPILKAN LAYAR KONFIRMASI
if ($forceUpdate) {
    header('Content-Type: text/html; charset=UTF-8');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    $versionData = file_exists($rootVersionFile) ? @json_decode(file_get_contents($rootVersionFile), true) : null;
    $buildTime = $versionData['buildTime'] ?? date('Y-m-d H:i:s');
    
    echo '<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="2;url=./?ts=' . time() . '">
  <title>SiMONCUT – Pembaruan Berhasil</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 36px; max-width: 480px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    .icon { width: 56px; height: 56px; background: #0d9488; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 20px; }
    h1 { color: #f8fafc; font-size: 22px; margin: 0 0 8px 0; }
    p { font-size: 14px; color: #94a3b8; line-height: 1.6; margin: 6px 0; }
    .badge { display: inline-block; background: rgba(13, 148, 136, 0.2); color: #2dd4bf; border: 1px solid rgba(45, 212, 191, 0.3); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 600; margin-bottom: 16px; }
    .btn { display: inline-block; background: #0d9488; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; margin-top: 20px; font-size: 14px; transition: 0.2s; }
    .btn:hover { background: #0f766e; }
    .meta { background: #0f172a; padding: 12px; border-radius: 10px; font-size: 12px; font-family: monospace; color: #cbd5e1; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✨</div>
    <div class="badge">Puskesmas Kepulauan Seribu Selatan</div>
    <h1>Pembaruan Berhasil Diaplikasikan!</h1>
    <p>Aplikasi <strong>SiMONCUT</strong> telah disinkronkan ke build terbaru.</p>
    <div class="meta">Build: ' . htmlspecialchars($buildTime) . '</div>
    <p style="font-size: 12px; margin-top: 14px; color: #64748b;">Membuka aplikasi secara otomatis dalam 2 detik...</p>
    <a href="./?ts=' . time() . '" class="btn">Buka Aplikasi SiMONCUT Sekarang</a>
  </div>
</body>
</html>';
    exit;
}

// 1. TANGANI PERMINTAAN FILE STATIS (CSS, JS, SVG, PNG, PWA MANIFEST, DLL)
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$requestPath = parse_url($requestUri, PHP_URL_PATH);
$cleanPath = ltrim($requestPath, '/');

if (!empty($cleanPath) && $cleanPath !== 'index.php') {
    $targetFile = null;
    
    if ($distDir && file_exists($distDir . '/' . $cleanPath)) {
        $targetFile = $distDir . '/' . $cleanPath;
    } elseif ($distDir && strpos($cleanPath, 'dist/') === 0 && file_exists($baseDir . '/' . $cleanPath)) {
        $targetFile = $baseDir . '/' . $cleanPath;
    } elseif (file_exists($baseDir . '/' . $cleanPath) && is_file($baseDir . '/' . $cleanPath)) {
        $allowedExts = ['js', 'mjs', 'css', 'svg', 'png', 'jpg', 'jpeg', 'ico', 'webmanifest', 'json', 'woff', 'woff2', 'txt'];
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

        // Strategi Cache Akurat:
        // Service Worker (sw.js), registerSW.js, dan manifest.webmanifest JANGAN dipermanenkan
        // agar browser langsung mendeteksi versi terbaru saat deploy!
        $fileName = basename($targetFile);
        if ($fileName === 'sw.js' || $fileName === 'registerSW.js' || $fileName === 'manifest.webmanifest' || $ext === 'json') {
            header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
            header('Pragma: no-cache');
            header('Expires: 0');
        } else {
            // Aset ber-hash unik di assets/ aman di-cache
            header('Cache-Control: public, max-age=31536000, immutable');
        }

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
    header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
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
  <title>SiMONCUT – Mempersiapkan Aplikasi</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; max-width: 520px; text-align: center; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
    h1 { color: #0d9488; font-size: 24px; margin: 0 0 8px 0; }
    p { font-size: 14px; color: #475569; line-height: 1.6; }
    .badge { display: inline-block; background: #ccfbf1; color: #0f766e; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
    .btn { display: inline-block; background: #0d9488; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; font-size: 14px; }
    .btn:hover { background: #0f766e; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Puskesmas Kepulauan Seribu Selatan</div>
    <h1>SiMONCUT</h1>
    <p><strong>Sistem Monitoring Cuti Pegawai</strong></p>
    <p style="color:#0d9488; font-style:italic;">“Pantau Cuti, Mudahkan Pengelolaan Kepegawaian”</p>
    <p>Aplikasi sedang dimuat. Klik tombol di bawah untuk menyinkronkan:</p>
    <a href="?update=1" class="btn">Sinkronkan Aplikasi Sekarang</a>
  </div>
</body>
</html>';
exit;

