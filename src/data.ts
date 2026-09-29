// IDSP Form S — Reporting Format for Syndromic Surveillance
// Row/section layout mirrors the official PDF (Form_S_P.pdf)

export interface CellVals {
  c_m5: number; c_m5p: number; c_f5: number; c_f5p: number;
  d_m5: number; d_m5p: number; d_f5: number; d_f5p: number;
}

export const emptyCells = (): CellVals => ({
  c_m5: 0, c_m5p: 0, c_f5: 0, c_f5p: 0,
  d_m5: 0, d_m5p: 0, d_f5: 0, d_f5p: 0,
});

export type PdfRow =
  | { kind: 'section'; label: string }
  | { kind: 'sub'; label: string }
  | { kind: 'data'; id: string; label: string; centered?: boolean };

export const PDF_ROWS: PdfRow[] = [
  { kind: 'section', label: '1. Fever' },
  { kind: 'sub', label: 'Fever < 7 days' },
  { kind: 'data', id: 'fever_only', label: '1 Only Fever' },
  { kind: 'data', id: 'fever_rash', label: '2 With Rash' },
  { kind: 'data', id: 'fever_bleeding', label: '3 With Bleeding' },
  { kind: 'data', id: 'fever_daze', label: '4 With Daze/Semiconsciousness/\nUnconsciousness' },
  { kind: 'data', id: 'fever_gt7', label: 'Fever > 7 days', centered: true },
  { kind: 'section', label: '2. Cough with or without fever' },
  { kind: 'data', id: 'cough_lt3', label: '< 3 weeks' },
  { kind: 'data', id: 'cough_gt3', label: '> 3 weeks' },
  { kind: 'section', label: '3. Loose Watery Stools of Less Than 2 Weeks Duration' },
  { kind: 'data', id: 'stool_dehyd', label: 'With Some/Much Dehydration' },
  { kind: 'data', id: 'stool_nodehyd', label: 'With no Dehydration' },
  { kind: 'data', id: 'stool_blood', label: 'With Blood in Stool' },
  { kind: 'section', label: '4. Jaundice cases of Less Than 4 Weeks Duration' },
  { kind: 'data', id: 'jaundice', label: 'Cases of acute Jaundice' },
  { kind: 'section', label: '5. Acute Flacid Paralysis Cases in Less Than 15 Years of Age' },
  { kind: 'data', id: 'afp', label: 'Cases of Acute Flacid Paralysis' },
  { kind: 'section', label: '6. Unusual Symptoms Leading to Death or Hospitalization that do not fit into the above.' },
  { kind: 'data', id: 'unusual', label: '' },
];

export const DATA_ROW_IDS = PDF_ROWS.filter(
  (r): r is Extract<PdfRow, { kind: 'data' }> => r.kind === 'data',
).map((r) => r.id);

// Entry-form grouping: section heading -> data rows under it
export interface EntrySection { heading: string; rows: { id: string; label: string }[] }

export const ENTRY_SECTIONS: EntrySection[] = [
  {
    heading: '1. Fever',
    rows: [
      { id: 'fever_only', label: '1 Only Fever (फक्त ताप)' },
      { id: 'fever_rash', label: '2 With Rash (पुरळासह)' },
      { id: 'fever_bleeding', label: '3 With Bleeding (रक्तस्रावासह)' },
      { id: 'fever_daze', label: '4 With Daze / Semiconsciousness / Unconsciousness' },
      { id: 'fever_gt7', label: 'Fever > 7 days (७ दिवसांपेक्षा जास्त ताप)' },
    ],
  },
  {
    heading: '2. Cough with or without fever (खोकला)',
    rows: [
      { id: 'cough_lt3', label: '< 3 weeks (३ आठवड्यांपेक्षा कमी)' },
      { id: 'cough_gt3', label: '> 3 weeks (३ आठवड्यांपेक्षा जास्त)' },
    ],
  },
  {
    heading: '3. Loose Watery Stools < 2 Weeks (जुलाब)',
    rows: [
      { id: 'stool_dehyd', label: 'With Some/Much Dehydration' },
      { id: 'stool_nodehyd', label: 'With no Dehydration' },
      { id: 'stool_blood', label: 'With Blood in Stool' },
    ],
  },
  {
    heading: '4. Jaundice < 4 Weeks (कावीळ)',
    rows: [{ id: 'jaundice', label: 'Cases of acute Jaundice' }],
  },
  {
    heading: '5. Acute Flacid Paralysis < 15 Years (पोलिओसदृश)',
    rows: [{ id: 'afp', label: 'Cases of Acute Flacid Paralysis' }],
  },
  {
    heading: '6. Unusual Symptoms → Death/Hospitalization',
    rows: [{ id: 'unusual', label: 'इतर असामान्य लक्षणे (वरीलपैकी नाहीत)' }],
  },
];

export interface SFormReport {
  id: string;
  state: string;
  district: string;
  block: string;
  year: string;
  workerName: string;
  supervisor: string;
  reportingUnit: string;
  idNo: string;
  weekFrom: string; // yyyy-mm-dd
  weekTo: string;   // yyyy-mm-dd
  rows: Record<string, CellVals>;
  updatedAt: number;
}

export interface Profile {
  state: string;
  district: string;
  block: string;
  workerName: string;
  supervisor: string;
  reportingUnit: string;
}

export const newReport = (profile: Profile): SFormReport => {
  const rows: Record<string, CellVals> = {};
  for (const id of DATA_ROW_IDS) rows[id] = emptyCells();
  const today = new Date();
  const iso = today.toISOString().slice(0, 10);
  return {
    id: 'r' + Date.now().toString(36),
    state: profile.state,
    district: profile.district,
    block: profile.block,
    year: String(today.getFullYear()),
    workerName: profile.workerName,
    supervisor: profile.supervisor,
    reportingUnit: profile.reportingUnit,
    idNo: '',
    weekFrom: iso,
    weekTo: iso,
    rows,
    updatedAt: Date.now(),
  };
};

// totals for one data row: [c_m5, c_m5p, c_mt, c_f5, c_f5p, c_ft, c_t, d_m5, d_m5p, d_mt, d_f5, d_f5p, d_ft, d_t]
export const rowTotals = (c: CellVals): number[] => {
  const c_mt = c.c_m5 + c.c_m5p;
  const c_ft = c.c_f5 + c.c_f5p;
  const d_mt = c.d_m5 + c.d_m5p;
  const d_ft = c.d_f5 + c.d_f5p;
  return [c.c_m5, c.c_m5p, c_mt, c.c_f5, c.c_f5p, c_ft, c_mt + c_ft,
          c.d_m5, c.d_m5p, d_mt, c.d_f5, c.d_f5p, d_ft, d_mt + d_ft];
};
