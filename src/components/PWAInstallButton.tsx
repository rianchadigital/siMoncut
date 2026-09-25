import React, { useState } from 'react';
import { Download, CheckCircle, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button or show badge
  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 font-medium">
        <CheckCircle className="w-3.5 h-3.5" />
        PWA Terpasang
      </span>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-800 transition whitespace-nowrap"
      >
        <Download className="w-3.5 h-3.5" />
        Install App
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition whitespace-nowrap shadow-xs"
        >
          <Smartphone className="w-3.5 h-3.5 text-teal-600" />
          Pasang di iOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Pasang SiMONCUT di iOS Safari</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                1. Ketuk tombol <strong>Share</strong> (ikon kotak dengan panah atas) di bilah navigasi Safari.<br />
                2. Gulir ke bawah lalu pilih <strong>Add to Home Screen (Tambahkan ke Layar Utama)</strong>.<br />
                3. Ketuk <strong>Add (Tambah)</strong> di pojok kanan atas.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-teal-700 py-2 text-xs font-semibold text-white hover:bg-teal-800 transition"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
