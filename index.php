<?php
/**
 * ====================================================================
 * SiMONCUT - Hostinger Production Dispatcher
 * Sistem Monitoring Cuti Pegawai Puskesmas Kepulauan Seribu Selatan
 * Tagline: “Pantau Cuti, Mudahkan Pengelolaan Kepegawaian”
 * ====================================================================
 * 
 * File ini memastikan saat repositori GitHub disinkronisasikan ke Hostinger,
 * website langsung tampil 100% sempurna tanpa layar putih!
 */

$distDir = __DIR__ . '/dist';
$distIndex = $distDir . '/index.html';

// 1. Tangani permintaan file statis aset
$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$cleanPath = ltrim($requestPath, '/');

if (!empty($cleanPath) && $cleanPath !== 'index.php') {
    $targetFile = null;
    if (file_exists($distDir . '/' . $cleanPath)) {
        $targetFile = $distDir . '/' . $cleanPath;
    } elseif (strpos($cleanPath, 'dist/') === 0 && file_exists(__DIR__ . '/' . $cleanPath)) {
        $targetFile = __DIR__ . '/' . $cleanPath;
    }

    if ($targetFile && is_file($targetFile)) {
        $ext = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));
        $contentTypes = [
            'js' => 'application/javascript; charset=UTF-8',
            'mjs' => 'application/javascript; charset=UTF-8',
            'css' => 'text/css; charset=UTF-8',
            'svg' => 'image/svg+xml',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'ico' => 'image/x-icon',
            'json' => 'application/json',
            'webmanifest' => 'application/manifest+json',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2',
        ];

        if (isset($contentTypes[$ext])) {
            header('Content-Type: ' . $contentTypes[$ext]);
        }
        header('Cache-Control: public, max-age=31536000, immutable');
        header('Access-Control-Allow-Origin: *');
        readfile($targetFile);
        exit;
    }
}

// 2. Sajikan halaman aplikasi SiMONCUT produksi
if (file_exists($distIndex)) {
    header('Content-Type: text/html; charset=UTF-8');
    header('X-Powered-By: SiMONCUT');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    readfile($distIndex);
    exit;
}

// 3. Fallback jika folder dist belum ada
header('Content-Type: text/html; charset=UTF-8');
echo '<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SiMONCUT – Mempersiapkan Aplikasi</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; max-width: 480px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    h1 { color: #0d9488; font-size: 24px; margin: 0 0 8px 0; }
    p { font-size: 14px; color: #475569; line-height: 1.6; }
    .badge { display: inline-block; background: #ccfbf1; color: #0f766e; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
    .tagline { color: #0d9488; font-style: italic; font-weight: 500; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Puskesmas Kepulauan Seribu Selatan</div>
    <h1>SiMONCUT</h1>
    <p><strong>Sistem Monitoring Cuti Pegawai</strong></p>
    <p class="tagline">“Pantau Cuti, Mudahkan Pengelolaan Kepegawaian”</p>
    <p>Aplikasi siap disinkronisasikan. Folder <code>dist/</code> sudah disertakan langsung di repositori.</p>
  </div>
</body>
</html>';
exit;
