import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SiMONCUT Uncaught Error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Aplikasi Mengalami Kendala Tampilan
              </h1>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Terjadi kesalahan teknis saat memuat data aplikasi SiMONCUT di peramban Anda. Silakan muat ulang halaman atau bersihkan cache.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-left font-mono text-[11px] text-slate-600 overflow-x-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Muat Ulang Halaman
              </button>
              <button
                onClick={this.handleResetCache}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                Reset Cache & Data
              </button>
            </div>

            <p className="text-[10px] text-slate-400">
              SiMONCUT · Puskesmas Kepulauan Seribu Selatan
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
