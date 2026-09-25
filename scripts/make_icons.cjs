const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function createSolidPng(width, height, r, g, b, a = 255) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8 bits per channel
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // Deflate
  ihdrData.writeUInt8(0, 11); // Filter
  ihdrData.writeUInt8(0, 12); // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image data with filter type 0 per line
  const rawBytes = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawBytes[offset++] = 0; // Filter byte: None
    for (let x = 0; x < width; x++) {
      // Draw background or simple Puskesmas cross
      const cx = width / 2;
      const cy = height / 2;
      const isCross = (Math.abs(x - cx) < width * 0.08 && Math.abs(y - cy) < height * 0.28) ||
                      (Math.abs(y - cy) < height * 0.08 && Math.abs(x - cx) < width * 0.28);
      if (isCross) {
        rawBytes[offset++] = 255;
        rawBytes[offset++] = 255;
        rawBytes[offset++] = 255;
        rawBytes[offset++] = 255;
      } else {
        rawBytes[offset++] = r;
        rawBytes[offset++] = g;
        rawBytes[offset++] = b;
        rawBytes[offset++] = a;
      }
    }
  }

  const compressed = zlib.deflateSync(rawBytes);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc >>> 0, 0);
  return Buffer.concat([length, typeBuf, data, crcBuf]);
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA icons in teal #0d9488 (13, 148, 136)
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createSolidPng(192, 192, 13, 148, 136));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createSolidPng(512, 512, 13, 148, 136));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createSolidPng(512, 512, 15, 118, 110));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createSolidPng(180, 180, 13, 148, 136));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createSolidPng(32, 32, 13, 148, 136));

console.log('PWA PNG icons generated successfully.');
