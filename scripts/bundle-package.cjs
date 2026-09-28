const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function getFiles(dir, base = '') {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const rel = path.join(base, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(getFiles(full, rel));
    } else {
      results.push({ path: rel.replace(/\\/g, '/'), content: fs.readFileSync(full).toString('base64'), mtime: stat.mtimeMs });
    }
  }
  return results;
}

try {
  const distDir = path.resolve(__dirname, '../dist');
  if (fs.existsSync(distDir)) {
    const buildInfo = {
      app: 'SiMONCUT',
      buildTime: new Date().toISOString(),
      buildTimestamp: Date.now(),
      description: 'Sistem Monitoring Cuti Pegawai Puskesmas Kepulauan Seribu Selatan',
    };
    
    // Tulis version.json di root dan di dalam dist
    const versionJson = JSON.stringify(buildInfo, null, 2);
    fs.writeFileSync(path.resolve(__dirname, '../version.json'), versionJson);
    fs.writeFileSync(path.join(distDir, 'version.json'), versionJson);

    const files = getFiles(distDir);
    const payload = {
      meta: buildInfo,
      files: files,
    };
    const json = JSON.stringify(payload);
    const gzipped = zlib.gzipSync(Buffer.from(json, 'utf8'), { level: 9 });
    const outputPath = path.resolve(__dirname, '../dist_package.dat');
    fs.writeFileSync(outputPath, gzipped);
    console.log(`[Hostinger Deploy Helper] dist_package.dat created successfully (${Math.round(gzipped.length / 1024)} KB, ${files.length} files, build: ${buildInfo.buildTime})`);
  }
} catch (err) {
  console.error('[Hostinger Deploy Helper] Failed to create dist_package.dat:', err);
}

