import React, { useState } from 'react';

/**
 * Format Google Drive URL into direct embeddable preview image
 */
export function formatGoogleDriveImageUrl(url?: string): string | undefined {
  if (!url || !url.trim()) return undefined;
  const clean = url.trim();
  const fileIdMatch =
    clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    clean.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  return clean;
}

/**
 * Official Lambang Daerah Khusus Ibukota Jakarta (Jaya Raya)
 * Monas, Padi & Kapas, Perisai Segi Lima, Gerbang Merah & Kuning Emas
 */
export const LogoJayaRaya: React.FC<{ className?: string; customSrc?: string }> = ({
  className = 'w-20 h-20',
  customSrc,
}) => {
  const [imgError, setImgError] = useState(false);
  const resolvedSrc = formatGoogleDriveImageUrl(customSrc);

  if (resolvedSrc && !imgError) {
    return (
      <img
        src={resolvedSrc}
        alt="Logo Jaya Raya DKI Jakarta"
        className={`${className} object-contain`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0`}
      aria-label="Logo Jaya Raya DKI Jakarta"
    >
      <defs>
        <filter id="crisp-jaya">
          <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Golden Yellow Outer Shield Border */}
      <path
        d="M 10 10 L 190 10 L 198 28 L 180 28 L 180 162 L 100 226 L 20 162 L 20 28 L 2 28 Z"
        fill="#ffc800"
        stroke="#d89600"
        strokeWidth="1.5"
      />

      {/* Top White Bar for Text "JAYA RAYA" */}
      <path d="M 22 14 L 178 14 L 178 68 L 22 68 Z" fill="#ffffff" />

      {/* Red Text: JAYA RAYA */}
      <text
        x="100"
        y="46"
        textAnchor="middle"
        fill="#dc143c"
        fontFamily="'Times New Roman', Times, 'DejaVu Serif', serif"
        fontWeight="900"
        fontSize="20"
        letterSpacing="5"
      >
        JAYA RAYA
      </text>

      {/* Stepped Arch Blue Field (Royal Blue) */}
      <path
        d="M 22 68 L 42 68 L 42 54 L 64 54 L 64 38 L 100 26 L 136 38 L 136 54 L 158 54 L 158 68 L 178 68 L 178 158 L 100 220 L 22 158 Z"
        fill="#0450a1"
        stroke="#ffc800"
        strokeWidth="2"
      />

      {/* Rice Stalk (Padi Emas - Sisi Kiri) */}
      <g fill="#ffc800" stroke="#b87800" strokeWidth="0.7">
        <path d="M 28 154 Q 22 108 64 68" fill="none" stroke="#ffc800" strokeWidth="2.5" />
        <ellipse cx="64" cy="68" rx="4" ry="7" transform="rotate(35 64 68)" />
        <ellipse cx="58" cy="74" rx="4" ry="7" transform="rotate(25 58 74)" />
        <ellipse cx="52" cy="82" rx="4" ry="7" transform="rotate(15 52 82)" />
        <ellipse cx="46" cy="92" rx="4" ry="7" transform="rotate(5 46 92)" />
        <ellipse cx="42" cy="104" rx="4" ry="7" transform="rotate(-10 42 104)" />
        <ellipse cx="38" cy="116" rx="4" ry="7" transform="rotate(-25 38 116)" />
        <ellipse cx="36" cy="128" rx="4" ry="7" transform="rotate(-40 36 128)" />
        <ellipse cx="35" cy="140" rx="4" ry="7" transform="rotate(-55 35 140)" />
        <ellipse cx="38" cy="152" rx="4" ry="7" transform="rotate(-70 38 152)" />
      </g>

      {/* Cotton Stalk (Kapas Putih Hijau - Sisi Kanan) */}
      <g>
        <path d="M 172 154 Q 178 108 136 68" fill="none" stroke="#00923f" strokeWidth="2.5" />
        <g fill="#ffffff" stroke="#90a4ae" strokeWidth="0.8">
          <circle cx="134" cy="72" r="5" />
          <circle cx="148" cy="78" r="5.5" />
          <circle cx="142" cy="90" r="5.5" />
          <circle cx="156" cy="98" r="5.5" />
          <circle cx="150" cy="112" r="6" />
          <circle cx="162" cy="122" r="6" />
          <circle cx="156" cy="138" r="6" />
        </g>
      </g>

      {/* Monas in Center */}
      <g id="monas-center">
        <polygon points="76,160 124,160 122,152 78,152" fill="#ffffff" />
        <polygon points="78,144 122,144 116,134 84,134" fill="#ffffff" />
        <polygon points="96,134 104,134 102,62 98,62" fill="#ffffff" />
        <line x1="100" y1="62" x2="100" y2="134" stroke="#94a3b8" strokeWidth="1.2" />
        <path d="M 100 36 C 95 44 95 48 97 55 L 103 55 C 105 48 105 44 100 36 Z" fill="#e31818" />
      </g>

      {/* Bottom Embellishment & Golden Chain */}
      <g fill="#ffc800" stroke="#b87800" strokeWidth="1.2">
        <circle cx="100" cy="172" r="5" />
        <ellipse cx="91" cy="172" rx="6" ry="4" transform="rotate(-15 91 172)" />
        <ellipse cx="109" cy="172" rx="6" ry="4" transform="rotate(15 109 172)" />
      </g>

      {/* Waves (Gelombang Laut Biru dan Putih) */}
      <g fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round">
        <path d="M 70 196 Q 85 188 100 196 Q 115 204 130 196" />
        <path d="M 78 206 Q 89 200 100 206 Q 111 212 122 206" />
      </g>
    </svg>
  );
};

/**
 * Official Logo Kesehatan (Kemenkes & Puskesmas Indonesia - Permenkes 43/2019)
 * Hexagon Hijau, Palang Hijau, Atap Rumah, Dua Lingkaran Putih Komunitas
 */
export const LogoKesehatan: React.FC<{ className?: string; customSrc?: string }> = ({
  className = 'w-20 h-20',
  customSrc,
}) => {
  const [imgError, setImgError] = useState(false);
  const resolvedSrc = formatGoogleDriveImageUrl(customSrc);

  if (resolvedSrc && !imgError) {
    return (
      <img
        src={resolvedSrc}
        alt="Logo Kesehatan Puskesmas"
        className={`${className} object-contain`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0`}
      aria-label="Logo Puskesmas Indonesia"
    >
      {/* Hexagon Outer Border in Dark Green */}
      <polygon
        points="100,8 188,58 188,172 100,222 12,172 12,58"
        fill="#ffffff"
        stroke="#005e09"
        strokeWidth="11"
        strokeLinejoin="round"
      />

      <g id="puskesmas-cross-house">
        {/* Greek Cross (Green) */}
        <rect x="74" y="44" width="52" height="50" fill="#005e09" />
        <rect x="32" y="92" width="44" height="52" fill="#005e09" />
        <path d="M 124 92 L 168 92 L 168 126 L 124 92 Z" fill="#004806" />

        {/* Slanted House Roof Overlay */}
        <path
          d="M 68 144 L 126 90 L 168 126 L 168 144 L 126 144 L 126 194 L 74 194 L 74 144 Z"
          fill="#005e09"
        />

        {/* White Separation Gap / Slanted Border */}
        <line x1="66" y1="145" x2="126" y2="89" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" />
        <line x1="126" y1="89" x2="168" y2="125" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />

        {/* Two Intersecting White Rings */}
        <g stroke="#ffffff" strokeWidth="3.5" fill="none">
          <circle cx="112" cy="126" r="11" />
          <circle cx="128" cy="126" r="11" />
        </g>
      </g>
    </svg>
  );
};
