import type { Profile, SFormReport } from '../data';

const PROFILE_KEY = 'idsp-sform-profile-v1';
const REPORTS_KEY = 'idsp-sform-reports-v1';

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw) as Profile;
  } catch { /* ignore */ }
  return { state: '', district: '', block: '', workerName: '', supervisor: '', reportingUnit: '' };
}

export function saveProfile(p: Profile) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

export function loadReports(): SFormReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as SFormReport[];
      return arr.sort((a, b) => (b.weekFrom || '').localeCompare(a.weekFrom || '') || b.updatedAt - a.updatedAt);
    }
  } catch { /* ignore */ }
  return [];
}

export function saveReports(reports: SFormReport[]) {
  try { localStorage.setItem(REPORTS_KEY, JSON.stringify(reports)); } catch { /* ignore */ }
}

export function weekLabel(r: SFormReport): string {
  const f = (s: string) => {
    if (!s) return '';
    const [y, m, d] = s.split('-');
    return `${d}/${m}/${y}`;
  };
  return `${f(r.weekFrom)} – ${f(r.weekTo)}`;
}
