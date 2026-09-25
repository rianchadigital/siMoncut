/**
 * Utilities for date calculations in Asia/Jakarta timezone.
 */

// Helper to convert date to YYYY-MM-DD
export function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Normalize various date formats (ISO string, DD/MM/YYYY, MM/DD/YYYY, YYYY/MM/DD, timestamp, text) to standard YYYY-MM-DD
export function normalizeDateStr(val: any): string {
  if (!val) return '';
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? '' : toDateString(val);
  }
  const str = String(val).trim();
  if (!str) return '';

  // Match YYYY-MM-DD or YYYY/MM/DD (with optional time)
  const m1 = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m1) {
    const y = m1[1];
    const m = m1[2].padStart(2, '0');
    const d = m1[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Match DD-MM-YYYY or MM-DD-YYYY or DD/MM/YYYY
  const m2 = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (m2) {
    const n1 = parseInt(m2[1], 10);
    const n2 = parseInt(m2[2], 10);
    const y = m2[3];
    let d = n1;
    let m = n2;
    // Check if US format MM/DD/YYYY (n1 <= 12 and n2 > 12)
    if (n1 <= 12 && n2 > 12) {
      m = n1;
      d = n2;
    }
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  // Handle Indonesian prose: "25 September 2026" or "25 Sep 2026"
  const mIndo = str.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (mIndo) {
    const d = parseInt(mIndo[1], 10);
    const monthName = mIndo[2].toLowerCase();
    const y = mIndo[3];
    const indoMonths: Record<string, number> = {
      jan: 1, januari: 1, january: 1,
      feb: 2, februari: 2, february: 2,
      mar: 3, maret: 3, march: 3,
      apr: 4, april: 4,
      mei: 5, may: 5,
      jun: 6, juni: 6, june: 6,
      jul: 7, juli: 7, july: 7,
      agu: 8, agt: 8, agustus: 8, august: 8,
      sep: 9, september: 9,
      okt: 10, oktober: 10, october: 10,
      nov: 11, november: 11,
      des: 12, desember: 12, december: 12,
    };
    for (const key in indoMonths) {
      if (monthName.startsWith(key)) {
        return `${y}-${String(indoMonths[key]).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
    }
  }

  // Try Date parsing
  try {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return toDateString(parsed);
    }
  } catch {
    // Ignore
  }

  return str.substring(0, 10);
}

// Standardize Indonesian leave types ("Tahunan", "Cuti Tahunan", etc.)
export function normalizeJenisCuti(val: any): string {
  if (!val) return 'Cuti Tahunan';
  const str = String(val).trim();
  const lower = str.toLowerCase();

  if (lower.includes('tahunan')) return 'Cuti Tahunan';
  if (lower.includes('sakit')) return 'Cuti Sakit';
  if (lower.includes('lahir') || lower.includes('salin') || lower.includes('hamil')) return 'Cuti Melahirkan';
  if (lower.includes('penting') || lower.includes('cap')) return 'Cuti Alasan Penting';
  if (lower.includes('besar')) return 'Cuti Besar';
  if (lower.includes('tanggungan') || lower.includes('cltn')) return 'Cuti di Luar Tanggungan Negara';
  if (lower.startsWith('cuti ')) return str;
  return `Cuti ${str}`;
}

// Check if leave matches category filter ("Semua", "Tahunan", "Cuti Tahunan", etc.)
export function matchJenisCuti(actual: string, filter: string): boolean {
  if (!filter || filter === 'Semua') return true;
  if (!actual) return false;
  const a = actual.toLowerCase().replace(/^cuti\s+/, '').trim();
  const f = filter.toLowerCase().replace(/^cuti\s+/, '').trim();
  return a === f || actual.toLowerCase().includes(f) || f.includes(a);
}

// Get short clean display label for leave category
export function getShortLeaveLabel(jenis: string): string {
  if (!jenis) return 'Tahunan';
  const clean = jenis.replace(/^Cuti\s+/i, '').trim();
  return clean || 'Tahunan';
}

export const OFFICIAL_TEMPAT_TUGAS = [
  'Puskesmas Kepulauan Seribu Selatan',
  'Puskesmas Pembantu Pulau Pari',
  'Puskesmas Pembantu Pulau Lancang',
  'Puskesmas Pembantu Pulau Untung Jawa',
] as const;

// Smart detection for Tempat Tugas across both tempatTugas and puskesmasPustu fields
export function detectPegawaiTempatTugas(tempatTugas?: string, puskesmasPustu?: string): string {
  const s1 = String(tempatTugas || '').toLowerCase();
  const s2 = String(puskesmasPustu || '').toLowerCase();

  // 1. Pulau Pari
  if (s1.includes('pari') || s2.includes('pari')) {
    return 'Puskesmas Pembantu Pulau Pari';
  }
  // 2. Pulau Lancang
  if (s1.includes('lancang') || s2.includes('lancang')) {
    return 'Puskesmas Pembantu Pulau Lancang';
  }
  // 3. Pulau Untung Jawa
  if (s1.includes('untung') || s2.includes('untung')) {
    return 'Puskesmas Pembantu Pulau Untung Jawa';
  }
  // 4. Puskesmas Induk / Kepulauan Seribu Selatan
  return 'Puskesmas Kepulauan Seribu Selatan';
}

// Normalize unit name to one of the 4 official health center units in Kepulauan Seribu Selatan
export function normalizeTempatTugas(val?: string): string {
  if (!val) return 'Puskesmas Kepulauan Seribu Selatan';
  return detectPegawaiTempatTugas(val);
}

// Robust comparison for unit / tempat tugas
export function isSameUnit(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  return normalizeTempatTugas(a) === normalizeTempatTugas(b);
}

// Current system date object
export function getNow(): Date {
  return new Date();
}

export function getTodayString(): string {
  return toDateString(getNow());
}

// Parse 'YYYY-MM-DD' into local Date at 00:00:00
export function parseDate(dateStr: string): Date {
  const normalized = normalizeDateStr(dateStr);
  const parts = normalized.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return new Date(y, m, d, 0, 0, 0, 0);
  }
  return new Date(dateStr);
}

// Check if a date string is between start and end inclusive
export function isDateInRange(targetDateStr: string, startStr: string, endStr: string): boolean {
  if (!targetDateStr || !startStr || !endStr) return false;
  const target = normalizeDateStr(targetDateStr);
  let start = normalizeDateStr(startStr);
  let end = normalizeDateStr(endStr);
  if (!target || !start || !end) return false;
  if (start > end) {
    const tmp = start;
    start = end;
    end = tmp;
  }
  return target >= start && target <= end;
}

// Check if leave is currently active today
export function isLeaveActiveToday(startStr: string, endStr: string, todayStr = getTodayString()): boolean {
  return isDateInRange(todayStr, startStr, endStr);
}

// Check if leave will start in the next N days (1 to N days from today)
export function isLeaveStartingInNextDays(startStr: string, days = 3, todayStr = getTodayString()): boolean {
  const normStart = normalizeDateStr(startStr);
  if (!normStart) return false;
  const today = parseDate(todayStr);
  const targetEnd = new Date(today);
  targetEnd.setDate(today.getDate() + days);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const tomorrowStr = toDateString(tomorrow);
  const maxStr = toDateString(targetEnd);

  return normStart >= tomorrowStr && normStart <= maxStr;
}

// Get the Monday and Sunday for the current week
export function getCurrentWeekRange(refDate = getNow()): { start: string; end: string } {
  const d = new Date(refDate);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    start: toDateString(monday),
    end: toDateString(sunday),
  };
}

// Check if leave overlaps with the current week
export function isLeaveOverlappingWeek(startStr: string, endStr: string, refDate = getNow()): boolean {
  if (!startStr || !endStr) return false;
  const s = normalizeDateStr(startStr);
  const e = normalizeDateStr(endStr);
  if (!s || !e) return false;
  const week = getCurrentWeekRange(refDate);
  // Two ranges [A, B] and [C, D] overlap if max(A, C) <= min(B, D)
  return s <= week.end && e >= week.start;
}

// Get the first and last day of current month
export function getCurrentMonthRange(refDate = getNow()): { start: string; end: string; monthName: string; year: number } {
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return {
    start: toDateString(firstDay),
    end: toDateString(lastDay),
    monthName: monthNames[month],
    year,
  };
}

// Check if leave overlaps with the current month
export function isLeaveOverlappingMonth(startStr: string, endStr: string, refDate = getNow()): boolean {
  if (!startStr || !endStr) return false;
  const s = normalizeDateStr(startStr);
  const e = normalizeDateStr(endStr);
  if (!s || !e) return false;
  const monthRange = getCurrentMonthRange(refDate);
  return s <= monthRange.end && e >= monthRange.start;
}

// Get the first and last day of next month
export function getNextMonthRange(refDate = getNow()): { start: string; end: string; monthName: string; year: number } {
  const year = refDate.getFullYear();
  const month = refDate.getMonth() + 1; // can be 12 (Jan next year)
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return {
    start: toDateString(firstDay),
    end: toDateString(lastDay),
    monthName: monthNames[firstDay.getMonth()],
    year: firstDay.getFullYear(),
  };
}

// Check if leave overlaps with next month
export function isLeaveOverlappingNextMonth(startStr: string, endStr: string, refDate = getNow()): boolean {
  if (!startStr || !endStr) return false;
  const s = normalizeDateStr(startStr);
  const e = normalizeDateStr(endStr);
  if (!s || !e) return false;
  const nextMonthRange = getNextMonthRange(refDate);
  return s <= nextMonthRange.end && e >= nextMonthRange.start;
}

// Format date to Indonesian prose: "25 September 2026"
export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  const d = parseDate(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Short format: "25 Sep 2026"
export function formatDateShortIndo(dateStr: string): string {
  if (!dateStr) return '-';
  const d = parseDate(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Calculate days between two dates inclusive
export function calculateDaysBetween(startStr: string, endStr: string): number {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  const diffTime = end.getTime() - start.getTime();
  if (diffTime < 0) return 0;
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// Format timestamp: "25 Sep 2026, 11:45 WIB"
export function formatTimestampIndo(isoStr?: string): string {
  const d = isoStr ? new Date(isoStr) : getNow();
  if (isNaN(d.getTime())) return 'Baru saja';
  
  const pad = (n: number) => String(n).padStart(2, '0');
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
}
